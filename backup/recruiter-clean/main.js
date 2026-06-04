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

  function renderRepos() {
    const target = document.getElementById("repo-grid");
    if (!target || typeof backup.loadGitShareRepos !== "function") return;

    target.innerHTML = '<p class="repo-status">Loading public GitHub repos...</p>';

    backup.loadGitShareRepos().then(repos => {
      target.innerHTML = repos.slice(0, 9).map(repo => {
        const escape = backup.escapeHtml || (value => String(value));
        const preview = repo.previewUrl || `https://opengraph.githubassets.com/backup-gitshare/${repo.fullName}`;
        const topics = repo.topics && repo.topics.length ? repo.topics.slice(0, 3) : [repo.language];
        const demo = repo.demoUrl ? `<a href="${escape(repo.demoUrl)}" target="_blank" rel="noopener noreferrer">Demo</a>` : "";

        return `<article class="repo-card">
          <img src="${escape(preview)}" alt="GitHub preview for ${escape(repo.fullName)}" loading="lazy" decoding="async">
          <div>
            <span>${escape(repo.owner)}</span>
            <h3>${escape(repo.name)}</h3>
            <p>${escape(repo.description)}</p>
            <div class="repo-topics">${topics.map(topic => `<small>${escape(topic)}</small>`).join("")}</div>
            <div class="repo-actions">
              <a href="${escape(repo.url)}" target="_blank" rel="noopener noreferrer">Source</a>
              ${demo}
            </div>
          </div>
        </article>`;
      }).join("");
    });
  }

  createContactActions("contact-actions");
  createContactActions("footer-actions");
  renderStats();
  renderProjects();
  renderRepos();
})();
