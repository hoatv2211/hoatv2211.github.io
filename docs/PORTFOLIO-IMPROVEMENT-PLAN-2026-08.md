# Portfolio Improvement Implementation Plan

> **Trạng thái:** Bản tổng hợp để review, chưa triển khai
>
> **Nguồn:** `docs/PORTFOLIO-AUDIT-2026-08.md`, kết quả review source, render desktop/mobile, static audit và Lighthouse ngày 13/08/2026
>
> **For Hermes:** Khi kế hoạch được duyệt, dùng `software-development/subagent-driven-development` để triển khai theo từng phase. Không commit, push, publish, xóa build hoặc rewrite Git history nếu chưa có yêu cầu rõ ràng từ người dùng.

**Goal:** Nâng portfolio từ mức 68-70/100 lên một website Senior Unity Developer nhanh, đáng tin, dễ kiểm chứng và có conversion rõ ràng, trong khi vẫn giữ playable WebGL và visual identity hiện tại.

**Architecture:** Thực hiện emergency containment trước mọi phase để đưa published set về dưới ngưỡng an toàn của GitHub Pages. Sau đó giữ mô hình static trong giai đoạn đầu, sửa critical loading path, dữ liệu và conversion trước khi refactor frontend. Project data sẽ được hợp nhất thành một nguồn chuẩn, sau đó generate các định dạng phục vụ main site, backup variants và chatbot. Playable builds được tách khỏi initial page load trước, rồi di chuyển khỏi repo chính theo migration có rollback.

**Tech Stack:** HTML, CSS, JavaScript thuần, Node.js validation scripts, GitHub Pages, Unity WebGL, Cloudflare Worker/R2 hoặc repo `mad-game-hub-shared`, Lighthouse, html-validate, Playwright/Chrome.

---

## 1. Tóm tắt quyết định đề xuất

Đây là các quyết định cần duyệt trước khi triển khai.

| ID | Quyết định đề xuất | Lý do | Trạng thái review |
|---|---|---|---|
| D1 | Giữ định vị chính là **Senior Unity Game Developer**, AI/automation là năng lực bổ trợ | Tránh portfolio bị phân tán giữa game, AI, Web3 và automation | [ ] Duyệt |
| D2 | Dùng information architecture của `backup/recruiter-clean/` làm khung, kết hợp visual identity của trang chính | Recruiter Clean dễ scan hơn, main site có cá tính game mạnh hơn | [ ] Duyệt |
| D3 | Chọn 6 flagship projects: Dalgona, Idle Cyber, MU Loren, Nekoverse, Sandwich Please, JX1 | Bao phủ solo delivery, technical leadership, MMORPG, commercial mobile và WebGL | [ ] Duyệt |
| D4 | CTA chính thống nhất là **Hire Me**; CTA phụ là **View Selected Work**; CV là utility action | Loại bỏ cạnh tranh giữa Hire Me, Book Call, Schedule Call và chatbot | [ ] Duyệt |
| D5 | Chỉ dùng **Book a Call** khi có URL đặt lịch thật; trong thời gian chưa có thì dùng **Message on Telegram** | Telegram hiện không phải lịch đặt cuộc gọi | [ ] Duyệt |
| D6 | Chọn `portfolio.json` làm nguồn dữ liệu giàu thông tin, generate `assets/js/portfolio-data.js` cho runtime | `portfolio.json` có role, contributions, achievements, team size và links; cần cập nhật `AGENTS.md` sau migration | [ ] Duyệt |
| D7 | Tách playable builds sang `mad-game-hub-shared` hoặc Cloudflare R2/Pages sau khi link migration đã được kiểm chứng | Giảm repo size, deployment risk và initial payload | [ ] Duyệt |
| D8 | Hoãn blog, bản tiếng Việt và testimonial đến sau khi performance, content proof và QA đạt gate | Tránh mở rộng scope trước khi sửa critical defects | [ ] Duyệt |
| D9 | Đặt hard gate published set tối đa **900 MiB** trước Phase 0 | Chỉ xuống sát 1 GiB không tạo đủ headroom cho deploy tiếp theo | [ ] Duyệt |
| D10 | Bảo vệ Worker theo abuse model, không coi URL public là secret | CORS không thay thế rate limit, bot protection hoặc request validation | [ ] Duyệt |

### Câu hỏi dữ liệu cần chủ sở hữu xác nhận

- [ ] Số chính thức là **50+** hay **100+ published games**?
- [ ] Claim “Top 1 World App” có URL hoặc screenshot chứng minh theo thời điểm không?
- [ ] Claim fundraising của Idle Cyber và Nekoverse có public source nào được phép dẫn không?
- [ ] Tên thương hiệu hiển thị chính: **HoaTV**, **MAD**, **MAD Game Works** hay **ONEMAD STUDIO**?
- [ ] Có được công khai team size, tên công ty và contribution cụ thể của từng project không?
- [ ] Nền tảng ưu tiên cho playable build: `mad-game-hub-shared` hay Cloudflare R2/Pages?
- [ ] Còn Unity source buildable cho từng playable game nào? Ai giữ source và Unity version tương ứng?
- [ ] Có quyền deploy/configure cả hai Worker `quiet-haze...` và `portfolio.thanhlong-worker...` không?

Không đưa claim chưa xác nhận vào metadata, case study headline hoặc result cards.

---

## 2. Baseline đã đối chiếu

Các số dưới đây là baseline dùng cho kế hoạch. Chúng thay thế số đếm cũ trong audit khi có khác biệt.

| Hạng mục | Baseline hiện tại |
|---|---:|
| Project trong `assets/js/portfolio-data.js` | **22** |
| Project trong `portfolio.json` | **19** |
| `portfolio.json._meta.lastUpdated` | **2026-04-01** |
| `.git` | khoảng **1.9 GB** trên disk; loose objects khoảng **1.49 GiB** |
| Tracked/published candidate set | **1,298,391,695 bytes**, khoảng **1,238.2 MiB**, 705 files |
| GitHub Pages published site limit | **1 GB** |
| GitHub Pages bandwidth soft limit | **100 GB/tháng** |
| `Games/` | khoảng **935 MB** |
| `assets/` | khoảng **295 MB** |
| Lighthouse mobile | Performance **55**, Accessibility **95**, Best Practices **65**, SEO **82** |
| Lighthouse desktop | Performance **63**, Accessibility **95**, Best Practices **65**, SEO **82** |
| Mobile LCP | **39.1 giây** |
| Desktop LCP | **5.5 giây** |
| Initial Lighthouse payload | khoảng **110-115 MB** |
| Portfolio validator | Pass cho **22 projects** |
| `npm test` | Fail vì chưa có test suite |
| HTML validation | 51 lỗi ở main/backup surfaces; 307 lỗi trong detail fragments |
| Detail fragments | 25 files, 22 được data tham chiếu, **3 orphan** |
| Orphan fragments | `citybuilder.html`, `iceBreakingBattle.html`, `neighborhood.html` |
| Cloudflare Worker protection | Chat Worker có origin allowlist một phần, nhưng cho phép request thiếu `Origin`; chưa có rate limit/Turnstile trong source |

