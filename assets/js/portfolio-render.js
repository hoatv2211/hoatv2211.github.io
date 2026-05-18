(function () {
  function renderPortfolioList(projects) {
    const list = document.querySelector('[data-render="portfolio-list"]');
    if (!list || !Array.isArray(projects)) return;

    list.innerHTML = projects.map(project => {
      const apiAndroid = project.apiUrlAndroid ? ` data-api-url-android="${project.apiUrlAndroid}"` : "";
      const apiIos = project.apiUrlIos ? ` data-api-url-ios="${project.apiUrlIos}"` : "";

      const isExternal = Boolean(project.externalUrl);
      const linkHref = isExternal ? project.externalUrl : "#";
      const linkAttrs = isExternal
        ? `href="${project.externalUrl}" target="_blank" rel="noopener noreferrer"`
        : `href="#" data-detail-category="${project.detailCategory}"`;
      const iconName = isExternal ? "open-outline" : "eye-outline";
      const iconDataAttr = isExternal ? "" : ` data-detail-category="${project.detailCategory}"`;
      const titleDataAttr = isExternal ? "" : ` data-detail-category="${project.detailCategory}"`;

      return `
        <li class="project-item active" data-filter-item data-category="${project.category}" data-detail-category="${project.detailCategory}"${apiAndroid}${apiIos}>
          <a ${linkAttrs}>
            <figure class="project-img">
              <div class="project-item-icon-box">
                <ion-icon name="${iconName}"${iconDataAttr}></ion-icon>
              </div>
              <img src="${project.image.src}" alt="${project.image.alt}" loading="lazy" decoding="async">
            </figure>
            <h3 class="project-title"${titleDataAttr}>${project.title}</h3>
            <div class="${project.tag.className}">
              <p class="project-category tag">${project.tag.label}</p>
            </div>
          </a>
        </li>
      `;
    }).join("");

    document.dispatchEvent(new CustomEvent("portfolio:list-rendered"));
  }

  function init() {
    if (!window.PORTFOLIO_DATA) return;
    renderPortfolioList(window.PORTFOLIO_DATA);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
