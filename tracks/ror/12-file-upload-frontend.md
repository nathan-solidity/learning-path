---
level: "rails-application"
order: 12
title: "Upload file & Frontend tích hợp"
est: "6-8 giờ"
checklist:
  - "Gắn được has_one_attached/has_many_attached và upload ảnh qua form"
  - "Hiển thị được ảnh đã upload và tạo variant (resize) để load nhẹ"
  - "Giải thích được Turbo Drive/Frames/Streams khác nhau ở đâu"
  - "Viết được một Stimulus controller đơn giản gắn vào DOM"
  - "Style form/nút bằng TailwindCSS hoặc Bootstrap và hiện flash message"
related:
  - "skill:nta-frontend-review"
  - "skill:nta-code-review"
  - "glossary:api"
---

## Vì sao gộp upload + frontend

App thật cần **cho user tải file** (avatar, ảnh sản phẩm) và **giao diện phản hồi nhanh**
mà không phải viết SPA riêng. Rails 7 giải quyết cả hai theo hướng "tối thiểu JS":
ActiveStorage cho file, Hotwire cho tương tác.

## ActiveStorage — upload file chuẩn của Rails

```bash
rails active_storage:install    # tạo bảng lưu metadata file
rails db:migrate
```

```ruby
class User < ApplicationRecord
  has_one_attached :avatar             # 1 file
end

class Product < ApplicationRecord
  has_many_attached :images            # nhiều file
end
```

Form upload — chỉ cần `file_field`:

```erb
<%= form_with model: @user do |f| %>
  <%= f.file_field :avatar %>
  <%= f.submit "Lưu" %>
<% end %>
```

Controller nhớ permit param file:

```ruby
def user_params
  params.require(:user).permit(:name, :avatar)   # :avatar cho 1 file
  # params.require(:product).permit(images: []) cho nhiều file
end
```

Hiển thị ảnh và **variant** (resize để load nhẹ, tránh trả ảnh gốc 5MB):

```erb
<% if @user.avatar.attached? %>
  <%= image_tag @user.avatar.variant(resize_to_limit: [200, 200]) %>
<% end %>
```

> Variant cần gem xử lý ảnh (`image_processing` + libvips hoặc ImageMagick trên máy).
> Production nên lưu file lên S3/GCS, không lưu đĩa server — cấu hình trong
> `config/storage.yml`.

**Shrine / CarrierWave** là lựa chọn thay thế: linh hoạt hơn (nhiều bước xử lý, validate
kích thước/định dạng chi tiết) nhưng phải cấu hình nhiều hơn. Với đa số app, ActiveStorage
đủ dùng và không thêm dependency.


![Luồng upload qua ActiveStorage và sinh variant khi hiển thị ảnh](/images/ror-upload-flow.png)

## Hotwire — tương tác không cần viết SPA

Hotwire gồm **Turbo** (HTML qua dây, gần như 0 JS) và **Stimulus** (JS nhỏ gắn vào HTML).

| Thành phần | Làm gì | Khi dùng |
|-----------|--------|----------|
| **Turbo Drive** | Chặn click link/submit, thay `<body>` bằng AJAX | Bật sẵn — điều hướng nhanh như SPA |
| **Turbo Frames** | Cập nhật **một vùng** độc lập trên trang | Sửa inline, tab, lazy-load một khối |
| **Turbo Streams** | Server đẩy nhiều mảnh HTML (append/replace/remove) | Thêm comment mới không reload, realtime |

Ví dụ Turbo Frame — nút "Sửa" chỉ đổi một khối:

```erb
<%= turbo_frame_tag @post do %>
  <h2><%= @post.title %></h2>
  <%= link_to "Sửa", edit_post_path(@post) %>
<% end %>
```

Turbo Stream sau khi tạo comment — thêm vào list, không reload cả trang:

```erb
<%# app/views/comments/create.turbo_stream.erb %>
<%= turbo_stream.append "comments", partial: "comments/comment",
                                     locals: { comment: @comment } %>
```

## Stimulus — chút JS khi cần

Turbo lo điều hướng; việc như "hiện/ẩn menu", "đếm ký tự còn lại" thì dùng Stimulus:

```javascript
// app/javascript/controllers/toggle_controller.js
import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["panel"]
  toggle() { this.panelTarget.classList.toggle("hidden") }
}
```

```erb
<div data-controller="toggle">
  <button data-action="click->toggle#toggle">Mở/đóng</button>
  <div data-toggle-target="panel" class="hidden">Nội dung ẩn</div>
</div>
```

`data-controller` gắn controller vào DOM, `data-action` map sự kiện → method,
`data-*-target` trỏ tới phần tử. Không cần jQuery.

## Style — Tailwind hoặc Bootstrap

```bash
rails new myapp --css tailwind      # tạo mới đã tích hợp Tailwind
# hoặc thêm sau:
./bin/bundle add tailwindcss-rails && rails tailwindcss:install
```

Flash message + style — hiện thông báo sau redirect:

```erb
<%# layout %>
<% flash.each do |type, msg| %>
  <div class="<%= type == "notice" ? "bg-green-100" : "bg-red-100" %> p-3 rounded">
    <%= msg %>
  </div>
<% end %>
```

Hiệu ứng động đơn giản dùng luôn class Tailwind (`transition`, `animate-pulse`) hoặc thêm
`data-controller` Stimulus toggle class — không cần thư viện animation nặng.

## Cạm bẫy hay gặp

- Quên permit param file → upload "thành công" nhưng file không được lưu.
- Trả ảnh gốc thay vì variant → trang nặng, chậm; luôn resize khi hiển thị.
- Lưu file lên đĩa server ở production → deploy mới là mất hết file cũ; dùng S3/GCS.
- Turbo Frame và Turbo Stream lẫn lộn: Frame = một vùng tự cập nhật, Stream = server đẩy
  nhiều thay đổi. Dùng sai → không thấy cập nhật hoặc thay nhầm chỗ.
- Viết JS rời rạc trong `<script>` thay vì Stimulus → Turbo Drive điều hướng xong, JS
  không chạy lại (vì `<body>` bị thay).

## Ghi nhớ

Rails 7 khuyến khích "server render HTML, thêm ít JS" — trước khi kéo React vào, thử
Hotwire; đa số nhu cầu (inline edit, realtime list, toggle) làm được mà giữ code trong
Rails. Skill `/nta-frontend-review` rà a11y, performance và style cho phần view.
