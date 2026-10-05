---
level: "architecture-api"
order: 14
title: "Kiến trúc ứng dụng nâng cao"
est: "4-5 giờ"
checklist:
  - "Nhận ra dấu hiệu fat model / fat controller và biết vì sao cần tách"
  - "Viết được một Service Object cho một luồng nghiệp vụ nhiều bước"
  - "Dùng Form Object khi form ghi vào nhiều model cùng lúc"
  - "Dùng Decorator/Presenter để đẩy logic hiển thị ra khỏi model và view"
  - "Biết khi nào KHÔNG cần các pattern trên (tránh over-engineer)"
related:
  - "skill:nta-refactor"
  - "skill:nta-code-review"
---

## Vì sao cần thêm tầng kiến trúc

Rails mặc định chỉ có Model – View – Controller. Khi nghiệp vụ đơn giản, thế là đủ. Nhưng
khi app lớn lên, logic bắt đầu dồn vào 2 chỗ và gây đau:

- **Fat model**: model `Order` chứa cả gửi email, trừ kho, tính điểm thưởng... — khó test,
  khó tái sử dụng, một thay đổi kéo theo hàng loạt.
- **Fat controller**: action `create` dài 60 dòng, xử lý validate + gọi API + ghi log.

> Nguyên tắc: **Model lo dữ liệu và quan hệ, Controller lo điều phối HTTP.** Mọi logic
> nghiệp vụ phức tạp nằm ở giữa nên có nhà riêng.


![Tách fat controller thành các tầng: Controller → Service/Form Object → Model, Decorator lo hiển thị](/images/ror-layered-arch.png)

## Service Object — đóng gói một luồng nghiệp vụ

Dùng khi một hành động có **nhiều bước, gọi nhiều model**, ví dụ "đặt hàng":

```ruby
# app/services/place_order.rb
class PlaceOrder
  def initialize(user:, cart:)
    @user = user
    @cart = cart
  end

  def call
    ActiveRecord::Base.transaction do
      order = @user.orders.create!(total: @cart.total)
      @cart.items.each { |i| order.line_items.create!(product: i.product, qty: i.qty) }
      InventoryService.new(order).reserve!
      OrderMailer.confirmation(order).deliver_later
      order
    end
  end
end

# Controller mỏng đi hẳn:
def create
  @order = PlaceOrder.new(user: current_user, cart: current_cart).call
  redirect_to @order
end
```

Quy ước phổ biến: 1 public method `call`, đặt trong `app/services/`, tên là **động từ**
(`PlaceOrder`, `RegisterUser`), trả về kết quả rõ ràng.

## Form Object — khi 1 form ghi nhiều model

Ví dụ đăng ký vừa tạo `User` vừa tạo `Company`. Thay vì nhồi vào 1 model:

```ruby
# app/forms/signup_form.rb
class SignupForm
  include ActiveModel::Model # cho validations + form_with dùng được

  attr_accessor :email, :password, :company_name
  validates :email, :company_name, presence: true

  def save
    return false unless valid?
    ActiveRecord::Base.transaction do
      company = Company.create!(name: company_name)
      company.users.create!(email: email, password: password)
    end
    true
  end
end
```

View dùng như model bình thường: `form_with model: @signup_form`.

## Decorator / Presenter — logic hiển thị

Đừng để view chứa `if user.first_name.present? ...` hay để model có method chỉ phục vụ HTML.
Dùng plain Ruby decorator (hoặc gem **draper**):

```ruby
# app/decorators/user_decorator.rb
class UserDecorator < SimpleDelegator
  def display_name
    full_name.presence || "Ẩn danh"
  end

  def badge
    admin? ? "👑 Admin" : "Thành viên"
  end
end

# controller / view
@user = UserDecorator.new(user)
# view: <%= @user.display_name %> <%= @user.badge %>
```

`SimpleDelegator` chuyển tiếp mọi method về object gốc, chỉ override cái cần trang trí.

## Đừng over-engineer

Các gem như **dry-rb**, **interactor**, **trailblazer** cho kiến trúc bài bản hơn — nhưng
chỉ đáng dùng khi **hệ thống thực sự lớn** và team đã thống nhất. Với app CRUD nhỏ, thêm
chúng là gánh nặng học tập vô ích.

| Tình huống | Dùng gì |
|-----------|---------|
| CRUD đơn giản | MVC thuần, không cần thêm gì |
| Một action nhiều bước | Service Object |
| Form ghi nhiều model | Form Object |
| Logic chỉ để hiển thị | Decorator/Presenter |
| Hệ thống lớn, nhiều team | Mới cân nhắc dry-rb / interactor |

## Dự án thực tế để luyện

Chọn một trong ba, áp dụng các pattern trên khi thấy code phình:

1. **Quản lý công việc** — có login, mỗi user thấy task của mình (Service khi hoàn tất task).
2. **Trang bán hàng** — sản phẩm + giỏ hàng + đặt hàng (Service `PlaceOrder`, Form giỏ hàng).
3. **Blog đa người dùng** — user roles, comment, tag (Decorator cho hiển thị bài viết).

## Ghi nhớ

Tách tầng để **giảm fat model/controller**, không phải để trông "pro". Bắt đầu từ MVC,
chỉ trích xuất khi một class làm quá nhiều việc. Dùng `/nta-refactor` để tách an toàn từng
bước và `/nta-code-review` soi lại sau khi tách.
