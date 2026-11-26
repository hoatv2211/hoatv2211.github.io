# Two audience-specific CVs

## Audience and routes (local work, not deployed)

- `/recruiter/`: studio employment first (e.g. Gamee/Sonat), Senior Unity Developer. CTA discusses a studio role/joining the team; no assumption about onsite work, relocation, availability or start date.
- `/assets/Tran-Van-Hoa-Unity-CV.pdf`: selective Unity studio CV, two A4 pages.
- `/`: existing All Work portfolio for international remote freelance/client engagements. Both main CV actions now download `/assets/Tran-Van-Hoa-Fullstack-CV.pdf`; services, design and complete catalog are unchanged.
- `/assets/Tran-Van-Hoa-Fullstack-CV.pdf`: client/server, APIs, developer tooling, automation and delivery ownership, two A4 pages. Suitable as an evidence-based starting CV for remote/client opportunities, not a claim of Upwork history or English proficiency.
- `/assets/Tran-Van-Hoa-CV.pdf`: original legacy PDF preserved byte-for-byte; existing detail/backup links remain compatible. `scripts/generate-cv.py` remains its legacy/company generator; do not run it to generate these new audience variants.
- Existing `/backup/recruiter-clean/`, `/backup/game-studio/`, `/backup/dev-console/` and `/themes/` aliases are unchanged.

Public URLs after deployment use `https://hoatv2211.github.io` plus the routes above. To review locally run `python3 -m http.server 4173 --bind 127.0.0.1`, then open `http://127.0.0.1:4173/recruiter/` or `http://127.0.0.1:4173/`. PDF case-study links use the public domain; local tests verify equivalent routes, not deployment. No typo route is created, nothing is uploaded, committed, pushed or submitted.

## Sources and factual scope

`portfolio.json` remains the sole canonical source for identity, contact, employers, formal titles, dates, education and project metadata. No canonical data change is needed. `recruiter/profile.json` holds concise audience-specific editorial copy and grouped skills, not a second full history. `scripts/cv-variants.py` derives both Markdown sources and renders their PDFs. Generated inspectable sources are `recruiter/cv-unity.md` and `recruiter/cv-fullstack.md`; edit canonical facts or editorial configuration, not these generated files.

Both CVs are English, single-column, selectable Unicode text, with 10pt body type and embedded regular/bold fonts. Page 1 holds profile, grouped skills and reverse-chronological experience; page 2 holds selected work and education. Project order is relevance-based, not chronology. Formal roles/dates are preserved; implementation ownership is separate from a job title. Hiring, onboarding, mentoring and team coordination remain visible. No measured-performance figures or unsupported architecture techniques are invented.

Unity selected order: JX1 → MU Loren → Sandwich Please! → Dalgona → Sudoku → Meow Flow, plus concise tools. Shared game copy stays coherent with recruiter web. Fullstack selected order: Flying Phoenix Chronicles (personal, in development) → JX1 → BrProxies → MOStudio Kit (beta) → ProxyAPI.MAD. Fullstack delivery explicitly includes the user's reusable tooling/AI skills to accelerate prototype-to-production work; no quantified speed claim. CLIProxyAPI upstream attribution is retained. The 8+ years and 100+ shipped games apply to game development, not equal tenure in web/backend/AI or 100+ full-stack products.

The recruiter page retains all 25 active projects exactly once (groups 6 / 12 / 4 / 3), with FCR leading More production & interactive work and labeled Personal. Canonical store/source/evidence links and rich case-study routes remain available. Optional null fields are handled without invented values. Store listings do not imply personal authorship. Tools remain separate from game production.

## Build and verification

Exact build command on this machine:

```sh
/Users/mad/.hermes/environments/documents/gen-94b20e77b7734ed8afae91b8d51333da/venv/bin/python scripts/build-recruiter-portfolio.py --pdf
```

Portable equivalent: `/path/to/documents/python scripts/build-recruiter-portfolio.py --pdf` with ReportLab installed. The renderer discovers Arial regular/bold on macOS or DejaVu Sans regular/bold on Linux. Set `CV_FONT_DIR` to the directory containing those two TTF files when needed. Same fonts and ReportLab version produce deterministic PDF bytes (`invariant=1`); different fonts can change wrapping, so rerun the PDF checks after a platform/font change. Rendering/comparison checks need pypdf, pdfplumber and pypdfium2 only in the documents environment.

```sh
python3 scripts/build-recruiter-portfolio.py --check
npm test
RECRUITER_SHOTS=/Users/mad/.hermes/cache/scratch/cv-variants-qa node scripts/test-recruiter-browser.js
/path/to/documents/python scripts/verify-cv-pdfs.py --render-dir /absolute/review-directory
# Backward-compatible PDF verification entry:
/path/to/documents/python scripts/test-recruiter-pdf.py
```

`npm test` pretest uses standard-library Python only: source freshness, exact HTML/Markdown, source-and-generator fingerprint, and integrity of BOTH PDFs. No ReportLab installation in CI is required. HTML-only regeneration (`npm run generate:recruiter`) refuses changed source fingerprints until PDFs are rebuilt. Sparse CI already includes `recruiter/`, `scripts/`, `assets/` and `themes/`; both PDFs are also in HTTP smoke routes.

PDF verification asserts two A4 pages, >=10pt body, safe character margins, every source line in exact reading order, canonical text and exact hyperlink annotations. It writes page images/text and JSON when `--render-dir` is supplied. Visual inspection of all four rendered pages complements those checks. Browser regression covers 320/390/768/1024/1440px, no horizontal overflow, exact active-key membership, images, keyboard skip link, reduced motion, no-JS catalog, local links, recruiter console errors, all 25 fresh detail loads and theme aliases. Root/backup contracts remain part of `npm test`. External store availability, live deployment, actual ATS scoring and live job submissions are not tested or claimed.

## Separate confirmation checklist (not in CVs or recruiter page)

No bracketed metric placeholders remain in submission-ready documents or recruiter HTML. Add results only after evidence is supplied:

- Android device/build/scenario and measured frame rate; sampling method and settings.
- Peak memory before/after under comparable conditions and units.
- Supported simultaneous entities: entity type, hardware, workload and pass criterion; never infer CCU.
- State synchronization/authority design, culling, pooling, Addressables/AssetBundles or other specific architecture: source or capture and actual decisions/trade-offs.
- CPU/GPU/GC traces, batching, shaders, LOD or build-time improvements: project and measurements.
- Named analytics SDKs, funnel/A-B results and release metrics: only add where source confirms the exact SDK/result. Current canonical evidence supports analytics integration generically.
- Employment logistics, timezone overlap, English communication level and start availability remain unconfirmed; none are inferred.
