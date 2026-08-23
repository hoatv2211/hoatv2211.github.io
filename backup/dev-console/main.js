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

  function renderRepos() {
    const target = document.getElementById("repo-list");
    if (!target || typeof backup.loadGitShareRepos !== "function") return;

    target.innerHTML = '<p class="repo-status">$ fetching github public repos...</p>';

    backup.loadGitShareRepos().then(repos => {
      target.innerHTML = repos.slice(0, 10).map(repo => {
        const escape = backup.escapeHtml || (value => String(value));
        const topics = repo.topics && repo.topics.length ? repo.topics.slice(0, 3) : [repo.language];
        const websiteLink = repo.demoUrl ? `<a href="${escape(repo.demoUrl)}" target="_blank" rel="noopener noreferrer">Website</a>` : "";

        return `<article class="repo-card">
          <code>${escape(repo.owner)}/${escape(repo.name)}</code>
          <p>${escape(repo.description)}</p>
          <div class="repo-topics">${topics.map(topic => `<span>${escape(topic)}</span>`).join("")}</div>
          <div class="repo-actions">
            <a href="${escape(repo.url)}" target="_blank" rel="noopener noreferrer">source</a>
            ${websiteLink}
          </div>
        </article>`;
      }).join("");
    });
  }

  renderRuntime();
  renderProjects();
  renderRepos();
  renderContact();
})();
