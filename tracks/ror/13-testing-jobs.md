---
level: "rails-application"
order: 13
title: "Testing & Background Job"
est: "8-10 giờ"
checklist:
  - "Viết được model spec kiểm tra validation và method bằng RSpec"
  - "Viết được request spec kiểm tra một endpoint trả đúng status và nội dung"
  - "Dùng FactoryBot tạo dữ liệu test và Faker sinh dữ liệu giả"
  - "Viết được một feature/system test mô phỏng thao tác user bằng Capybara"
  - "Đẩy được một tác vụ nặng sang background job với ActiveJob + Sidekiq"
related:
  - "skill:nta-test-gen"
  - "skill:nta-code-review"
  - "glossary:unit-test"
---

## Vì sao test là kỹ năng bắt buộc

Rails "convention" khiến code chạy nhanh, nhưng khi app lớn, sửa một chỗ dễ vỡ chỗ khác.
Test là **lưới an toàn**: refactor mà không sợ, và spec chính là tài liệu sống mô tả code
làm gì. RSpec là framework test phổ biến nhất trong cộng đồng Rails.

## RSpec — cấu trúc cơ bản

```ruby
# Gemfile (group :development, :test)
gem "rspec-rails"
gem "factory_bot_rails"
gem "faker"
```

```bash
rails generate rspec:install    # tạo spec/ + .rspec + rails_helper
```

`describe` gom nhóm, `context` mô tả điều kiện, `it` là một kỳ vọng, `expect` là assertion:

```ruby
# spec/models/post_spec.rb
require "rails_helper"

RSpec.describe Post, type: :model do
  describe "validations" do
    it "bắt buộc có title" do
      post = Post.new(title: nil)
      expect(post).not_to be_valid
      expect(post.errors[:title]).to include("can't be blank")
    end
  end

  describe "#published?" do
    context "khi status là published" do
      it "trả về true" do
        expect(Post.new(status: "published").published?).to be true
      end
    end
  end
end
```

Chạy: `bundle exec rspec` hoặc `bundle exec rspec spec/models/post_spec.rb`.

## FactoryBot + Faker — dữ liệu test gọn

Thay vì lặp lại `Post.create(title: "...", body: "...")` khắp nơi, định nghĩa factory một
lần:

```ruby
# spec/factories/posts.rb
FactoryBot.define do
  factory :post do
    title { Faker::Book.title }           # Faker sinh dữ liệu giả thực tế
    body  { Faker::Lorem.paragraph }
    status { "published" }
    association :user                     # tự tạo user liên quan
  end
end
```

```ruby
build(:post)              # tạo object chưa lưu DB (nhanh)
create(:post)             # tạo và lưu DB
create(:post, title: "X") # override field
create_list(:post, 5)     # 5 post cùng lúc
```

> `build` không đụng DB → nhanh hơn nhiều `create`. Chỉ `create` khi test cần record thật
> trong DB (query, association).

## Request spec — test endpoint

Ưu tiên **request spec** (test qua HTTP thật) hơn controller spec kiểu cũ:

```ruby
# spec/requests/posts_spec.rb
require "rails_helper"

RSpec.describe "Posts", type: :request do
  describe "GET /posts" do
    it "trả về 200 và hiện title post" do
      post = create(:post, title: "Hello Rails")
      get posts_path
      expect(response).to have_http_status(:ok)
      expect(response.body).to include("Hello Rails")
    end
  end

  describe "POST /posts" do
    it "tạo post mới khi dữ liệu hợp lệ" do
      user = create(:user)
      sign_in user                        # helper Devise trong test
      expect {
        post posts_path, params: { post: { title: "New", body: "..." } }
      }.to change(Post, :count).by(1)
    end
  end
end
```

## Capybara — feature/system test

Feature test mô phỏng **thao tác thật của user** trên trình duyệt: click, gõ, submit.

```ruby
# spec/system/create_post_spec.rb
require "rails_helper"

RSpec.describe "Tạo post", type: :system do
  it "user đăng nhập tạo được post" do
    user = create(:user)
    sign_in user

    visit new_post_path
    fill_in "Title", with: "Bài viết đầu tiên"
    fill_in "Body",  with: "Nội dung..."
    click_button "Lưu"

    expect(page).to have_content("Bài viết đầu tiên")
    expect(page).to have_current_path(post_path(Post.last))
  end
end
```

| Loại test | Kiểm tra | Tốc độ |
|-----------|----------|--------|
| Model spec | Logic model, validation, method | Nhanh nhất |
| Request spec | Endpoint trả đúng status/nội dung | Nhanh |
| System/feature | Luồng user end-to-end qua browser | Chậm — dùng cho luồng quan trọng |

Skill `/nta-test-gen` sinh test scaffold cho code có sẵn; `/nta-code-review` rà coverage.


![Tháp test: nhiều unit test (nhanh, rẻ) ở đáy, ít E2E (chậm) ở đỉnh](/images/ror-test-pyramid.png)

## Background Job — việc nặng làm sau

Việc chậm (gửi email, xử lý ảnh, gọi API ngoài) **không nên** chặn request. Đẩy sang job
nền qua **ActiveJob** (interface chung) chạy trên **Sidekiq** (backend Redis, phổ biến nhất):

```ruby
# app/jobs/thumbnail_job.rb
class ThumbnailJob < ApplicationJob
  queue_as :default
  def perform(post_id)
    post = Post.find(post_id)
    post.generate_thumbnail!            # việc nặng chạy ở background
  end
end
```

```ruby
ThumbnailJob.perform_later(post.id)     # đẩy vào hàng đợi, request trả ngay
# perform_now(...) chạy đồng bộ — chỉ dùng khi test
```

```ruby
# config/application.rb
config.active_job.queue_adapter = :sidekiq
```

Chạy worker: `bundle exec sidekiq`. Cần Redis chạy nền.

## Caching & I18n (gọn)

**Fragment caching** — cache một khối view hay đổi để khỏi render lại:

```erb
<% @posts.each do |post| %>
  <% cache post do %>              <%# key theo post; đổi post → tự invalidate %>
    <%= render post %>
  <% end %>
<% end %>
```

**I18n** — tách chuỗi hiển thị ra file locale, dễ đa ngôn ngữ:

```yaml
# config/locales/vi.yml
vi:
  posts:
    created: "Đã tạo bài viết thành công"
```

```ruby
redirect_to @post, notice: t("posts.created")   # t() lấy chuỗi theo locale
```

## Cạm bẫy hay gặp

- Test phụ thuộc thứ tự chạy (dùng data còn sót) → dùng factory tạo mới trong mỗi test.
- Lạm dụng system test (chậm) cho thứ model spec test được → tháp test ngược, CI ì ạch.
- `perform_now` trong production thay vì `perform_later` → request treo chờ việc nặng.
- Job nhận nguyên object thay vì id → object cũ/không serialize được; luôn truyền `id`.
- Quên bật Redis → Sidekiq không chạy, job kẹt mãi trong hàng đợi.

## Ghi nhớ

Viết test ngay khi viết code, đừng để "xong rồi test sau" — vì sẽ không bao giờ có "sau".
Ưu tiên nhiều model/request spec (nhanh), ít system test (chậm nhưng bao luồng quan trọng).
Việc gì làm user chờ mà không cần kết quả ngay → đẩy background.
