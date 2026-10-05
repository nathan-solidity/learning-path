---
level: "technical"
order: 14
title: "Đọc log & tra cứu khi có sự cố"
est: "3-4 giờ"
checklist:
  - "Phân biệt được các mức log: DEBUG, INFO, WARN, ERROR và ý nghĩa từng mức"
  - "Đọc được một dòng log và rút ra: khi nào, ở đâu, cái gì xảy ra"
  - "Dùng được từ khóa/timestamp để lọc ra dòng log liên quan đến một sự cố"
  - "Biết cung cấp thông tin gì cho dev để tái hiện bug (không chỉ nói 'nó lỗi')"
related:
  - "glossary:observability"
  - "skill:nta-bug-report"
  - "skill:nta-debug"
  - "playbook:qa"
---

## Vì sao BA cần đọc log

Khi khách báo "hệ thống lỗi", BA biết đọc log thì có thể **khoanh vùng vấn đề** trước khi
chuyển dev: lỗi xảy ra lúc nào, ở chức năng nào, có phải do dữ liệu đầu vào không. Điều
này rút ngắn vòng lặp qua lại và giúp viết bug report chất lượng.

BA không cần debug code — chỉ cần đọc hiểu log đủ để **mô tả chính xác** và **định vị**.

## Các mức log

| Mức | Ý nghĩa | BA quan tâm khi |
|-----|---------|-----------------|
| `DEBUG` | Chi tiết kỹ thuật cho dev | Hiếm khi, chỉ khi dev nhờ |
| `INFO` | Sự kiện bình thường ("user X đăng nhập") | Dựng lại timeline hành động |
| `WARN` | Bất thường nhưng chưa lỗi | Dấu hiệu sớm của vấn đề |
| `ERROR` | Có lỗi xảy ra | **Ưu tiên đọc đầu tiên** |

## Đọc một dòng log

```
2026-08-17 14:32:05 ERROR [OrderService] Failed to create order:
  insufficient balance, customerId=1042, amount=5000000
```

Rút ra:
- **Khi nào**: 14:32:05 ngày 17/08/2026
- **Ở đâu**: `OrderService` (chức năng tạo đơn)
- **Cái gì**: tạo đơn thất bại — không đủ số dư
- **Ngữ cảnh**: khách 1042, số tiền 5.000.000

→ Đây có thể **không phải bug** mà là nghiệp vụ đúng (chặn khi thiếu tiền). BA đọc log để
phân biệt "lỗi hệ thống" với "hành vi đúng nhưng khách hiểu nhầm".

## Lọc log liên quan

Log thật có hàng nghìn dòng. Cách khoanh vùng:
- **Theo thời gian**: khách báo lỗi lúc ~14:30 → tìm quanh mốc đó.
- **Theo từ khóa**: `grep ERROR`, hoặc lọc theo `customerId=1042`, mã đơn, request ID.
- **Theo request ID / trace ID**: nhiều hệ thống gắn ID cho mỗi request — lần theo ID đó
  thấy toàn bộ hành trình một thao tác.

## Thông tin cần cung cấp cho dev

Đừng chỉ nói "nó lỗi". Một bug report tốt gồm:
- **Khi nào** (timestamp chính xác), **ai** (user/account), **làm gì** (các bước).
- **Kỳ vọng** vs **thực tế**.
- **Dòng log ERROR** liên quan (nếu truy cập được), hoặc request ID.
- Môi trường (prod/staging), phiên bản.

> Càng đủ thông tin, dev càng tái hiện nhanh. Thiếu thông tin = vòng "cho anh xin thêm..."
> kéo dài nhiều ngày.

Công cụ: `/nta-bug-report` (viết bug report chuẩn Backlog), `/nta-debug` (phân tích lỗi
tương tác). Xem thêm playbook QA về cách ghi nhận sự cố.
