(function () {
  "use strict";

  const ROOT_PREFIX = "../../";
  const ABSOLUTE_URL_PATTERN = /^(https?:)?\/\//i;
  const DATA = Array.isArray(window.PORTFOLIO_DATA) ? window.PORTFOLIO_DATA : [];

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
      demoUrl: project.demoUrl || "",
      detailUrl: project.demoUrl || `${ROOT_PREFIX}index.html`,
      hasStoreMetrics: Boolean(project.apiUrlAndroid || project.apiUrlIos),
      rank: index + 1
    };
  }

  const projects = DATA.map(normalizeProject);

  function getProjects() {
    return projects.slice();
  }

  function getFeaturedProjects(limit) {
    const priority = ["proxyapi-mad", "muloren", "jx1", "idleCyber", "nekoverse", "dalgona", "HomeDesign", "ageofbattle"];
    const byId = new Map(projects.map(project => [project.id, project]));
    const featured = priority.map(id => byId.get(id)).filter(Boolean);
    const rest = projects.filter(project => !priority.includes(project.id));

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
      { label: "LinkedIn", href: "https://www.linkedin.com/in/hoatv" }
    ];
  }

  window.PortfolioBackup = {
    asset,
    formatCategory,
    getProjects,
    getFeaturedProjects,
    getProjectsByCategory,
    getStats,
    getContactLinks
  };
})();
