---
level: "rails-foundation"
order: 8
title: "View, ERB & Form + dự án nhỏ"
est: "5-6 giờ"
checklist:
  - "Viết được ERB dùng `<%= %>` (in ra) và `<% %>` (chỉ chạy) đúng chỗ"
  - "Tách được phần dùng chung ra partial và render lại bằng `render`"
  - "Dựng được form model-backed bằng `form_with model:` và hiển thị lỗi validation"
  - "Hiểu được khác nhau giữa `form_with model:` và `form_with url:` / `form_tag`"
  - "Ghép được một app CRUD hoàn chỉnh (Blog hoặc To-do) chạy từ `rails new` đến trình duyệt"
related:
  - "glossary:mvc"
---

## ERB — nhúng Ruby vào HTML

View mặc định của Rails là **ERB** (Embedded Ruby). Hai loại tag:

```erb
<%= @post.title %>        <%# = : chạy Ruby VÀ IN kết quả ra HTML %>
<% if @post.published? %> <%# không = : chỉ chạy Ruby, không in %>
  <span class="badge">Đã đăng</span>
<% end %>
```

```erb
<%# app/views/posts/index.html.erb %>
<h1>Bài viết</h1>
<%= link_to "Viết bài mới", new_post_path, class: "btn" %>

<ul>
  <% @posts.each do |post| %>
    <li>
      <%= link_to post.title, post %>       <%# post → post_path(post) %>
      <small><%= post.created_at.strftime("%d/%m/%Y") %></small>
    </li>
  <% end %>
</ul>
```

> Dùng `<%=` khi muốn **thấy** giá trị trên trang; dùng `<%` cho `if`/`each`/gán biến.
> Lẫn lộn hai cái là lỗi hiển thị phổ biến nhất của người mới.

## Layout, partial & helper

- **Layout** (`app/views/layouts/application.html.erb`) là khung chung; `<%= yield %>` là
  chỗ nội dung từng trang chèn vào.
- **Partial** là mảnh view dùng lại, tên bắt đầu bằng `_`.

```erb
<%# app/views/posts/_post.html.erb — partial cho 1 post %>
<article class="post">
  <h2><%= link_to post.title, post %></h2>
  <p><%= truncate(post.body, length: 100) %></p>
</article>
```

```erb
<%# Dùng lại partial %>
<%= render "post", post: @post %>          <%# render 1 partial %>
<%= render @posts %>                        <%# render partial _post cho từng phần tử %>
```

- **Helper** (`app/helpers/`) chứa hàm định dạng để view gọn:

```ruby
# app/helpers/posts_helper.rb
module PostsHelper
  def status_label(post)
    post.published? ? "Đã đăng" : "Nháp"
  end
end
```

## Form — form_with

`form_with` là cách chuẩn (Rails 5.1+). Truyền `model:` thì Rails tự đoán URL, method
(POST tạo mới / PATCH khi sửa) và tên field.

```erb
<%# app/views/posts/_form.html.erb — dùng chung cho new & edit %>
<%= form_with model: @post do |form| %>
  <%# Hiển thị lỗi validation nếu có %>
  <% if @post.errors.any? %>
    <div class="errors">
      <h3><%= pluralize(@post.errors.count, "lỗi") %> cần sửa:</h3>
      <ul>
        <% @post.errors.full_messages.each do |msg| %>
          <li><%= msg %></li>
        <% end %>
      </ul>
    </div>
  <% end %>

  <div>
    <%= form.label :title, "Tiêu đề" %>
    <%= form.text_field :title %>
  </div>
  <div>
    <%= form.label :body, "Nội dung" %>
    <%= form.text_area :body, rows: 8 %>
  </div>
  <div>
    <%= form.check_box :published %>
    <%= form.label :published, "Đăng ngay" %>
  </div>

  <%= form.submit %>
<% end %>
```

```erb
<%# new.html.erb và edit.html.erb chỉ cần: %>
<%= render "form" %>
```

| Cách | Khi nào dùng |
|------|--------------|
| `form_with model: @post` | Gắn với 1 record — Rails tự lo URL, method, prefix field (`post[title]`) |
| `form_with url: search_path, method: :get` | Form không gắn record (search, filter) |
| `form_tag` / `form_for` | Cú pháp cũ (trước 5.1) — gặp ở code cũ, dự án mới dùng `form_with` |

> Rails tự chèn **CSRF token** vào mọi form `form_with`. Đừng tắt `protect_from_forgery`
> để "cho tiện" — đó là lá chắn chống tấn công CSRF.

## Dự án nhỏ — Blog CRUD chạy được

Ghép mọi thứ 3 bài trước thành app hoàn chỉnh:

```bash
# 1. Tạo app
rails new blog --database=postgresql
cd blog
bin/rails db:create

# 2. Sinh scaffold nhanh (model + controller + view + route)  hoặc làm tay từng phần
bin/rails generate model Post title:string body:text published:boolean
bin/rails db:migrate
```

```ruby
# 3. Model — thêm validation (app/models/post.rb)
class Post < ApplicationRecord
  validates :title, presence: true, length: { minimum: 3 }
  validates :body,  presence: true
  scope :recent, -> { order(created_at: :desc) }
end
```

```ruby
# 4. Route (config/routes.rb)
Rails.application.routes.draw do
  root "posts#index"
  resources :posts
end
```

```ruby
# 5. Controller — dùng đúng bộ 7 action ở bài trước (app/controllers/posts_controller.rb)
#    index / show / new / create / edit / update / destroy
```

```bash
# 6. Tạo view: index / show / new / edit + _form.html.erb (như trên)
# 7. Seed vài bài mẫu rồi chạy
bin/rails db:seed
bin/rails server        # mở http://localhost:3000
```

**Biến thể To-do app**: đổi model thành `Task title:string done:boolean`, thêm checkbox
`done` trong form và nút toggle. Route thêm `resources :tasks`. Logic y hệt Blog.

> **Mẹo học nhanh**: `rails generate scaffold Post title:string body:text` sinh **toàn bộ**
> CRUD (model + controller + view + route) để bạn đọc code Rails "chuẩn". Nhưng nên làm
> tay ít nhất một lần để hiểu từng phần thay vì phụ thuộc scaffold.

## Cạm bẫy hay gặp

- Quên `<%=` (chỉ viết `<%`) khi muốn in → trang trắng chỗ đó, không báo lỗi.
- Sửa `config/routes.rb` nhưng dùng URL chuỗi tay trong view → 404 khi route đổi. Dùng
  path helper (`posts_path`, `edit_post_path(post)`).
- `render "form"` khi `@post` chưa được khởi tạo trong action → lỗi `nil`. Nhớ gán
  `@post = Post.new` ở action `new`.
- Partial đặt sai tên (thiếu dấu `_` ở file `_post.html.erb`) → Rails không tìm thấy.

## Ghi nhớ

View chỉ nên **trình bày**, không chứa logic nghiệp vụ nặng. Lặp lại HTML nhiều nơi →
tách partial. Logic định dạng → đưa vào helper. Giữ view mỏng giúp cả team đọc và sửa
giao diện mà không sợ vỡ nghiệp vụ. Xong bài này bạn đã có app CRUD đầu tiên chạy thật.
