---
level: "operations-advanced"
order: 16
title: "Testing nâng cao & CI/CD"
est: "4-5 giờ"
checklist:
  - "Đo được test coverage bằng SimpleCov và biết đọc con số đó cho đúng"
  - "Viết được CI workflow chạy rspec tự động khi push/PR"
  - "Viết được một E2E test với Capybara mô phỏng thao tác người dùng"
  - "Chạy được browser test ở chế độ headless trên CI"
  - "Hiểu tháp test: unit nhiều, integration vừa, E2E ít"
---

## Vì sao cần CI và coverage

Viết test là một chuyện, **đảm bảo chúng luôn chạy** là chuyện khác. CI (Continuous
Integration) chạy toàn bộ test tự động mỗi khi có push/PR — không ai merge được code làm
đỏ test. Coverage cho biết **phần nào của code chưa hề được test chạm tới**.

> Coverage cao **không** đồng nghĩa test tốt. 100% coverage vẫn có thể test rỗng (chạy code
> mà không assert gì). Coverage chỉ giúp phát hiện vùng **hoàn toàn** bỏ quên.

## Đo coverage với SimpleCov

```ruby
# Gemfile
group :test do
  gem "simplecov", require: false
end
```

```ruby
# spec/spec_helper.rb — PHẢI đứng đầu file, trước khi require code app
require "simplecov"
SimpleCov.start "rails" do
  add_filter "/spec/"
  minimum_coverage 80 # CI fail nếu coverage tụt dưới 80%
end
```

Chạy `bundle exec rspec` xong mở `coverage/index.html` để xem dòng nào chưa được chạy.

## E2E test với Capybara + Selenium

Unit test kiểm tra từng method; **E2E** (system test) mô phỏng người dùng thật click qua
trình duyệt. Rails có sẵn system test dùng Capybara:

```ruby
# spec/system/login_spec.rb
require "rails_helper"

RSpec.describe "Đăng nhập", type: :system do
  before { driven_by(:selenium_chrome_headless) } # headless: không mở cửa sổ browser

  it "vào được dashboard sau khi đăng nhập đúng" do
    user = create(:user, password: "secret123")
    visit login_path
    fill_in "Email", with: user.email
    fill_in "Mật khẩu", with: "secret123"
    click_button "Đăng nhập"

    expect(page).to have_content("Xin chào, #{user.email}")
  end
end
```

`selenium_chrome_headless` cho phép chạy trên CI (không có màn hình). Local muốn xem
browser thật thì đổi thành `:selenium_chrome`.

## CI với GitHub Actions

Tạo file workflow — mỗi lần push/PR, GitHub dựng môi trường sạch, cài gem, chạy rspec:

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres: # DB thật cho test, không mock
        image: postgres:16
        env:
          POSTGRES_PASSWORD: postgres
        ports: ["5432:5432"]
        options: >-
          --health-cmd pg_isready --health-interval 10s
          --health-timeout 5s --health-retries 5
    env:
      RAILS_ENV: test
      DATABASE_URL: postgres://postgres:postgres@localhost:5432
    steps:
      - uses: actions/checkout@v4
      - uses: ruby/setup-ruby@v1
        with:
          bundler-cache: true # cache gem, chạy nhanh hơn nhiều
      - name: Setup DB
        run: bin/rails db:schema:load
      - name: Run tests
        run: bundle exec rspec
```

GitLab CI tương đương dùng `.gitlab-ci.yml` với `stage: test` và cùng logic (service
postgres + `bundle exec rspec`).

## Tháp test — cân bằng cho đúng

```
        /\      E2E (ít)     — chậm, giòn, chỉ cho luồng quan trọng
       /  \     Integration  — request/controller specs
      /____\    Unit (nhiều) — model, service; nhanh, ổn định
```

Đừng viết mọi thứ thành E2E — chúng chậm và hay flaky. Ưu tiên unit test cho logic, E2E
chỉ cho vài luồng sống-còn (đăng nhập, thanh toán).

## Cạm bẫy hay gặp

- `require "simplecov"` đặt SAI vị trí (không ở đầu) → coverage báo thiếu vô căn cứ.
- E2E flaky do timing → dùng `have_content` (Capybara tự chờ), tránh `sleep` cứng.
- Quên `bundler-cache: true` → CI chạy chậm gấp nhiều lần.
- Chạy đuổi theo con số coverage → viết test rỗng. Test **hành vi**, không test để lấp số.
