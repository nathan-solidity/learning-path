---
level: "architecture-api"
order: 15
title: "REST API & GraphQL"
est: "5-6 giờ"
checklist:
  - "Tạo được API-only controller trả JSON có versioning (/api/v1)"
  - "Serialize response bằng Jbuilder hoặc jsonapi-serializer thay vì to_json thô"
  - "Hiểu khác biệt giữa REST và GraphQL, biết khi nào chọn cái nào"
  - "Viết được một query và một mutation cơ bản với graphql-ruby"
  - "Bảo vệ API bằng JWT; hiểu OAuth2 dùng khi nào"
related:
  - "skill:nta-api-design-review"
  - "skill:nta-doc-gen"
---

## REST API trong Rails

Rails phục vụ API rất tự nhiên. Với app chỉ làm API, sinh bằng `rails new app --api` để
bỏ view/asset. Còn app đã có sẵn thì thêm namespace `api/v1` cho endpoint JSON:

```ruby
# config/routes.rb
namespace :api do
  namespace :v1 do
    resources :products, only: %i[index show create]
  end
end
```

```ruby
# app/controllers/api/v1/products_controller.rb
module Api
  module V1
    class ProductsController < ApplicationController
      # API không dùng cookie session → tắt CSRF, xác thực bằng token
      skip_before_action :verify_authenticity_token

      def index
        products = Product.all
        render json: products, status: :ok
      end
    end
  end
end
```

> **Versioning từ đầu** (`/api/v1`). Khi cần đổi format response mà không phá client cũ,
> bạn mở `v2` — client cũ vẫn gọi `v1`. Sửa thẳng API đang chạy là cách nhanh nhất để làm
> vỡ app của người khác.


![Luồng một REST API request/response; khác biệt cốt lõi giữa REST và GraphQL](/images/ror-api-flow.png)

## Serialize — đừng trả `to_json` thô

`render json: product` phơi hết mọi cột (kể cả cột nhạy cảm) và khó kiểm soát. Dùng
serializer để **chọn field và định dạng**.

**Jbuilder** (template, đi kèm Rails):

```ruby
# app/views/api/v1/products/show.json.jbuilder
json.id product.id
json.name product.name
json.price_formatted number_to_currency(product.price)
json.category product.category.name
```

**jsonapi-serializer** (trước là fast_jsonapi — nhanh, theo chuẩn JSON:API):

```ruby
# app/serializers/product_serializer.rb
class ProductSerializer
  include JSONAPI::Serializer
  attributes :name, :price
  belongs_to :category
end

# controller
render json: ProductSerializer.new(products).serializable_hash
```

`ActiveModel::Serializer` là lựa chọn khác nhưng hiện ít được bảo trì hơn — dự án mới nên
ưu tiên jsonapi-serializer hoặc Jbuilder.

## GraphQL — khi client cần dữ liệu linh hoạt

REST trả **cố định** một shape. GraphQL để client **tự chọn field cần**, gộp nhiều
resource trong 1 request — hợp khi có nhiều loại client (web, mobile) cần dữ liệu khác nhau.

```bash
bundle add graphql
rails generate graphql:install
```

```ruby
# app/graphql/types/product_type.rb
module Types
  class ProductType < Types::BaseObject
    field :id, ID, null: false
    field :name, String, null: false
    field :price, Float, null: false
  end
end

# app/graphql/types/query_type.rb — query đọc dữ liệu
field :products, [Types::ProductType], null: false
def products
  Product.all
end
```

```ruby
# app/graphql/mutations/create_product.rb — mutation ghi dữ liệu
class Mutations::CreateProduct < Mutations::BaseMutation
  argument :name, String, required: true
  argument :price, Float, required: true
  field :product, Types::ProductType, null: false

  def resolve(name:, price:)
    { product: Product.create!(name: name, price: price) }
  end
end
```

| Chọn | Khi |
|------|-----|
| REST | Resource rõ ràng, cache HTTP quan trọng, client đơn giản |
| GraphQL | Nhiều client với nhu cầu field khác nhau, tránh over/under-fetch |

Đừng mặc định GraphQL vì "nghe hiện đại" — nó thêm độ phức tạp (N+1, phân quyền theo field).

## Xác thực API: JWT & OAuth2

API không có session cookie → mỗi request mang **token**.

- **JWT** (JSON Web Token): server ký một token khi login, client gửi kèm header
  `Authorization: Bearer <token>`. Server verify chữ ký, không cần tra DB mỗi request.

```ruby
# tạo token khi login
token = JWT.encode({ user_id: user.id, exp: 24.hours.from_now.to_i }, Rails.application.secret_key_base)

# verify ở before_action
payload = JWT.decode(request.headers["Authorization"].split.last, Rails.application.secret_key_base).first
@current_user = User.find(payload["user_id"])
```

- **OAuth2**: dùng khi cho phép **bên thứ ba** truy cập thay người dùng (đăng nhập bằng
  Google, hoặc bạn mở API cho đối tác). Gem `doorkeeper` biến Rails thành OAuth2 provider.

## Cạm bẫy hay gặp

- Trả `to_json` thô → lộ cột nhạy cảm (`password_digest`, token nội bộ).
- GraphQL query lồng nhau gây **N+1** → dùng `graphql-batch` hoặc dataloader.
- Quên set `exp` cho JWT → token sống mãi, rủi ro bảo mật.
- Không versioning → sửa response là vỡ mọi client đang chạy.

Dùng `/nta-api-design-review` để soi convention/naming/error-format và `/nta-doc-gen` để
sinh tài liệu API từ code.
