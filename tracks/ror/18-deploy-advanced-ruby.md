---
level: "operations-advanced"
order: 18
title: "Triển khai & Ruby nâng cao"
est: "5-6 giờ"
checklist:
  - "Viết được Dockerfile multi-stage và docker-compose có DB cho app Rails"
  - "Biết các lựa chọn deploy (Heroku/Render/EC2) và đánh đổi của mỗi cái"
  - "Cấu hình error tracking (Sentry/Rollbar) để bắt lỗi production"
  - "Phân biệt được Ractor, Fiber, Enumerator và mục đích mỗi cái"
  - "Biết RBS là gì và viết được một gem đơn giản để publish"
  - "Debug bằng Pry / debug gem với breakpoint thay vì rải puts"
---

## Docker hóa Rails

Đóng gói app + phụ thuộc vào image để chạy giống nhau ở mọi máy. Multi-stage giữ image
production nhỏ (không mang theo công cụ build):

```dockerfile
# Dockerfile
# --- stage build: cài gem, precompile asset ---
FROM ruby:3.3-slim AS build
WORKDIR /app
RUN apt-get update -qq && apt-get install -y build-essential libpq-dev nodejs
COPY Gemfile Gemfile.lock ./
RUN bundle install --without development test
COPY . .
RUN SECRET_KEY_BASE=dummy bundle exec rails assets:precompile

# --- stage runtime: chỉ lấy thứ cần chạy ---
FROM ruby:3.3-slim
WORKDIR /app
RUN apt-get update -qq && apt-get install -y libpq-dev
COPY --from=build /usr/local/bundle /usr/local/bundle
COPY --from=build /app /app
CMD ["bundle", "exec", "rails", "server", "-b", "0.0.0.0"]
```

```yaml
# docker-compose.yml — app + postgres cho local
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: postgres
    volumes: ["pg_data:/var/lib/postgresql/data"]
  web:
    build: .
    ports: ["3000:3000"]
    environment:
      DATABASE_URL: postgres://postgres:postgres@db:5432/app_production
    depends_on: [db]
volumes:
  pg_data:
```


![Docker multi-stage build: stage build cài gem + assets, stage runtime chỉ giữ thứ cần chạy](/images/ror-docker-build.png)

## Lựa chọn deploy

| Nền tảng | Ưu | Nhược |
|----------|-----|-------|
| **Heroku** | Nhanh nhất để lên, `git push` là xong | Đắt khi scale, ít quyền tinh chỉnh |
| **Render** | Giống Heroku, giá dễ chịu hơn | Hệ sinh thái nhỏ hơn |
| **AWS EC2** | Toàn quyền, rẻ khi tối ưu | Phải tự lo OS, DB, deploy, backup |

> Người mới nên bắt đầu ở **Heroku/Render** để tập trung vào app; chuyển EC2/Kubernetes chỉ
> khi thực sự cần kiểm soát hạ tầng. Đừng dựng cụm K8s cho một app 100 người dùng.

## Error tracking

`rails server` log ra file thì không ai đọc kịp trên production. Gắn **Sentry** hoặc
**Rollbar** để lỗi được gom, gắn stacktrace và báo về Slack/email:

```ruby
# Gemfile
gem "sentry-ruby"
gem "sentry-rails"
```

```ruby
# config/initializers/sentry.rb
Sentry.init do |config|
  config.dsn = ENV["SENTRY_DSN"]
  config.traces_sample_rate = 0.1 # lấy mẫu 10% để theo dõi hiệu năng
end
```

## Ruby nâng cao: concurrency

- **Enumerator** — dòng dữ liệu lười (lazy), tính khi cần: `(1..Float::INFINITY).lazy.map { ... }.first(5)`.
- **Fiber** — coroutine hợp tác, tự nhường quyền (`Fiber.yield`); nền tảng cho async I/O.
- **Ractor** — chạy song song **thật** (bỏ giới hạn GVL), nhưng các Ractor không chia sẻ
  object mutable — phải truyền message. Dùng cho tính toán nặng CPU:

```ruby
r = Ractor.new { 1_000_000.times.sum } # chạy trên core riêng
r.take                                   # lấy kết quả
```

## RBS — type signature cho Ruby

Ruby là dynamic typing; RBS mô tả kiểu ở file `.rbs` riêng để công cụ (Steep) kiểm tra:

```rbs
# sig/user.rbs
class User
  attr_reader name: String
  def greeting: (String) -> String
end
```

Chưa bắt buộc, nhưng đáng học khi codebase lớn để bắt lỗi kiểu trước runtime.

## Viết gem riêng & publish

```bash
bundle gem my_awesome_gem   # sinh khung gem chuẩn
cd my_awesome_gem
# viết code trong lib/, khai báo ở my_awesome_gem.gemspec
gem build my_awesome_gem.gemspec
gem push my_awesome_gem-0.1.0.gem   # publish lên rubygems.org
```

Tách logic tái sử dụng thành gem giúp chia sẻ giữa các project — nhưng chỉ khi nó thực sự
dùng chung, đừng tách sớm.

## Debug nâng cao

Bỏ thói quen rải `puts`. Dùng breakpoint:

```ruby
# Gemfile (development, test)
gem "debug"      # đi kèm Ruby 3.1+
gem "pry-rails"  # console mạnh hơn irb
```

```ruby
def create
  binding.break   # (hoặc binding.pry) — dừng ở đây, mở console tại chỗ
  @order = PlaceOrder.new(...).call
end
```

Tại breakpoint bạn xem được biến, gọi method, chạy step-by-step — nhanh hơn đoán mò.

## Ghi nhớ

Triển khai là **làm cho người khác chạy được và bạn thấy được lỗi**: Docker cho tính nhất
quán, error tracking cho khả năng quan sát. Ruby nâng cao (Ractor/RBS/gem) là công cụ cho
đúng bài toán — học để biết, dùng khi cần, không phô diễn.

> **Chặng đường tiếp theo**: bạn đã đi hết lộ trình từ Ruby căn bản đến vận hành production.
> Giờ là lúc chọn một dự án thực tế và làm end-to-end — dựng, test, đóng Docker, deploy, gắn
> monitoring. Kiến thức chỉ đọng lại khi bạn tự tay đưa một app ra thế giới thật. Khi gặp
> tình huống mới, quay lại các bài liên quan và tra `term-glossary` cho thuật ngữ lạ.