### Rủi ro tồn vong của hosting

Published candidate set hiện khoảng **1,238.2 MiB**, vượt giới hạn site publish 1 GB của GitHub Pages. Đây là rủi ro khác với `.git` 1.9 GB:

- `.git` lớn làm clone, push và CI chậm nhưng không được gửi cho visitor.
- Tracked/published files lớn mới trực tiếp đe dọa giới hạn Pages và bandwidth.
- Một lượt chơi WebGL khoảng 100 MB có thể khiến soft bandwidth 100 GB/tháng cạn sau khoảng 1,000 lượt chơi, chưa tính traffic portfolio và tải lại.

Không bắt đầu Phase 0-4 khi tracked set còn trên 900 MiB. Mức 900 MiB là operational headroom của dự án, không phải giới hạn chính thức mới của GitHub.

### Quick-relief arithmetic đã xác minh

| Candidate | Dung lượng giảm ước tính | Trạng thái tham chiếu |
|---|---:|---|
| `assets/images/game/Archero/Movie_003.mp4` | 93.7 MiB | Dùng bởi `archero.html` và orphan `citybuilder.html`; phải thay bằng external video/poster trước khi remove |
| `assets/videos/CryptoQuest.mp4` | 75.6 MiB | Dùng bởi `cryptoquest.html`; phải thay bằng external video/poster trước khi remove |
| `Games/Sudoku/Build/Build_Webgl.*` | 65.7 MiB | Loader hiện dùng `Sudoku.*`; duplicate candidate cần smoke-test trước khi remove |
| `assets/videos/intro.gif` | 28.6 MiB | Chỉ README tham chiếu; thay bằng ảnh nhẹ |
| `assets/videos/mugenhorror.mp4` | 30.9 MiB | Không có runtime reference trong source hiện tại; vẫn phải kiểm tra owner intent |

Năm candidate trên đưa tracked set về khoảng **943.8 MiB**, vẫn chưa đạt hard gate 900 MiB. Emergency phase phải di dời thêm tối thiểu khoảng **44 MiB**. Đề xuất di dời trọn một playable build 60 MiB trở lên sau inventory; `Games/HomeDesign/` khoảng 128 MB là candidate, không phải quyết định xóa mặc định.

### Nguyên nhân performance quan trọng nhất

`assets/js/portfolio-details.js` đang fetch và inject toàn bộ 22 detail fragments khi trang khởi động. Một số fragment chứa video autoplay, gồm `assets/portfolio-details/archero.html` tham chiếu video khoảng 93.7 MB. Vì vậy initial payload thực tế cao hơn nhiều so với ước tính chỉ tính hero assets.

### Defect đã xác minh cần sửa ngay

- `assets/js/gaming-showcase.js` map `sandwich` sang `Games/FoodTruck/index.html` thay vì `Games/SandwichPlease/index.html`.
- `assets/portfolio-details/sandwich.html` tham chiếu `assets/images/game/SandwichPlease/icon.png`, file không tồn tại.
- Mobile navigation che nội dung About tại viewport 390px.
- Sticky contact CTA và chatbot có thể che project/content.
- Main page và backup variants có project cards nhìn như thiếu ảnh khi lazy image chưa được kích hoạt hoặc external image không tải.
- `backup/shared/backup-data-adapter.js` cho nhiều nút “View evidence” quay về homepage thay vì đúng project detail.

---

## 3. Nguyên tắc triển khai

1. **Performance trước redesign:** không chỉnh visual lớn khi initial page vẫn tải detail/video nặng.
2. **Proof trước breadth:** 6 case studies tốt quan trọng hơn 22 cards ngang hàng.
3. **Một nguồn dữ liệu:** không cập nhật thủ công main, JSON, backup và chatbot ở nhiều nơi.
4. **Static-first:** giữ GitHub Pages friendly; không thêm framework nếu chưa có lợi ích đo được.
5. **Không phá URL:** giữ route cũ hoặc redirect rõ ràng khi di chuyển playable builds.
6. **An toàn dữ liệu:** tách build và cleanup working tree trước; rewrite history là phase riêng cần backup và phê duyệt.
7. **Mỗi phase có gate:** chỉ sang phase tiếp theo khi acceptance criteria của phase hiện tại đạt.
8. **Không dùng số liệu ước đoán làm proof:** mọi metric public phải có nguồn hoặc được chủ sở hữu xác nhận.
9. **Hosting survival trước Lighthouse:** tracked published set và bandwidth pressure được xử lý trước cosmetic/performance work.
10. **Abuse prevention phía server:** client cooldown và CORS chỉ là UX/browser controls, không phải security boundary.

---

## 4. Quản trị delivery, branch và estimate

### Tổng effort

Kế hoạch thực tế khoảng **20-30 ngày công**, tương đương **4-6 tuần** cho một người nếu có đầy đủ quyền deploy và Unity source. Estimate chưa gồm thời gian rebuild Unity khi source/version bị thiếu, review của chủ sở hữu hoặc thời gian chờ DNS/CDN.

| Workstream | Task | Estimate | Dependency chính |
|---|---|---:|---|
| Emergency | E0 inventory source, publish set và rollback map | 0.5-1 ngày | Quyền xem source/build ownership |
| Emergency | E1 quick relief về tối đa 900 MiB | 0.5-1.5 ngày | External storage/repo destination |
| Emergency | E2 deploy, verify và rollback rehearsal | 0.5 ngày | E1 |
| Data | 0.1 claim registry | 0.5 ngày | Owner xác nhận |
| Data | 0.2 canonical model và orphan classification | 1 ngày | E0 |
| Runtime | 1.1 regression checks | 1 ngày | Emergency gate pass |
| Runtime | 1.2 demand-load details | 1.5-2 ngày | 1.1 |
| Runtime | 1.3 URL, asset và orphan cleanup | 0.5-1 ngày | 1.1 |
| Runtime | 1.4 media loading policy | 1-1.5 ngày | 1.2 |
| Runtime | 1.5 mobile nav và overlay | 1 ngày | 1.1 |
| Security | 1.6 Worker abuse hardening | 1-2 ngày | Quyền deploy Worker |
| Conversion | 2.1-2.5 hero, flagship, cases, content, backups | 4-6 ngày | Claims đã khóa |
| SEO/a11y | 3.1-3.5 SEO, routes, semantics, Best Practices, CV | 4-6 ngày | Phase 2 |
| Data/CI | 4.1-4.3 generator, validator, CI | 2-3 ngày | Canonical model |
| WebGL/repo | 5.1-5.4 rebuild/migrate/cleanup | 3-8 ngày | Source availability và D7 |
| Git history | 5.5 history rewrite | 0.5-1 ngày + coordination | Approval riêng |

### Branch và rollback áp dụng cho mọi phase

Mỗi phase dùng một branch riêng từ base đã được chủ sở hữu duyệt:

