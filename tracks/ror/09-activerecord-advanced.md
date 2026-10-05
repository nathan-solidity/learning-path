---
level: "rails-application"
order: 9
title: "ActiveRecord nâng cao"
est: "6-8 giờ"
checklist:
  - "Khai báo được has_many, belongs_to, has_one và has_many :through cho quan hệ thực tế"
  - "Viết được scope và enum, gọi được chúng trong controller/view"
  - "Nhận ra một N+1 query từ log và fix bằng includes/preload/eager_load"
  - "Biết khi nào dùng callback và khi nào KHÔNG nên dùng (side effect ngầm)"
  - "Thêm được index cho foreign key và cột hay query, giải thích được vì sao"
related:
  - "skill:nta-perf-audit"
  - "skill:nta-db-review"
  - "glossary:orm"
---

## Vì sao ActiveRecord nâng cao quan trọng

CRUD cơ bản chỉ đủ cho app đồ chơi. App thật có **quan hệ giữa các bảng** (user có nhiều
post, post có nhiều comment) và **truy vấn dữ liệu lớn**. Nắm phần này giúp bạn viết query
đúng và **nhanh** — đặc biệt tránh N+1, bug hiệu năng phổ biến nhất trong Rails.

## Quan hệ (Associations)

```ruby
class User < ApplicationRecord
  has_many :posts, dependent: :destroy   # xoá user → xoá post của họ
  has_many :comments
  has_one  :profile
end

class Post < ApplicationRecord
  belongs_to :user
  has_many :comments, dependent: :destroy
  has_many :taggings
  has_many :tags, through: :taggings     # quan hệ nhiều-nhiều qua bảng trung gian
end

class Tagging < ApplicationRecord        # bảng join
  belongs_to :post
  belongs_to :tag
end
```

`has_many :through` là cách chuẩn cho quan hệ **nhiều-nhiều** khi bảng join có thêm cột
(vd `created_at`). Dùng được ngay:

```ruby
user.posts                # tất cả post của user
post.tags                 # tất cả tag của post
post.tags << Tag.first    # gán tag
```


![Quan hệ has_many / belongs_to / has_many :through giữa users, posts, comments](/images/ror-associations-erd.png)

## Scope — query tái sử dụng

Scope là query đặt tên, chain được với nhau:

```ruby
class Post < ApplicationRecord
  scope :published, -> { where(status: "published") }
  scope :recent,    -> { order(created_at: :desc) }
  scope :by_author, ->(user) { where(user: user) }   # scope nhận tham số
end

Post.published.recent.limit(10)     # chain thoải mái
Post.by_author(current_user).published
```

> Scope luôn trả về `ActiveRecord::Relation` (chain được). Nếu viết logic có thể trả `nil`,
> dùng class method thay vì scope.

## Enum — trạng thái dạng số nhưng đọc như chữ

```ruby
class Post < ApplicationRecord
  enum status: { draft: 0, published: 1, archived: 2 }
end

post.published!        # setter: đổi sang published
post.published?        # => true/false
Post.published         # scope tự sinh, lấy tất cả post published
```

DB lưu số (0/1/2) nhưng code đọc như chữ. Tránh magic number rải rác trong app.

## Callback — mạnh nhưng dễ lạm dụng

```ruby
class User < ApplicationRecord
  before_save   :normalize_email
  after_create  :send_welcome_email

  private
  def normalize_email = self.email = email.downcase.strip
  def send_welcome_email = UserMailer.welcome(self).deliver_later
end
```

> **Cảnh báo lạm dụng callback**: callback chạy **ngầm** mỗi lần save. Nhồi quá nhiều
> logic (gửi mail, gọi API, tạo record khác) khiến model khó test và khó đoán. Side effect
> phức tạp nên đưa ra **Service Object** (xem level Kiến trúc). Callback chỉ nên lo dữ liệu
> của chính record đó (normalize, set default).

## N+1 query — bug hiệu năng số 1

Đoạn này trông vô hại nhưng **thảm hoạ**:

```erb
<% @posts.each do |post| %>
  <p><%= post.user.name %></p>   <%# mỗi vòng lặp = 1 query lấy user %>
<% end %>
```

Với 100 post → 1 query lấy posts + 100 query lấy user = **101 query**. Log sẽ đầy dòng
`SELECT * FROM users WHERE id = ?`. Fix bằng **eager loading**:

```ruby
# Controller
@posts = Post.includes(:user).limit(100)   # 2 query thay vì 101
```

| Method | Cách chạy | Khi dùng |
|--------|-----------|----------|
| `includes` | Rails tự chọn preload/eager_load | Mặc định, dùng cái này trước |
| `preload`  | Query riêng cho từng bảng (2 query) | Không filter theo bảng liên quan |
| `eager_load` | LEFT JOIN (1 query) | Cần `where` trên bảng liên quan |

Gem **Bullet** tự cảnh báo N+1 lúc dev (xem level Vận hành). Skill `/nta-perf-audit` cũng
quét được N+1 trong code.

## Index & performance

Foreign key và cột hay dùng trong `WHERE`/`ORDER BY` **phải có index**, nếu không DB quét
toàn bảng:

```ruby
class AddIndexes < ActiveRecord::Migration[7.1]
  def change
    add_index :posts, :user_id                      # FK — gần như luôn cần
    add_index :posts, :status
    add_index :users, :email, unique: true          # vừa nhanh vừa chống trùng
    add_index :taggings, [:post_id, :tag_id], unique: true  # composite
  end
end
```

## Cạm bẫy hay gặp

- Quên `dependent: :destroy` → xoá user để lại post mồ côi (orphan record).
- N+1 không thấy khi test với 2-3 record, chỉ lộ khi data thật lớn → luôn xem log query.
- Nhồi logic vào callback → save một record vô tình gửi 3 email, gọi 2 API.
- Thiếu index trên FK → app chạy nhanh lúc đầu, chậm dần khi bảng lớn.

## Ghi nhớ

Association + eager loading là hai thứ tách "Rails dev biết viết query" khỏi "Rails dev
viết query làm sập production". Mỗi khi lặp qua collection và gọi `.something`, hỏi ngay:
"đây có phải N+1 không?"
