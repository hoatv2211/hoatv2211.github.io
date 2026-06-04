(function () {
  "use strict";

  const backup = window.PortfolioBackup;
  if (!backup) return;

  function createContactActions(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = backup.getContactLinks().slice(0, 3).map(link => (
      `<a href="${link.href}" target="${link.href.startsWith("http") ? "_blank" : "_self"}" rel="noopener noreferrer">${link.label}</a>`
    )).join("");
  }

  function renderStats() {
    const target = document.getElementById("stats");
    if (!target) return;

    target.innerHTML = backup.getStats().map(stat => (
      `<article class="stat"><strong>${stat.value}</strong><span>${stat.label} / ${stat.detail}</span></article>`
    )).join("");
  }

  function renderProjects() {
    const target = document.getElementById("project-grid");
    if (!target) return;

    target.innerHTML = backup.getFeaturedProjects(9).map(project => (
      `<article class="project-card">
        <img src="${project.image.src}" alt="${project.image.alt}" loading="lazy" decoding="async">
        <div>
          <h3>${project.title}</h3>
          <p>${project.description}</p>
          <a href="${project.detailUrl}">View evidence</a>
        </div>
      </article>`
    )).join("");
  }

  createContactActions("contact-actions");
  createContactActions("footer-actions");
  renderStats();
  renderProjects();
})();