| Phase | Branch đề xuất | Pre-merge tag trên base | Rollback |
|---|---|---|---|
| Emergency | `hotfix/pages-size-relief` | `portfolio-pre-size-relief-2026-08` | Revert merge hoặc redeploy tag |
| Phase 0 | `plan/data-claims` | `portfolio-pre-phase-0` | Revert docs/data-only merge |
| Phase 1 | `perf/runtime-demand-load` | `portfolio-pre-phase-1` | Revert merge; restore prior static assets |
| Phase 2 | `feat/recruiter-conversion` | `portfolio-pre-phase-2` | Revert merge; preserve route aliases |
| Phase 3 | `feat/seo-a11y-cv` | `portfolio-pre-phase-3` | Revert merge; keep old URLs live |
| Phase 4 | `chore/data-ci-gates` | `portfolio-pre-phase-4` | Revert generator/CI merge together |
| Phase 5 | `infra/webgl-hosting` | `portfolio-pre-phase-5` | Switch canonical URLs to rollback map |

Rules:

- Không merge phase khi gate chưa pass.
- Tag chỉ được tạo ngay trước merge/deploy, không tạo trong lượt review plan.
- Mỗi phase có một merge commit hoặc PR độc lập để revert nguyên phase.
- Không trộn user-authored changes hiện có vào branch/commit của phase.
- Phase 5.5 vẫn cần backup mirror và explicit force-push approval riêng.

---

## 5. Target experience sau cải tiến

### First viewport desktop

1. `Senior Unity Game Developer`
2. Một câu value proposition tối đa 20 từ
3. Hai CTA: `Hire Me`, `View Selected Work`
4. Một visual/gameplay poster nhẹ, không autoplay
5. Ba proof points đã xác minh

### Thứ tự trang chính

1. Hero và CTA
2. Selected proof
3. Flagship case studies
4. Playable demos
5. Technical capabilities
6. Experience rút gọn
7. Process/engagement gộp chung
8. Additional work và GitHub
9. Contact

### Cấu trúc mỗi flagship case study

- Context
- Role và team size
- Problem/constraint
- Direct contributions
- Technical solution
- Result có nguồn
- Stack/platform
- Evidence: video, screenshot, store, source hoặc playable link
- NDA note nếu cần

### Content grouping

- **Flagship Work:** 6 projects đã chọn
- **Playable Demos:** chỉ project có URL hoạt động và load budget đạt
- **Additional Projects:** archive/filter
- **Beyond Unity:** ProxyAPI.MAD và agentic tooling, không trộn vào hero positioning

---

# Emergency Phase: Giảm rủi ro GitHub Pages trước mọi cải tiến

**Mục tiêu:** Đưa tracked/published candidate set từ 1,238.2 MiB xuống tối đa 900 MiB, xác minh source availability và tạo rollback map trước Phase 0.

## Task E0: Inventory tối thiểu và source-availability gate

**Estimate:** 0.5-1 ngày

**Files:**
- Create: `docs/playable-build-inventory.md`
- Read: `Games/**`
- Read: `assets/videos/**`
- Read: `assets/portfolio-details/*.html`
- Read: Unity source locations ngoài repo nếu có

**Thực hiện:**

- Ghi current URL, size, loader-selected files, source owner, Unity version, rebuildability, destination URL và rollback URL cho từng playable build.
- Xác minh source availability **trước Phase 0**. Game mất source chuyển sang hướng host nguyên build hiện tại hoặc retire có chủ đích; không giả định có thể rebuild compression.
- Phân loại 25 detail fragments thành 22 active và 3 orphan.
- Chụp baseline tracked files bằng script deterministic, không dùng `du -sh .` làm published-size metric.

**Acceptance criteria:**

- [ ] 11 thư mục trong `Games/` được phân loại; BikeTrial không được tính là playable nếu vẫn chỉ là thư mục rỗng/hỏng.
- [ ] Mỗi build thực sự playable có trạng thái source: available, missing hoặc unknown.
- [ ] Mỗi candidate remove/relocate có reference map và rollback URL.
- [ ] Xác nhận loader Sudoku dùng `Sudoku.*`, không dùng `Build_Webgl.*`.
- [ ] `citybuilder`, `iceBreakingBattle`, `neighborhood` được ghi là orphan và có quyết định remove/archive/restore-to-data.

## Task E1: Quick relief không phá hủy

**Estimate:** 0.5-1.5 ngày

**Files:**
- Modify: `assets/portfolio-details/archero.html`
- Modify: `assets/portfolio-details/cryptoquest.html`
- Modify: `README.md`
- Modify: canonical/demo URLs liên quan
- Relocate then remove after verification: media/build candidates đã duyệt

**Thứ tự an toàn:**

1. Copy/upload media và build candidate tới destination đã duyệt.
2. Verify HTTP status, MIME type, playback/load và public URL.
3. Đổi references sang external URL hoặc poster facade.
4. Smoke-test main, detail và playable routes.
5. Chỉ sau đó remove bản tracked trong portfolio repo.

**Quick-relief set ban đầu:**

- Relocate `Movie_003.mp4` và `CryptoQuest.mp4`.
- Thay README GIF bằng static image nhẹ rồi remove `intro.gif`.
- Remove bộ `Games/Sudoku/Build/Build_Webgl.*` sau smoke test loader.
- Remove/relocate `mugenhorror.mp4` nếu owner xác nhận không cần giữ local.
- Relocate thêm tối thiểu một build đủ lớn để tracked set đạt tối đa 900 MiB. Chọn từ inventory, không mặc định xóa HomeDesign.

**Acceptance criteria:**

- [ ] Tracked set tối đa **900 MiB**, tạo khoảng 54 MiB headroom nếu giới hạn 1 GB được tính theo 1,000,000,000 bytes.
- [ ] Không còn tracked file đơn lẻ lớn hơn 90 MiB; file trên 50 MiB có owner và migration note.
- [ ] Archero và CryptoQuest vẫn có evidence/playback hoạt động.
- [ ] Sudoku playable load đúng bộ `Sudoku.*`.
- [ ] Không có broken local asset hoặc route sau removal.

## Task E2: Deploy verification và rollback rehearsal

**Estimate:** 0.5 ngày

**Files:**
- Update: `docs/playable-build-inventory.md`
- Update: rollback map trong cùng tài liệu

**Acceptance criteria:**

- [ ] GitHub Pages deployment hoàn tất trong giới hạn thời gian.
- [ ] Published routes trả 200 và external media/build URLs hoạt động.
- [ ] Đo lại tracked bytes được ghi vào tài liệu.
- [ ] Revert branch/tag hoặc URL rollback được diễn tập ít nhất ở local/staging.

## Emergency gate

- [ ] Không bắt đầu Phase 0 khi tracked set còn trên 900 MiB.
- [ ] Không bắt đầu kế hoạch rebuild Unity khi source availability chưa được phân loại.
- [ ] Bandwidth model được cập nhật theo payload thực của từng playable build.

---

