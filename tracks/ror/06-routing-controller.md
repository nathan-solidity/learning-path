---
level: "rails-foundation"
order: 6
title: "Routes & Controller"
est: "4-5 giờ"
checklist:
  - "Khai báo được route bằng `resources` và hiểu 7 route RESTful nó sinh ra"
  - "Viết được route thủ công với get/post và đặt root path"
  - "Đọc được `params` và dùng Strong Parameters để lọc dữ liệu form an toàn"
  - "Phân biệt được khi nào dùng `render` và khi nào dùng `redirect_to`"
  - "Dùng được `before_action` để chạy code chung trước nhiều action"
  - "Hiển thị được flash message sau khi tạo/sửa/xóa thành công"
related:
  - "glossary:rest"
  - "skill:nta-code-review"
---

## Routes — bảng định tuyến

`config/routes.rb` ánh xạ **URL + HTTP method** sang **controller#action**. Rails khuyến
khích RESTful: một `resources` sinh ra đủ 7 route CRUD.

```ruby
# config/routes.rb
Rails.application.routes.draw do
  root "posts#index"          # trang chủ "/" → PostsController#index

  resources :posts            # sinh 7 route RESTful cho posts

  # Route thủ công khi cần action ngoài chuẩn CRUD
  get  "about", to: "pages#about"
  post "posts/:id/publish", to: "posts#publish", as: :publish_post
end
```

`resources :posts` sinh ra:

| HTTP | Path | Controller#Action | Mục đích |
|------|------|-------------------|----------|
| GET | /posts | posts#index | Danh sách |
| GET | /posts/new | posts#new | Form tạo mới |
| POST | /posts | posts#create | Lưu bản mới |
| GET | /posts/:id | posts#show | Xem chi tiết |
| GET | /posts/:id/edit | posts#edit | Form sửa |
| PATCH/PUT | /posts/:id | posts#update | Cập nhật |
| DELETE | /posts/:id | posts#destroy | Xóa |

```bash
bin/rails routes           # in toàn bộ bảng route + tên helper (posts_path, new_post_path...)
```

> Tên helper (vd `posts_path`, `edit_post_path(@post)`) do route sinh ra — **luôn dùng
> helper** thay vì viết URL chuỗi tay `"/posts"`. Đổi route sau này helper tự đúng.

## Controller — nhận request, điều phối

Mỗi action là một method public. Nó lấy dữ liệu qua Model, gán biến `@instance` cho View.

```ruby
# app/controllers/posts_controller.rb
class PostsController < ApplicationController
  before_action :set_post, only: %i[show edit update destroy]

  def index
    @posts = Post.order(created_at: :desc)   # View đọc @posts
  end

  def show; end                              # @post đã có sẵn từ before_action

  def new
    @post = Post.new                         # object rỗng cho form
  end

  def create
    @post = Post.new(post_params)
    if @post.save
      redirect_to @post, notice: "Đã tạo bài viết."   # thành công → chuyển trang + flash
    else
      render :new, status: :unprocessable_entity      # lỗi → render lại form (giữ dữ liệu)
    end
  end

  def edit; end

  def update
    if @post.update(post_params)
      redirect_to @post, notice: "Đã cập nhật."
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @post.destroy
    redirect_to posts_path, notice: "Đã xóa.", status: :see_other
  end

  private

  # Chạy trước các action cần 1 post cụ thể → tránh lặp Post.find
  def set_post
    @post = Post.find(params[:id])
  end

  # Strong Parameters — chỉ cho phép các field này, chặn mass-assignment
  def post_params
    params.require(:post).permit(:title, :body, :published)
  end
end
```

## params & Strong Parameters

`params` là hash chứa dữ liệu từ URL (`:id`), query string (`?q=...`) và body form.

```ruby
params[:id]                  # "42" — từ /posts/42
params[:post][:title]        # "Bài A" — từ form
```

**Strong Parameters** bắt buộc bạn khai báo rõ field nào được phép nhận. Nếu không lọc,
user có thể gửi thêm field ẩn (vd `admin=true`) — lỗ hổng **mass-assignment**.

```ruby
params.require(:post).permit(:title, :body)   # chỉ nhận title, body; bỏ mọi field khác
```

> **Luôn** dùng Strong Parameters cho dữ liệu tạo/sửa record. Đây là mặc định bảo mật của
> Rails, đừng bypass bằng `permit!`.

## render vs redirect_to

| | `render` | `redirect_to` |
|---|----------|---------------|
| Làm gì | Dựng view **ngay trong request hiện tại** | Bảo trình duyệt **gọi request mới** tới URL khác |
| URL trình duyệt | Không đổi | Đổi sang path mới |
| Khi nào dùng | Form lỗi validation (giữ dữ liệu đã nhập) | Sau khi lưu/xóa thành công |

Dùng sai gây lỗi kinh điển: `redirect_to` sau khi save fail → mất hết dữ liệu user vừa gõ.

## flash message

`flash` giữ thông báo **qua đúng 1 redirect** rồi tự xóa — hợp để báo "đã lưu", "có lỗi".

```ruby
redirect_to @post, notice: "Đã tạo."     # flash[:notice]
redirect_to @post, alert: "Không có quyền." # flash[:alert]
```

```erb
<%# app/views/layouts/application.html.erb — hiển thị 1 lần cho mọi trang %>
<% flash.each do |type, message| %>
  <div class="flash flash-<%= type %>"><%= message %></div>
<% end %>
```

## Cạm bẫy hay gặp

- Quên `private` trước `post_params`/`set_post` → Rails coi chúng là action, sinh route lỗi.
- `render :new` mà quên `status: :unprocessable_entity` → Turbo (Rails 7) không hiển thị
  lại form lỗi đúng cách.
- Đặt quá nhiều action ngoài 7 RESTful → dấu hiệu nên tách controller mới.
- `before_action` không giới hạn `only:`/`except:` → chạy nhầm ở action không cần.

## Ghi nhớ

Controller nên **mỏng**: nhận request, gọi model, chọn render/redirect. Logic nghiệp vụ
nặng để ở Model (hoặc Service Object học sau). Controller phình to là mùi cần refactor.
