(function () {
  function renderContacts(contacts) {
    const container = document.querySelector('[data-render="contacts"]');
    if (!container || !Array.isArray(contacts)) return;

    container.innerHTML = contacts.map(contact => {
      let content = "";
      if (contact.type === "link") {
        content = `<a href="${contact.href}" class="contact-link">${contact.label}</a>`;
      } else if (contact.type === "time") {
        content = `<time datetime="${contact.datetime}">${contact.label}</time>`;
      } else {
        content = `<address>${contact.label}</address>`;
      }

      return `
        <li class="contact-item">
          <div class="icon-box">
            <ion-icon name="${contact.icon}"></ion-icon>
          </div>
          <div class="contact-info">
            <p class="contact-title">${contact.title}</p>
            ${content}
          </div>
        </li>
      `;
    }).join("");
  }

  function renderSocials(socials) {
    const container = document.querySelector('[data-render="socials"]');
    if (!container || !Array.isArray(socials)) return;

    container.innerHTML = socials.map(item => {
      const icon = item.type === "img"
        ? `<img src="${item.src}" alt="${item.alt}" height="${item.height}" width="${item.width}" />`
        : `<ion-icon name="${item.icon}"></ion-icon>`;

      return `
        <li class="social-item">
          <a href="${item.href}" class="social-link">
            ${icon}
          </a>
        </li>
      `;
    }).join("");
  }

  function renderServices(services) {
    const container = document.querySelector('[data-render="services"]');
    if (!container || !Array.isArray(services)) return;

    container.innerHTML = services.map(service => {
      return `
        <li class="service-item-box2">
          <div class="service-icon-box">
            <img src="${service.icon.src}" alt="${service.icon.alt}" width="${service.icon.width}">
          </div>
          <div class="service-content-box">
            <h4 class="h4 service-item-title">${service.title}</h4>
            <p>${service.description}</p>
          </div>
        </li>
      `;
    }).join("");
  }

  function renderSkillCategories(targetSelector, categories) {
    const container = document.querySelector(targetSelector);
    if (!container || !Array.isArray(categories)) return;

    container.innerHTML = categories.map(category => {
      const items = category.items.map(item => {
        if (typeof item === "string") {
          return `<li class="skills-item">${item}</li>`;
        }
        return `<li class="skills-item" title="${item.title}">${item.label}</li>`;
      }).join("");

      return `
        <div class="skills-category">
          <h4 class="h4 skills-header">${category.title}</h4>
          <ul class="skills-list">
            ${items}
          </ul>
        </div>
      `;
    }).join("");
  }

  function renderSiteConfig() {
    const config = window.SITE_CONFIG;
    if (!config) return;

    renderContacts(config.contacts);
    renderSocials(config.socials);
    renderServices(config.services);
    renderSkillCategories('[data-render="main-skills"]', config.mainSkills);
    renderSkillCategories('[data-render="skills"]', config.skills);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderSiteConfig);
  } else {
    renderSiteConfig();
  }
})();
