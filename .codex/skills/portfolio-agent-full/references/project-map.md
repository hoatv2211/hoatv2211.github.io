# Project Map

Repository: `C:\Users\admin\Desktop\hoatv2211.github.io`

## Site Type

Static personal portfolio for MAD / Tran Van Hoa, focused on Unity, WebGL/mobile games, GameFi, agentic tooling, and applications.

## Key Files

- `index.html`: root page and shell for rendered portfolio sections.
- `assets/js/portfolio-data.js`: source of truth for portfolio cards. Defines `window.PORTFOLIO_DATA`.
- `assets/js/portfolio-render.js`: renders portfolio list/cards from data.
- `assets/js/portfolio-details.js`: loads each detail fragment from `assets/portfolio-details/<detailCategory>.html`.
- `assets/portfolio-details/`: project detail HTML fragments.
- `assets/css/style.css`, `assets/css/modern-enhancements.css`, `assets/css/animations.css`: primary UI styling.
- `scripts/validate-portfolio.js`: validates required data fields, duplicate ids/detail categories, allowed categories, and matching detail files.
- `.github/agents/`: older GitHub/Copilot agent notes. Useful context, but Codex skill rules should live in `.codex/skills/portfolio-agent-full`.

## Data Flow

1. `assets/js/portfolio-data.js` defines project objects.
2. Portfolio list renders cards from each object.
3. `assets/js/portfolio-details.js` maps each `detailCategory` to `assets/portfolio-details/<detailCategory>.html` and injects fragments into `[data-render="portfolio-details"]`.
4. Filters depend on `category` values and detail fragment `data-detail-category` attributes.

## Validation

Run from repo root:

```powershell
npm run validate:portfolio
```

Expected success shape: `Portfolio validation passed for <n> projects`.

