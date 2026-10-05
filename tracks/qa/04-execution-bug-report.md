---
level: "intermediate"
order: 7
title: "Thực thi test & viết bug report chuẩn"
est: "3-4 giờ"
checklist:
  - "Chạy test theo quy trình: chuẩn bị → thực thi → ghi kết quả (pass/fail/blocked)"
  - "Viết được bug title rõ ràng theo công thức: nơi + hành động + hiện tượng"
  - "Phân biệt và gán đúng severity vs priority cho một bug"
  - "Viết step to reproduce đủ để dev tái hiện lỗi mà không cần hỏi lại"
  - "Ghi rõ actual vs expected và đính kèm evidence (ảnh/log/video)"
  - "Nắm được vòng đời bug: New → Open → Fixed → Retest → Closed/Reopen"
related:
  - "skill:nta-test-run"
  - "skill:nta-bug-report"
---

## Quy trình thực thi test

1. **Chuẩn bị**: xác nhận đúng môi trường, seed test data, đọc lại precondition.
2. **Thực thi**: chạy từng step, quan sát kỹ (không chỉ nhìn "có chạy" mà so với expected).
3. **Ghi kết quả**: gán trạng thái cho mỗi case.

| Trạng thái | Nghĩa |
|------------|-------|
| **Pass** | Actual = expected |
| **Fail** | Actual ≠ expected → tạo bug |
| **Blocked** | Không chạy được vì lỗi khác chặn / môi trường hỏng |
| **Skipped** | Cố tình bỏ (ngoài scope lần này) |

> Ghi kết quả **ngay khi test**, kèm ngày và môi trường. "Pass" hôm qua trên build cũ không
> có giá trị cho build hôm nay. `/nta-test-run` giúp chạy và sinh execution report pass/fail
> kèm evidence.

## Bug report — mắt xích quyết định giá trị QA

Tìm ra bug nhưng báo mù mờ khiến dev không tái hiện được thì công sức test coi như bỏ. Một
bug report tốt phải để **dev sửa được mà không cần hỏi lại**.

### Title rõ ràng

Công thức: **[Nơi] + [hành động] + [hiện tượng]**.

| Xấu | Tốt |
|-----|-----|
| "Lỗi login" | "[Màn hình Login] Nhập sai mật khẩu 5 lần không bị khóa tài khoản" |
| "Bị crash" | "[Giỏ hàng] Bấm 'Thanh toán' khi giỏ rỗng gây màn hình trắng" |

### Severity vs Priority — đừng nhầm

| | Định nghĩa | Ai quyết |
|---|-----------|----------|
| **Severity** | Mức nghiêm trọng về **kỹ thuật** (ảnh hưởng hệ thống) | QA |
| **Priority** | Mức **cần sửa gấp** (theo nghiệp vụ) | PM / PO |

Chúng độc lập nhau:

- **Severity cao + Priority thấp**: crash ở trang admin hiếm dùng → nghiêm trọng nhưng chưa gấp.
- **Severity thấp + Priority cao**: sai chính tả tên công ty trên trang chủ → nhỏ về kỹ thuật
  nhưng phải sửa ngay vì ảnh hưởng hình ảnh.

### Step to reproduce

Đánh số từng bước, cụ thể, kèm data thật đã dùng:

```
1. Đăng nhập bằng user test01@example.com
2. Vào "Giỏ hàng" (giỏ đang trống)
3. Bấm nút "Thanh toán"

Actual:   Màn hình trắng, console báo "Cannot read property 'total' of null"
Expected: Hiện thông báo "Giỏ hàng trống, vui lòng thêm sản phẩm"
```

### Actual vs Expected + Evidence

- **Actual**: hệ thống thực sự làm gì (mô tả + trích log lỗi nếu có).
- **Expected**: theo spec, đáng lẽ phải thế nào (dẫn spec/màn hình nếu được).
- **Evidence**: screenshot, video, log, request/response. Bug UI thì ảnh; bug API thì log +
  payload; bug chập chờn thì video.

> **Đừng che log lỗi**. Message như `NullPointerException at OrderService:88` là vàng cho
> dev. Nhưng **che PII/token** trong evidence trước khi đính kèm.

`/nta-bug-report` sinh bug report đúng format cho Backlog với đủ các phần trên.

## Vòng đời bug

```
New → Open (dev nhận) → Fixed (dev sửa xong) → Retest (QA test lại)
                                                    ├─ đạt → Closed
                                                    └─ chưa → Reopen → Open
```

Vai trò QA trong vòng đời:

- **Retest** bản fix trên đúng build đã sửa — không tin "dev bảo fixed rồi".
- **Regression**: kiểm tra fix có làm hỏng chỗ khác không (defect clustering).
- **Reject** nếu dev đóng bug là "không tái hiện" nhưng bạn tái hiện được → gửi lại kèm
  evidence rõ hơn.

## Cạm bẫy hay gặp

- **Title mơ hồ** ("lỗi", "không chạy") → dev không biết bug gì.
- **Thiếu step / thiếu data** → dev không tái hiện được, bug bị đóng "cannot reproduce".
- **Nhầm severity với priority** → sắp xếp sửa lỗi sai thứ tự.
- **Chỉ mô tả actual, quên expected** → dev không biết "đúng" là thế nào.
- **Không đính evidence** → tranh cãi qua lại tốn thời gian.
- **Tin "fixed" mà không retest** → bug lọt ra prod.

## Ghi nhớ

Ghi kết quả test **ngay** kèm build & môi trường. Bug report tốt = **title rõ + step tái hiện
được + actual vs expected + evidence**. Nhớ **severity (kỹ thuật, QA quyết) khác priority
(nghiệp vụ, PM quyết)**. Và luôn **retest + regression** bản fix — đừng tin lời "đã sửa xong".
