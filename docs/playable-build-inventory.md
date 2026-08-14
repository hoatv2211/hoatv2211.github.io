# Playable Build & Publish Inventory

> Status: Emergency E0 complete; E1 migrated set verified
> Branch: `feature/performance`
> Baseline commit: `68de90b8839e5b4e0f489fb9f5deff3f1032acd0`
> Production commit observed: `7034af23633e31866648c4bae5b44064684d323d`

## GitHub Pages deployment model

| Field | Verified value |
|---|---|
| Production URL | `https://hoatv2211.github.io/` |
| Build type | `legacy` |
| Source | branch `main`, path `/` |
| HTTPS | enforced |
| Main protection | disabled at inventory time |
| Deploy trigger | push/merge that updates `main`; GitHub legacy Pages build |
| Feature preview | local HTTP + CI smoke/artifact on `feature/performance` |
| Production permission in this implementation | **Not granted**: do not merge/deploy `main` |

Evidence command:

```bash
gh api repos/hoatv2211/hoatv2211.github.io/pages
gh api repos/hoatv2211/hoatv2211.github.io/branches/main
```

Production rollback handoff (documented, not executed): revert the production merge/commit on `main`, push the revert, then verify Pages build status and critical URLs. A tag alone is not a deployment rollback.

## Publish-size baseline

| Metric | Value |
|---|---:|
| Tracked files after staged removals | 679 |
| Tracked bytes after staged removals | 924,789,953 |
| Tracked MiB after staged removals | **881.95** |
| `Games/` tracked MiB | 934.0 approximately |
| Emergency gate | <= 900 MiB |

## Tracked game directories

| Directory | Tracked MiB | Entry and loader-selected build | Service Worker / manifest / headers | Source status | Migration target | Rollback |
|---|---:|---|---|---|---|---|
| `Games/Sudoku` | 133.54 | `index.html` → `index.js` → **`Sudoku.*`** | SW registered; manifest present | unknown | `mad-game-hub-shared` | current relative URL |
| `Games/Tele_GameFI` | 128.28 | `index.html` → `index.js` → `root.*` | SW registered twice (inline + JS); two manifests | unknown | `mad-game-hub-shared` | current relative URL |
| `Games/HomeDesign` | 127.47 | `index.html` → `index.js` → `HomeMakeover_BuildWebGL.*` | SW + manifest present; no registration found in entry JS | unknown | `mad-game-hub-shared` | current relative URL |
| `Games/Archero` | 123.30 | `index.html` → `index.js` → `Archero.*` | SW registered; manifest present | unknown | `mad-game-hub-shared` | current relative URL |
| `Games/SandwichPlease` | 102.50 | `index.html` → `index.js` → `docs.*` | SW + manifest + `_headers`; no registration found in entry JS | unknown | `mad-game-hub-shared` | current relative URL |
| `Games/TileCandy` | 97.31 | `index.html` → `index.js` → `Build_Webgl.*` | SW registered; manifest present | unknown | `mad-game-hub-shared` | current relative URL |
| `Games/SurvivorIO` | 81.23 | `index.html` → `index.js` → `BuildWebgl.*` | SW registered; manifest present | unknown | `mad-game-hub-shared` | current relative URL |
| `Games/Tilesmatch3` | 63.90 | `index.html` → `index.js` → `Tilesmatch3.*` | SW registered; manifest present | unknown | `mad-game-hub-shared` | current relative URL |
| `Games/FoodTruck` | 61.97 | `index.html` → `index.js` → `FoodTruck_BuildWebGL.*` | SW + manifest present; no registration found in entry JS | unknown | migrated and HTTP/MIME verified at `https://hoatv2211.github.io/mad-game-hub-shared/portfolio-games/FoodTruck/` | restore from Git parent or revert E1 commit |
| `Games/Neighborhood` | 14.23 | Construct entry, not Unity WebGL | offline scripts; referenced `appmanifest.json` is missing | unknown | archived/not displayed | current relative URL |

No `.br`, `.gz`, `.zip` or `.7z` build artifacts are tracked under `Games/`; current Unity payload filenames provide no evidence of pre-compression.

`BikeTrial` is not tracked and therefore is not part of fresh-clone inventory. Any local-only source/build candidate must be owner-confirmed separately.

## Large media/build candidates

| Path | MiB | Reference/decision | Migration rule |
|---|---:|---|---|
| `assets/images/game/Archero/Movie_003.mp4` | 93.68 | referenced by Archero detail and orphan CityBuilder | copy, verify HTTP/MIME/playback, replace references, then remove |
| `assets/videos/CryptoQuest.mp4` | 75.64 | referenced by CryptoQuest detail | same |
| `Games/Sudoku/Build/Build_Webgl.*` | ~65.7 | entry selects `Sudoku.*`; wasm/framework are exact SHA-256 duplicates, data differs by 1 byte | remove only after local HTTP smoke test proves `Sudoku.*` loads without this set |
| `assets/videos/mugenhorror.mp4` | 30.92 | no known runtime reference at baseline | remove/relocate only after reference scan + owner intent evidence |
| `assets/videos/intro.gif` | 28.56 | README-only at baseline | replace README with lightweight image, then remove |

## E1 verified migration result

- Destination Pages build: `mad-game-hub-shared@9910c2e` (media) and `@ebbf757` (FoodTruck build), status `built`.
- Archero video: HTTP 206, `video/mp4`.
- CryptoQuest video: HTTP 206, `video/mp4`.
- FoodTruck entry: HTTP 206, `text/html`.
- FoodTruck loader: HTTP 206, JavaScript MIME.
- FoodTruck data: HTTP 206, `application/octet-stream`.
- FoodTruck wasm: HTTP 206, `application/wasm`.
- Sudoku local smoke: entry, `Sudoku.loader.js`, `Sudoku.data`, and `Sudoku.wasm` returned HTTP 200. Loader contract test passed and contains no `Build_Webgl` reference.
- `mugenhorror.mp4` was preserved externally before local removal; SHA-256 source/destination: `d99472df28d43aa2d87481f89ddcc124c829675acd0d9014980323743302a4ae`.
- Runtime references were changed before staging local removals. Historical Lighthouse reports may still contain baseline URLs and are intentionally immutable evidence.

Rollback for E1 is a Git revert of the eventual E1 commit on `feature/performance`; external destination copies remain available and are not deleted by rollback.

The initial five quick-relief candidates alone would have left approximately 943.8 MiB. Migrating FoodTruck as the additional verified build reduced the staged tracked set to **881.95 MiB**, so the Emergency size gate now passes.

## Detail-fragment classification

| Fragment | State | Decision |
|---|---|---|
| `citybuilder.html` | orphan | archived; do not display |
| `iceBreakingBattle.html` | orphan | archived; do not display |
| `neighborhood.html` | orphan | archived; do not display |
| Remaining referenced fragments | active candidate | canonical reconciliation pending |

## Migration safety rules

1. Copy/upload first.
2. Verify public URL, status, MIME, loader, media playback, cold load and repeat load.
3. Update canonical/reference URLs.
4. Run local and HTTP smoke tests.
5. Remove old tracked files only after verification.
6. Do not rewrite Git history or force-push.
7. Do not merge/deploy `main` without a new approval.

## Pending evidence before E0 PASS

- Exact loader-selected files, compression and Service Worker/precache behavior for every tracked game.
- Source path/owner and Unity version for each Unity build; current status is `unknown`, never implied PASS.
- Exact media/detail reference map and rollback URLs after destination paths are chosen.
- Bandwidth model from actual migrated payloads.
