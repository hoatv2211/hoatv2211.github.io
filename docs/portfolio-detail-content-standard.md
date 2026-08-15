# Portfolio Detail Content Standard

## Ownership

- `portfolio.json` owns shared facts, contribution, evidence, links, and canonical media.
- `rendered` fragments contain only the required root.
- `hybrid` fragments may contain one `data-detail-slot="bespoke"` section.
- `archived` records require an archive reason and do not require a working demo.

## Section order

- Tier A: identity, featured media, context/problem, contribution, technical decisions, personal outcome, product context, evidence, supporting gallery, bespoke narrative.
- Tier B: identity, summary, contribution, selected media, links, bespoke narrative.
- Tier C: status, purpose/summary, verified media or demo, technical notes, archive reason.

## Claims

- Use exact wording from `docs/portfolio-claims.md` for controlled roles, teams, rankings, funding, metrics, and attribution.
- Separate product context from HoaTV's personal contribution.
- Omit unsupported facts rather than adding placeholder prose.

## Media

- The genuine LCP image is eager with high fetch priority.
- Supporting images are lazy and async-decoded.
- Dashboard/UI images use contain mode; portrait screenshots use portrait mode.
- Heavy WebGL demos use launch cards instead of eager mobile iframes.
- Bespoke media must be declared in canonical `detail.bespokeMedia`.

## Semantics

- One `h2` detail title; section headings use `h3`.
- Lists contain only `li` children.
- Empty sections, inline layout styles, inline event handlers, and generic alt text are prohibited.