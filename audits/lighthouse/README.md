# Lighthouse Baseline - 2026-05-18

## Reports

- `baseline-mobile.report.html`
- `baseline-mobile.report.json`
- `baseline-desktop.report.html`
- `baseline-desktop.report.json`

## Scores

| Profile | Performance | Accessibility | Best Practices | SEO |
| --- | ---: | ---: | ---: | ---: |
| Mobile | 56 | 95 | 71 | 91 |
| Desktop | 77 | 98 | 70 | 91 |

## Key Timing Metrics

| Profile | FCP | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: |
| Mobile | 10.3 s | 24.0 s | 0 | 0 ms |
| Desktop | 1.4 s | 2.9 s | 0.071 | 0 ms |

## Largest Mobile Opportunities

1. Enable text compression - estimated savings: 302 KiB / 1300 ms
2. Eliminate render-blocking resources - estimated savings: 540 ms
3. Properly size images - estimated savings: 359 KiB / 420 ms
4. Reduce unused CSS - estimated savings: 75 KiB / 300 ms
5. Serve images in next-gen formats - estimated savings: 4385 KiB / 280 ms
6. Minify CSS - estimated savings: 34 KiB / 180 ms

## Reading

The current bottleneck is not JavaScript execution. Mobile TBT is effectively zero, while LCP is very high, so the next optimization pass should prioritize delivery of heavy visual assets, render-blocking CSS, compression, and image formats/sizing before deeper script work.
