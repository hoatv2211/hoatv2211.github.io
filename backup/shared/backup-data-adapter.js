(function () {
  "use strict";

  const ROOT_PREFIX = "../../";
  const ABSOLUTE_URL_PATTERN = /^(https?:)?\/\//i;
  const DATA = Array.isArray(window.PORTFOLIO_DATA) ? window.PORTFOLIO_DATA : [];
  const GITSHARE_OWNERS = ["hoatv2211", "mad-agentic"];
  const GITSHARE_FALLBACK = [
    {
      owner: "hoatv2211",
      name: "hoatv2211.github.io",
      fullName: "hoatv2211/hoatv2211.github.io",
      description: "Personal portfolio source with Unity projects, backup styles, and developer profile content.",
      url: "https://github.com/hoatv2211/hoatv2211.github.io",
      demoUrl: "https://hoatv2211.github.io",
      language: "HTML",
      topics: ["portfolio", "github-pages", "unity"],
      updatedAt: "2026-06-04T00:00:00Z"
    },
    {
      owner: "mad-agentic",
      name: "ProxyAPI.MAD",
      fullName: "mad-agentic/ProxyAPI.MAD",
      description: "Agentic proxy bridge and API workflow project for automation and AI tooling experiments.",
      url: "https://github.com/mad-agentic/ProxyAPI.MAD",
      demoUrl: "https://mad-agentic.github.io/ProxyAPI.MAD",
      language: "JavaScript",
      topics: ["agentic", "api", "automation"],
      updatedAt: "2026-06-04T00:00:00Z"
    }
  ];

  function asset(path) {
    if (!path || ABSOLUTE_URL_PATTERN.test(path) || path.startsWith("data:")) {
      return path || "";
    }

    return ROOT_PREFIX + path.replace(/^\.\//, "");
  }

  function formatCategory(category) {
    const labels = {
      unity: "Unity",
      unreal: "Unreal",
      agentic: "Agentic AI",
      webgl: "WebGL",
      gamefi: "GameFi"
    };

    return labels[category] || (category ? category.replace(/-/g, " ").replace(/\b\w/g, char => char.toUpperCase()) : "Project");
  }

  function normalizeProject(project, index) {
    const category = project.category || "project";
    const image = project.image || {};

    return {
      id: project.id || `project-${index}`,
      title: project.title || "Untitled Project",
      category,
      categoryLabel: formatCategory(category),
      detailCategory: project.detailCategory || "",
      description: project.description || "Portfolio project.",
      image: {
        src: asset(image.src),
        alt: image.alt || project.title || "Portfolio project"
      },
      tag: project.tag || { label: formatCategory(category), className: "" },
      featured: project.featured === true,
      featuredOrder: Number.isInteger(project.featuredOrder) ? project.featuredOrder : null,
      demoUrl: project.demoUrl || "",
      detailUrl: project.detailUrl ? asset(project.detailUrl) : (project.demoUrl || `${ROOT_PREFIX}index.html`),
      hasStoreMetrics: Boolean(project.apiUrlAndroid || project.apiUrlIos),
      rank: index + 1
    };
  }

  const projects = DATA.map(normalizeProject);

  function getProjects() {
    return projects.slice();
  }

  function getFeaturedProjects(limit) {
    const featured = projects
      .filter(project => project.featured)
      .sort((a, b) => a.featuredOrder - b.featuredOrder);
    const rest = projects.filter(project => !project.featured);

    return featured.concat(rest).slice(0, limit || 6);
  }

  function getProjectsByCategory() {
    return projects.reduce((groups, project) => {
      const key = project.category || "project";
      if (!groups[key]) groups[key] = [];
      groups[key].push(project);
      return groups;
    }, {});
  }

  function getStats() {
    const groups = getProjectsByCategory();
    return [
      { label: "Years", value: "8+", detail: "Unity delivery" },
      { label: "Projects", value: `${projects.length}+`, detail: "portfolio entries" },
      { label: "Specialties", value: Object.keys(groups).length.toString(), detail: "game/dev tracks" },
      { label: "Platforms", value: "5", detail: "Mobile, WebGL, GameFi, Telegram, AI" }
    ];
  }

  function getContactLinks() {
    return [
      { label: "Email", href: "mailto:hoatv.mad@gmail.com?subject=Unity%20project%20inquiry" },
      { label: "Telegram", href: "https://t.me/o0_MaD_0o" },
      { label: "GitHub", href: "https://github.com/hoatv2211" },
      { label: "Agentic GitHub", href: "https://github.com/mad-agentic" },
      { label: "LinkedIn", href: "https://www.linkedin.com/in/hoatv" }
    ];
  }

  async function loadGitShareRepos() {
    try {
      const batches = await Promise.all(GITSHARE_OWNERS.map(owner => (
        fetch(`https://api.github.com/users/${owner}/repos?per_page=100&sort=updated`, {
          headers: { Accept: "application/vnd.github+json" }
        }).then(response => {
          if (!response.ok) throw new Error(`GitHub API failed for ${owner}`);
          return response.json();
        })
      )));

      const repos = batches.flat()
        .filter(repo => repo && !repo.fork && !repo.archived)
        .map(normalizeRepo)
        .sort(sortGitShareRepos);

      return repos.length ? repos : GITSHARE_FALLBACK.slice();
    } catch (error) {
      return GITSHARE_FALLBACK.slice();
    }
  }

  function normalizeRepo(repo) {
    const owner = repo.owner && repo.owner.login ? repo.owner.login : repo.full_name.split("/")[0];

    return {
      owner,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description || `Public repository from ${owner}.`,
      url: repo.html_url,
      demoUrl: repo.homepage || "",
      language: repo.language || "Code",
      topics: Array.isArray(repo.topics) ? repo.topics.slice(0, 4) : [],
      updatedAt: repo.updated_at,
      previewUrl: `https://opengraph.githubassets.com/backup-gitshare/${repo.full_name}`
    };
  }

  function sortGitShareRepos(a, b) {
    const aHasDemo = Boolean(a.demoUrl);
    const bHasDemo = Boolean(b.demoUrl);

    if (aHasDemo !== bHasDemo) return bHasDemo - aHasDemo;
    return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  window.PortfolioBackup = {
    asset,
    formatCategory,
    getProjects,
    getFeaturedProjects,
    getProjectsByCategory,
    getStats,
    getContactLinks,
    loadGitShareRepos,
    escapeHtml
  };
})();
