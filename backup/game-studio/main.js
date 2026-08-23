(function () {
  "use strict";

  const backup = window.PortfolioBackup;
  if (!backup) return;

  function getGameProjects() {
    return backup.getProjects().filter(project => project.category !== "agentic");
  }

  function getFeaturedGameProjects() {
    return getGameProjects()
      .filter(project => project.featured)
      .sort((a, b) => a.featuredOrder - b.featuredOrder);
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

    target.innerHTML = getFeaturedGameProjects().map(project => (
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

  function renderRepos() {
    const target = document.getElementById("repo-grid");
    if (!target || typeof backup.loadGitShareRepos !== "function") return;

    target.innerHTML = '<p class="repo-status">Loading public GitHub repos...</p>';

    backup.loadGitShareRepos().then(repos => {
      target.innerHTML = repos.slice(0, 8).map(repo => {
        const escape = backup.escapeHtml || (value => String(value));
        const preview = repo.previewUrl || `https://opengraph.githubassets.com/backup-gitshare/${repo.fullName}`;
        const topics = repo.topics && repo.topics.length ? repo.topics.slice(0, 3) : [repo.language];
        const websiteLink = repo.demoUrl ? `<a href="${escape(repo.demoUrl)}" target="_blank" rel="noopener noreferrer">Website</a>` : "";

        return `<article class="repo-card">
          <img src="${escape(preview)}" alt="GitHub preview for ${escape(repo.fullName)}" loading="lazy" decoding="async">
          <div>
            <p class="eyebrow">${escape(repo.owner)}</p>
            <h3>${escape(repo.name)}</h3>
            <p>${escape(repo.description)}</p>
            <div class="repo-topics">${topics.map(topic => `<span>${escape(topic)}</span>`).join("")}</div>
            <div class="repo-actions">
              <a href="${escape(repo.url)}" target="_blank" rel="noopener noreferrer">Source</a>
              ${websiteLink}
            </div>
          </div>
        </article>`;
      }).join("");
    });
  }

  renderHero();
  renderProof();
  renderCases();
  renderArchive();
  renderRepos();
  renderContact();
})();
