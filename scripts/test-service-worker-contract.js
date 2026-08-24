const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const workerPath = path.join(root, "service-worker.js");
const legacyWorkerPath = path.join(root, "assets/js/service-worker.js");
const bootstrap = fs.readFileSync(path.join(root, "assets/js/bootstrap.js"), "utf8");
const failures = [];
const expect = (condition, message) => {
  if (!condition) failures.push(message);
};

expect(fs.existsSync(workerPath), "Service worker must live at the repository root so it controls the portfolio page.");
expect(!fs.existsSync(legacyWorkerPath), "Legacy assets/js service worker must be removed to avoid the narrow default scope.");
expect(/serviceWorker\s*\.\s*register\(['"]service-worker\.js['"]\)/.test(bootstrap), "Bootstrap must register the root-scoped service worker.");
expect(/getRegistrations\(\)/.test(bootstrap), "Bootstrap must inspect existing service worker registrations during migration.");
expect(/assets\/js\/service-worker\.js/.test(bootstrap), "Bootstrap must identify the deleted legacy service worker script exactly.");

if (!fs.existsSync(workerPath)) {
  console.error("Service worker contract failed:\n- " + failures.join("\n- "));
  process.exit(1);
}

const source = fs.readFileSync(workerPath, "utf8");
const cacheName = source.match(/const\s+CACHE_NAME\s*=\s*['"]([^'"]+)['"]/)?.[1];
expect(Boolean(cacheName), "Service worker must declare CACHE_NAME.");

function makeResponse(id, ok = true, status = ok ? 200 : 500) {
  return {
    id,
    ok,
    status,
    clone() {
      return makeResponse(id, ok, status);
    },
  };
}

const buckets = new Map();
const keyOf = (request) => typeof request === "string" ? request : request.url;
const cacheFor = (name) => {
  if (!buckets.has(name)) buckets.set(name, new Map());
  const bucket = buckets.get(name);
  return {
    async addAll(urls) {
      urls.forEach((url) => bucket.set(url, makeResponse(`precache:${url}`)));
    },
    async put(request, response) {
      bucket.set(keyOf(request), response);
    },
    async match(request) {
      return bucket.get(keyOf(request));
    },
  };
};

const caches = {
  async open(name) {
    return cacheFor(name);
  },
  async keys() {
    return [...buckets.keys()];
  },
  async delete(name) {
    return buckets.delete(name);
  },
  async match(request) {
    const key = keyOf(request);
    for (const bucket of buckets.values()) {
      if (bucket.has(key)) return bucket.get(key);
    }
    return undefined;
  },
};

const handlers = {};
let fetchImpl = async () => makeResponse("default");
let claimed = false;
const context = {
  URL,
  Promise,
  caches,
  console,
  fetch(request) {
    return fetchImpl(request);
  },
  self: {
    addEventListener(type, handler) {
      handlers[type] = handler;
    },
    skipWaiting() {},
    clients: {
      claim() {
        claimed = true;
        return Promise.resolve();
      },
    },
  },
};

vm.runInNewContext(source, context, { filename: workerPath });

async function runLifecycle(type) {
  const waits = [];
  handlers[type]({ waitUntil(promise) { waits.push(Promise.resolve(promise)); } });
  await Promise.all(waits);
}

async function runFetch(url, responseOrError) {
  fetchImpl = async () => {
    if (responseOrError instanceof Error) throw responseOrError;
    return responseOrError;
  };
  const waits = [];
  let responsePromise;
  handlers.fetch({
    request: { mode: "navigate", url },
    respondWith(promise) {
      responsePromise = Promise.resolve(promise);
    },
    waitUntil(promise) {
      waits.push(Promise.resolve(promise));
    },
  });
  const response = await responsePromise;
  await Promise.all(waits);
  return response;
}

async function verifyLegacyRegistrationCleanup() {
  const loadHandlers = [];
  const unregistered = [];
  let registeredScript = null;
  const makeRegistration = (scope, scriptURL, id) => ({
    scope,
    active: { scriptURL },
    unregister() {
      unregistered.push(id);
      return Promise.resolve(true);
    },
  });
  const registrations = [
    makeRegistration("https://hoatv2211.github.io/assets/js/", "https://hoatv2211.github.io/assets/js/service-worker.js", "legacy"),
    makeRegistration("https://hoatv2211.github.io/games/dalgona/", "https://hoatv2211.github.io/games/dalgona/service-worker.js", "game"),
    makeRegistration("https://hoatv2211.github.io/", "https://hoatv2211.github.io/service-worker.js", "root"),
  ];
  const bootstrapContext = {
    URL,
    console,
    localStorage: { setItem() {} },
    document: {
      readyState: "loading",
      addEventListener() {},
      querySelector() { return null; },
      documentElement: {
        classList: { toggle() {}, contains() { return false; } },
        setAttribute() {},
      },
    },
    navigator: {
      serviceWorker: {
        controller: {},
        ready: Promise.resolve(),
        addEventListener() {},
        getRegistrations() { return Promise.resolve(registrations); },
        register(script) {
          registeredScript = script;
          return Promise.resolve();
        },
      },
    },
    window: {
      location: { href: "https://hoatv2211.github.io/" },
      addEventListener(type, handler) {
        if (type === "load") loadHandlers.push(handler);
      },
    },
  };

  vm.runInNewContext(bootstrap, bootstrapContext, { filename: path.join(root, "assets/js/bootstrap.js") });
  expect(loadHandlers.length === 1, "Bootstrap must install one load handler for service worker migration.");
  loadHandlers[0]();
  await new Promise((resolve) => setImmediate(resolve));

  expect(unregistered.join(",") === "legacy", "Bootstrap must unregister only the exact legacy assets/js service worker.");
  expect(registeredScript === "service-worker.js", "Bootstrap must still register the root service worker after legacy cleanup.");
}

(async () => {
  await verifyLegacyRegistrationCleanup();
  buckets.set("portfolio-shell-v1", new Map([["/index.html", makeResponse("stale-shell")]]));
  buckets.set("unity-webgl-cache-v2", new Map([["/index.html", makeResponse("legacy-homepage")]]));
  buckets.set("dalgona-webgl-cache", new Map([
    ["game.data", makeResponse("game-data")],
    ["/index.html", makeResponse("unrelated-index")],
  ]));
  buckets.set(cacheName, new Map());
  await runLifecycle("activate");

  expect(claimed, "Activation must claim clients.");
  expect(!buckets.has("portfolio-shell-v1"), "Activation must delete obsolete portfolio shell caches.");
  expect(!buckets.has("unity-webgl-cache-v2"), "Activation must delete the known legacy portfolio cache.");
  expect(buckets.has("dalgona-webgl-cache"), "Activation must preserve unrelated WebGL/game caches.");
  expect(buckets.has(cacheName), "Activation must preserve the current portfolio shell cache.");

  const rootResponse = makeResponse("root-live");
  await runFetch("https://hoatv2211.github.io/", rootResponse);
  expect(buckets.get(cacheName).get("/index.html")?.id === "root-live", "Successful root navigation must refresh the cached homepage.");

  await runFetch("https://hoatv2211.github.io/backup/recruiter-clean/index.html", makeResponse("backup-live"));
  expect(buckets.get(cacheName).get("/index.html")?.id === "root-live", "Backup navigation must not overwrite the cached homepage.");

  await runFetch("https://hoatv2211.github.io/index.html", makeResponse("root-error", false, 503));
  expect(buckets.get(cacheName).get("/index.html")?.id === "root-live", "Unsuccessful root responses must not overwrite the cached homepage.");

  const offlineRoot = await runFetch("https://hoatv2211.github.io/", new Error("offline"));
  expect(offlineRoot?.id === "root-live", "Offline root navigation must fall back to the last successful cached homepage.");

  if (failures.length) {
    console.error("Service worker contract failed:\n- " + failures.join("\n- "));
    process.exit(1);
  }

  console.log("Service worker contract passed.");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
