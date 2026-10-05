---
level: "rails-foundation"
order: 5
title: "Môi trường & kiến trúc MVC"
est: "3-4 giờ"
checklist:
  - "Cài được Ruby bằng rbenv (hoặc RVM) và kiểm tra đúng version đang dùng"
  - "Tạo được app Rails mới và chạy `bin/rails server` truy cập được localhost:3000"
  - "Giải thích được Gemfile, Gemfile.lock và `bundle install` khác nhau chỗ nào"
  - "Chỉ ra được thư mục nào chứa model, controller, view, routes trong app/ và config/"
  - "Vẽ lại được luồng một request đi qua Rails: routes → controller → model → view"
related:
  - "glossary:mvc"
---

## Vì sao cần quản lý version Ruby

Mỗi dự án có thể cần **version Ruby khác nhau**. Nếu cài Ruby thẳng vào hệ thống, chuyển
dự án là xung đột. **rbenv** (hoặc **RVM**) cho phép mỗi thư mục dùng một version riêng.

```bash
# Cài rbenv trên macOS
brew install rbenv ruby-build
rbenv install 3.3.0        # cài Ruby 3.3.0
rbenv global 3.3.0         # đặt mặc định toàn máy
ruby -v                    # => ruby 3.3.0 ...

# Khóa version cho riêng 1 dự án (tạo file .ruby-version)
cd my_project
rbenv local 3.3.0
```

> rbenv và RVM **không nên cài cùng lúc** — chúng tranh nhau `PATH`. Chọn một. Nhóm mới
> thường chọn rbenv vì nhẹ và ít "phép thuật".

## Bundler & Gemfile — quản lý thư viện

Rails dựng trên **gem** (thư viện Ruby). **Bundler** đọc `Gemfile` để cài đúng gem, đúng
version cho dự án.

```ruby
# Gemfile
source "https://rubygems.org"
ruby "3.3.0"

gem "rails", "~> 7.1"
gem "pg"                    # driver PostgreSQL
gem "puma"                  # web server

group :development, :test do
  gem "rspec-rails"         # chỉ cài ở môi trường dev/test
end
```

```bash
bundle install    # đọc Gemfile → cài gem → ghi version chính xác vào Gemfile.lock
```

| File | Vai trò |
|------|---------|
| `Gemfile` | Bạn khai báo gem muốn dùng (có thể để version linh hoạt `~> 7.1`) |
| `Gemfile.lock` | Bundler ghi **version chính xác** đã cài — commit vào git để cả team giống nhau |
| `bundle install` | Cài theo Gemfile.lock nếu có; nếu không thì giải Gemfile rồi tạo lock |

> **Luôn commit `Gemfile.lock`.** Nó đảm bảo máy bạn, máy đồng đội và server production
> chạy **đúng cùng version gem** — tránh lỗi "chạy được ở máy tôi".

## Tạo app & cấu trúc thư mục

```bash
rails new blog --database=postgresql
cd blog
bin/rails server          # mở http://localhost:3000
```

Các thư mục cốt lõi:

```
blog/
├── app/
│   ├── models/           # Model — dữ liệu & business logic (ActiveRecord)
│   ├── views/            # View — template HTML (ERB)
│   ├── controllers/      # Controller — nhận request, điều phối
│   └── helpers/          # Helper — hàm dùng lại trong view
├── config/
│   ├── routes.rb         # Bảng định tuyến URL → controller#action
│   └── database.yml      # Cấu hình kết nối DB
├── db/
│   ├── migrate/          # Các file migration (thay đổi schema)
│   └── seeds.rb          # Dữ liệu khởi tạo
└── Gemfile               # Khai báo gem
```

## MVC & luồng một request

Rails theo mẫu **MVC** (Model – View – Controller): tách **dữ liệu**, **giao diện** và
**điều phối** ra 3 phần để dễ bảo trì.

- **Model** — đại diện dữ liệu và quy tắc nghiệp vụ (bảng `posts`, validation...).
- **View** — trình bày HTML gửi về trình duyệt.
- **Controller** — nhận request, gọi model, chọn view trả về.

Luồng một request khi user mở `/posts`:

```
Trình duyệt  →  config/routes.rb  →  PostsController#index  →  Post model (query DB)
                                              ↓
Trình duyệt  ←  HTML render        ←  app/views/posts/index.html.erb  ←  @posts
```

1. **Routes** khớp URL `/posts` với `PostsController#index`.
2. **Controller** chạy action `index`, hỏi **Model** `Post.all` lấy dữ liệu.
3. **Controller** đưa dữ liệu (`@posts`) sang **View**.
4. **View** render HTML, trả về trình duyệt.


![Luồng một HTTP request đi qua MVC: routes → controller → model → database → view](/images/ror-mvc-flow.png)

## Cạm bẫy hay gặp

- Chạy `ruby -v` ra version hệ thống thay vì version rbenv → chưa `eval "$(rbenv init -)"`
  trong `~/.zshrc`.
- Quên `bundle install` sau khi sửa `Gemfile` → lỗi `Could not find gem ...`.
- Không commit `Gemfile.lock` → mỗi máy cài version gem khác nhau, bug khó tái hiện.
- Sửa file trong `config/` mà không **restart server** → thay đổi không có tác dụng (khác
  với file trong `app/` thường auto-reload ở dev).

## Ghi nhớ

Rails "ẩn" rất nhiều thứ theo convention. Hiểu **thư mục nào chứa gì** và **luồng request
đi đâu** là chìa khóa để không bị lạc khi app lớn dần. Khi bí, tự hỏi: request này vào
route nào → controller nào → action nào?
