# Traditional Unity recruiter portfolio

## Routes (local changes, not deployed)

- `/recruiter/`: independent, light static hiring page; no intro popup, terminal, JavaScript dependency, or root-page redesign.
- `/assets/Tran-Van-Hoa-Unity-CV.pdf`: separate, two-page Unity CV. The default `assets/Tran-Van-Hoa-CV.pdf` and its generator are unchanged by this feature.
- `/?focus=all`: existing full catalog and services. The root retains its established All Work behavior.
- `/themes/game-studio/` → `/backup/game-studio/`.
- `/themes/dev-console/` → `/backup/dev-console/`.
- Existing `/backup/recruiter-clean/`, `/backup/game-studio/`, and `/backup/dev-console/` remain at their original URLs. Theme aliases use static meta redirects and visible fallback links, so no GitHub Pages rewrites are required.

These URLs become public only after deployment. The PDF uses the canonical public portfolio domain for case studies; local browser tests verify the corresponding routes, not deployment status.

## Source and editorial scope

`portfolio.json` is the sole source for identity, contact, project facts, contribution text, experience, education, and store evidence. `recruiter/profile.json` contains selection, positioning, and indexes selecting canonical experience/contribution bullets; it is not a duplicate career database. The builder prefers `detail.contribution` and combines top-level `links` with `detail.evidence`, deduplicating exact store URLs. This is important because several puzzle titles have store evidence only in their detail records.

The page renders every canonical `status: active` project exactly once (25 currently), grouped for recruiters: priority Unity production; more production and interactive work; samples and personal projects; AI and developer tools. `category: agentic` and `type: tool` identify tools, including commercial ProxyAPI.MAD, without presenting them as game-production credits. The six priority projects lead the HTML and remain the only selected projects in the two-page PDF, in order:

1. Sandwich Please! — casual production gameplay and core ownership.
2. Meow Flow — path-connection puzzle systems.
3. Tiles Match 3: Mahjong — tile matching and progression.
4. Sudoku Universe - Modern — generation, validation, persistence.
5. Rise of Trial Bike — physics and documented particles.
6. MU Loren Mobile — published 3D product, primary development within a collaborative team, profiling and optimization.

All six currently contain direct store URLs in canonical evidence. All other active projects appear on the recruiter page itself, not behind a full-catalog link. Cards preserve formal roles, ownership, contribution text, project context, exact case-study keys, and available store, GitHub, website, demo, and other evidence links. Missing/null optional links, genre, ownership, type, and period are handled without printing null values or inventing facts. Samples and personal work retain their classifications. Upstream attribution remains in contribution/context text, including the CLIProxyAPI adaptation. Store pages establish product context rather than personal authorship; missing store evidence does not become a publication claim. Public copy describes concrete delivery positively, leaving verification caveats in these working notes.

C#, Unity, OOP, SOLID, and design patterns are profile-listed skills, not a public code audit. UI animation evidence references Tile Candy; physics and particles reference Rise of Trial Bike; 3D profiling references MU Loren. The page does not claim advanced VFX specialization. Tenure is explicitly **8+ years in games**, not 8+ years in every adjacent discipline. The anonymous freeC casual/puzzle JD informed selection only; it is not attributed to Gamee, Sonat, or any named employer. No company-specific application is fabricated.

## Build

HTML-only refresh, with no third-party Python dependency:

```sh
npm run generate:recruiter
python3 scripts/build-recruiter-portfolio.py --check
```

When canonical data or editorial selection changes, regenerate both artifacts using Python with ReportLab installed:

```sh
/path/to/documents/python scripts/build-recruiter-portfolio.py --pdf
```

Verified documents interpreter on this machine:

```sh
/Users/mad/.hermes/environments/documents/gen-94b20e77b7734ed8afae91b8d51333da/venv/bin/python scripts/build-recruiter-portfolio.py --pdf
```

`recruiter/build-manifest.json` fingerprints the source and PDF bytes. `--check` verifies rendered HTML, source freshness, and PDF integrity with the standard library only. HTML-only regeneration refuses changed canonical inputs after a previous build, preventing it from silently blessing a stale CV. PDF generation is explicit and does not alter the existing default CV.

## Verification

```sh
npm run test:recruiter
node scripts/test-recruiter-browser.js
/path/to/documents/python scripts/test-recruiter-pdf.py
npm test
```

`npm test` runs the recruiter regression through the npm `pretest` lifecycle without replacing the existing test command. The contract was written first and observed failing because `/recruiter/index.html` did not exist before implementation.

The browser regression uses existing `playwright-core` and `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`, starts a temporary local HTTP server, and closes it after verification. It checks 320/390/768/1440 widths, horizontal overflow, the exact active project-key multiset, every project image, card titles and evidence URLs, local links, console/page errors on the recruiter page, fresh case-study loads for every active key by its actual visible `data-detail-category`, and both theme aliases. Screenshots default to `/Users/mad/.hermes/cache/scratch/recruiter-review/`; set `RECRUITER_SHOTS` to override. Existing root/backup pages can issue third-party network errors; the zero-console-error assertion is deliberately scoped to the new static page. The all-active membership contract was observed failing against the previous six-card page before implementation.

The optional PDF test checks two pages, canonical names, education, project titles, exact case-study URI annotations, extractable text, and page bounds. Render and inspect both pages after PDF layout changes. External store availability, geographic access, and continued publication are not guaranteed or tested by local URL checks; the URLs are preserved canonical evidence.

Design deliberately uses resume-scale sections, restrained interaction, local game artwork, system fonts, visible focus, a skip link, and reduced-motion support—not full-screen marketing effects or the taste kit's scene templates. No external design gate is claimed; real Chrome layout tests and visual inspection are the acceptance checks for this hiring document.
