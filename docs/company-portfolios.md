# Company-specific portfolio and CV builds

No companies or job descriptions have been supplied. The repository contains an **empty, intentionally non-buildable template**, not fabricated applications. Nothing is published by these commands.

## Architecture

`portfolio.json` remains the source of truth. `scripts/build-company-portfolio.py` reads it and an explicit profile to generate a standalone, recruiter-readable static CV page at `companies/<slug>/index.html` and invokes the existing ReportLab generator for `assets/company-<slug>-CV.pdf`. The HTML includes identity/contact, full-stack profile, complete employment history with unchanged positions, skills, education, and **every active canonical project**. It uses a lightweight responsive/print stylesheet and root image assets, not a fragile clone of root markup or its perspective UI. It needs no JavaScript to read. Root `index.html`, generated runtime data, backups, and the default CV are not modified.

The catalog count follows active canonical data: currently 25 active projects; three archived records remain excluded. `projectKeys` prioritizes cards in supplied order; unselected cards remain in canonical `displayOrder` (stable ties). HTML never filters out projects. In the selected-work PDF, nonempty `projectKeys` selects and orders project entries using canonical titles, roles, and summaries. Empty keys retain the existing PDF selected-project set. The PDF retains its existing results, experience, skills, education, margins, and footer. Target company/role are clearly application context, not replacement identity or employment titles.

A `<base href="../../">` resolves images, the corresponding PDF, and `?project=<detailKey>` links against the root portfolio. Root query routing opens full details, not stores or playable builds. PDF detail links use the absolute canonical portfolio URL. Each tailored HTML page has its own canonical URL and `noindex, nofollow`; this is **not access control**. Public PDF URLs are also accessible to anyone with the URL. Keep confidential information out of generated pages and PDFs.

## Profile fields

Copy `company-profiles/template.json` to a private file outside the repository and fill it manually:

- `slug`: required, maximum 64 characters; lowercase ASCII alphanumeric words separated by single hyphens. No paths, slashes, dots, uppercase, or traversal.
- `company`, `role`: required plain text; `role` is the target position, never a claimed employment title.
- `projectKeys`: unique, case-sensitive canonical **detailKey** values, not slugs or titles. Unknown identifiers are rejected. Empty list is supported.
- `headline`, `summary`: optional plain text (empty strings use canonical copy); write only claims supported by the portfolio and verified experience.

Exactly these six fields are accepted; unknown fields are rejected. Text is capped at 4000 characters per field and cannot contain control characters. HTML and ReportLab text are escaped, including angle brackets and ampersands. The generator performs no JD ingestion, company lookup, claim invention, or sensitive-data copying. Human review is required: validation proves structure, not truthfulness of supplied prose.

List valid keys:

```sh
python3 -c "import json; print('\n'.join(p['detailKey'] for p in json.load(open('portfolio.json'))['projects'] if p['status'] == 'active'))"
```

## Commands

Use Python 3.10+ with ReportLab; tests also require pypdf. In this environment, verified imports are available with:

```sh
PY=/Users/mad/.hermes/environments/documents/gen-94b20e77b7734ed8afae91b8d51333da/venv/bin/python
"$PY" -c 'import reportlab, pypdf, pypdfium2'
"$PY" scripts/test-company-portfolio.py
```

For a real approved private profile, run from the repository:

```sh
"$PY" scripts/build-company-portfolio.py --profile /absolute/private/profile.json
```

Preview without creating public repository artifacts:

```sh
"$PY" scripts/build-company-portfolio.py --profile /absolute/private/profile.json --output-root "$HOME/.hermes/cache/scratch/company-preview"
```

The custom destination is a site root: output HTML still references the real site's root assets and links. For a complete local HTTP preview, stage/copy the root `index.html` and `assets/` under that preview root (or serve an equivalent overlay). The generator deliberately does not clone assets or publish a fictitious company page. Never use an external profile pathname containing secrets as a command-line argument on a shared host.

Build only a tailored PDF or a default-compatible PDF into a safe review path:

```sh
"$PY" scripts/generate-cv.py --profile /absolute/private/profile.json --output "$TMPDIR/review-CV.pdf"
"$PY" scripts/generate-cv.py --output "$TMPDIR/default-review-CV.pdf"
```

With a profile but no `--output`, PDF output is `assets/company-<slug>-CV.pdf`. With **no flags**, the original destination `assets/Tran-Van-Hoa-CV.pdf` and original default content remain unchanged; this command explicitly regenerates that asset, so do not run it unless intended.

## Verification and deployment

Tests first demonstrated missing validation, build CLI, and output override failures, then passed against real HTML and PDF generation. They check traversal/unknown identifiers, escaped copy, all-project retention and ordering, unchanged experience titles, per-company canonical/noindex/base/PDF links, PDF extracted copy and annotation destinations, repeatable HTML, default content compatibility, and preservation of the existing default PDF bytes. Fixtures live only in the Hermes scratch directory and are automatically deleted by the test suite.

Before publishing a real application, review the generated HTML on mobile and desktop, render every PDF page for overflow/orphans, verify contact details and all claims, and click the prioritized deep links using fresh loads of the matching root build. Deploy generated HTML/PDF alongside the matching root assets and detail routing. No local build can establish that unpublished links already work on the public site. Add only explicitly approved company artifacts to version control; do not commit private profile inputs or JDs. Re-run after canonical changes; there is no automatic publication or background sync. Remove the company's generated directory and PDF to roll back a variant.