# Phase 0: Khóa dữ liệu và scope

**Mục tiêu:** Chốt claim, thương hiệu, flagship selection và nguồn dữ liệu trước khi chỉnh UI.

## Task 0.1: Lập claim registry

**Files:**
- Create: `docs/portfolio-claims.md`
- Read: `index.html`
- Read: `portfolio.json`
- Read: `assets/js/portfolio-data.js`
- Read: `assets/portfolio-details/*.html`

**Thực hiện:**

Tạo bảng gồm `claim`, `value`, `source URL/file`, `allowed wording`, `last verified`, `owner approval`. Đưa các claim sau vào trạng thái pending cho đến khi được xác nhận:

- 50+ hoặc 100+ published games
- Top 1 World App
- Hundreds of thousands of users
- Million-dollar funding
- Team leadership 5-15 người
- 8+ years

**Acceptance criteria:**

- [ ] Không còn claim public mâu thuẫn giữa `index.html`, `portfolio.json`, backup variants và metadata.
- [ ] Mỗi claim định lượng có source hoặc owner approval.
- [ ] Wording phân biệt rõ product/company outcome với direct contribution của Hoa.

## Task 0.2: Chốt canonical data model

**Files:**
- Modify: `portfolio.json`
- Modify later: `AGENTS.md`
- Create later: `scripts/generate-portfolio-data.js`

**Đề xuất schema project tối thiểu:**

```text
id, slug, title, type, featured, category, genre, period,
role, teamSize, engine, platforms, summary, problem,
contributions[], outcomes[], evidence[], image, playableUrl,
storeUrls, sourceUrl, detailRoute, ndaNote
```

**Acceptance criteria:**

- [ ] Có đúng 22 project records hoặc danh sách loại bỏ được ghi rõ.
- [ ] ID và slug duy nhất.
- [ ] Mỗi flagship project có role, contributions và evidence.
- [ ] Không thay `AGENTS.md` sang nguồn mới trước khi generator và validator hoạt động.
- [ ] Orphan fragments `citybuilder`, `iceBreakingBattle`, `neighborhood` có quyết định rõ: remove, archive hoặc restore-to-data.
- [ ] Không còn detail file trên disk ngoài canonical project set trừ khi được ghi trong inventory với lý do giữ lại.

**Gate Phase 0:** D1-D10 và các câu hỏi dữ liệu đã được duyệt.

---

# Phase 1: Sửa critical loading path và broken flows

**Mục tiêu:** Trang chủ không tải media/detail của project chưa mở; mọi CTA/project route đúng; mobile không bị che nội dung.

## Task 1.1: Thêm regression checks trước khi sửa

**Files:**
- Create: `scripts/validate-links.js`
- Create: `scripts/check-runtime-smoke.js` hoặc Playwright smoke test tương đương
- Modify: `package.json`

**Checks bắt buộc:**

- Local image/file tồn tại.
- `demoUrl`, store URL và detail route hợp lệ.
- Project detail file tồn tại.
- Không có duplicate ID/slug.
- Trang chủ không request `.wasm`, `.data` hoặc project-detail video trước interaction.
- Main và ba backup routes load được qua HTTP.

**Expected scripts:**

```json
{
  "test": "npm run validate:portfolio && npm run validate:links && npm run test:smoke",
  "validate:links": "node scripts/validate-links.js",
  "test:smoke": "node scripts/check-runtime-smoke.js"
}
```

**Acceptance criteria:**

- [ ] Test mới bắt được route Sandwich sai trước khi implementation được sửa.
- [ ] `npm test` có ý nghĩa và không còn placeholder fail.

## Task 1.2: Demand-load project details

**Files:**
- Modify: `assets/js/portfolio-details.js`
- Modify: `assets/js/script.js`
- Modify: `assets/js/gaming-showcase.js`
- Modify: `assets/js/portfolio-render.js`

**Implementation direction:**

- Không gọi `fetch` cho 22 detail files trong `DOMContentLoaded`.
- Tạo API `loadProjectDetail(detailCategory)` trả về Promise và cache theo slug.
- Khi người dùng bấm card hoặc CTA, fetch đúng một fragment, render loading state và sau đó mở detail.
- Có error state với link quay lại project list.
- Không inject hidden detail fragments vào DOM.
- Không preload project videos/iframes trước khi detail được mở.

**Acceptance criteria:**

- [ ] Network khi load homepage không có request tới `assets/portfolio-details/*.html`.
- [ ] Mở một project chỉ fetch một detail fragment.
- [ ] Mở lại project dùng cache trong session.
- [ ] Back flow trả về đúng scroll position/project list.
- [ ] DOM homepage giảm rõ rệt so với baseline hơn 3,000 elements.

## Task 1.3: Sửa project URL và asset integrity

**Files:**
- Modify: `assets/js/gaming-showcase.js`
- Modify: `assets/js/portfolio-data.js` hoặc canonical generator output
- Modify: `assets/portfolio-details/sandwich.html`
- Check siblings: toàn bộ `assets/portfolio-details/*.html`

**Required fixes:**

- `sandwich` trỏ tới `Games/SandwichPlease/index.html`.
- Dùng asset tồn tại `assets/images/game/Sanwitch/icon.webp` hoặc đổi tên asset có migration rõ ràng.
- Chuyển demo mapping vào project data, loại bỏ `DEMO_URL_BY_KEY` khi dữ liệu đã đầy đủ.
- Thêm fallback image cho external image fail.
- Sửa “Jx Mobie” nếu chủ sở hữu xác nhận tên đúng là “JX Mobile”.

**Acceptance criteria:**

- [ ] 22/22 cards mở đúng target.
- [ ] Mọi playable CTA có label `Play Demo` hoặc `Play WebGL`, không dùng `Detail` cho playable action.
- [ ] Không còn missing local asset trong validator.

## Task 1.4: Media loading policy

**Files:**
- Modify: `index.html`
- Modify: `assets/portfolio-details/*.html`
- Modify: `assets/js/modern-enhancements.js`
- Modify: `assets/js/media-orientation.js` nếu cần
- Modify: `assets/css/style.css`
- Modify: `assets/css/modern-enhancements.css`

**Policy:**

- Hero dùng poster/thumbnail; video chỉ load sau click.
- Detail video dùng `preload="none"`, poster và không autoplay.
- YouTube iframe dùng poster facade hoặc tối thiểu `loading="lazy"` và chỉ được tạo khi detail mở.
- Image dưới fold dùng native `loading="lazy" decoding="async"`.
- Image trên first viewport có kích thước cố định để tránh CLS.
- Không thay `src` bằng blank data SVG theo cách khiến full-page screenshot hoặc backup card trông như mất ảnh; native lazy loading là mặc định.

**Acceptance criteria:**

- [ ] Không request `assets/vd1.mp4` trước khi click Play.
- [ ] Không request `assets/images/game/Archero/Movie_003.mp4` ở homepage.
- [ ] Không autoplay media ở hidden/inactive content.
- [ ] Mọi project image có fallback có chủ đích.

