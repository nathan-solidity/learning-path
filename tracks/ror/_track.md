---
track: "ror"
role: "dev-ror"
group: "dev"
group_title: "Developer"
group_icon: "💻"
group_summary: "Lộ trình cho lập trình viên — chọn ngôn ngữ/framework bạn muốn học chuyên sâu."
variant: "Ruby on Rails"
variant_desc: "Từ Ruby căn bản đến Rails developer thực chiến: ngôn ngữ, nền tảng, ứng dụng, kiến trúc & API, vận hành."
title: "Ruby on Rails Developer"
icon: "💎"
summary: "Lộ trình từ Ruby căn bản đến Rails developer thực chiến: ngôn ngữ Ruby, nền tảng Rails (MVC, ActiveRecord), ứng dụng thực tế (auth, upload, testing), kiến trúc & API (Service Object, REST/GraphQL), và vận hành (deploy, performance, security)."
levels:
  - key: "ruby"
    title: "Ruby ngôn ngữ"
    desc: "Cú pháp, kiểu dữ liệu, OOP, block/proc/lambda, exception, I/O — nền tảng phải chắc trước khi vào Rails."
  - key: "rails-foundation"
    title: "Rails nền tảng"
    desc: "Môi trường (rbenv/Bundler), MVC, routing, controller, ActiveRecord CRUD, view/form, migration — đủ để làm dự án nhỏ đầu tiên."
  - key: "rails-application"
    title: "Rails ứng dụng"
    desc: "ActiveRecord nâng cao, routing/controller nâng cao, xác thực & phân quyền, upload file, frontend (Hotwire), testing (RSpec), background job."
  - key: "architecture-api"
    title: "Kiến trúc & API"
    desc: "Service/Form Object, Decorator/Presenter, REST API (Jbuilder/serializer), GraphQL, xác thực API (OAuth2/JWT)."
  - key: "operations-advanced"
    title: "Vận hành & Ruby nâng cao"
    desc: "Testing nâng cao (CI/CD, coverage, E2E), hiệu năng & bảo mật, Docker & deploy, Ractor/Fiber, RBS, viết gem, debug nâng cao."
---

## Về lộ trình này

Lộ trình dành cho người học **Ruby on Rails** từ chưa biết Ruby đến làm được ứng dụng
production. Thiết kế theo hướng **học đến đâu code được đến đó**: mỗi cấp độ đều có bài
thực hành/dự án nhỏ, không chỉ đọc lý thuyết.

Học tuần tự **Ruby ngôn ngữ → Rails nền tảng → Rails ứng dụng → Kiến trúc & API →
Vận hành & nâng cao**. Mỗi bài có checklist tự đánh giá — tick khi bạn tự tin đã nắm và
**code được**, không chỉ hiểu lý thuyết. Tiến độ tính theo số item đã tick.

### Vì sao học theo thứ tự này

Rails là framework "convention over configuration" — nó tự làm rất nhiều thứ ngầm. Nếu
nhảy thẳng vào Rails mà chưa chắc Ruby, bạn sẽ **copy code mà không hiểu vì sao chạy**.
Nắm Ruby trước (block, method, OOP) giúp đọc được source Rails và tự debug khi lỗi.

| Cấp độ | Bạn làm được gì sau khi xong |
|--------|------------------------------|
| Ruby ngôn ngữ | Viết script Ruby, hiểu OOP và block — nền để đọc code Rails |
| Rails nền tảng | Dựng được CRUD app (blog, to-do) chạy được, có form và validation |
| Rails ứng dụng | Thêm đăng nhập, phân quyền, upload ảnh, viết test, chạy job nền |
| Kiến trúc & API | Tổ chức code sạch (service object), build REST/GraphQL API |
| Vận hành & nâng cao | Đóng Docker, deploy, tối ưu performance & bảo mật, viết gem |

### Môi trường & tài nguyên

- Ruby cài bằng **rbenv** hoặc **RVM**; gem quản lý bằng **Bundler**.
- Editor: **VS Code** (+ Ruby LSP) hoặc **RubyMine**.
- Tài liệu chính thức: [Rails Guides](https://guides.rubyonrails.org), [Ruby docs](https://ruby-doc.org).
- Mỗi bài có ví dụ code chạy được — nên gõ lại và chạy thử, đừng chỉ đọc.

Nội dung liên kết với `term-glossary` (tra thuật ngữ) và các skill dev (`/nta-code-review`,
`/nta-test-gen`, `/nta-refactor`...) — gặp thuật ngữ lạ thì mở glossary, muốn tự động hóa
review/test thì dùng skill tương ứng.
