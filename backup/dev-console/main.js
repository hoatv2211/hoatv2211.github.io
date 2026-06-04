(function () {
  "use strict";

  const backup = window.PortfolioBackup;
  if (!backup) return;

  function renderRuntime() {
    const target = document.getElementById("runtime");
    if (!target) return;

    target.innerHTML = backup.getStats().map(stat => (
      `<article class="runtime-card"><strong>${stat.value}</strong><span>${stat.label.toLowerCase()} :: ${stat.detail}</span></article>`
    )).join("");
  }

  function renderProjects() {
    const target = document.getElementById("project-list");
    if (!target) return;

    target.innerHTML = backup.getFeaturedProjects(8).map(project => (
      `<article class="project-card">
        <img src="${project.image.src}" alt="${project.image.alt}" loading="lazy" decoding="async">
        <div>
          <code>[${project.categoryLabel}] #${String(project.rank).padStart(2, "0")}</code>
          <h3>${project.title}</h3>
          <p>${project.description}</p>
          <a href="${project.detailUrl}">open detail</a>
        </div>
      </article>`
    )).join("");
  }

  function renderContact() {
    const target = document.getElementById("contact-links");
    if (!target) return;

    target.innerHTML = backup.getContactLinks().map(link => (
      `<a href="${link.href}" target="${link.href.startsWith("http") ? "_blank" : "_self"}" rel="noopener noreferrer">${link.label.toLowerCase()}</a>`
    )).join("");
  }

  renderRuntime();
  renderProjects();
  renderContact();
})();