## Task 1.5: Sửa mobile navigation và overlay

**Files:**
- Modify: `index.html`
- Modify: `assets/css/style.css`
- Modify: `assets/css/modern-enhancements.css`
- Modify: `assets/css/portfolio-chatbot.css`
- Modify: `assets/js/script.js`

**Implementation direction:**

- Mobile dùng menu gọn hoặc tối đa các mục chính không chồng nội dung.
- Navbar có layout space thực, không overlay lên heading.
- Sticky CTA không xuất hiện đồng thời với hero CTA ở first viewport.
- Chatbot mặc định collapsed, không che card/CTA.
- Touch targets tối thiểu 44x44px.
- Desktop nav một dòng, cao không quá 80px.

**Acceptance criteria:**

- [ ] Viewport 390x844: `scrollWidth === clientWidth`.
- [ ] About heading và hero CTA không bị navbar/chatbot che.
- [ ] Viewport 1440px: sticky CTA không che copy hoặc project card.
- [ ] Keyboard focus và Escape hoạt động với menu/dialog/chatbot.

## Task 1.6: Hardening Cloudflare Worker abuse surface

**Estimate:** 1-2 ngày, không gồm thời gian chờ deploy/quyền Cloudflare

**Files:**
- Modify: `cloudflare/portfolio-chat-worker.js`
- Modify: Worker xử lý visit hook nếu là deployment khác với Chat Worker
- Modify: `assets/js/visit-telegram-hook.js`
- Modify: `assets/js/fetchdownloadcount.js`
- Create or update: Worker deployment/config documentation, không ghi token vào repo

**Threat model:**

- URL Worker trong client là public và không phải secret.
- `Origin` allowlist chỉ bảo vệ browser CORS; request không có `Origin` vẫn được chấp nhận tại `cloudflare/portfolio-chat-worker.js:96-99`.
- Visit hook có thể gửi dữ liệu visitor sang Telegram.
- Proxy download-count nhận URL từ client và cần giới hạn upstream/target để tránh SSRF hoặc abuse.

**Implementation direction:**

- Thêm rate limit theo IP/CF connecting IP, route và session key ở edge.
- Thêm Turnstile cho chat/lead flow nếu UX cho phép; nếu không, yêu cầu server-issued short-lived challenge cho các action có side effect.
- Giới hạn body size, request frequency, message count và total characters phía Worker; không chỉ validate shape hiện tại.
- Tách visit hook khỏi chat route nếu có thể; chỉ cho phép payload fields cần thiết.
- Chặn request không có `Origin` cho các browser-only route nếu không cần hỗ trợ server-to-server. Nếu giữ hỗ trợ beacon, dùng signed nonce hoặc challenge riêng.
- Với download-count proxy, allowlist upstream host/path và cache response; không forward arbitrary `?url=`.
- Thêm logging/alert cho 403, 429, Telegram send burst và upstream failure. Không log token hoặc dữ liệu nhạy cảm.
- Giữ token, chat ID và 9Router key trong Worker secrets/env; không đưa vào static client.

**Acceptance criteria:**

- [ ] Burst test từ cùng IP/session nhận 429 theo policy đã ghi.
- [ ] Request không có Origin không thể gọi side-effect route ngoài policy đã duyệt.
- [ ] Origin check, rate limit và Turnstile/challenge được test ở production Worker.
- [ ] Download proxy từ chối target ngoài allowlist.
- [ ] Visit hook không gửi Telegram lặp vô hạn khi reload/bot flood.
- [ ] Có rollback config và runbook rotate secret.

## Gate Phase 1

- [ ] Homepage payload trước interaction dưới **5 MB**; target cuối dưới **3 MB**.
- [ ] Không có request WebGL `.wasm/.data` hoặc detail video trên homepage.
- [ ] Mobile Lighthouse Performance tối thiểu **75** ở gate đầu.
- [ ] Desktop Lighthouse Performance tối thiểu **85** ở gate đầu.
- [ ] Lighthouse Best Practices tối thiểu **90** ở gate đầu; lỗi chưa xử lý phải có exception note.
- [ ] `npm test` pass.
- [ ] Main, Portfolio, GitShare và ba backup routes pass smoke test.

---

# Phase 2: Recompose portfolio cho recruiter/client conversion

**Mục tiêu:** Người xem hiểu giá trị, thấy proof và có đường liên hệ rõ trong 30-60 giây.

## Task 2.1: Rút gọn hero và CTA

**Files:**
- Modify: `index.html`
- Modify: `assets/css/style.css`
- Modify: `assets/css/modern-enhancements.css`
- Modify: `assets/js/site-config.js` hoặc canonical data output

**Hero content limit:**

- Eyebrow hoặc role label
- Headline tối đa 2 dòng desktop
- Subtext tối đa 20 từ
- Một primary CTA và một secondary CTA
- Một visual/poster nhẹ

**CTA vocabulary:**

- `Hire Me`: email/form contact
- `View Selected Work`: anchor/route tới flagship projects
- `Download CV`: utility action
- `Message on Telegram`: contact channel
- `Book a Call`: chỉ dùng khi có scheduling URL thật

**Acceptance criteria:**

- [ ] CTA xuất hiện trong initial viewport desktop và mobile.
- [ ] Không còn “Book Call” trỏ thẳng Telegram.
- [ ] Không có hai label khác nhau cho cùng một intent.

## Task 2.2: Đưa flagship proof lên trước services/process

**Files:**
- Modify: `index.html`
- Modify: `assets/js/portfolio-render.js`
- Modify: `assets/js/gaming-showcase.js`
- Modify: canonical project data

**Featured order đề xuất:**

1. Dalgona - Worldchain
2. Idle Cyber
3. MU Loren Mobile
4. Nekoverse
5. Sandwich Please
6. JX1 Mobile

**Acceptance criteria:**

- [ ] Flagship section xuất hiện ngay sau hero/proof strip.
- [ ] Mỗi card có role, 1 outcome, platform và đúng CTA.
- [ ] Sample/template không đứng ngang hàng với commercial flagship.
- [ ] Agentic work nằm trong section “Beyond Unity” hoặc GitShare.

## Task 2.3: Chuẩn hóa case studies

**Files:**
- Modify: `assets/portfolio-details/dalgona.html`
- Modify: `assets/portfolio-details/idleCyber.html`
- Modify: `assets/portfolio-details/muloren.html`
- Modify: `assets/portfolio-details/nekoverse.html`
- Modify: `assets/portfolio-details/sandwich.html`
- Modify: `assets/portfolio-details/jx1.html`
- Later create: standalone project routes in Phase 3

**Acceptance criteria:**

- [ ] Sáu case studies theo cùng domain model nhưng không copy-paste generic text.
- [ ] Phân biệt rõ game description với contribution của Hoa.
- [ ] Có evidence link hoạt động.
- [ ] Không dùng fundraising/user count như direct personal result nếu không có attribution.
- [ ] Screenshot alt mô tả nội dung thật, không lặp “screenshot 1”.

