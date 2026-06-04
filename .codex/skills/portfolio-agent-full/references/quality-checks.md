# Quality Checks

## Required After Data/Detail Edits

Run:

```powershell
npm run validate:portfolio
```

Fix all `ERROR` lines. Report `WARN` lines if not fixed.

## Manual Checks

- `id` unique.
- `detailCategory` unique.
- Detail file exists when no `externalUrl` is used.
- Detail root `data-detail-category` matches the data entry.
- Card image path exists or external URL is intentional.
- Links use valid `href` and meaningful labels.
- New copy matches existing portfolio tone.

## UI QA For Visual Changes

When CSS, layout, `index.html`, or detail markup structure changes:

1. Start local static server if needed.
2. Check desktop and mobile widths.
3. Verify portfolio cards render, detail filters still work, no overlapping text, media fits containers, and clickable service links remain usable.
4. Prefer screenshot/browser inspection for risky visual changes.

## Final Report

Include:

- Files changed.
- Validation command and result.
- Any checks skipped and why.
- Residual risks, especially external URLs, unavailable assets, or claims based on user-provided facts.

