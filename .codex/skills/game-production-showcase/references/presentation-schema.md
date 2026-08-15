# Presentation Schema

`portfolio.json` remains the source of truth.

```json
{
  "presentation": {
    "layoutVariant": "mobile-campaign",
    "theme": "project-slug",
    "eyebrow": "Short product category",
    "heroMediaKey": "hero",
    "palette": {
      "ink": "#090b16",
      "panel": "#141a32",
      "accent": "#e3b45d",
      "accentAlt": "#55bd86",
      "text": "#f8f5eb",
      "muted": "#b5bdd2"
    },
    "storyBeats": [
      {
        "id": "gameplay",
        "kicker": "Gameplay loop",
        "title": "Project-specific outcome",
        "body": "Evidence-safe description.",
        "mediaKeys": ["screen-2"],
        "layout": "split"
      }
    ]
  }
}
```

Every referenced media record needs a unique `key`. The hero key and story media keys must resolve. Non-compact families cover every media record exactly once across hero and story beats. `compact-proof` may use an empty `storyBeats` array because its renderer owns the remaining proof gallery.

Allowed story layouts: `wide`, `split`, `offset`, `rail`, `stack`, `console`.

Palette values are six-digit hex colors. Choose colors from existing UI, artwork, or brand assets and verify contrast in Browser.
