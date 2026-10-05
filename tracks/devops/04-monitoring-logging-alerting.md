---
level: "intermediate"
order: 6
title: "Monitoring, logging & alerting"
est: "5-6 giờ"
checklist:
  - "Phân biệt được 3 pillars of observability: metrics, logs, traces và khi nào dùng cái nào"
  - "Hiểu vai trò Prometheus (thu thập metric) và Grafana (dashboard) trong một setup giám sát"
  - "Giải thích được logging tập trung (ELK/Loki) giải quyết vấn đề gì so với log rải rác"
  - "Định nghĩa được SLI, SLO và error budget cho một service"
  - "Đặt alert dựa trên triệu chứng người dùng cảm nhận, tránh alert fatigue"
---

## 3 pillars of observability

Muốn biết hệ thống đang khỏe hay ốm, cần ba loại dữ liệu:

| Pillar | Trả lời câu hỏi | Ví dụ |
|--------|-----------------|-------|
| **Metrics** | "Bao nhiêu? Nhanh chậm ra sao?" | CPU 80%, latency p99 = 1.2s, 500/phút request |
| **Logs** | "Chuyện gì đã xảy ra ở dòng nào?" | `ERROR payment failed: card declined userId=42` |
| **Traces** | "Request này đi qua đâu, tắc ở service nào?" | request → gateway → order-svc → payment-svc (chậm ở đây) |

> Metrics cho biết **có vấn đề** (latency tăng vọt). Logs cho biết **vấn đề gì** (lỗi kết
> nối DB). Traces cho biết **ở đâu** (service payment). Cần cả ba để debug nhanh.

## Prometheus + Grafana

Bộ đôi kinh điển cho metrics:

- **Prometheus**: **pull** metric từ các service theo chu kỳ (scrape endpoint `/metrics`),
  lưu dạng time-series, cho phép truy vấn bằng PromQL.
- **Grafana**: vẽ **dashboard** và trực quan hóa dữ liệu từ Prometheus (và nhiều nguồn khác).

```yaml
# prometheus.yml — khai báo target để scrape
scrape_configs:
  - job_name: "my-app"
    scrape_interval: 15s
    static_configs:
      - targets: ["app:8080"]   # app expose /metrics ở port 8080
```

```promql
# PromQL: tỉ lệ lỗi 5xx trong 5 phút gần nhất
rate(http_requests_total{status=~"5.."}[5m])
```

## Logging tập trung

Khi có 20 container trên 5 server, `ssh` vào từng nơi `grep` log là ác mộng. **Logging tập
trung** gom toàn bộ log về một chỗ để tìm kiếm và tương quan:

- **ELK** = Elasticsearch (lưu + tìm) + Logstash (xử lý) + Kibana (giao diện).
- **Loki + Grafana** là lựa chọn nhẹ hơn, hợp nếu đã có Grafana.

> Log nên ở dạng **structured** (JSON) với các field như `timestamp`, `level`, `service`,
> `trace_id` — để lọc/tương quan được, thay vì chuỗi text tự do khó parse.

## SLI, SLO, error budget

Đo chất lượng dịch vụ theo góc nhìn **người dùng**, không phải theo CPU:

- **SLI** (Service Level Indicator): chỉ số đo được. Vd: *tỉ lệ request thành công*, *latency p99*.
- **SLO** (Service Level Objective): mục tiêu cho SLI. Vd: *99.9% request thành công trong 30 ngày*.
- **Error budget**: phần được phép hỏng = `100% - SLO`. Với SLO 99.9% → được phép lỗi 0.1%.

```
SLO = 99.9% uptime/tháng  →  error budget ≈ 43 phút downtime/tháng
Còn budget  → team được phép deploy tính năng mới nhanh
Hết budget  → dừng feature, tập trung ổn định
```

## Đặt alert đúng — tránh alert fatigue

Alert nên báo khi **người dùng thực sự bị ảnh hưởng**, không phải mỗi khi một metric nhích lên:

```yaml
# Alert dựa trên TRIỆU CHỨNG (tốt): tỉ lệ lỗi vượt ngưỡng trong 5 phút
- alert: HighErrorRate
  expr: rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.05
  for: 5m
  labels: { severity: critical }
  annotations:
    summary: "Tỉ lệ lỗi 5xx > 5% trong 5 phút"
```

| Nên | Không nên |
|-----|-----------|
| Alert theo **triệu chứng** (error rate, latency người dùng thấy) | Alert theo **nguyên nhân** đơn lẻ (CPU 80% mà user vẫn ổn) |
| Mỗi alert **cần hành động** | Alert chỉ để "biết cho vui" |
| Phân **severity** (critical gọi điện, warning ghi log) | Mọi thứ đều critical |

> **Alert fatigue**: khi báo động nổ liên tục vì cấu hình quá nhạy, người trực dần phớt lờ —
> rồi bỏ lỡ alert thật. Ít alert nhưng đúng còn hơn nhiều alert nhiễu.

## Cạm bẫy hay gặp

- **Chỉ có metrics, không có logs/traces** → biết hệ thống ốm nhưng không biết vì sao.
- **Log rải rác trên từng server** → không tìm được khi sự cố khẩn cấp.
- **Alert theo CPU/RAM** thay vì theo trải nghiệm người dùng → báo động sai, bỏ lỡ báo động thật.
- **Đặt quá nhiều alert** → alert fatigue, cả team ngó lơ.
- **Không có SLO** → không biết "chậm bao nhiêu là chấp nhận được", tranh cãi cảm tính.
- **Log để mãi không xoay vòng** (rotate) → đầy ổ đĩa, service chết.

## Ghi nhớ

Observability đứng trên **3 chân**: metrics (bao nhiêu), logs (chuyện gì), traces (ở đâu).
**Prometheus** thu metric, **Grafana** vẽ dashboard, **ELK/Loki** gom log tập trung. Đo chất
lượng bằng **SLI/SLO + error budget** theo góc nhìn người dùng. Đặt **alert theo triệu chứng
cần hành động** để tránh **alert fatigue**.
