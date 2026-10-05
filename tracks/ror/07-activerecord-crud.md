---
level: "rails-foundation"
order: 7
title: "Model & ActiveRecord CRUD"
est: "5-6 giờ"
checklist:
  - "Tạo được model kèm migration và chạy `bin/rails db:migrate` thành công"
  - "Thực hiện được đủ CRUD: create, find/where, update, destroy trên console"
  - "Viết được validation presence/uniqueness/length và validation tùy chỉnh"
  - "Phân biệt được `save` (trả true/false) và `save!` / `create!` (raise lỗi)"
  - "Đọc được `db/schema.rb` để biết cấu trúc bảng hiện tại"
  - "Viết được `db/seeds.rb` và nạp dữ liệu mẫu bằng `db:seed`"
related:
  - "glossary:orm"
---

## ActiveRecord là gì

**ActiveRecord** là ORM của Rails: mỗi **class model** ↔ một **bảng**, mỗi **object** ↔
một **dòng**. Bạn thao tác bằng Ruby, ActiveRecord dịch sang SQL.

```ruby
Post.all        # SELECT * FROM posts
post.save       # INSERT / UPDATE
```

## Tạo model & migration

```bash
# Sinh model Post + migration tạo bảng posts
bin/rails generate model Post title:string body:text published:boolean
```

Lệnh trên tạo:

```ruby
# db/migrate/20260101000000_create_posts.rb
class CreatePosts < ActiveRecord::Migration[7.1]
  def change
    create_table :posts do |t|
      t.string  :title, null: false
      t.text    :body
      t.boolean :published, default: false
      t.timestamps                       # tự thêm created_at, updated_at
    end
    add_index :posts, :title             # index để tìm theo title nhanh
  end
end
```

```bash
bin/rails db:migrate      # áp migration → tạo bảng thật + cập nhật db/schema.rb
bin/rails db:rollback     # hoàn tác migration gần nhất (khi lỡ sai)
```

> `db/schema.rb` là **ảnh chụp** cấu trúc DB hiện tại, do migration tự sinh — **không sửa
> tay**. Muốn đổi schema thì viết migration mới. Commit `schema.rb` vào git.

## CRUD trên console

```bash
bin/rails console         # môi trường Ruby có sẵn model, an toàn để thử
```

```ruby
# CREATE
post = Post.new(title: "Bài đầu", body: "Nội dung")
post.save                          # => true/false (không raise)
Post.create(title: "Bài 2")        # new + save gộp làm một
Post.create!(title: nil)           # create! RAISE lỗi nếu validation fail

# READ
Post.find(1)                       # theo id — raise nếu không có
Post.find_by(title: "Bài đầu")     # theo điều kiện — trả nil nếu không có
Post.where(published: true)        # nhiều dòng — trả relation (lazy)
Post.where("created_at > ?", 1.week.ago).order(created_at: :desc).limit(5)
Post.count                         # đếm

# UPDATE
post.update(title: "Sửa tiêu đề")  # gán + save, trả true/false
post.title = "Cách khác"
post.save

# DELETE
post.destroy                       # xóa 1 dòng (chạy callback)
Post.where(published: false).destroy_all
```

> Dùng `?` placeholder trong `where("... > ?", value)` — **không** nội suy chuỗi
> `where("id = #{params[:id]}")`. Nội suy tay mở đường cho **SQL injection**.


![4 thao tác CRUD ánh xạ sang câu lệnh SQL trên bảng `posts`](/images/ror-crud-table.png)

## Validations — chặn dữ liệu bẩn từ Model

Validation chạy trước khi lưu; fail thì `save` trả `false` và gom lỗi vào `errors`.

```ruby
# app/models/post.rb
class Post < ApplicationRecord
  validates :title, presence: true, length: { minimum: 3, maximum: 120 }
  validates :slug,  uniqueness: true
  validates :body,  presence: true

  # Validation tùy chỉnh
  validate :title_not_spam

  private

  def title_not_spam
    if title&.downcase&.include?("spam")
      errors.add(:title, "không được chứa từ cấm")
    end
  end
end
```

```ruby
post = Post.new(title: "ab")
post.valid?             # => false
post.errors.full_messages
# => ["Title is too short (minimum is 3 characters)", "Body can't be blank"]
```

| Validation | Ý nghĩa |
|-----------|---------|
| `presence: true` | Không được rỗng/nil |
| `uniqueness: true` | Không trùng (kèm **DB index unique** để chắc chắn) |
| `length: { in: 3..120 }` | Giới hạn độ dài |
| `numericality`, `format`, `inclusion` | Số, regex, thuộc tập giá trị |

> `uniqueness` ở model **không đủ** chống trùng khi 2 request đồng thời. Luôn kèm
> `add_index :posts, :slug, unique: true` ở migration để DB chặn ở tầng cuối.

## Seed — dữ liệu mẫu

```ruby
# db/seeds.rb — chạy được nhiều lần nên dùng find_or_create_by để không nhân đôi
5.times do |i|
  Post.find_or_create_by!(title: "Bài mẫu #{i + 1}") do |p|
    p.body = "Nội dung mẫu số #{i + 1}"
    p.published = i.even?
  end
end
puts "Seed xong: #{Post.count} bài"
```

```bash
bin/rails db:seed                 # nạp dữ liệu mẫu
bin/rails db:reset                # xóa DB, tạo lại từ schema, chạy seed (chỉ dev!)
```

## Cạm bẫy hay gặp

- Dùng `save`/`update` (trả false) trong seed/script mà quên kiểm tra → dữ liệu không vào
  mà không báo. Dùng bản có `!` (`save!`, `create!`) để lỗi nổ ngay.
- `find` raise `RecordNotFound`, còn `find_by` trả `nil` — chọn đúng theo tình huống.
- Sửa `schema.rb` bằng tay → lệch với migration, vỡ khi deploy.
- `db:reset` / `db:seed` chạy nhầm trên production → **mất dữ liệu thật**. Chỉ dùng ở dev.

## Ghi nhớ

Model là nơi đặt **quy tắc dữ liệu**: validation, quan hệ, và (sau này) business logic
gọn. Đặt validation ở model để **mọi con đường** ghi dữ liệu (form, API, console, seed)
đều bị kiểm tra như nhau — đừng chỉ validate ở form.
