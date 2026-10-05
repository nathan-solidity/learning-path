---
level: "advanced"
order: 11
title: "Performance & load testing"
est: "4-5 giờ"
checklist:
  - "Phân biệt các loại: load, stress, spike, soak (endurance) test"
  - "Đọc đúng metric: throughput, latency p50/p95/p99, error rate, concurrent users"
  - "Hiểu vì sao dùng percentile (p95/p99) thay vì trung bình khi đánh giá độ nhanh"
  - "Thiết kế một kịch bản load test bám hành vi người dùng thật, không bắn phẳng"
  - "Đọc kết quả để tìm điểm gãy (breaking point) và nghi phạm bottleneck"
related:
  - "skill:nta-load-test-plan"
  - "skill:nta-load-test-run"
---

## Đúng với 1 người, sập với 1000 người

Functional test chạy với một user. Nhưng production có hàng trăm, hàng nghìn người cùng lúc.
**Performance testing** trả lời: hệ thống **nhanh đến đâu** và **chịu được bao nhiêu** trước khi
gãy. Đây là non-functional mà QA hay được giao, và nối thẳng với hạ tầng bên DevOps.

## Bốn loại test tải

| Loại | Câu hỏi | Cách chạy |
|------|---------|-----------|
| **Load** | Chịu tải **dự kiến** tốt không? | Tăng dần tới mức tải bình thường/cao điểm |
| **Stress** | Gãy ở đâu, gãy thế nào? | Đẩy vượt giới hạn tới khi hỏng |
| **Spike** | Chịu được cú tăng đột ngột? | Tăng vọt tức thì (flash sale, viral) |
| **Soak** | Chạy lâu có rò rỉ/xuống cấp? | Giữ tải vừa trong nhiều giờ |

> Mỗi loại trả lời một câu khác nhau. Load hỏi "ngày thường ổn không". Stress hỏi "giới hạn ở
> đâu và khi vỡ thì vỡ có kiểm soát hay sập thẳng". Spike hỏi "flash sale có chịu nổi". Soak
> bắt **memory leak** — thứ chỉ lộ sau vài giờ chạy, load test ngắn không bao giờ thấy.

## Đọc metric cho đúng

| Metric | Nghĩa |
|--------|-------|
| **Throughput** | Số request/giây hệ thống xử lý được |
| **Latency** | Thời gian phản hồi một request |
| **Error rate** | % request lỗi/timeout — tăng là dấu hiệu quá tải |
| **Concurrent users** | Số người dùng đồng thời đang mô phỏng |

## Percentile, không phải trung bình

Sai lầm kinh điển: đánh giá độ nhanh bằng **trung bình**. Trung bình che giấu người dùng khổ nhất.

```
100 request: 95 cái mất 100ms, 5 cái mất 5000ms
Trung bình = 345ms  → nghe ổn
p95        = 100ms  ✓
p99        = 5000ms → 1% user chờ 5 giây!
```

> "Trung bình 345ms" nghe chấp nhận được, nhưng nó **giấu** việc 5% người dùng đang chờ 5 giây
> — đủ để họ bỏ đi. **p95 = 95% request nhanh hơn ngưỡng này**; **p99** soi cái đuôi tệ nhất.
> Luôn đặt SLA theo percentile ("p95 < 500ms"), không bao giờ theo trung bình. Cái đuôi mới là
> nơi khách hàng thật sự đau.

## Kịch bản phải giống người thật

Load test bắn 10.000 request phẳng vào một endpoint là **sai**. Người thật đi theo **luồng**:

```
Kịch bản "mua hàng" điển hình:
1. Vào trang chủ            (nghĩ 3s)
2. Tìm sản phẩm            (nghĩ 5s)
3. Xem chi tiết            (nghĩ 8s)
4. Thêm giỏ + thanh toán   (nghĩ 10s)
```

- **Think time**: người thật dừng giữa các thao tác; bỏ nó đi là tạo tải phi thực tế.
- **Ramp-up**: tăng user dần dần, không bật 5000 user tức thì (trừ khi cố ý test spike).
- **Data đa dạng**: mỗi user dùng account/sản phẩm khác nhau, tránh cache che mất tải thật.

> Kịch bản không giống hành vi thật cho kết quả vô nghĩa: hoặc lạc quan giả (chỉ hit endpoint
> nhẹ), hoặc bi quan giả (bắn phẳng endpoint nặng nhất không nghỉ). Mô phỏng đúng luồng và think
> time thì con số mới đáng tin để ra quyết định go/no-go.

## Đọc kết quả — tìm điểm gãy

Mục tiêu không phải "chạy cho có số" mà tìm **breaking point** và **nghi phạm**:

- Latency tăng vọt ở một mức user cụ thể → đó là **giới hạn chịu tải**.
- Error rate nhảy lên → hệ thống bắt đầu từ chối/timeout.
- CPU/RAM/DB connection cắm trần khi gãy → chỉ ra **bottleneck** (thường là DB, connection pool,
  hay một service chậm) — nối với bài Database ops & cost/scaling bên DevOps.

## Công cụ

`/nta-load-test-plan` lập kế hoạch load test và sinh script (k6/JMeter/Locust) từ spec;
`/nta-load-test-run` chạy script k6, validate và sinh báo cáo. Bạn tập trung vào **thiết kế
kịch bản đúng** và **đọc kết quả** — hai phần máy không làm thay được.

## Cạm bẫy hay gặp

- **Đánh giá bằng trung bình** → giấu mất cái đuôi p99, nơi user thật khổ nhất.
- **Bắn request phẳng, bỏ think time** → tải phi thực tế, con số vô nghĩa.
- **Không ramp-up** (bật full tải tức thì) → test nhầm thành spike, hiểu sai giới hạn.
- **Dùng chung một account/data** → cache che mất tải DB thật.
- **Load test trên môi trường khác prod** → kết quả không suy ra được cho prod.
- **Chỉ chạy load, bỏ soak** → không bắt được memory leak lộ sau nhiều giờ.

## Ghi nhớ

Bốn loại: **load** (tải dự kiến), **stress** (tìm điểm gãy), **spike** (tăng đột ngột), **soak**
(rò rỉ theo thời gian). Đánh giá độ nhanh bằng **percentile p95/p99**, không bao giờ bằng trung
bình — cái đuôi mới là nơi khách đau. Kịch bản phải **giống hành vi thật**: có think time,
ramp-up, data đa dạng. Đọc kết quả để tìm **breaking point** và **bottleneck**. Dùng
`/nta-load-test-plan` + `/nta-load-test-run` để sinh và chạy script.
