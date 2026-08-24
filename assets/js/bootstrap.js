(function () {
  window.toggleTheme = function () {
    document.documentElement.classList.toggle('light-mode');
    const currentTheme = document.documentElement.classList.contains('light-mode') ? 'light' : 'dark';
    localStorage.setItem('theme', currentTheme);
  };

  if ('serviceWorker' in navigator) {
    const unregisterLegacyServiceWorker = function () {
      const legacyScope = new URL('assets/js/', window.location.href).href;
      const legacyScriptUrl = new URL('assets/js/service-worker.js', window.location.href).href;

      return navigator.serviceWorker.getRegistrations().then(function (registrations) {
        const legacyRegistration = registrations.find(function (registration) {
          if (registration.scope !== legacyScope) return false;

          return [registration.active, registration.waiting, registration.installing].some(function (worker) {
            return worker && worker.scriptURL === legacyScriptUrl;
          });
        });

        return legacyRegistration ? legacyRegistration.unregister() : false;
      });
    };

    const syncServiceWorkerState = function () {
      document.documentElement.setAttribute(
        'data-service-worker-controlled',
        navigator.serviceWorker.controller ? 'true' : 'false'
      );
    };

    navigator.serviceWorker.addEventListener('controllerchange', syncServiceWorkerState);
    window.addEventListener('load', function () {
      syncServiceWorkerState();
      unregisterLegacyServiceWorker()
        .catch(function () { return false; })
        .then(function () {
          return navigator.serviceWorker.register('service-worker.js');
        })
        .then(function () { return navigator.serviceWorker.ready; })
        .then(syncServiceWorkerState)
        .catch(syncServiceWorkerState);
    });
  }

  function initFormHandler() {
    const form = document.querySelector(".form");
    if (!form) return;

    async function handleSubmit(event) {
      event.preventDefault();
      const formData = new FormData(form);

      try {
        const response = await fetch(form.action, {
          method: form.method,
          body: formData,
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          alert("✅ Message sent successfully!");
          form.reset();
        } else {
          alert("❌ Oops! Something went wrong. Please try again.");
        }
      } catch (error) {
        alert("⚠️ Network error. Please try again later.");
      }
    }

    form.addEventListener("submit", handleSubmit);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initFormHandler);
  } else {
    initFormHandler();
  }
})();
