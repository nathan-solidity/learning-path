---
level: "rails-application"
order: 11
title: "Xác thực & phân quyền"
est: "6-8 giờ"
checklist:
  - "Cài Devise và có được luồng đăng ký/đăng nhập/đăng xuất chạy được"
  - "Dùng được current_user và before_action :authenticate_user! để chặn trang"
  - "Phân biệt được authentication (bạn là ai) và authorization (bạn được làm gì)"
  - "Viết được một Pundit policy và gọi authorize trong controller"
  - "Ẩn/hiện nút trên view theo quyền bằng policy thay vì if role rải rác"
related:
  - "glossary:authentication"
---

## Xác thực vs phân quyền — hai việc khác nhau

- **Authentication (xác thực)**: *bạn là ai?* — đăng nhập, kiểm tra mật khẩu, session.
- **Authorization (phân quyền)**: *bạn được làm gì?* — user thường không sửa post người
  khác, chỉ admin xoá được user.

Lẫn lộn hai khái niệm này là nguồn của rất nhiều lỗ hổng bảo mật. Rails tách rõ: **Devise**
lo xác thực, **Pundit/CanCanCan** lo phân quyền.


![Authentication (Devise) xác định 'bạn là ai', authorization (Pundit) xác định 'bạn được làm gì'](/images/ror-auth-flow.png)

## Devise — xác thực trong vài lệnh

```ruby
# Gemfile
gem "devise"
```

```bash
bundle install
rails generate devise:install       # tạo config + hướng dẫn
rails generate devise User          # thêm model User + migration + routes
rails db:migrate
```

Devise tự thêm `devise_for :users` vào routes → có sẵn `/users/sign_in`, `/users/sign_up`,
`/users/sign_out`. Trong controller và view dùng ngay các helper:

```ruby
class PostsController < ApplicationController
  before_action :authenticate_user!, except: %i[index show]  # chặn khách chưa login

  def create
    @post = current_user.posts.build(post_params)   # current_user = user đang đăng nhập
    @post.save ? redirect_to(@post) : render(:new)
  end
end
```

```erb
<%# app/views/layouts/application.html.erb %>
<% if user_signed_in? %>
  Xin chào <%= current_user.email %>
  <%= button_to "Đăng xuất", destroy_user_session_path, method: :delete %>
<% else %>
  <%= link_to "Đăng nhập", new_user_session_path %>
<% end %>
```

> Muốn thêm cột (vd `name`, `role`) vào form đăng ký, phải permit chúng trong
> `ApplicationController` qua `configure_permitted_parameters` — Devise mặc định chỉ cho
> email + password.

## Pundit — phân quyền bằng policy

Pundit đặt **mỗi model một policy class**, mỗi action là một method trả `true/false`. Rõ
ràng, dễ test, dễ tìm.

```ruby
# Gemfile
gem "pundit"
```

```ruby
# app/controllers/application_controller.rb
class ApplicationController < ActionController::Base
  include Pundit::Authorization

  rescue_from Pundit::NotAuthorizedError do
    redirect_to root_path, alert: "Bạn không có quyền thực hiện thao tác này."
  end
end
```

```ruby
# app/policies/post_policy.rb
class PostPolicy < ApplicationPolicy
  def update?
    user.admin? || record.user == user     # admin hoặc chính chủ mới sửa
  end

  def destroy? = update?

  class Scope < Scope
    def resolve
      user.admin? ? scope.all : scope.where(user: user)  # user thường chỉ thấy post mình
    end
  end
end
```

Gọi trong controller — quên `authorize` là quên phân quyền, nên Pundit có
`after_action :verify_authorized` để ép:

```ruby
class PostsController < ApplicationController
  def update
    @post = Post.find(params[:id])
    authorize @post                 # gọi PostPolicy#update? — fail thì raise
    @post.update(post_params) ? redirect_to(@post) : render(:edit)
  end

  def index
    @posts = policy_scope(Post)     # dùng Scope#resolve — chỉ post user được xem
  end
end
```

Ẩn nút trên view theo quyền (thay vì rải `if current_user.admin?` khắp nơi):

```erb
<% if policy(@post).update? %>
  <%= link_to "Sửa", edit_post_path(@post) %>
<% end %>
```

## CanCanCan — lựa chọn thay thế

Nếu team quen kiểu **tập trung tất cả quyền vào 1 file** thay vì mỗi model 1 policy, dùng
CanCanCan:

```ruby
# app/models/ability.rb
class Ability
  include CanCan::Ability
  def initialize(user)
    can :read, :all
    can :manage, Post, user_id: user.id     # chủ post toàn quyền
    can :manage, :all if user.admin?
  end
end
```

```ruby
# controller
load_and_authorize_resource       # tự load + check quyền
```

| | Pundit | CanCanCan |
|--|--------|-----------|
| Cách tổ chức | Mỗi model 1 policy | Tất cả trong 1 Ability |
| Hợp với | App lớn, quyền phức tạp theo từng model | App nhỏ/vừa, quyền đơn giản |
| Rõ ràng | Dễ tìm "quyền của Post ở đâu" | Xem 1 chỗ nhưng file dễ phình |

Chọn 1 và nhất quán — **đừng dùng cả hai**. Bài này lấy Pundit làm chính.

## Cạm bẫy hay gặp

- Chỉ ẩn nút trên view mà **không** `authorize` trong controller → user gõ URL trực tiếp
  vẫn thực hiện được. Phân quyền phải ở **server**, view chỉ là trải nghiệm.
- Dùng `current_user.role == "admin"` rải khắp code → khó sửa khi đổi logic quyền.
- Quên permit param mới trong Devise → đăng ký "thành công" nhưng field bị bỏ trống.
- Để `authenticate_user!` sót action nhạy cảm → lộ endpoint.

## Ghi nhớ

Xác thực và phân quyền là **tuyến phòng thủ ở server**, không phải chuyện ẩn nút. Mỗi khi
thêm action đụng dữ liệu người khác, hỏi ngay: "user nào được làm việc này, và mình check
ở đâu?".
