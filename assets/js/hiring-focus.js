(function () {
  "use strict";
  const model = window.HiringFocusModel;
  const config = window.HIRING_FOCUS_CONFIG;
  if (!model || !config) return;
  const escapeHtml = value => String(value || "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));

  function init() {
    const intro = document.querySelector(".about-text > p");
    const cta = document.querySelector(".hero-cta-group .portfolio-cta-primary");
    const cases = document.querySelector("#case-study-sample");
    const capabilities = document.querySelector("[data-focus-capabilities]");
    if (!intro || !cta || !cases || !capabilities) return;
    // Public portfolio is always All Work; audience config stays internal for future builds.
    const current = model.resolve(config, "all");
    const selected = model.selectProjects(window.PORTFOLIO_DATA || [], current);
    document.body.dataset.recruiterFocus = "all";
    intro.textContent = current.intro;
    cta.textContent = current.cta;
    cta.href = `mailto:hoatv.mad@gmail.com?subject=${encodeURIComponent(current.cta)}`;
    const closingCta = document.querySelector('.experience-contact .portfolio-cta-primary');
    closingCta.textContent = current.cta;
    closingCta.href = cta.href;
    const highlights = ["flyingphoenix", "muloren", "sandwich", "dalgona", "idleCyber", "nekoverse", "proxyapi-mad", "brproxies", "gamestudio-codexkit"]
      .map(key => selected.find(project => project.detailCategory === key)).filter(Boolean);
    cases.innerHTML = `<h2 class="h2 article-title" id="case-study-title">Selected Work</h2><p class="focus-section-note">Explore gameplay systems, implementation scope, and production context. All projects remain available in Portfolio.</p><div class="focus-project-grid">${highlights.map(project => `<div class="focus-project-card"><a class="focus-project-media" href="${escapeHtml(project.image.src)}" target="_blank" rel="noopener noreferrer" aria-label="Open full-size ${escapeHtml(project.title)} preview"><img src="${escapeHtml(project.image.src)}" alt="${escapeHtml(project.image.alt)}" loading="lazy" decoding="async"></a><span class="focus-project-type">${escapeHtml(project.projectType || "Project")}</span><h3 class="h4">${escapeHtml(project.title.replace(/ \(NFT\)$/, ""))}</h3><span class="focus-project-role">${escapeHtml(project.ownership || "")}</span><p>${escapeHtml(model.describe(project, current))}</p><button type="button" class="portfolio-cta" data-detail-category="${escapeHtml(project.detailCategory)}" aria-label="Read ${escapeHtml(project.title)} case study">Read case study</button></div>`).join("")}</div>`;
    capabilities.innerHTML = `<ul class="focus-capability-list">${current.skills.map(skill => `<li>${escapeHtml(skill)}</li>`).join("")}</ul>`;
    const projectsByKey = new Map(selected.map(project => [project.detailCategory, project]));
    const list = document.querySelector('[data-render="portfolio-list"]');
    list.querySelectorAll(":scope > [data-filter-item]").forEach(item => {
      item.hidden = false;
      const project = projectsByKey.get(item.dataset.detailCategory);
      if (project) {
        let description = item.querySelector(".focus-card-description");
        if (!description) {
          description = document.createElement("p");
          description.className = "focus-card-description";
          item.querySelector("a").append(description);
        }
        description.textContent = model.describe(project, current);
        item.querySelector(".project-category").textContent = project.projectType || project.tag.label;
        item.querySelector(".project-title").textContent = project.title.replace(/ \(NFT\)$/, "");
      }
      item.style.order = selected.findIndex(project => project.detailCategory === item.dataset.detailCategory);
    });
    document.querySelectorAll(".portfolio-showcase").forEach(section => { section.hidden = false; });
    document.querySelectorAll(".service-list > li").forEach(item => { item.hidden = false; });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
