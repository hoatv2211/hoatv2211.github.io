(function () {
  window.toggleTheme = function () {
    document.documentElement.classList.toggle('light-mode');
    const currentTheme = document.documentElement.classList.contains('light-mode') ? 'light' : 'dark';
    localStorage.setItem('theme', currentTheme);
  };

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('assets/js/service-worker.js');

      fetch("https://n8n-f48v.onrender.com/webhook/f7b2b54e-c076-44f1-87cc-72f16e10167d", {
        method: "GET"
      });
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
