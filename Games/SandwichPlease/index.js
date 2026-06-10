// Unity WebGL loader for Telegram Mini App production builds.
(function () {
    "use strict";

    var searchParams = new URLSearchParams(window.location.search);
    var debugEnabled = searchParams.get("debug") === "1" || searchParams.get("tgDebug") === "1";
    var container = document.querySelector("#unity-container");
    var canvas = document.querySelector("#unity-canvas");
    var loadingBar = document.querySelector("#unity-loading-bar");
    var progressBarFull = document.querySelector("#unity-progress-bar-full");
    var warningBanner = document.querySelector("#unity-warning");
    var debugOverlay = document.querySelector("#telegram-debug-overlay");
    var telegram = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;

    window.IdleDefenseTelegram = {
        debug: debugEnabled,
        hasTelegram: !!telegram,
        webApp: telegram,
        unityInstance: null,
        viewport: {}
    };

    function setCssNumber(name, value) {
        var numberValue = Number(value);
        if (!Number.isFinite(numberValue)) {
            numberValue = 0;
        }
        document.documentElement.style.setProperty(name, numberValue + "px");
    }

    function setCssColor(name, value) {
        if (typeof value === "string" && value.length > 0) {
            document.documentElement.style.setProperty(name, value);
        }
    }

    function safeStringify(value) {
        if (value instanceof Error) {
            return value.name + ": " + value.message;
        }

        if (typeof value === "string") {
            return value;
        }

        try {
            return JSON.stringify(value);
        } catch (error) {
            return String(value);
        }
    }

    function isTelegramVersionAtLeast(requiredVersion) {
        if (!telegram || typeof telegram.version !== "string") {
            return false;
        }

        var currentParts = telegram.version.split(".").map(function (part) {
            return parseInt(part, 10) || 0;
        });
        var requiredParts = requiredVersion.split(".").map(function (part) {
            return parseInt(part, 10) || 0;
        });
        var length = Math.max(currentParts.length, requiredParts.length);

        for (var i = 0; i < length; i++) {
            var current = i < currentParts.length ? currentParts[i] : 0;
            var required = i < requiredParts.length ? requiredParts[i] : 0;
            if (current !== required) {
                return current > required;
            }
        }

        return true;
    }

    function writeDebug(message, payload) {
        if (!debugEnabled || !debugOverlay) {
            return;
        }

        var line = document.createElement("div");
        var time = new Date().toISOString().slice(11, 19);
        var suffix = payload === undefined ? "" : " " + safeStringify(payload);
        line.textContent = "[" + time + "] " + message + suffix;
        debugOverlay.appendChild(line);
        debugOverlay.scrollTop = debugOverlay.scrollHeight;
    }

    function unityShowBanner(msg, type) {
        if (!warningBanner) {
            return;
        }

        function updateBannerVisibility() {
            warningBanner.style.display = warningBanner.children.length ? "block" : "none";
        }

        var div = document.createElement("div");
        div.textContent = msg;
        warningBanner.appendChild(div);

        if (type === "error") {
            div.className = "unity-banner unity-banner-error";
        } else if (type === "warning") {
            div.className = "unity-banner unity-banner-warning";
            setTimeout(function () {
                if (div.parentNode) {
                    warningBanner.removeChild(div);
                    updateBannerVisibility();
                }
            }, 5000);
        } else {
            div.className = "unity-banner unity-banner-info";
        }

        updateBannerVisibility();
    }

    function reportError(source, error) {
        var message = source + ": " + safeStringify(error);
        console.error(message, error);
        unityShowBanner(message, "error");
        writeDebug("ERROR " + source, error);
    }

    window.addEventListener("error", function (event) {
        reportError("window.onerror", {
            message: event.message,
            source: event.filename,
            line: event.lineno,
            column: event.colno
        });
    });

    window.addEventListener("unhandledrejection", function (event) {
        reportError("unhandledrejection", event.reason || "Promise rejected");
    });

    function lazyLoadBackground() {
        var img = new Image();
        img.onload = function () {
            document.body.classList.add("bg-loaded");
        };
        img.src = "TemplateData/BG.png";
    }

    function applyInsets(prefix, inset) {
        inset = inset || {};
        setCssNumber(prefix + "-top", inset.top);
        setCssNumber(prefix + "-right", inset.right);
        setCssNumber(prefix + "-bottom", inset.bottom);
        setCssNumber(prefix + "-left", inset.left);
    }

    function applyTelegramViewport() {
        var viewportHeight = window.innerHeight;
        var viewportStableHeight = window.innerHeight;

        if (telegram) {
            viewportHeight = telegram.viewportHeight || viewportHeight;
            viewportStableHeight = telegram.viewportStableHeight || viewportHeight;
            applyInsets("--idle-tg-safe-area-inset", telegram.safeAreaInset);
            applyInsets("--idle-tg-content-safe-area-inset", telegram.contentSafeAreaInset);
            setCssColor("--idle-tg-bg-color", telegram.backgroundColor);
            setCssColor("--idle-tg-header-color", telegram.headerColor);
            setCssColor("--idle-tg-bottom-bar-color", telegram.bottomBarColor);
        }

        setCssNumber("--idle-tg-viewport-height", viewportHeight);
        setCssNumber("--idle-tg-viewport-stable-height", viewportStableHeight);
        setCssNumber("--idle-tg-portrait-width", viewportStableHeight * 9 / 16);
        window.IdleDefenseTelegram.viewport = {
            height: viewportHeight,
            stableHeight: viewportStableHeight,
            isExpanded: telegram ? telegram.isExpanded : false
        };
    }

    function initializeTelegram() {
        if (!telegram) {
            document.documentElement.classList.add("telegram-unavailable");
            writeDebug("Telegram WebApp SDK unavailable");
            applyTelegramViewport();
            return;
        }

        document.documentElement.classList.add("telegram-available");

        try {
            telegram.ready();
            writeDebug("Telegram ready", {
                version: telegram.version,
                platform: telegram.platform,
                colorScheme: telegram.colorScheme
            });
        } catch (error) {
            reportError("Telegram.ready", error);
        }

        try {
            telegram.expand();
        } catch (error) {
            reportError("Telegram.expand", error);
        }

        if (typeof telegram.setHeaderColor === "function" && isTelegramVersionAtLeast("6.1")) {
            try {
                telegram.setHeaderColor("#17212b");
            } catch (error) {
                writeDebug("Telegram setHeaderColor skipped", error);
            }
        }

        if (typeof telegram.setBackgroundColor === "function" && isTelegramVersionAtLeast("6.1")) {
            try {
                telegram.setBackgroundColor("#17212b");
            } catch (error) {
                writeDebug("Telegram setBackgroundColor skipped", error);
            }
        }

        if (typeof telegram.onEvent === "function") {
            telegram.onEvent("viewportChanged", function (eventData) {
                applyTelegramViewport();
                writeDebug("viewportChanged", eventData);
            });
            telegram.onEvent("safeAreaChanged", function () {
                applyTelegramViewport();
                writeDebug("safeAreaChanged");
            });
            telegram.onEvent("contentSafeAreaChanged", function () {
                applyTelegramViewport();
                writeDebug("contentSafeAreaChanged");
            });
            telegram.onEvent("themeChanged", function () {
                applyTelegramViewport();
                writeDebug("themeChanged", telegram.themeParams);
            });
        }

        applyTelegramViewport();
    }

    window.addEventListener("resize", applyTelegramViewport);
    window.addEventListener("orientationchange", function () {
        setTimeout(applyTelegramViewport, 250);
    });

    window.addEventListener("load", function () {
        lazyLoadBackground();
    });

    initializeTelegram();

    var buildUrl = "Build";
    var loaderUrl = buildUrl + "/docs.loader.js";
    var config = {
        dataUrl: buildUrl + "/docs.data",
        frameworkUrl: buildUrl + "/docs.framework.js",
        codeUrl: buildUrl + "/docs.wasm",
        streamingAssetsUrl: "StreamingAssets",
        companyName: "MAD",
        productName: "Sandwich Please",
        productVersion: "1.0",
        autoSyncPersistentDataPath: true,
        showBanner: unityShowBanner,
        errorHandler: function (message, source, line) {
            reportError("Unity runtime", {
                message: message,
                source: source || "",
                line: line || 0
            });
        },
        startupErrorHandler: function (message, source, line) {
            reportError("Unity startup", {
                message: message,
                source: source || "",
                line: line || 0
            });
        },
    };


    loadingBar.style.display = "block";

    var script = document.createElement("script");
    script.src = loaderUrl;
    script.async = true;
    script.onload = function () {
        writeDebug("Unity loader loaded", loaderUrl);
        createUnityInstance(canvas, config, function (progress) {
            progressBarFull.style.width = 100 * progress + "%";
            if (debugEnabled) {
                window.IdleDefenseTelegram.loadProgress = progress;
            }
        }).then(function (unityInstance) {
            window.IdleDefenseTelegram.unityInstance = unityInstance;
            loadingBar.style.display = "none";
            container.classList.add("unity-loaded");
            writeDebug("Unity instance ready");
        }).catch(function (error) {
            if (error === undefined) {
                reportError("createUnityInstance", "Unity startup failed before the loader returned a detailed exception. Rebuild with WebGL Exception Support enabled, then check the first Unity startup/runtime error above this line.");
                return;
            }

            reportError("createUnityInstance", error);
        });
    };
    script.onerror = function () {
        reportError("Unity loader script", "Failed to load " + loaderUrl);
    };
    document.body.appendChild(script);
})();
