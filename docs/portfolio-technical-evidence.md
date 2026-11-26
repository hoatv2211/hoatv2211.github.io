# Hồ sơ bằng chứng kỹ thuật và câu hỏi xác nhận

## Phạm vi và quy tắc biên tập

Tài liệu làm việc để chuẩn bị trao đổi kỹ thuật; không phải lịch sử sự cố đã xảy ra. Các mục workshop bên dưới là **giả thuyết cần xác nhận, KHÔNG phải kinh nghiệm lịch sử và KHÔNG phải tuyên bố công khai trong portfolio**. Không chuyển chúng thành thành tích hoặc `detail.engineering` nếu chưa có xác nhận và bằng chứng phù hợp.

Người dùng đã xác nhận trách nhiệm phát triển chính trên các dự án, cùng phạm vi freelance full-stack client/server, kiến trúc hệ thống, thiết kế automation, AI skills và agent workflows cho công ty và dự án lớn. Điều này không đồng nghĩa làm một mình, tác giả duy nhất, hoặc sở hữu toàn bộ backend của từng game. Mốc 8+ năm chỉ áp dụng cho ngành game; không suy diễn số năm backend/AI. Giữ nguyên chức danh chính thức.

`portfolio.json` là nguồn dữ liệu chuẩn. Năm phần engineering diễn giải thách thức từ phạm vi tính năng đã ghi nhận, phần triển khai, kết quả định tính và giới hạn bằng chứng; không dựng incident, số liệu trước/sau, phương án từng bị loại hoặc quy trình kiểm chứng chưa có nguồn.

## Danh mục nguồn và giới hạn

### ProxyAPI.MAD

