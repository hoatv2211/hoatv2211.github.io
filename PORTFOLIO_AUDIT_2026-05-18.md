# Portfolio Audit & Improvement Plan (2026-05-18)

## 1) Tổng quan nhanh

Dựa trên cấu trúc dự án hiện tại (`index.html`, dữ liệu profile/project trong `portfolio.json`, hệ nhiều dự án WebGL trong thư mục `Games/`), portfolio này đã có nền tảng tốt cho một Senior Unity Developer.

**Điểm tổng thể hiện tại: 7.8/10**.

Lý do chưa lên 9+: thông tin rất mạnh nhưng còn thiếu phần “proof of impact” theo chuẩn tuyển dụng quốc tế (metrics chuẩn hóa, case study theo framework rõ ràng, tối ưu conversion cho recruiter/client, và tối ưu SEO/hiệu năng sâu hơn).

---

## 2) Chấm điểm chi tiết (thang 10)

### A. Nội dung chuyên môn: **8.8/10**
**Điểm mạnh**
- Kinh nghiệm dài (7+ năm), đúng positioning Senior Unity/GameFi.
- Có nhiều project thật, đa thể loại, đa nền tảng.
- Mô tả skill và stack rộng (Unity/C#/WebGL/Firebase/Ads/Web3).

**Thiếu**
- Một số claim còn “broad” chưa có benchmark kỹ thuật cụ thể (FPS, crash-free rate, retention uplift, CPI/ROAS impact, build size reduction).
- Cần thêm “before/after” cho các phần optimization.

### B. Trình bày & UX portfolio: **7.5/10**
**Điểm mạnh**
- Bố cục trực quan, có video hero, có project gallery.
- Dễ hiểu đối với người xem phổ thông.

**Thiếu**
- CTA chưa đủ mạnh theo funnel tuyển dụng: thiếu nút “Hire me / Book a call / Download CV” nổi bật, sticky.
- Nội dung About còn dài, lặp ý; cần cô đọng theo business outcome.
- Chưa có trang Case Study riêng cho project flagship.

### C. Độ tin cậy (trust): **7.3/10**
**Điểm mạnh**
- Có social links, lịch sử công việc, danh sách project.

**Thiếu**
- Thiếu testimonials/endorsement từ client/team lead.
- Thiếu “proof pack”: ảnh store listing, analytics snapshot (ẩn dữ liệu nhạy cảm), release notes, vai trò cụ thể theo team size.

### D. Kỹ thuật web & hiệu năng: **7.2/10**
**Điểm mạnh**
- Đã tách data/script, có preload CSS, có manifest.

**Thiếu**
- Nhiều asset WebGL nặng trong repo => có rủi ro tải chậm.
- Chưa thấy chiến lược rõ cho lazy-load media nặng theo viewport.
- Chưa có baseline Lighthouse/Core Web Vitals được công bố.

### E. SEO & discoverability: **7.9/10**
**Điểm mạnh**
- Có meta cơ bản, OG tags.

**Thiếu**
- Cần structured data (JSON-LD Person/CreativeWork/Project).
- Cần chiến lược keyword theo intent tuyển dụng (Unity contractor, GameFi developer, WebGL optimization, etc.).
- Cần thêm trang/section tiếng Anh chuẩn “hire-ready” (nếu target global).

---

## 3) Đánh giá theo góc nhìn recruiter/client

Nếu recruiter chỉ xem 90 giây đầu:
- **Ấn tượng kỹ thuật**: tốt.
- **Khả năng chốt interview**: khá, nhưng chưa tối đa do thiếu evidence định lượng và CTA rõ.
- **Khả năng chốt freelance lead**: khá tốt, cần tăng trust assets và quy trình làm việc minh bạch.

=> Portfolio hiện tại ở mức **“đáng phỏng vấn”**, chưa đạt mức **“phải liên hệ ngay”**.

---

## 4) Những cải thiện quan trọng nhất (ưu tiên cao)

1. **Tạo 3 case study flagship theo format STAR/CAR**
   - Problem → Action → Technical Solution → Metrics → Outcome.
   - Mỗi case study có 5–8 ảnh/video ngắn + số liệu định lượng.

2. **Chuẩn hóa số liệu thành KPI rõ ràng**
   - Ví dụ: D1 retention, ARPDAU, crash rate, ANR, FPS mid-range Android, loading time, build size.
   - Mục tiêu: mỗi project có ít nhất 3 chỉ số đo được.

3. **Tối ưu funnel chuyển đổi**
   - Sticky CTA: “Hire me”, “Schedule call”, “Download CV (PDF 1 trang)”.
   - Thêm section “How I work” (timeline 4 bước + SLA phản hồi).

4. **Trust layer**
   - Thêm 3–5 testimonials thật (tên/role/công ty).
   - Thêm “Selected Results” dạng card (impact-focused).

5. **Hiệu năng front-end cho portfolio**
   - Lazy-load ảnh/video; trì hoãn script không critical.
   - Đặt mục tiêu Lighthouse mobile >= 85.

---

## 5) Kế hoạch sửa đổi (roadmap 6 tuần)

## Tuần 1 — Foundation & Conversion
- Viết lại Hero + About theo outcome-first (ngắn gọn, không lặp).
- Thêm CTA nổi bật + link đặt lịch + CV tải nhanh.
- Tạo section “Selected Results” (5 bullet có số liệu).

**Deliverable:** Bản landing mới tăng khả năng chuyển đổi recruiter/client.

## Tuần 2 — Case Study Pack v1
- Chọn 3 dự án tiêu biểu (casual, mid-core, GameFi/Web3).
- Viết 3 case study theo template thống nhất.
- Chuẩn hóa ảnh/video minh họa, thêm caption “vai trò của tôi”.

**Deliverable:** 3 case study có thể gửi trực tiếp khi apply job/freelance.

## Tuần 3 — Trust & Authority
- Thu thập testimonial + permission hiển thị.
- Bổ sung timeline kinh nghiệm dạng rõ ràng (role, scope, team size, stack).
- Thêm “Process” + “Engagement model” (part-time/full-time/contract).

**Deliverable:** Tăng độ tin cậy và khả năng chốt call.

## Tuần 4 — Performance & SEO
- Audit Lighthouse (mobile/desktop), tối ưu ảnh/video/script.
- Thêm schema JSON-LD (Person, WebSite, CreativeWork/SoftwareApplication).
- Tối ưu title/description theo nhóm keyword mục tiêu.

**Deliverable:** Điểm hiệu năng + SEO cải thiện có số đo trước/sau.

## Tuần 5 — Technical Credibility Upgrade
- Mỗi project thêm “Technical challenges solved”.
- Đưa snippets kiến trúc (system design nhẹ, không lộ IP).
- Thêm mục “Postmortem & Lessons learned”.

**Deliverable:** Portfolio thể hiện tư duy senior/lead rõ hơn.

## Tuần 6 — Packaging & Distribution
- Tạo CV 1 trang + CV kỹ thuật 2 trang + project sheet PDF.
- Tạo phiên bản rút gọn cho LinkedIn Featured và Upwork/Freelancer.
- Final QA đa thiết bị, cập nhật checklist maintain hàng tháng.

**Deliverable:** Bộ hồ sơ đồng bộ đa kênh, sẵn sàng scale outreach.

---

## 6) KPI mục tiêu sau khi cải thiện

- Time-on-page trung bình tăng >= 25%.
- CTR nút liên hệ >= 2x so với hiện tại.
- Tỷ lệ phản hồi recruiter/client từ portfolio tăng >= 30%.
- Lighthouse Mobile: Performance >= 85, SEO >= 90, Best Practices >= 90.

---

## 7) Checklist triển khai nhanh (có thể làm ngay)

- [ ] Rút gọn About xuống còn 120–180 từ, tập trung value proposition.
- [ ] Thêm 1 CTA chính và 1 CTA phụ ở vùng above-the-fold.
- [ ] Viết 1 case study mẫu hoàn chỉnh trước để làm template.
- [ ] Chuẩn bị bảng metrics (CSV/Notion) cho toàn bộ project.
- [ ] Chụp/thu thập bằng chứng release-performance hợp lệ.
- [ ] Chạy Lighthouse baseline và lưu kết quả trước khi tối ưu.

---

## 8) Kết luận

Với nền tảng hiện tại, portfolio đã ở mức **khá mạnh** cho vai trò Unity Senior/Freelance Game Developer. Nếu thực hiện đúng roadmap trên, điểm tổng thể có thể tăng từ **7.8/10 lên 9.0–9.3/10** trong 4–8 tuần, đặc biệt ở khả năng chốt interview và khách hàng chất lượng cao.
