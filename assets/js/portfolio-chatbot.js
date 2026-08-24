(function () {
  var STORAGE_PREFIX = "portfolioChatbot";
  var scrollLockY = 0;
  var DEFAULT_CONFIG = {
    endpoint: "",
    telegramUrl: "https://t.me/o0_MaD_0o",
    title: "MAD Assistant",
    subtitle: "Unity / WebGL / AI",
    greeting: "Hi, I am Hoa's portfolio assistant. Ask about Unity projects, WebGL, GameFi, Telegram bots, or hiring availability.",
    maxMessages: 12,
    maxInputLength: 900,
    proactiveEnabled: true,
    proactiveDelayMs: 5000,
    proactiveDetailDelayMs: 8000,
    proactiveDetailScrollThreshold: 0.3,
    proactiveVisibleMs: 4000,
    proactiveMaxPerSession: 4,
    proactiveMessages: [
      "Hi! Looking for a Game developer?",
      "Need a Unity developer who can take a game from prototype to release?",
      "Have a game idea that needs a playable prototype?",
      "Looking for someone who can lead Unity production?",
      "Building a mobile, WebGL, GameFi, or Telegram game?",
      "Need help with gameplay, optimization, ads, IAP, or publishing?"
    ],
    proactiveContextMessages: {
      about: "Want a quick summary of Hoa's strongest experience?",
      resume: "Want me to highlight the experience most relevant to your team?",
      portfolio: "Need help choosing which projects to review first?",
      detail: "Planning something similar? Ask me how Hoa can help.",
      gitshare: "Looking for public code samples or playable demos?",
      hiring: "Have a project in mind? I can help you contact Hoa on Telegram."
    },
    quickPrompts: [
      "What Unity projects should I review first?",
      "Can Hoa build a Telegram mini app?",
      "I want to hire Hoa for a game prototype."
    ]
  };

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
      return;
    }
    fn();
  }

  function getConfig() {
    var custom = window.PORTFOLIO_CHATBOT_CONFIG || {};
    var config = Object.assign({}, DEFAULT_CONFIG, custom);
    if (!Array.isArray(config.quickPrompts) || config.quickPrompts.length === 0) {
      config.quickPrompts = DEFAULT_CONFIG.quickPrompts;
    }
    if (!Array.isArray(config.proactiveMessages) || config.proactiveMessages.length === 0) {
      config.proactiveMessages = DEFAULT_CONFIG.proactiveMessages;
    }
    if (!config.proactiveContextMessages || typeof config.proactiveContextMessages !== "object") {
      config.proactiveContextMessages = DEFAULT_CONFIG.proactiveContextMessages;
    }
    config.proactiveDelayMs = Math.max(1000, Number(config.proactiveDelayMs) || DEFAULT_CONFIG.proactiveDelayMs);
    config.proactiveDetailDelayMs = Math.max(1000, Number(config.proactiveDetailDelayMs) || DEFAULT_CONFIG.proactiveDetailDelayMs);
    config.proactiveDetailScrollThreshold = Math.min(0.9, Math.max(0.1, Number(config.proactiveDetailScrollThreshold) || DEFAULT_CONFIG.proactiveDetailScrollThreshold));
    config.proactiveVisibleMs = Math.max(1000, Number(config.proactiveVisibleMs) || DEFAULT_CONFIG.proactiveVisibleMs);
    config.proactiveMaxPerSession = Math.max(1, Number(config.proactiveMaxPerSession) || DEFAULT_CONFIG.proactiveMaxPerSession);
    return config;
  }

  function safeStorageGet(key) {
    try {
      return localStorage.getItem(STORAGE_PREFIX + key);
    } catch (error) {
      return null;
    }
  }

  function safeStorageSet(key, value) {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, value);
    } catch (error) {
      /* storage unavailable */
    }
  }

  function safeSessionGet(key) {
    try {
      return sessionStorage.getItem(STORAGE_PREFIX + key);
    } catch (error) {
      return null;
    }
  }

  function safeSessionSet(key, value) {
    try {
      sessionStorage.setItem(STORAGE_PREFIX + key, value);
    } catch (error) {
      /* session storage unavailable */
    }
  }

  function createSessionId() {
    var id = "chat-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
    safeStorageSet("SessionId", id);
    return id;
  }

  function makeId() {
    var saved = safeStorageGet("SessionId");
    return saved || createSessionId();
  }

  function loadMessages(config) {
    var savedEndpoint = safeStorageGet("Endpoint");
    if (savedEndpoint !== config.endpoint) {
      safeStorageSet("Endpoint", config.endpoint || "");
      safeStorageSet("Messages", "");
    }

    var saved = safeStorageGet("Messages");
    if (!saved) {
      return [{ role: "assistant", content: config.greeting }];
    }

    try {
      var parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.slice(-config.maxMessages);
      }
    } catch (error) {
      /* reset invalid state */
    }

    return [{ role: "assistant", content: config.greeting }];
  }

  function saveMessages(messages, config) {
    safeStorageSet("Messages", JSON.stringify(messages.slice(-config.maxMessages)));
  }

  function createRobotButton(config) {
    var button = document.createElement("button");
    button.className = "portfolio-chatbot-button";
    button.type = "button";
    button.style.position = "fixed";
    button.style.right = "88px";
    button.style.bottom = "244px";
    button.style.zIndex = "10002";
    button.style.display = "grid";
    button.setAttribute("aria-label", "Open portfolio assistant");
    button.setAttribute("title", "Open portfolio assistant");
    button.innerHTML = [
      '<span class="portfolio-chatbot-pet" aria-hidden="true"></span>',
      '<span class="portfolio-chatbot-ping" aria-hidden="true"></span>'
    ].join("");
    return button;
  }

  function createPanel(config) {
    var panel = document.createElement("section");
    panel.className = "portfolio-chatbot-panel";
    panel.style.position = "fixed";
    panel.style.right = "18px";
    panel.style.bottom = "320px";
    panel.style.zIndex = "10001";
    panel.setAttribute("aria-label", "Portfolio assistant chat");
    panel.setAttribute("aria-hidden", "true");
    panel.innerHTML = [
      '<div class="portfolio-chatbot-header">',
      '<div>',
      '<strong>' + escapeHtml(config.title) + '</strong>',
      '<span>' + escapeHtml(config.subtitle) + '</span>',
      '</div>',
      '<div class="portfolio-chatbot-actions">',
      '<button class="portfolio-chatbot-new" type="button" aria-label="New chat" title="New chat"><span aria-hidden="true"></span></button>',
      '<button class="portfolio-chatbot-expand" type="button" aria-label="Expand chat" title="Expand chat"><span aria-hidden="true"></span></button>',
      '<button class="portfolio-chatbot-close" type="button" aria-label="Close assistant">x</button>',
      '</div>',
      '</div>',
      '<div class="portfolio-chatbot-log" aria-live="polite"></div>',
      '<div class="portfolio-chatbot-prompts" aria-label="Quick prompts"></div>',
      '<form class="portfolio-chatbot-form">',
      '<input class="portfolio-chatbot-input" type="text" autocomplete="off" maxlength="' + Number(config.maxInputLength) + '" placeholder="Ask about projects or hiring...">',
      '<button class="portfolio-chatbot-send" type="submit" aria-label="Send message">Send</button>',
      '</form>',
      '<a class="portfolio-chatbot-fallback" href="' + escapeAttr(config.telegramUrl) + '" target="_blank" rel="noopener noreferrer">Open Telegram direct</a>'
    ].join("");
    return panel;
  }

  function createInvitation() {
    var invitation = document.createElement("aside");
    invitation.className = "portfolio-chatbot-invitation";
    invitation.setAttribute("role", "status");
    invitation.setAttribute("aria-live", "polite");
    invitation.setAttribute("aria-hidden", "true");
    invitation.inert = true;
    invitation.innerHTML = [
      '<button class="portfolio-chatbot-invitation-message" type="button"></button>',
      '<button class="portfolio-chatbot-invitation-close" type="button" aria-label="Dismiss assistant invitation">x</button>'
    ].join("");
    return invitation;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, function (char) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char];
    });
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/'/g, "&#39;");
  }

  function renderMessages(log, messages) {
    log.innerHTML = messages.map(function (message) {
      return '<div class="portfolio-chatbot-message ' + message.role + '"><span>' + escapeHtml(message.content) + '</span></div>';
    }).join("");
    log.scrollTop = log.scrollHeight;
  }

  function renderPrompts(container, prompts, onPrompt) {
    container.innerHTML = prompts.slice(0, 4).map(function (prompt) {
      return '<button type="button">' + escapeHtml(prompt) + '</button>';
    }).join("");

    Array.from(container.querySelectorAll("button")).forEach(function (button) {
      button.addEventListener("click", function () {
        onPrompt(button.textContent || "");
      });
    });
  }

  function endpointReady(endpoint) {
    return endpoint && endpoint.indexOf("YOUR_WORKER") === -1;
  }

  function makeFallbackReply(config) {
    return "Assistant API is not connected yet. Message Hoa directly on Telegram: " + config.telegramUrl;
  }

  function getTurnstileToken(config) {
    var provider = typeof config.getTurnstileToken === "function"
      ? config.getTurnstileToken
      : window.getTurnstileToken;

    if (typeof provider !== "function") {
      return Promise.reject(new Error("Turnstile challenge not configured"));
    }

    return Promise.resolve().then(function () {
      return provider();
    }).then(function (token) {
      if (typeof token !== "string" || !token.trim()) {
        throw new Error("Turnstile challenge returned no token");
      }
      return token;
    });
  }

  function callWorker(config, sessionId, messages) {
    if (!endpointReady(config.endpoint)) {
      return Promise.resolve({ reply: makeFallbackReply(config), leadSent: false, leadReason: "endpoint not configured" });
    }

    return getTurnstileToken(config).then(function (turnstileToken) {
      return fetch(config.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionId,
          messages: messages.slice(-config.maxMessages),
          pageUrl: window.location.href,
          turnstileToken: turnstileToken
        })
      });
    }).then(function (response) {
      if (!response.ok) throw new Error("chat request failed");
      return response.json();
    });
  }

  function addStatus(panel, text) {
    var status = panel.querySelector(".portfolio-chatbot-status");
    if (!status) {
      status = document.createElement("div");
      status.className = "portfolio-chatbot-status";
      panel.insertBefore(status, panel.querySelector(".portfolio-chatbot-form"));
    }
    status.textContent = text;
  }

  function clearStatus(panel) {
    var status = panel.querySelector(".portfolio-chatbot-status");
    if (status) status.remove();
  }

  function setOpen(panel, button, open) {
    panel.classList.toggle("active", open);
    button.classList.toggle("active", open);
    panel.setAttribute("aria-hidden", open ? "false" : "true");
    panel.inert = !open;
    safeStorageSet("Open", open ? "1" : "0");
    updateScrollLock(panel);
  }

  function setExpanded(panel, expandButton, expanded) {
    panel.classList.toggle("is-expanded", expanded);
    safeStorageSet("Expanded", expanded ? "1" : "0");

    if (expandButton) {
      expandButton.setAttribute("aria-label", expanded ? "Shrink chat" : "Expand chat");
      expandButton.setAttribute("title", expanded ? "Shrink chat" : "Expand chat");
    }

    updateScrollLock(panel);
  }

  function isMobileViewport() {
    return window.matchMedia && window.matchMedia("(max-width: 768px)").matches;
  }

  function shouldLockScroll(panel) {
    return isMobileViewport() && panel.classList.contains("active") && panel.classList.contains("is-expanded");
  }

  function lockPageScroll() {
    if (document.body.classList.contains("portfolio-chatbot-scroll-locked")) return;

    scrollLockY = window.scrollY || document.documentElement.scrollTop || 0;
    document.body.classList.add("portfolio-chatbot-scroll-locked");
    document.body.style.position = "fixed";
    document.body.style.top = "-" + scrollLockY + "px";
    document.body.style.left = "0";
    document.body.style.right = "0";
  }

  function unlockPageScroll() {
    if (!document.body.classList.contains("portfolio-chatbot-scroll-locked")) return;

    document.body.classList.remove("portfolio-chatbot-scroll-locked");
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    window.scrollTo(0, scrollLockY);
  }

  function updateScrollLock(panel) {
    if (shouldLockScroll(panel)) {
      lockPageScroll();
      return;
    }
    unlockPageScroll();
  }

  function restorePosition(button) {
    var saved = safeStorageGet("PositionV2");
    if (!saved) return;

    try {
      var pos = JSON.parse(saved);
      if (typeof pos.x === "number" && typeof pos.y === "number") {
        var x = Math.max(0, Math.min(window.innerWidth - button.offsetWidth, pos.x));
        var y = Math.max(0, Math.min(window.innerHeight - button.offsetHeight, pos.y));
        setFloatingPosition(button, x, y);
      }
    } catch (error) {
      /* ignore invalid position */
    }
  }

  function setFloatingPosition(button, x, y) {
    button.style.setProperty("left", x + "px", "important");
    button.style.setProperty("top", y + "px", "important");
    button.style.setProperty("right", "auto", "important");
    button.style.setProperty("bottom", "auto", "important");
  }

  function clampPosition(button) {
    var rect = button.getBoundingClientRect();
    var x = Math.max(0, Math.min(window.innerWidth - button.offsetWidth, rect.left));
    var y = Math.max(0, Math.min(window.innerHeight - button.offsetHeight, rect.top));
    setFloatingPosition(button, x, y);
  }

  function resetMobilePosition(button) {
    ["left", "top", "right", "bottom"].forEach(function (property) {
      button.style.removeProperty(property);
    });
  }

  function makeDraggable(button) {
    if (isMobileViewport()) {
      resetMobilePosition(button);
      return;
    }
    restorePosition(button);

    var dragging = false;
    var suppressClick = false;
    var offsetX = 0;
    var offsetY = 0;
    var startX = 0;
    var startY = 0;

    function moveTo(clientX, clientY) {
      var x = Math.max(0, Math.min(window.innerWidth - button.offsetWidth, clientX - offsetX));
      var y = Math.max(0, Math.min(window.innerHeight - button.offsetHeight, clientY - offsetY));
      setFloatingPosition(button, x, y);
    }

    function savePosition() {
      safeStorageSet("PositionV1", JSON.stringify({
        x: parseFloat(button.style.left || "0"),
        y: parseFloat(button.style.top || "0")
      }));
      safeStorageSet("PositionV2", JSON.stringify({
        x: parseFloat(button.style.left || "0"),
        y: parseFloat(button.style.top || "0")
      }));
    }

    function onMove(event) {
      if (!dragging) return;
      if (Math.hypot(event.clientX - startX, event.clientY - startY) > 4) {
        suppressClick = true;
      }
      moveTo(event.clientX, event.clientY);
    }

    function onUp(event) {
      if (!dragging) return;
      dragging = false;
      button.classList.remove("is-dragging");
      try {
        button.releasePointerCapture(event.pointerId);
      } catch (error) {
        /* pointer capture may already be released */
      }
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointercancel", onUp);
      if (suppressClick) savePosition();
    }

    button.addEventListener("pointerdown", function (event) {
      if (typeof event.button === "number" && event.button !== 0) return;
      var rect = button.getBoundingClientRect();
      dragging = true;
      suppressClick = false;
      startX = event.clientX;
      startY = event.clientY;
      offsetX = event.clientX - rect.left;
      offsetY = event.clientY - rect.top;
      button.classList.add("is-dragging");
      try {
        button.setPointerCapture(event.pointerId);
      } catch (error) {
        /* pointer capture unavailable */
      }
      document.addEventListener("pointermove", onMove);
      document.addEventListener("pointerup", onUp);
      document.addEventListener("pointercancel", onUp);
    });

    button.addEventListener("click", function (event) {
      if (!suppressClick) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      window.setTimeout(function () { suppressClick = false; }, 0);
    }, true);
  }

  function shuffle(items) {
    var result = items.slice();
    for (var index = result.length - 1; index > 0; index -= 1) {
      var swapIndex = Math.floor(Math.random() * (index + 1));
      var current = result[index];
      result[index] = result[swapIndex];
      result[swapIndex] = current;
    }
    return result;
  }

  function activeInvitationContext() {
    if (document.body.classList.contains("portfolio-detail-open") || document.querySelector("[project-detail].active")) return "detail";
    var activePage = document.querySelector("[data-page].active");
    return activePage && activePage.dataset ? activePage.dataset.page : "about";
  }

  function activeDetailProject() {
    var detail = document.querySelector("[project-detail].active");
    if (!detail || !document.body.classList.contains("portfolio-detail-open")) return null;
    return {
      element: detail,
      key: detail.dataset.detailCategory || "",
      title: detail.dataset.projectTitle || "this project",
      role: detail.dataset.projectRole || "",
      family: detail.dataset.showcaseFamily || ""
    };
  }

  function detailInvitationFor(project) {
    var title = project.title;
    var messages = {
      "flagship-worlds": "Want Hoa's production highlights for " + title + "?",
      "mobile-campaign": "Want the mobile delivery highlights for " + title + "?",
      "gameplay-editorial": "Want the gameplay highlights for " + title + "?",
      "product-console": "Want the product architecture behind " + title + "?",
      "compact-proof": "Want a quick role summary for " + title + "?",
      "production-showcase": "Want the production story behind " + title + "?"
    };
    return messages[project.family] || "Want a quick project summary for " + title + "?";
  }

  function detailPromptFor(project) {
    return "Summarize Hoa's role and strongest production contributions on " + project.title + ".";
  }

  function detailScrollProgress(project) {
    var top = project.element.getBoundingClientRect().top + window.scrollY;
    var distance = Math.max(project.element.offsetHeight - window.innerHeight, 1);
    return Math.max(0, Math.min(1, (window.scrollY - top) / distance));
  }

  function createProactiveController(config, button, panel, input, form, newChat) {
    var invitation = createInvitation();
    var messageButton = invitation.querySelector(".portfolio-chatbot-invitation-message");
    var closeButton = invitation.querySelector(".portfolio-chatbot-invitation-close");
    var scheduleTimer = 0;
    var dismissalTimer = 0;
    var detailArmTimer = 0;
    var detailScrollArmed = false;
    var queue = shuffle(config.proactiveMessages);
    var state = { stopped: false, count: 0, used: [], detailSeen: [] };
    var pendingDetailPrompt = "";
    var saved = safeSessionGet("ProactiveState");

    if (saved) {
      try {
        state = Object.assign(state, JSON.parse(saved));
      } catch (error) {
        state = { stopped: false, count: 0, used: [], detailSeen: [] };
      }
    }
    if (!Array.isArray(state.used)) state.used = [];
    if (!Array.isArray(state.detailSeen)) state.detailSeen = [];

    document.body.appendChild(invitation);

    function persist() {
      safeSessionSet("ProactiveState", JSON.stringify(state));
    }

    function clearTimers() {
      window.clearTimeout(scheduleTimer);
      window.clearTimeout(dismissalTimer);
      window.clearTimeout(detailArmTimer);
      scheduleTimer = 0;
      dismissalTimer = 0;
      detailArmTimer = 0;
      detailScrollArmed = false;
    }

    function hide() {
      window.clearTimeout(dismissalTimer);
      dismissalTimer = 0;
      invitation.classList.remove("active");
      invitation.setAttribute("aria-hidden", "true");
      invitation.inert = true;
      pendingDetailPrompt = "";
    }

    function position() {
      if (!invitation.classList.contains("active")) return;
      var buttonRect = button.getBoundingClientRect();
      var invitationRect = invitation.getBoundingClientRect();
      var left = Math.max(10, Math.min(window.innerWidth - invitationRect.width - 10, buttonRect.right - invitationRect.width));
      var top = Math.max(10, buttonRect.top - invitationRect.height - 12);
      invitation.style.left = left + "px";
      invitation.style.top = top + "px";
    }

    function stop() {
      if (!state.stopped) {
        state.stopped = true;
        persist();
      }
      clearTimers();
      hide();
    }

    function nextMessage() {
      var project = activeDetailProject();
      if (project) {
        if (!project.key || state.detailSeen.indexOf(project.key) !== -1) return "";
        state.detailSeen.push(project.key);
        pendingDetailPrompt = detailPromptFor(project);
        return detailInvitationFor(project);
      }
      var contextMessage = config.proactiveContextMessages[activeInvitationContext()];
      if (contextMessage && state.used.indexOf(contextMessage) === -1) return contextMessage;
      while (queue.length) {
        var candidate = queue.shift();
        if (state.used.indexOf(candidate) === -1) return candidate;
      }
      var hiringMessage = config.proactiveContextMessages.hiring;
      return hiringMessage && state.used.indexOf(hiringMessage) === -1 ? hiringMessage : "";
    }

    function schedule() {
      window.clearTimeout(scheduleTimer);
      if (!config.proactiveEnabled || state.stopped || document.hidden || state.count >= config.proactiveMaxPerSession) return;
      var project = activeDetailProject();
      if (project && state.detailSeen.indexOf(project.key) !== -1) return;
      scheduleTimer = window.setTimeout(show, project ? config.proactiveDetailDelayMs : config.proactiveDelayMs);
    }

    function armDetailScroll() {
      window.clearTimeout(detailArmTimer);
      detailScrollArmed = false;
      if (!activeDetailProject()) return;
      detailArmTimer = window.setTimeout(function () {
        detailArmTimer = 0;
        detailScrollArmed = true;
      }, 1200);
    }

    function show() {
      window.clearTimeout(scheduleTimer);
      scheduleTimer = 0;
      if (state.stopped || document.hidden || panel.classList.contains("active")) return;
      var message = nextMessage();
      if (!message) return;
      state.used.push(message);
      state.count += 1;
      if (state.count >= config.proactiveMaxPerSession) state.stopped = true;
      persist();
      messageButton.textContent = message;
      invitation.classList.add("active");
      invitation.setAttribute("aria-hidden", "false");
      invitation.inert = false;
      window.requestAnimationFrame(position);
      dismissalTimer = window.setTimeout(hide, config.proactiveVisibleMs);
      if (!state.stopped) schedule();
    }

    function onDetailScroll() {
      if (!detailScrollArmed || state.stopped || document.hidden || panel.classList.contains("active")) return;
      var project = activeDetailProject();
      if (!project || state.detailSeen.indexOf(project.key) !== -1) return;
      if (detailScrollProgress(project) >= config.proactiveDetailScrollThreshold) show();
    }

    messageButton.addEventListener("click", function () {
      var detailPrompt = pendingDetailPrompt;
      stop();
      setOpen(panel, button, true);
      if (detailPrompt) input.value = detailPrompt;
      input.focus();
    });
    closeButton.addEventListener("click", stop);
    button.addEventListener("click", stop);
    input.addEventListener("input", stop, { once: true });
    form.addEventListener("submit", stop);
    newChat.addEventListener("click", stop);
    document.addEventListener("visibilitychange", function () {
      clearTimers();
      hide();
      if (!document.hidden) {
        schedule();
        armDetailScroll();
      }
    });
    document.addEventListener("portfolio:detail-opened", function () {
      clearTimers();
      hide();
      schedule();
      armDetailScroll();
    });
    window.addEventListener("scroll", onDetailScroll, { passive: true });
    window.addEventListener("resize", position);
    window.addEventListener("beforeunload", clearTimers, { once: true });

    if (panel.classList.contains("active")) stop();
    else {
      schedule();
      armDetailScroll();
    }

    return { stop: stop, position: position };
  }

  function applyThemeClass() {
    if (document.querySelector(".topbar")) {
      document.body.classList.add("portfolio-chatbot-clean");
    }
    if (document.querySelector(".console-nav")) {
      document.body.classList.add("portfolio-chatbot-console");
    }
    if (document.querySelector(".masthead")) {
      document.body.classList.add("portfolio-chatbot-studio");
    }
  }

  ready(function () {
    if (document.querySelector(".portfolio-chatbot-button")) return;

    applyThemeClass();

    var config = getConfig();
    var sessionId = makeId();
    var messages = loadMessages(config);
    var button = createRobotButton(config);
    var panel = createPanel(config);
    var log = panel.querySelector(".portfolio-chatbot-log");
    var form = panel.querySelector(".portfolio-chatbot-form");
    var input = panel.querySelector(".portfolio-chatbot-input");
    var newChat = panel.querySelector(".portfolio-chatbot-new");
    var expand = panel.querySelector(".portfolio-chatbot-expand");
    var close = panel.querySelector(".portfolio-chatbot-close");
    var prompts = panel.querySelector(".portfolio-chatbot-prompts");

    document.body.appendChild(button);
    document.body.appendChild(panel);
    renderMessages(log, messages);
    renderPrompts(prompts, config.quickPrompts, function (prompt) {
      input.value = prompt;
      form.requestSubmit();
    });
    makeDraggable(button);

    setOpen(panel, button, safeStorageGet("Open") === "1");
    setExpanded(panel, expand, safeStorageGet("Expanded") === "1");
    var proactive = createProactiveController(config, button, panel, input, form, newChat);

    button.addEventListener("click", function () {
      setOpen(panel, button, !panel.classList.contains("active"));
      if (panel.classList.contains("active")) input.focus();
    });

    close.addEventListener("click", function () {
      setOpen(panel, button, false);
    });

    newChat.addEventListener("click", function () {
      sessionId = createSessionId();
      messages = [{ role: "assistant", content: config.greeting }];
      input.value = "";
      clearStatus(panel);
      saveMessages(messages, config);
      renderMessages(log, messages);
      if (!panel.classList.contains("active")) setOpen(panel, button, true);
      input.focus();
    });

    expand.addEventListener("click", function () {
      setExpanded(panel, expand, !panel.classList.contains("is-expanded"));
      if (panel.classList.contains("active")) input.focus();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && panel.classList.contains("active")) {
        setOpen(panel, button, false);
      }
    });

    window.addEventListener("resize", function () {
      if (isMobileViewport()) resetMobilePosition(button);
      else clampPosition(button);
      proactive.position();
      updateScrollLock(panel);
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var text = input.value.trim();
      if (!text) return;
      if (text.length > config.maxInputLength) {
        text = text.slice(0, config.maxInputLength);
      }

      input.value = "";
      messages.push({ role: "user", content: text });
      messages.push({ role: "assistant", content: "typing..." });
      renderMessages(log, messages);
      button.classList.add("is-thinking");

      callWorker(config, sessionId, messages.filter(function (message) { return message.content !== "typing..."; }))
        .then(function (data) {
          messages.pop();
          messages.push({ role: "assistant", content: data && data.reply ? data.reply : makeFallbackReply(config) });
          if (data && data.leadSent) {
            addStatus(panel, "Sent to Hoa on Telegram.");
          }
        })
        .catch(function () {
          messages.pop();
          messages.push({ role: "assistant", content: makeFallbackReply(config) });
        })
        .finally(function () {
          button.classList.remove("is-thinking");
          saveMessages(messages, config);
          renderMessages(log, messages);
        });
    });
  });
})();
