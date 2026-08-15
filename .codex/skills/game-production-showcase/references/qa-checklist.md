# Showcase QA Checklist

## Automated

- Run `npm run generate:portfolio`.
- Run focused validation, content, renderer, style, and interaction contracts.
- Run `npm test`.
- Run `git diff --check`.

## Desktop

- Product identity, role, and strongest media appear in the first viewport.
- Story sequence is visually varied and readable.
- Media crops preserve important UI and characters.
- CTAs match available evidence and open safely.
- No media is duplicated.

## Mobile — 390px

- No horizontal overflow.
- Portrait media remains readable.
- CTAs are at least 44px high.
- Fixed global controls do not permanently hide content.
- Story order remains coherent in one column.

## Accessibility

- Semantic heading order.
- Useful project-specific alt text.
- Visible keyboard focus.
- Media viewer opens and closes with keyboard, including Escape.
- Motion respects `prefers-reduced-motion`.
- Text contrast reaches 4.5:1.

## Comparison

Compare representative projects with the released site. Preserve its project identity and visual storytelling while improving length, semantics, responsiveness, and claim safety.
