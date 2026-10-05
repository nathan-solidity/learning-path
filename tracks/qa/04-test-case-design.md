---
level: "basic"
order: 4
title: "Kỹ thuật thiết kế test case"
est: "3-4 giờ"
checklist:
  - "Áp dụng được equivalence partitioning để gom input thành các lớp tương đương"
  - "Xác định đúng các giá trị biên (boundary value) cần test cho một khoảng số"
  - "Lập được decision table cho logic có nhiều điều kiện kết hợp"
  - "Vẽ được state transition cho một luồng có nhiều trạng thái (đơn hàng, tài khoản)"
  - "Viết một test case đủ 3 phần: precondition, step, expected result"
  - "Gán độ ưu tiên (priority) cho test case theo rủi ro và tần suất dùng"
related:
  - "skill:nta-test-case"
  - "skill:nta-test-case-review"
---

## Vì sao cần kỹ thuật thiết kế?

Không thể test mọi input (nguyên tắc "exhaustive testing bất khả thi"). Kỹ thuật thiết kế
giúp bạn **chọn ít case nhưng bắt được nhiều lỗi** — thay vì test mò.

## Equivalence Partitioning (phân lớp tương đương)

Gom input thành các **lớp mà hệ thống xử lý giống nhau**. Chỉ cần test **1 giá trị đại diện**
mỗi lớp, không cần test hết.

Ví dụ ô "tuổi" cho phép **18–60**:

| Lớp | Khoảng | Đại diện | Kỳ vọng |
|-----|--------|----------|---------|
| Dưới hợp lệ | < 18 | 15 | Báo lỗi |
| Hợp lệ | 18–60 | 30 | Chấp nhận |
| Trên hợp lệ | > 60 | 70 | Báo lỗi |
| Không phải số | "abc" | abc | Báo lỗi |

Thay vì test 15, 16, 17... bạn chỉ cần 4 case đại diện.

## Boundary Value Analysis (giá trị biên)

Lỗi hay nằm ở **ranh giới** (`<` viết nhầm thành `<=`). Với khoảng 18–60, test ngay các biên:

![Equivalence chọn 1 đại diện mỗi lớp; boundary test 2 bên mỗi biên: 17,18 và 60,61](/images/qa-boundary.png)

Quy tắc: với mỗi biên, test **giá trị ngay dưới, giá trị biên, và giá trị ngay trên**. Kết
hợp equivalence + boundary là bộ đôi mạnh nhất cho input dạng khoảng.

## Decision Table (bảng quyết định)

Dùng khi output phụ thuộc **nhiều điều kiện kết hợp**. Liệt kê mọi tổ hợp điều kiện → hành
động tương ứng.

Ví dụ giảm giá: là thành viên VIP? đơn ≥ 1 triệu?

| Điều kiện \ Rule | R1 | R2 | R3 | R4 |
|------------------|----|----|----|----|
| Là VIP | Y | Y | N | N |
| Đơn ≥ 1tr | Y | N | Y | N |
| **→ Giảm giá** | 20% | 10% | 5% | 0% |

Mỗi cột (rule) là 1 test case. Bảng buộc bạn không bỏ sót tổ hợp nào.

## State Transition (chuyển trạng thái)

Dùng cho đối tượng có **nhiều trạng thái** và luồng chuyển giữa chúng — đơn hàng, tài khoản,
ticket. Vẽ ra để test cả **chuyển hợp lệ** lẫn **chuyển không hợp lệ**.

![Sơ đồ trạng thái đơn hàng: các chuyển hợp lệ, và chuyển bị cấm cần test để đảm bảo bị chặn](/images/qa-state-transition.png)

Case quan trọng: chuyển **không hợp lệ** phải bị chặn — ví dụ "Đã huỷ" không được chuyển
thành "Đang giao". Bug hay lọt ở đây.

## Cấu trúc một test case tốt

Mỗi test case cần đủ 3 phần, viết để **người khác chạy lại được mà không hỏi**:

| Phần | Nội dung | Ví dụ |
|------|----------|-------|
| **Precondition** | Trạng thái trước khi chạy | User đã login, giỏ hàng có 1 sản phẩm giá 500k |
| **Step** | Các bước cụ thể, đánh số | 1. Nhập mã "VIP20". 2. Bấm "Áp dụng" |
| **Expected result** | Kết quả mong đợi, đo được | Tổng tiền giảm còn 400k, hiện "Đã áp dụng VIP20" |

> Expected result phải **cụ thể và đo được**. Viết "hoạt động đúng" là vô nghĩa — đúng là bao
> nhiêu, hiện thông báo gì?

## Độ ưu tiên (priority)

Không phải case nào cũng quan trọng như nhau. Ưu tiên theo:

- **Rủi ro**: hỏng thì thiệt hại lớn không? (thanh toán > đổi avatar)
- **Tần suất dùng**: luồng login dùng mỗi ngày > trang cài đặt hiếm vào.
- **Khả năng có bug**: module mới sửa, logic phức tạp → ưu tiên cao.

Gán `High / Medium / Low` để khi thiếu thời gian còn biết chạy cái nào trước.

## Cạm bẫy hay gặp

- **Chỉ test giá trị giữa lớp, bỏ biên** → lọt lỗi `<` vs `<=`.
- **Bỏ tổ hợp điều kiện** trong logic phức tạp → dùng decision table để không sót.
- **Quên test chuyển trạng thái không hợp lệ** → cho phép hành động cấm.
- **Expected result mơ hồ** ("chạy ok") → người khác không verify được.
- **Không gán priority** → khi gấp không biết cắt case nào.

## Ghi nhớ

Bốn kỹ thuật lõi: **equivalence partitioning** (gom lớp), **boundary value** (test biên),
**decision table** (tổ hợp điều kiện), **state transition** (luồng trạng thái). Mỗi test case
phải đủ **precondition + step + expected result** đo được, và có **priority** để biết chạy
cái nào trước khi thiếu thời gian.
