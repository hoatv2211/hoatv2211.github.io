(function () {
  function renderPortfolioList(projects) {
    const list = document.querySelector('[data-render="portfolio-list"]');
    if (!list || !Array.isArray(projects)) return;

    list.innerHTML = projects.map(project => {
      const imageStyle = project.image.style ? ` style="${project.image.style}"` : "";
      const apiAndroid = project.apiUrlAndroid ? ` data-api-url-android="${project.apiUrlAndroid}"` : "";
      const apiIos = project.apiUrlIos ? ` data-api-url-ios="${project.apiUrlIos}"` : "";

      return `
        <li class="project-item active" data-filter-item data-category="${project.category}" data-detail-category="${project.detailCategory}"${apiAndroid}${apiIos}>
          <a href="#" data-detail-category="${project.detailCategory}">
            <figure class="project-img"${imageStyle}>
              <div class="project-item-icon-box">
                <ion-icon name="eye-outline" data-detail-category="${project.detailCategory}"></ion-icon>
              </div>
              <img src="${project.image.src}" alt="${project.image.alt}" loading="lazy">
            </figure>
            <h3 class="project-title" data-detail-category="${project.detailCategory}">${project.title}</h3>
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
