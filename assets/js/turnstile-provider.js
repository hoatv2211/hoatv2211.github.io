(function () {
  "use strict";

  var SITEKEY = "0x4AAAAAAEaAESgEirq4LgKq";
  var API_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
  var SCRIPT_ID = "portfolio-turnstile-api";
  var CONTAINER_ID = "portfolio-turnstile";
  var LOAD_TIMEOUT_MS = 15000;
  var TOKEN_TIMEOUT_MS = 15000;

  var apiPromise = null;
  var widgetId = null;
  var pendingToken = null;
  var hasExecuted = false;
  var tokenQueue = Promise.resolve();

  function turnstileApi() {
    var api = window.turnstile;
    return api && typeof api.render === "function" && typeof api.execute === "function" ? api : null;
  }

  function loadApi() {
    var available = turnstileApi();
    if (available) return Promise.resolve(available);
    if (apiPromise) return apiPromise;

    apiPromise = new Promise(function (resolve, reject) {
      var script = document.getElementById(SCRIPT_ID);
      var created = false;
      var timer = window.setTimeout(function () {
        reject(new Error("Turnstile API load timed out"));
      }, LOAD_TIMEOUT_MS);

      function finish(error) {
        window.clearTimeout(timer);
        var api = turnstileApi();
        if (!error && api) {
          resolve(api);
          return;
        }
        reject(error || new Error("Turnstile API unavailable"));
      }

      if (!script) {
        script = document.createElement("script");
        script.id = SCRIPT_ID;
        script.src = API_URL;
        script.async = true;
        script.defer = true;
        created = true;
      }

      script.onload = function () { finish(); };
      script.onerror = function () {
        if (typeof script.remove === "function") script.remove();
        finish(new Error("Turnstile API failed to load"));
      };

      if (created) {
        try {
          document.head.appendChild(script);
        } catch (error) {
          finish(error);
        }
      }
    }).catch(function (error) {
      apiPromise = null;
      throw error;
    });

    return apiPromise;
  }

  function ensureContainer() {
    var container = document.getElementById(CONTAINER_ID);
    if (container) return container;

    container = document.createElement("div");
    container.id = CONTAINER_ID;
    container.setAttribute("aria-hidden", "true");
    container.style.position = "fixed";
    container.style.left = "-10000px";
    container.style.top = "0";
    container.style.width = "1px";
    container.style.height = "1px";
    container.style.overflow = "hidden";
    (document.body || document.documentElement).appendChild(container);
    return container;
  }

  function settlePending(token, error) {
    if (!pendingToken) return;
    var request = pendingToken;
    pendingToken = null;
    window.clearTimeout(request.timer);

    if (!error && typeof token === "string" && token.trim()) {
      request.resolve(token);
      return;
    }
    request.reject(error || new Error("Turnstile challenge failed"));
  }

  function ensureWidget() {
    return loadApi().then(function (api) {
      if (widgetId !== null) return api;

      widgetId = api.render(ensureContainer(), {
        sitekey: SITEKEY,
        execution: "execute",
        callback: function (token) { settlePending(token); },
        "error-callback": function () { settlePending("", new Error("Turnstile challenge failed")); },
        "expired-callback": function () { settlePending("", new Error("Turnstile challenge expired")); },
        "timeout-callback": function () { settlePending("", new Error("Turnstile challenge timed out")); },
      });

      if (widgetId === undefined || widgetId === null) {
        throw new Error("Turnstile widget failed to render");
      }
      return api;
    });
  }

  function acquireToken() {
    return ensureWidget().then(function (api) {
      return new Promise(function (resolve, reject) {
        pendingToken = {
          resolve: resolve,
          reject: reject,
          timer: window.setTimeout(function () {
            settlePending("", new Error("Turnstile token timed out"));
          }, TOKEN_TIMEOUT_MS),
        };

        try {
          if (hasExecuted) api.reset(widgetId);
          hasExecuted = true;
          api.execute(widgetId);
        } catch (error) {
          settlePending("", error);
        }
      });
    });
  }

  window.getTurnstileToken = function () {
    var request = tokenQueue.then(acquireToken, acquireToken);
    tokenQueue = request.then(
      function () { return new Promise(function (resolve) { window.setTimeout(resolve, 0); }); },
      function () { return new Promise(function (resolve) { window.setTimeout(resolve, 0); }); }
    );
    return request;
  };
})();
