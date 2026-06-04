"use strict";

(function () {
  const OWNERS = ["hoatv2211", "mad-agentic"];
  const FALLBACK_REPOS = [
    {
      owner: "hoatv2211",
      name: "hoatv2211.github.io",
      fullName: "hoatv2211/hoatv2211.github.io",
      description: "Personal portfolio source with Unity projects, web demos, and developer profile content.",
      url: "https://github.com/hoatv2211/hoatv2211.github.io",
      homepage: "https://hoatv2211.github.io",
      language: "HTML",
      topics: ["portfolio", "github-pages", "unity"],
      updatedAt: "2026-06-04T00:00:00Z",
      isFallback: true
    },
    {
      owner: "mad-agentic",
      name: "ProxyAPI.MAD",
      fullName: "mad-agentic/ProxyAPI.MAD",
      description: "Agentic proxy bridge and API workflow project for automation and AI tooling experiments.",
      url: "https://github.com/mad-agentic/ProxyAPI.MAD",
      homepage: "https://mad-agentic.github.io/ProxyAPI.MAD",
      language: "JavaScript",
      topics: ["agentic", "api", "automation"],
      updatedAt: "2026-06-04T00:00:00Z",
      isFallback: true
    }
  ];

  let repos = [];
  let activeOwner = "all";

  document.addEventListener("DOMContentLoaded", initGitShare);

  function initGitShare() {
    const grid = document.querySelector("[data-gitshare-grid]");
    if (!grid) return;

    bindFilters();
    setStatus("Loading public repos...");

    loadRepos()
      .then(function (loadedRepos) {
        repos = loadedRepos;
        renderRepos();
        setStatus("Live GitHub data loaded");
      })
      .catch(function () {
        repos = FALLBACK_REPOS.slice();
        renderRepos();
        setStatus("GitHub API unavailable. Showing fallback repos.");
      });
  }

  function bindFilters() {
    const buttons = document.querySelectorAll("[data-gitshare-owner]");

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        activeOwner = button.dataset.gitshareOwner || "all";
        buttons.forEach(function (item) {
          item.classList.toggle("active", item === button);
        });
        renderRepos();
      });
    });
  }

  async function loadRepos() {
    const batches = await Promise.all(OWNERS.map(fetchOwnerRepos));
    const flattened = batches.flat()
      .filter(function (repo) { return repo && !repo.fork && !repo.archived; })
      .map(normalizeRepo)
      .sort(sortRepos);

    if (!flattened.length) {
      throw new Error("No public repos found");
    }

    return flattened;
  }

  async function fetchOwnerRepos(owner) {
    const response = await fetch("https://api.github.com/users/" + owner + "/repos?per_page=100&sort=updated", {
      headers: { Accept: "application/vnd.github+json" }
    });

    if (!response.ok) {
      throw new Error("GitHub API failed for " + owner);
    }

    return response.json();
  }

  function normalizeRepo(repo) {
    const owner = repo.owner && repo.owner.login ? repo.owner.login : repo.full_name.split("/")[0];

    return {
      owner: owner,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description || "Public repository from " + owner + ".",
      url: repo.html_url,
      homepage: repo.homepage || "",
      language: repo.language || "Code",
      topics: Array.isArray(repo.topics) ? repo.topics.slice(0, 4) : [],
      updatedAt: repo.updated_at,
      pushedAt: repo.pushed_at,
      isFallback: false
    };
  }

  function sortRepos(a, b) {
    const aHasDemo = Boolean(a.homepage);
    const bHasDemo = Boolean(b.homepage);

    if (aHasDemo !== bHasDemo) return bHasDemo - aHasDemo;

    return new Date(b.updatedAt || b.pushedAt || 0) - new Date(a.updatedAt || a.pushedAt || 0);
  }

  function renderRepos() {
    const grid = document.querySelector("[data-gitshare-grid]");
    if (!grid) return;

    const visibleRepos = activeOwner === "all"
      ? repos
      : repos.filter(function (repo) { return repo.owner === activeOwner; });

    if (!visibleRepos.length) {
      grid.innerHTML = '<div class="gitshare-empty">No repositories found for this owner.</div>';
      return;
    }

    grid.innerHTML = visibleRepos.map(renderRepoCard).join("");
  }

  function renderRepoCard(repo) {
    const topics = repo.topics.length
      ? repo.topics.map(function (topic) { return '<span>' + escapeHtml(topic) + '</span>'; }).join("")
      : '<span>' + escapeHtml(repo.language) + '</span>';
    const homepageLink = repo.homepage
      ? '<a class="gitshare-mini-link" href="' + escapeAttribute(repo.homepage) + '" target="_blank" rel="noopener noreferrer">Demo</a>'
      : "";

    return `
      <article class="gitshare-card">
        <a class="gitshare-card-media" href="${escapeAttribute(repo.url)}" target="_blank" rel="noopener noreferrer" aria-label="Open ${escapeAttribute(repo.fullName)} on GitHub">
          <img src="https://opengraph.githubassets.com/gitshare/${escapeAttribute(repo.fullName)}" alt="GitHub preview for ${escapeAttribute(repo.fullName)}" loading="lazy">
          <span class="gitshare-language">${escapeHtml(repo.language)}</span>
        </a>
        <div class="gitshare-card-body">
          <div class="gitshare-card-head">
            <h3>${escapeHtml(repo.owner)}<span>/</span>${escapeHtml(repo.name)}</h3>
            <a class="gitshare-source" href="${escapeAttribute(repo.url)}" target="_blank" rel="noopener noreferrer">
              <ion-icon name="logo-github"></ion-icon>
              <span>Source</span>
            </a>
          </div>
          <p>${escapeHtml(repo.description)}</p>
          <div class="gitshare-topics">${topics}</div>
          <div class="gitshare-card-foot">
            <span>${escapeHtml(repo.fullName)}</span>
            ${homepageLink}
          </div>
        </div>
      </article>
    `;
  }

  function setStatus(message) {
    const status = document.querySelector("[data-gitshare-status]");
    if (status) status.textContent = message;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function escapeAttribute(value) {
    return escapeHtml(value).replace(/`/g, "&#096;");
  }
})();
