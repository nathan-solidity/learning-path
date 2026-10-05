---
level: "operations-advanced"
order: 17
title: "Hiệu năng & Bảo mật"
est: "4-5 giờ"
checklist:
  - "Phát hiện N+1 query bằng Bullet và sửa bằng includes/eager loading"
  - "Dùng rack-mini-profiler để tìm request/action chậm"
  - "Tránh SQL injection: dùng parameterized query, không nội suy chuỗi vào where"
  - "Hiểu Rails chống CSRF/XSS mặc định thế nào và khi nào mình vô tình tắt nó"
  - "Thêm rate limiting cho endpoint nhạy cảm bằng rack-attack"
---

## Rails an toàn mặc định — nhưng đừng chủ quan

Rails bật sẵn nhiều lớp bảo vệ (CSRF token, auto-escape HTML, parameterized query). Đa số
lỗ hổng đến từ việc lập trình viên **vô tình tắt** chúng — nội suy chuỗi vào SQL, gọi
`html_safe` bừa. Hiểu cơ chế để không tự phá lớp bảo vệ.

## Hiệu năng: N+1 query với Bullet

N+1 là thủ phạm chậm phổ biến nhất: lặp qua N bản ghi, mỗi vòng lại query DB một lần.

```ruby
# Gemfile
group :development, :test do
  gem "bullet"
end
```

```ruby
# config/environments/development.rb
config.after_initialize do
  Bullet.enable = true
  Bullet.alert  = true # popup cảnh báo ngay trên trang
end
```

Bullet la lên khi thấy N+1. Sửa bằng eager loading:

```ruby
# ❌ N+1: mỗi post lại query author riêng
@posts = Post.all
@posts.each { |p| puts p.author.name }

# ✅ 1 query gộp
@posts = Post.includes(:author)
```


![N+1 query (1 + N truy vấn) so với eager loading bằng includes (chỉ 2 truy vấn)](/images/ror-n1-query.png)

## Tìm chỗ chậm với rack-mini-profiler

```ruby
# Gemfile (development)
gem "rack-mini-profiler"
```

Nó chèn một badge thời gian ở góc trang, bấm vào xem breakdown: SQL nào chậm, view nào
render lâu. Kết hợp với Bullet để khoanh vùng trước khi tối ưu — **đo trước, tối ưu sau**,
đừng đoán.

## SQL Injection — nguy hiểm nhất, dễ tránh nhất

```ruby
# ❌ nội suy chuỗi — kẻ xấu truyền "' OR 1=1 --" là lộ toàn bộ
User.where("email = '#{params[:email]}'")

# ✅ parameterized — Rails tự escape
User.where("email = ?", params[:email])
User.where(email: params[:email]) # hash form, an toàn nhất
```

> Quy tắc: **không bao giờ** nhét `params` trực tiếp vào chuỗi SQL. Luôn dùng placeholder
> `?` hoặc named `:key`, hoặc hash condition.

## CSRF, XSS, Strong Parameters

**CSRF** — Rails tự chèn token vào form và verify. Chỉ tắt cho API (dùng token khác thay thế):

```ruby
class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception # mặc định đã bật
end
```

**XSS** — ERB **tự escape** mọi output `<%= %>`. Bạn chỉ dính XSS khi tự phá nó:

```erb
<%= @comment.body %>              <!-- ✅ an toàn, HTML bị escape -->
<%= raw @comment.body %>          <!-- ⚠️ nguy hiểm nếu body từ user -->
<%= @comment.body.html_safe %>    <!-- ⚠️ tương tự, chỉ dùng khi CHẮC nội dung sạch -->
```

**Strong Parameters** — chặn mass-assignment, chỉ cho phép cột được khai báo:

```ruby
def user_params
  params.require(:user).permit(:name, :email) # KHÔNG permit :admin, :role
end
```

Quên strong params → user tự set `admin: true` qua form. Đây là lỗi kinh điển.

## Rate limiting / throttling với rack-attack

Chặn brute-force login, lạm dụng API:

```ruby
# config/initializers/rack_attack.rb
class Rack::Attack
  # tối đa 5 lần login/phút theo IP
  throttle("login/ip", limit: 5, period: 60.seconds) do |req|
    req.ip if req.path == "/login" && req.post?
  end

  # giới hạn API 100 request/phút
  throttle("api/ip", limit: 100, period: 60.seconds) do |req|
    req.ip if req.path.start_with?("/api/")
  end
end
```

## Cạm bẫy hay gặp

| Lỗi | Hậu quả | Cách đúng |
|-----|---------|-----------|
| Nội suy `params` vào `where("...")` | SQL injection | Dùng `?` hoặc hash |
| `raw` / `html_safe` nội dung từ user | XSS | Để ERB tự escape |
| `permit!` hoặc quên strong params | Mass-assignment | Chỉ permit cột an toàn |
| Không giới hạn login | Brute-force | rack-attack throttle |
| Tối ưu khi chưa đo | Phí công, sai chỗ | Bullet + profiler trước |

## Ghi nhớ

Bảo mật Rails phần lớn là **đừng tắt cái nó đang bảo vệ bạn**. Hiệu năng thì **đo trước
khi tối ưu**.