## Task 2.4: Gom nội dung trùng lặp

**Files:**
- Modify: `index.html`
- Modify: `assets/js/site-config.js`

**Gộp:**

- `How I Work` + `Engagement Model` thành một section ngắn.
- `Public Proof` + `Selected Results` thành proof strip và evidence links.
- `What I'm Doing` + service-more list thành capability groups.
- Resume đầy đủ giữ ở CV/detail route, homepage chỉ hiện recent/strongest experience.

**Acceptance criteria:**

- [ ] Homepage giảm ít nhất 25% visible copy so với baseline mà không mất proof chính.
- [ ] Không có section nào lặp cùng message hoặc cùng CTA intent.
- [ ] First flagship project xuất hiện sớm hơn baseline.

## Task 2.5: Đồng bộ ba backup variants

**Files:**
- Modify: `backup/shared/backup-data-adapter.js`
- Modify: `backup/recruiter-clean/index.html`
- Modify: `backup/recruiter-clean/main.js`
- Modify: `backup/dev-console/index.html`
- Modify: `backup/dev-console/main.js`
- Modify: `backup/game-studio/index.html`
- Modify: `backup/game-studio/main.js`

**Required fixes:**

- `View evidence` mở đúng project route/detail.
- Image fallback không tạo blank blocks.
- Contact CTA thống nhất.
- Backup routes vẫn dùng data adapter, không duplicate project records.

## Gate Phase 2

- [ ] Recruiter có thể xác định role, seniority, 3 flagship proofs và contact path trong 30 giây.
- [ ] 6 flagship projects có case study usable.
- [ ] Main và backups hiển thị cùng dữ liệu cốt lõi.
- [ ] Visual QA desktop 1440px và mobile 390px pass.

---

# Phase 3: SEO, social sharing, accessibility và CV

**Mục tiêu:** Portfolio có preview đẹp khi chia sẻ, index đúng và không còn structural accessibility defects quan trọng.

## Task 3.1: SEO foundation

**Files:**
- Create: `robots.txt`
- Create: `sitemap.xml`
- Create: `404.html`
- Create: `assets/og/portfolio-cover-1200x630.png` hoặc `.webp` với format social hỗ trợ tốt
- Modify: `index.html`

**Metadata bắt buộc:**

- `<!DOCTYPE html>`
- canonical absolute URL
- absolute `og:image`
- OG image width, height, type và alt
- Twitter card metadata
- locale khớp ngôn ngữ trang
- loại bỏ masked `telephone` khỏi JSON-LD hoặc dùng số hợp lệ nếu chủ sở hữu muốn public

**Acceptance criteria:**

- [ ] `/robots.txt`, `/sitemap.xml`, `/404.html` trả đúng content.
- [ ] Facebook/LinkedIn/Telegram preview dùng cover 1200x630.
- [ ] Structured data validator không có lỗi critical.
- [ ] Không còn relative OG URL.

## Task 3.2: Standalone project routes

**Files:**
- Create: `projects/<slug>/index.html` cho 6 flagship projects
- Modify: canonical project data
- Modify: `sitemap.xml`
- Modify: `assets/js/portfolio-render.js`
- Modify: `backup/shared/backup-data-adapter.js`

**Acceptance criteria:**

- [ ] Mỗi flagship có shareable URL riêng.
- [ ] Mỗi route có title, description, canonical và OG metadata riêng.
- [ ] Internal navigation và browser back/forward hoạt động.
- [ ] Route cũ không bị break hoặc có redirect/link migration.

## Task 3.3: HTML semantics và accessibility

**Files:**
- Modify: `index.html`
- Modify: `assets/portfolio-details/*.html`
- Modify: backup `index.html` files
- Modify: associated CSS/JS

**Fix classes:**

- Button có `type`.
- Form có label thật, helper/error text và focus state.
- Iframe có title.
- `<ul>` chỉ chứa `<li>`.
- Clickable image dùng `<button>` thay anchor không `href`.
- Dialog quản lý focus, Escape và `aria-hidden` đúng.
- Heading hierarchy không rỗng và không nhảy cấp vô lý.
- Reduced motion được tôn trọng.

**Acceptance criteria:**

- [ ] `npx --yes html-validate` pass cho main và ba backup pages.
- [ ] Detail fragments không còn structural errors.
- [ ] Lighthouse Accessibility tối thiểu **98**.
- [ ] Keyboard-only test pass các nav, filter, detail, image modal, contact và chatbot.

## Task 3.4: CV PDF

**Files:**
- Create: `assets/Tran-Van-Hoa-CV.pdf`
- Keep: `assets/Tran-Van-Hoa-CV.html`
- Modify: `index.html`
- Modify: backup contact/action rendering

**Acceptance criteria:**

- [ ] `View CV` mở HTML.
- [ ] `Download PDF` tải file PDF có text layer, không phải ảnh scan.
- [ ] PDF có contact, flagship work, experience và links nhất quán với canonical data.

## Task 3.5: Best Practices remediation

**Estimate:** 0.5-1 ngày

**Files:**
- Modify theo audit output: `index.html`, runtime JS, media markup, Worker client integration và external resource loading
- Update: Lighthouse baseline/report documentation

**Implementation direction:**

- Chạy Lighthouse từ clean Chrome profile và lưu danh sách audit Best Practices đang fail.
- Sửa theo audit ID, không tối ưu theo điểm tổng mơ hồ.
- Ưu tiên browser console errors, deprecated APIs/markup, unsafe third-party behavior, image/media defects và security-related findings.
- Ghi exception cho finding phụ thuộc external provider hoặc GitHub Pages, kèm owner và deadline.

**Acceptance criteria:**

- [ ] Lighthouse Best Practices tối thiểu **90** ở mobile và desktop.
- [ ] Không có console error từ first-party code trên main và flagship routes.
- [ ] Mỗi audit chưa pass có documented exception, không bị bỏ qua im lặng.

## Gate Phase 3

- [ ] SEO Lighthouse tối thiểu **95**.
- [ ] Accessibility tối thiểu **98**.
- [ ] Best Practices tối thiểu **90**.
- [ ] Social preview được test bằng public URL sau publish.
- [ ] Sáu flagship routes có trong sitemap.

---

# Phase 4: Hợp nhất dữ liệu và thiết lập quality gates

**Mục tiêu:** Một lần cập nhật project tự đồng bộ main site, backup variants, chatbot reference và validation.

## Task 4.1: Generate runtime data từ canonical JSON

**Files:**
- Modify: `portfolio.json`
- Create: `scripts/generate-portfolio-data.js`
- Generate: `assets/js/portfolio-data.js`
- Modify: `AGENTS.md`
- Modify: `package.json`

**Workflow đề xuất:**

```text
portfolio.json
  -> validate schema
  -> generate assets/js/portfolio-data.js
  -> main site + backup adapter consume generated data
  -> chatbot/reference consume portfolio.json hoặc generated compact feed
```

**Acceptance criteria:**

