---
level: "advanced"
order: 10
title: "Tự động hóa kiểm thử cơ bản"
est: "4-6 giờ"
checklist:
  - "Giải thích được test pyramid và tại sao unit > integration > E2E về số lượng"
  - "Quyết định được test nào NÊN automate, test nào nên để manual"
  - "Viết được một API test cơ bản (kiểm status code, body, header)"
  - "Hiểu vai trò E2E test và một luồng Playwright điển hình (navigate → action → assert)"
  - "Biết cách tích hợp test vào CI để chạy tự động mỗi khi push code"
  - "Nhận diện nguyên nhân flaky test và cách giảm thiểu"
---

## Khi nào nên automate?

Automation **không thay thế** tester — nó gánh phần **lặp lại, ổn định, chạy nhiều lần**. Việc
cần phán đoán con người (usability, exploratory) vẫn để manual.

| Nên automate | Nên để manual |
|--------------|---------------|
| Regression chạy mỗi lần deploy | Exploratory testing (test khám phá) |
| Luồng ổn định, ít đổi | Feature mới, UI còn thay đổi liên tục |
| Nhiều tổ hợp data (data-driven) | Kiểm tra thẩm mỹ, trải nghiệm |
| Test API, tính toán | Case chạy 1-2 lần rồi bỏ |

## Test Pyramid

Nguyên tắc phân bổ: **nhiều unit, ít E2E**.

```
        /\        E2E     ← ít: chậm, giòn, đắt bảo trì
       /  \
      /----\     Integration  ← vừa: API, DB
     /      \
    /--------\   Unit    ← nhiều: nhanh, rẻ, ổn định
```

- **Unit** (dev viết): nhanh (mili-giây), chạy hàng nghìn cái. Nền của pyramid.
- **Integration / API**: kiểm module ghép với nhau — đây là **điểm ngọt cho QA** vì test được
  nhiều logic mà vẫn nhanh và ổn định hơn E2E.
- **E2E**: mô phỏng người dùng thật trên UI. Giá trị cao nhưng **chậm và dễ vỡ** — chỉ automate
  vài luồng quan trọng nhất (critical path: login, checkout).

> Anti-pattern **"ice cream cone"** (ngược pyramid): quá nhiều E2E, ít unit. Hậu quả: bộ test
> chạy chậm, hay đỏ vì lý do vặt, team mất niềm tin và bỏ luôn.

## API test

Test trực tiếp ở tầng API — nhanh và ổn định hơn UI. Kiểm 3 thứ: **status code, body, header**.

```
POST /api/login
Body: { "email": "test01@example.com", "password": "wrong" }

Kỳ vọng:
- Status: 401 Unauthorized
- Body:   { "error": "Invalid credentials" }
- KHÔNG lộ thông tin "email tồn tại nhưng sai mật khẩu" (tránh user enumeration)
```

Với Postman/Bruno, viết assertion ngay trong collection:

```javascript
pm.test("status là 401", () => pm.response.to.have.status(401));
pm.test("có message lỗi", () => {
  pm.expect(pm.response.json().error).to.eql("Invalid credentials");
});
```

## E2E với Playwright

E2E lái trình duyệt thật. Luồng điển hình: **navigate → action → assert**.

```javascript
test('login thành công vào được dashboard', async ({ page }) => {
  await page.goto('/login');                                  // navigate
  await page.fill('[name="email"]', 'test01@example.com');    // action
  await page.fill('[name="password"]', 'correct-pass');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/dashboard');                 // assert
  await expect(page.getByText('Xin chào')).toBeVisible();
});
```

> Chọn selector **ổn định**: ưu tiên `data-testid` hoặc role/label, tránh selector theo CSS
> class hay vị trí (`div > div:nth-child(3)`) — đổi UI một tí là vỡ.

## Tích hợp CI

Giá trị lớn nhất của automation: **chạy tự động mỗi khi push code**, chặn regression trước khi
lên prod.

```yaml
# .github/workflows/test.yml (rút gọn)
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm test              # unit + integration
      - run: npx playwright test   # E2E critical path
```

Nguyên tắc: test **đỏ thì chặn merge**. Nếu để merge được khi test đỏ, bộ test mất tác dụng.

## Flaky test — kẻ thù số 1

**Flaky test** = cùng code mà lúc pass lúc fail. Nó phá niềm tin: team bắt đầu "chạy lại cho
xanh" và bỏ qua fail thật.

| Nguyên nhân | Cách giảm |
|-------------|-----------|
| **Timing / race condition** | Dùng `waitFor`/auto-wait, không `sleep` cứng |
| **Phụ thuộc thứ tự / data chung** | Mỗi test tự setup + teardown data riêng |
| **Phụ thuộc mạng / service ngoài** | Mock/stub service không kiểm soát được |
| **Selector giòn** | Dùng `data-testid`, role, label |

> Test flaky **tệ hơn không có test**: nó tốn thời gian điều tra và làm mọi người mất tin vào
> cả bộ test. Thấy flaky thì **quarantine (tách ra) và sửa ngay**, đừng để tích tụ.

## Cạm bẫy hay gặp

- **Ice cream cone**: quá nhiều E2E, ít unit → chậm, giòn, tốn công bảo trì.
- **Automate cả feature còn đang đổi UI liên tục** → sửa test nhiều hơn sửa code.
- **Selector theo CSS/vị trí** → vỡ ngay khi refactor giao diện.
- **Dùng `sleep` cứng để chờ** → chậm và vẫn flaky; dùng auto-wait.
- **Cho merge khi test đỏ** → bộ test thành trang trí.
- **Bỏ qua flaky test** → mất niềm tin vào toàn bộ automation.

## Ghi nhớ

Automate phần **lặp lại, ổn định**; giữ manual cho **exploratory và thẩm mỹ**. Theo **test
pyramid**: nhiều unit, vừa phải integration/API, ít E2E cho critical path. Tích hợp **CI** để
test chạy mỗi lần push và **chặn merge khi đỏ**. Và luôn cảnh giác **flaky test** — nó tệ hơn
không có test, thấy là tách ra sửa ngay.
