(function () {
  "use strict";

  const backup = window.PortfolioBackup;
  if (!backup) return;

  function getGameProjects() {
    return backup.getProjects().filter(project => project.category !== "agentic");
  }

  function renderHero() {
    const target = document.getElementById("hero-media");
    const project = getGameProjects()[0] || backup.getFeaturedProjects(1)[0];
    if (!target || !project) return;

    target.innerHTML = `<img src="${project.image.src}" alt="" loading="eager" decoding="async">`;
  }

  function renderProof() {
    const target = document.getElementById("proof-strip");
    if (!target) return;

    target.innerHTML = backup.getStats().map(stat => (
      `<article class="proof"><strong>${stat.value}</strong><span>${stat.label} / ${stat.detail}</span></article>`
    )).join("");
  }

  function renderCases() {
    const target = document.getElementById("case-grid");
    if (!target) return;

    target.innerHTML = getGameProjects().slice(0, 6).map(project => (
      `<article class="case-card">
        <img src="${project.image.src}" alt="${project.image.alt}" loading="lazy" decoding="async">
        <div>
          <p class="eyebrow">${project.categoryLabel}</p>
          <h3>${project.title}</h3>
          <p>${project.description}</p>
          <a href="${project.detailUrl}">Read case</a>
        </div>
      </article>`
    )).join("");
  }

  function renderArchive() {
    const target = document.getElementById("archive-grid");
    if (!target) return;

    target.innerHTML = backup.getProjects().map(project => (
      `<a class="archive-card" href="${project.detailUrl}">
        <img src="${project.image.src}" alt="${project.image.alt}" loading="lazy" decoding="async">
        <strong>${project.title}</strong>
        <span>${project.categoryLabel}</span>
      </a>`
    )).join("");
  }

  function renderContact() {
    const target = document.getElementById("contact-links");
    if (!target) return;

    target.innerHTML = backup.getContactLinks().slice(0, 3).map(link => (
      `<a href="${link.href}" target="${link.href.startsWith("http") ? "_blank" : "_self"}" rel="noopener noreferrer">${link.label}</a>`
    )).join("");
  }

  renderHero();
  renderProof();
  renderCases();
  renderArchive();
  renderContact();
})();