- [ ] `npm run generate:portfolio` tạo deterministic output.
- [ ] Chạy generator hai lần không tạo diff.
- [ ] `AGENTS.md` chỉ đổi single source of truth sau khi workflow pass.
- [ ] Không còn cập nhật thủ công 5 nơi cho một project.

## Task 4.2: Mở rộng validator

**Files:**
- Modify: `scripts/validate-portfolio.js`
- Modify: `scripts/validate-links.js`
- Modify: `package.json`

**Validator phải kiểm tra:**

- Required schema fields theo project type.
- Duplicate IDs/slugs.
- Featured count và order.
- Local assets tồn tại.
- Detail route và evidence link.
- Claim registry references cho metric public.
- Generated JS đang sync với JSON.
- Backup adapter không mất project.

## Task 4.3: CI quality workflow

**Files:**
- Create: `.github/workflows/portfolio-quality.yml`

**Pipeline:**

1. Install Node dependencies.
2. Generate/check portfolio data.
3. Run `npm test`.
4. Run `html-validate`.
5. Run static page audit.
6. Serve site và run smoke routes.
7. Lighthouse CI với budgets.
8. `git diff --check`.

**Acceptance criteria:**

- [ ] CI fail khi link, asset, schema, generated data hoặc budgets regress.
- [ ] CI không download/play toàn bộ WebGL builds.
- [ ] Local và CI dùng cùng commands.

## Gate Phase 4

- [ ] Một project update chỉ sửa canonical JSON và assets/content liên quan.
- [ ] `npm test` và CI pass.
- [ ] Main + 3 backup variants render đúng cùng dataset.

---

# Phase 5: WebGL delivery dài hạn và repo hygiene

**Mục tiêu:** Giữ lợi thế playable demos nhưng giảm download, repo size và deployment risk.

## Safety gate bắt buộc

Phase này chia thành hai phần:

1. **Migration không phá hủy:** copy/upload builds, đổi links, verify, giữ source cũ để rollback.
2. **Cleanup phá hủy:** xóa build cũ và rewrite history chỉ sau khi migration production đã ổn định và người dùng duyệt riêng.

Không chạy `git filter-repo`, force-push hoặc xóa build theo kế hoạch này nếu chưa có backup và explicit approval.

## Task 5.1: Inventory playable builds

**Files:**
- Update: `docs/playable-build-inventory.md` đã tạo ở Emergency Task E0
- Read: `Games/**`
- Read: canonical project data

**Inventory fields:**

- Game
- Current URL
- `.data/.wasm/framework` sizes
- Compression format
- Expected first download
- Mobile compatibility
- Owner/source project available
- Destination URL
- Rollback URL

**Acceptance criteria:**

- [ ] Tất cả playable builds có owner, source và migration target.
- [ ] Broken/empty folders như BikeTrial được xác định trước khi xóa.
- [ ] Duplicate Sudoku build được xác định bằng loader reference, không xóa theo tên đoán.
- [ ] Inventory được mở rộng từ emergency minimum sang compression, browser compatibility và long-term destination plan.

## Task 5.2: Rebuild/compress Unity WebGL

**Ngoài repo portfolio nếu cần Unity source.**

**Unity settings target:**

- Gzip hoặc Brotli với hosting tương thích.
- Decompression Fallback theo target host.
- Strip Engine Code.
- Smaller IL2CPP code generation khi phù hợp.
- Texture/audio budgets theo game.
- Loader UX có progress, error và retry.

**Acceptance criteria:**

- [ ] Mỗi flagship playable có first download budget; target dưới **25 MB**, exception phải ghi rõ.
- [ ] Loader hoạt động trên Chrome desktop, Android Chrome và iOS Safari nếu hỗ trợ.
- [ ] Server headers/fallback đúng với compression format.
- [ ] Không claim compressed chỉ dựa vào extension; phải verify network transfer thực tế.

## Task 5.3: Tách builds và videos khỏi repo chính

**Files:**
- Modify: canonical project URLs
- Modify: playable hub links
- Modify: `README.md`
- Modify: `.gitignore`
- Do not delete yet: `Games/`, `assets/videos/`

**Destination options:**

1. `mad-game-hub-shared`, đơn giản và sẵn có.
2. Cloudflare R2/Pages, kiểm soát headers/cache tốt hơn.

**Acceptance criteria:**

- [ ] New external URLs live và pass smoke tests.
- [ ] Main portfolio không phụ thuộc relative `Games/...` links.
- [ ] CORS, MIME types, compression và cache verified.
- [ ] Rollback mapping được lưu trước khi cleanup.

## Task 5.4: Working-tree cleanup

**Files:**
- Modify: `.gitignore`
- Remove only after verification: obsolete builds, duplicate build outputs, `index.backup.html`, empty/broken directories
- Rewrite: `README.md`

**`.gitignore` additions:**

```text
Library/
Temp/
Obj/
Build/
Builds/
Logs/
UserSettings/
*.unitypackage
*.zip
*.7z
*.rar
```

Điều chỉnh exception nếu repo vẫn cố ý chứa một build template.

**Acceptance criteria:**

- [ ] Không xóa file đang được loader hoặc route dùng.
- [ ] README không nhúng GIF 30 MB.
- [ ] README mô tả portfolio, local run, validation, publishing và data workflow.
- [ ] Main + backups + playable links pass sau cleanup.

## Task 5.5: Git history rewrite, yêu cầu approval riêng

**Preconditions:**

- [ ] Remote build migration chạy ổn định.
- [ ] Repo mirror/backup đầy đủ.
- [ ] Danh sách collaborators và branch protection đã được xem xét.
- [ ] User duyệt downtime/force-push plan.

**Acceptance criteria:**

- [ ] Fresh clone hoạt động.
- [ ] Repo history size mục tiêu dưới 100 MB hoặc budget đã duyệt.
- [ ] GitHub Pages deployment pass từ fresh clone.
- [ ] Không mất user-authored docs, source hoặc release tags cần giữ.

## Gate Phase 5

- [ ] Portfolio repo không còn là nơi lưu binary distribution chính.
- [ ] Playable demo vẫn là lợi thế nổi bật và load nhanh hơn baseline.
- [ ] Fresh clone, test và publish pass.

---

# Phase 6: Growth sau khi core quality đạt

Chỉ thực hiện sau Phase 1-5 hoặc khi có mục tiêu kinh doanh rõ.

## Backlog đề xuất

- [ ] Ba bài kỹ thuật có proof: Unity WebGL optimization, Telegram Mini Game delivery, scalable gameplay/data architecture.
- [ ] Bản `/vi/` nếu tập trung thị trường Việt Nam.
- [ ] Cal.com hoặc scheduling tool thật.
- [ ] Testimonial có tên, vai trò, công ty và permission.
- [ ] Search Console và privacy-respecting analytics.
- [ ] Monthly link checker và Lighthouse monitor.

Không bật blog chỉ để có menu. Chỉ publish khi có ít nhất ba bài chất lượng và owner có lịch duy trì.

