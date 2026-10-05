---
level: "rails-application"
order: 10
title: "Routing & Controller nâng cao"
est: "4-6 giờ"
checklist:
  - "Viết được nested routes và biết khi nào dùng shallow để tránh URL quá dài"
  - "Tạo được namespace admin/ với controller và view riêng"
  - "Thêm được member route và collection route cho action ngoài CRUD"
  - "Tách logic dùng chung ra routing concern và controller concern"
  - "Nhận ra fat controller và biết ít nhất 2 cách làm mỏng nó"
related:
  - "skill:nta-refactor"
  - "skill:nta-code-review"
  - "glossary:rest"
---

## Vì sao cần routing/controller nâng cao

CRUD `resources :posts` đủ cho app phẳng. App thật có **quan hệ lồng nhau** (comment thuộc
post), **khu vực admin riêng**, và controller phình to theo thời gian. Phần này giúp URL
gọn, code có tổ chức, và controller không thành "God object".

## Nested routes — thể hiện quan hệ trong URL

```ruby
# config/routes.rb
resources :posts do
  resources :comments        # /posts/1/comments, /posts/1/comments/5
end
```

Vấn đề: URL sửa/xoá comment thành `/posts/1/comments/5/edit` — thừa `post_id` vì comment
đã có id riêng. Dùng **shallow** để chỉ lồng các action cần cha:

```ruby
resources :posts do
  resources :comments, shallow: true
end
# index/new/create vẫn lồng: /posts/1/comments
# show/edit/update/destroy phẳng: /comments/5/edit
```

> Quy tắc: chỉ lồng **1 cấp**. Lồng sâu hơn (`posts/1/comments/5/replies/9`) là dấu hiệu
> nên tách resource hoặc dùng shallow.


![Nested routes vs shallow routes — shallow giữ URL con ngắn gọn](/images/ror-nested-routes.png)

## Namespace — khu vực admin

```ruby
namespace :admin do
  resources :posts        # /admin/posts → Admin::PostsController
  resources :users
end
```

Tạo controller trong thư mục con, view cũng vậy:

```ruby
# app/controllers/admin/posts_controller.rb
module Admin
  class PostsController < Admin::BaseController   # base có auth admin
    def index = @posts = Post.all
  end
end
```

Phân biệt `namespace` (đổi cả URL + module) với `scope module:` (chỉ đổi module, URL giữ
nguyên) và `scope path:` (chỉ đổi URL).

## Member & collection routes — action ngoài CRUD

```ruby
resources :posts do
  member do
    patch :publish          # /posts/1/publish — tác động 1 record
  end
  collection do
    get :search             # /posts/search — tác động cả tập
  end
end
```

`member` cần id (thao tác 1 bản ghi), `collection` không (thao tác cả danh sách).

## routes.rb đầy đủ ví dụ

```ruby
Rails.application.routes.draw do
  root "posts#index"

  resources :posts do
    member { patch :publish }
    collection { get :search }
    resources :comments, shallow: true
  end

  namespace :admin do
    root "dashboard#index"
    resources :posts
    resources :users, only: %i[index show destroy]
  end

  devise_for :users
end
```

Kiểm tra bằng `rails routes | grep post` hoặc mở `/rails/info/routes` khi dev.

## Concern — refactor code lặp lại

**Routing concern** — nhóm route dùng chung:

```ruby
concern :commentable do
  resources :comments, shallow: true
end

resources :posts,  concerns: :commentable
resources :photos, concerns: :commentable    # cả hai đều có comments
```

**Controller concern** — hành vi dùng chung giữa nhiều controller:

```ruby
# app/controllers/concerns/paginatable.rb
module Paginatable
  extend ActiveSupport::Concern

  def paginate(scope)
    scope.page(params[:page]).per(params[:per] || 20)
  end
end

class PostsController < ApplicationController
  include Paginatable
  def index = @posts = paginate(Post.published)
end
```

## Fat controller — nhận ra & làm mỏng

Controller "fat" là controller chứa business logic (tính toán, gọi nhiều model, side
effect). Dấu hiệu: action dài > 10-15 dòng, nhiều `if`, gọi 3-4 model.

```ruby
# ❌ Fat controller
def create
  @order = Order.new(order_params)
  @order.total = @order.items.sum { |i| i.price * i.qty }
  @order.apply_discount if current_user.vip?
  if @order.save
    InventoryService.reserve(@order)
    OrderMailer.confirm(@order).deliver_later
    redirect_to @order
  else
    render :new
  end
end
```

Cách làm mỏng:

| Cách | Đưa logic vào |
|------|---------------|
| **Service Object** | Class riêng lo nghiệp vụ (xem level Kiến trúc) |
| **Model method / scope** | Logic thuộc về dữ liệu → về model |
| **Concern** | Hành vi lặp giữa nhiều controller |
| **before_action** | Load record, check quyền, guard chung |

```ruby
# ✅ Mỏng
def create
  result = PlaceOrder.call(user: current_user, params: order_params)
  if result.success?
    redirect_to result.order
  else
    @order = result.order
    render :new
  end
end
```

Skill `/nta-refactor` giúp phân tích code smell và lập kế hoạch tách từng bước.

## Cạm bẫy hay gặp

- Nested quá sâu → URL xấu, helper `post_comment_reply_path(...)` dài kinh khủng.
- Nhồi logic vào controller thay vì model/service → khó test, khó tái sử dụng.
- Quên `Admin::BaseController` check quyền → route admin ai cũng vào được.
- Đặt method dùng chung ở `ApplicationController` mãi → nó thành fat, dùng concern thay thế.

## Ghi nhớ

Controller chỉ nên làm 3 việc: **nhận request → gọi đúng chỗ xử lý → trả response**.
Business logic không thuộc về nó. URL nên phản ánh quan hệ dữ liệu nhưng đừng lồng quá 1 cấp.