- [README tại commit e16608567f4439c8ff9b84b6abc3362176875a8a](https://raw.githubusercontent.com/mad-agentic/ProxyAPI.MAD/e16608567f4439c8ff9b84b6abc3362176875a8a/README.md), đã đọc để đối chiếu: `frontend/` là React + Vite + TypeScript; `proxyapi_core/` là backend Go gồm proxy API và management API. Mục Reference ghi rõ dự án adapted from CLIProxyAPI.
- [Repository](https://github.com/mad-agentic/ProxyAPI.MAD), [upstream CLIProxyAPI](https://github.com/router-for-me/CLIProxyAPI), [website được liên kết](https://mad-agentic.github.io/ProxyAPI.MAD).
- `portfolio.json`: ảnh dashboard, API keys, providers, chat, logs và settings; trách nhiệm tích hợp/adaptation full-stack độc lập.
- Source và README cho phép kiểm tra cấu trúc, cấu hình và credit upstream; không tự chứng minh ai viết từng module. Registry/stream transforms có thể được kế thừa; chưa xác định tác giả, không nhận là tự viết. Chưa kiểm thử request thật, streaming thật hoặc độ tin cậy production trong lần chỉnh nội dung này.

### Crypto Quest

- `portfolio.json`, dự án `cryptoquest`: dynamic quest creation/completion và backend actor-condition integration; beast API/UI; equipment, skills, consumables, rarity, inventory, localization; account deletion, cutscene, ScriptableObject Browser; live-ops và tối ưu.
- [Website được liên kết](https://crypto-quest.org/) và [demo được liên kết](https://games.indigames.link/crypto-quest/stg/); các ảnh quest/NPC/equipment/tooling trong canonical data là điểm để reviewer xem giao diện, không phải bằng chứng server internals.
- Team 14 người gồm 9 frontend, 3 backend, 2 testers. Primary developer không có nghĩa sở hữu toàn bộ backend. Chưa kiểm thử runtime hoặc xác nhận khả dụng hiện tại của demo.

### MU Loren Mobile

- `portfolio.json`, `detailKey: muloren`: quests, class mechanics, monster spawning, events, battle interactions, UI và mobile 3D profiling/optimization trong nhóm cộng tác.
- [Trang sản phẩm](https://lucdia.adnxgames.vn/trang-chu), [Google Play](https://play.google.com/store/apps/details?id=com.mobi.ldlorencia), [trailer](https://www.youtube.com/watch?v=UTqN9xl2pBM) và ảnh đã liên kết trong canonical data.
- Các liên kết là điểm xem sản phẩm, không tự chứng minh tác giả hoặc hiệu năng. Không có căn cứ để thêm pooling, LOD, network authority hay số FPS cải thiện.

### Nekoverse

- `portfolio.json`: Unity battles, elemental skills, NFT/staking integration, resource farming/crafting, mobile profiling và optimization; trách nhiệm chính trong team sản phẩm GameFi đã được tài trợ.
- [Trang sản phẩm](https://gam3s.gg/nekoverse/), [trailer](https://www.youtube.com/watch?v=4FiWVHmdfig), ảnh trong canonical data.
- Audit trước đó ghi nhận mô tả blog turn-based xung đột với copy real-time trong portfolio. Chưa chốt phiên bản hoặc timing model; dùng từ trung tính battles/elemental skills và cần người dùng xác nhận. Không nhận công lao gây ra việc gọi vốn, không suy diễn backend hoặc blockchain correctness từ footage.

### Sandwich Please!

- `portfolio.json`, `detailKey: sandwich`: sandwich assembly, order handling, customer service, gameplay UI/feedback, device optimization và analytics monitoring.
- [App Store](https://apps.apple.com/us/app/sandwich-please/id6475763350), [Google Play](https://play.google.com/store/apps/details?id=com.gb.sandwichidle.burgerplease.pizza.coffee), [gameplay video](https://www.youtube.com/watch?v=LoYwMs8mFsc) và ảnh canonical.
- Video/ảnh là điểm xem vòng lặp phục vụ và UI. Không có báo cáo analytics hoặc profiler trước/sau để xác nhận retention, doanh thu, FPS hay mức giảm CPU/GC. Không thêm kết quả đo lường.

Các nguồn game ở trên được kiểm kê từ canonical data và ngữ cảnh audit; lần chỉnh dữ liệu này không tuyên bố đã phát lại toàn bộ footage, truy cập thành công mọi link hoặc xác minh độc lập quyền tác giả.

## Câu hỏi kỹ thuật chưa được xác nhận

- Proxy: commit/module nào là phần sửa riêng? Upstream baseline nào? Management API contract và cấu hình triển khai nào đã tự thay đổi? Có test cho streaming/cancel/error không, hay hiện chỉ là khả năng có sẵn của upstream?
- Crypto Quest: actor-condition schema và ranh giới client/server cụ thể là gì? Có gặp stale state, response đảo thứ tự hoặc hoàn thành quest lặp không? Ai triển khai từng endpoint? Có đoạn source/diagram được phép chia sẻ cho account/cutscene/ScriptableObject tools không?
- MU: hotspot thực tế ở cảnh nào, thiết bị/build nào? Dữ liệu profiler nào được phép công khai? Đã dùng kỹ thuật gì và đánh đổi nào thực sự xảy ra? Không mặc định pooling/LOD/network authority.
- Neko: phiên bản đã làm dùng turn-based, real-time hay nhiều mode? Những phần nào trong footage tương ứng với thời gian và đóng góp của người dùng? Ranh giới Unity integration với smart contract/backend do ai đảm nhiệm?
- Sandwich: analytics provider, event names và câu hỏi sản phẩm nào đã triển khai? Có baseline, device matrix và profiler capture không? Có incident cụ thể kèm triệu chứng, nguyên nhân và cách xác nhận hay chỉ là công việc tối ưu thường kỳ?

## Workshop giải pháp giả định — KHÔNG phải kinh nghiệm lịch sử

### 1. Quest stale state — giả thuyết cần xác nhận

**Tình huống giả định, không khẳng định Crypto Quest từng gặp:** khi đổi scene hoặc reconnect, response cũ cập nhật UI sau response mới.

- Đề xuất thử nghiệm: ghi request/quest ID, revision và thời điểm; mô phỏng latency, response đảo thứ tự, reconnect và thao tác hoàn thành lặp.
- Phương án để thảo luận: versioned snapshot, bỏ response thuộc session cũ, xác định server làm nguồn trạng thái cuối và cơ chế idempotency ở endpoint nếu team backend đồng ý.
- Đánh đổi cần khảo sát: độ phức tạp đồng bộ, tương thích schema và chi phí request; không tự gắn những lựa chọn này vào hệ thống lịch sử.
- Bằng chứng cần có trước khi viết case thật: xác nhận incident, log đã ẩn thông tin nhạy cảm, ranh giới trách nhiệm, diff được phép chia sẻ và test tái hiện/hồi quy thực sự chạy.

### 2. Mobile profiling — giả thuyết cần xác nhận

**Bài tập giả định, không phải sự cố MU/Neko/Sandwich đã được xác nhận:** frame-time tăng trong cảnh nhiều tương tác hoặc UI cập nhật.

- Đề xuất lấy development build trên thiết bị đại diện, scene và thao tác lặp cố định; tách CPU/GPU, GC allocations, rendering và loading trước khi chọn giải pháp.
- Chỉ cân nhắc giảm cập nhật UI, thay đổi vòng đời object hoặc ngân sách hiệu ứng nếu capture chỉ đúng bottleneck; không kết luận đã dùng pooling hay LOD.
- Giữ cùng build setting, thiết bị và khoảng ghi khi so sánh; kiểm tra gameplay/visual regression. Chưa có kết quả đo, không đặt mục tiêu thành thành tích đã đạt.

### 3. Provider streaming — giả thuyết cần xác nhận

**Bài tập thiết kế giả định, không phải incident ProxyAPI.MAD đã xảy ra:** stream bị ngắt, provider trả lỗi giữa chừng hoặc người dùng hủy request.

- Đề xuất đọc contract và phần xử lý kế thừa từ CLIProxyAPI trước; phân biệt code upstream với adaptation.
- Có thể dựng provider test fixture cho fragmented chunks, timeout, cancel và lỗi giữa stream; kiểm tra đóng kết nối, bảo toàn ranh giới message và log đã che secret.
- Thảo luận retry trước khi có output so với tránh retry sau khi đã gửi token, tránh trả nội dung lặp và tránh vô tình log API key. Đây là đề xuất, chưa xác nhận đã triển khai.
- Chỉ viết thành kinh nghiệm thực tế khi có xác nhận đóng góp, commit cụ thể và kết quả chạy test thật; không nhận tác giả registry hoặc stream transforms chỉ vì chúng có trong repository.