---

## 6. Definition of Done toàn dự án

### Functional

- [ ] 22 project records được quản lý từ một nguồn.
- [ ] 6 flagship case studies có route riêng và evidence hoạt động.
- [ ] Mọi playable CTA mở đúng game.
- [ ] Main và ba backup routes render đúng.
- [ ] Contact, CV, Telegram, GitHub và store links hoạt động.

### Performance

- [ ] Homepage không request project details, videos, `.wasm` hoặc `.data` trước interaction.
- [ ] Initial payload dưới **3 MB** trên production target.
- [ ] Mobile Lighthouse Performance tối thiểu **85**; desktop tối thiểu **90**.
- [ ] LCP target dưới **2.5 giây**, CLS dưới **0.1**.
- [ ] Playable builds có documented download budgets.
- [ ] Target Performance/LCP được đánh dấu **conditional** nếu site vẫn ở GitHub Pages. Gate tuyệt đối áp dụng sau D7 khi hosting/CDN headers được kiểm soát; trước đó dùng median của ba run và ghi rõ giới hạn cache header.

### UX/conversion

- [ ] Hero fit first viewport ở desktop/mobile.
- [ ] Một primary CTA intent.
- [ ] Nav không overlap content và touch targets đạt tối thiểu 44x44px.
- [ ] Chatbot không che CTA/project cards.
- [ ] Recruiter thấy role, proof và contact path trong 30 giây.

### SEO/accessibility

- [ ] SEO và Accessibility Lighthouse tối thiểu **95**.
- [ ] Lighthouse Best Practices tối thiểu **90**.
- [ ] Canonical, OG, Twitter, robots, sitemap và custom 404 hoàn chỉnh.
- [ ] Main, backups và flagship routes pass HTML validation.
- [ ] Keyboard-only và reduced-motion flows pass.

### Engineering

- [ ] `npm test` pass và có regression coverage thực.
- [ ] CI quality workflow pass.
- [ ] Generated data deterministic.
- [ ] `git diff --check` pass.
- [ ] Không có secrets hoặc private infrastructure credentials trong repo.

### Repository

- [ ] Binary builds không còn được cập nhật trong portfolio repo.
- [ ] Tracked/published set tối đa **900 MiB** từ Emergency Phase và tiếp tục giảm sau migration.
- [ ] Fresh clone có kích thước và thời gian hợp lý theo budget đã duyệt.
- [ ] History rewrite, nếu làm, có backup và approval riêng.

---

## 7. Verification commands

Chạy từ repository root bằng Git Bash trên Windows.

Đo tracked/published candidate set trước và sau Emergency Phase:

```bash
python - <<'PY'
import subprocess
from pathlib import Path

tracked = subprocess.check_output(['git', 'ls-files', '-z']).split(b'\0')
files = [Path(value.decode('utf-8')) for value in tracked if value]
total = sum(path.stat().st_size for path in files)
print(f'tracked files: {len(files)}')
print(f'tracked bytes: {total}')
print(f'tracked MiB: {total / 1024 / 1024:.1f}')
PY
```

Gate: tracked MiB phải nhỏ hơn hoặc bằng 900 trước Phase 0.

```bash
npm run generate:portfolio
npm run validate:portfolio
npm run validate:links
npm run test:smoke
npm test
npx --yes html-validate index.html \
  backup/recruiter-clean/index.html \
  backup/dev-console/index.html \
  backup/game-studio/index.html
python "C:/Users/admin/.hermes/skills/software-development/github-pages-static-sites/scripts/audit_static_page.py" index.html
git diff --check
git status --short
```

HTTP/visual verification:

```bash
python -m http.server 8765 --bind 127.0.0.1
```

Kiểm tra:

- `http://127.0.0.1:8765/index.html`
- `http://127.0.0.1:8765/index.html#portfolio`
- `http://127.0.0.1:8765/backup/recruiter-clean/index.html`
- `http://127.0.0.1:8765/backup/dev-console/index.html`
- `http://127.0.0.1:8765/backup/game-studio/index.html`
- Sáu standalone flagship routes
- Sáu playable URLs

Network assertions:

- Không có `.wasm`, `.data`, detail HTML hoặc project video trước click.
- Mọi image có non-zero natural dimensions sau khi vào viewport.
- `document.documentElement.scrollWidth === document.documentElement.clientWidth` ở 390px và 1440px.

---

## 8. Trình tự triển khai đề xuất

| Thứ tự | Phase | Kết quả chính | Mức rủi ro |
|---:|---|---|---|
| 1 | Emergency E0-E2 | Published set tối đa 900 MiB, source inventory và rollback map | Cao, critical path |
| 2 | Phase 0 | Claim và data decisions được khóa | Thấp |
| 3 | Phase 1 | Cắt initial payload, sửa broken routes/mobile và Worker abuse | Trung bình |
| 4 | Phase 2 | Portfolio dễ scan, proof và CTA rõ | Trung bình |
| 5 | Phase 3 | SEO, a11y, Best Practices, project routes và CV PDF | Thấp-Trung bình |
| 6 | Phase 4 | Single source of truth và CI | Trung bình |
| 7 | Phase 5.1-5.4 | Build delivery dài hạn và repo cleanup an toàn | Cao |
| 8 | Phase 5.5 | Rewrite Git history | Rất cao, approval riêng |
| 9 | Phase 6 | Growth/SEO content | Theo nhu cầu |

### Milestone score kỳ vọng

Điểm chỉ là chỉ báo, acceptance criteria mới là gate chính.

- Sau Emergency + Phase 1: khoảng **78-82** và không còn trạng thái vượt giới hạn published site. Điểm này không được công bố nếu Emergency gate chưa pass.
- Sau Phase 2-3: khoảng **85-89**
- Sau Phase 4-5: khoảng **90+**

---

## 9. Review sign-off

### Duyệt scope

- [ ] Duyệt Emergency Phase E0-E2
- [ ] Duyệt toàn bộ Phase 0-4
- [ ] Duyệt migration build Phase 5.1-5.4
- [ ] Chưa duyệt rewrite history Phase 5.5
- [ ] Duyệt backlog Phase 6

### Yêu cầu chỉnh trước khi triển khai

```text
Ghi chú của chủ sở hữu:



```

### Implementation starting point đề xuất

Sau khi review, bắt đầu bằng **Emergency Phase**, sau đó mới tới **Phase 0 + Phase 1**. Không redesign toàn trang và không rewrite history trong lượt đầu. Deliverable đầu tiên phải chứng minh:

1. Tracked/published candidate set tối đa 900 MiB và Pages deploy pass.
2. Source availability của từng playable build đã được phân loại.
3. Homepage không tải 22 detail fragments và media nặng.
4. Sandwich Please và toàn bộ project links đúng.
5. Mobile nav/overlay không che nội dung.
6. Worker side-effect routes có abuse controls được verify.
7. `npm test` pass với link/runtime smoke checks.
8. Lighthouse và payload cải thiện bằng số đo thực tế.
