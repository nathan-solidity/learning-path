---
level: "advanced"
order: 9
title: "Cost, scaling & performance tại scale"
est: "5-6 giờ"
checklist:
  - "Phân biệt scale dọc (vertical) và scale ngang (horizontal), và khi nào chọn cái nào"
  - "Giải thích autoscaling theo metric và vì sao cần cả scale-out lẫn scale-in"
  - "Kể tên các nguồn tốn tiền cloud phổ biến và cách phát hiện lãng phí (idle, over-provision, egress)"
  - "Chạy được load test để tìm điểm nghẽn trước khi production gặp, và đọc p95/p99 latency"
  - "Nhận ra khi nào CHƯA cần scale/tối ưu để tránh over-engineering"
related:
  - "skill:nta-load-test-plan"
  - "skill:nta-scale-check"
---

## Scale và cost là hai mặt của một đồng xu

Hệ thống lớn lên thì phải scale; scale thì tốn tiền. DevOps giỏi không phải người "cho nhiều
tài nguyên nhất" mà là người cho **đủ để chịu tải, không thừa để đốt tiền** — và biết **khi nào
chưa cần làm gì cả**.

## Vertical vs horizontal scaling

| Kiểu | Nghĩa | Ưu | Nhược |
|------|-------|-----|-------|
| **Vertical (dọc)** | Cho máy to hơn (thêm CPU/RAM) | Đơn giản, không đổi kiến trúc | Có trần, phải restart, single point of failure |
| **Horizontal (ngang)** | Thêm nhiều máy/instance | Gần như không trần, chịu lỗi tốt | Cần app **stateless** + load balancer |

> Vertical đụng trần vật lý và vẫn là một điểm chết duy nhất. Horizontal mới là con đường của
> hệ thống lớn — nhưng nó **đòi app stateless**: mọi state (session, file upload, cache) phải ra
> ngoài (DB, Redis, object storage), không giữ trong bộ nhớ một instance.

## Autoscaling

Thay vì fix cứng số instance, **autoscale** theo tải thực tế:

```
Metric (CPU/RAM/request-rate/queue-length) vượt ngưỡng → scale-out (thêm instance)
Metric xuống dưới ngưỡng                                 → scale-in  (bớt instance)
```

- **Scale-out** cứu bạn khi tải tăng đột biến (flash sale, viral).
- **Scale-in** mới là chỗ **tiết kiệm tiền** — nhiều team quên bước này, giữ nguyên đỉnh cả ngày.
- Đặt **min/max** hợp lý: min đủ để chịu baseline + đột biến ngắn, max để chặn hóa đơn chạy loạn.

> Cẩn thận **thrashing**: ngưỡng quá nhạy khiến hệ thống liên tục thêm/bớt instance, vừa tốn vừa
> bất ổn. Đặt cooldown và ngưỡng scale-in thấp hơn scale-out để tạo vùng đệm.

## Cost — tiền cloud chảy đi đâu

Những nguồn đốt tiền phổ biến và cách phát hiện:

| Nguồn lãng phí | Dấu hiệu | Cách xử lý |
|----------------|----------|-----------|
| **Over-provision** | CPU/RAM dùng < 20% thường xuyên | Giảm size, bật autoscale-in |
| **Idle resource** | Instance/DB dev bật 24/7 nhưng chỉ dùng giờ hành chính | Tắt ngoài giờ, schedule |
| **Egress traffic** | Chuyển data ra ngoài/cross-region nhiều | Dùng CDN, gom region, cache |
| **Storage cũ** | Snapshot/log/backup không ai xóa | Đặt lifecycle policy tự dọn |
| **Zombie** | LB/IP/volume không gắn với gì | Audit định kỳ, dọn resource mồ côi |

> Egress (data đi ra) thường là hóa đơn "bất ngờ" nhất — data đi **vào** cloud hay miễn phí, đi
> **ra** thì tính tiền. Một API trả payload to cho hàng triệu request, hoặc backup cross-region,
> có thể tốn hơn cả tiền compute.

## Load test — tìm điểm nghẽn trước

Đừng để production là nơi đầu tiên bạn biết hệ thống chịu được bao nhiêu. **Load test** đẩy tải
giả lập để tìm giới hạn:

- **Smoke**: tải nhẹ, kiểm tra script/hệ thống chạy đúng.
- **Load**: tải mục tiêu (VD 1000 user đồng thời) — có đạt SLO không?
- **Stress**: đẩy tới khi **gãy** — để biết trần thật và cách nó gãy.

Đọc kết quả bằng **percentile**, không phải trung bình:

> **p95/p99 quan trọng hơn latency trung bình.** Trung bình 200ms nghe êm, nhưng p99 = 5s nghĩa
> là **1% request chậm 5 giây** — và 1% của hàng triệu request là rất nhiều user bực bội. Trung
> bình che giấu cái đuôi; percentile phơi nó ra.

## Khi nào CHƯA cần scale

Quan trọng ngang việc biết cách scale là biết **khi nào đừng**:

- Traffic còn nhỏ, server rảnh → **thêm Redis/K8s/queue lúc này là over-engineering**, thêm
  thứ phải vận hành mà chưa giải quyết vấn đề thật.
- Chậm vì **một query thiếu index** → sửa query, đừng vội thêm cache/instance che triệu chứng.
- Chưa **đo** (chưa có metric/load test) → đừng tối ưu theo cảm tính; **profile trước, tối ưu sau**.

> Giải pháp scale luôn kèm chi phí vận hành (thêm hạ tầng để trông coi, thêm chỗ để hỏng). Chỉ
> trả cái giá đó khi có **bằng chứng** cần nó. Tối ưu sớm cái không phải nghẽn là lãng phí kép.

## Cạm bẫy hay gặp

- **Scale ngang mà app còn stateful** (giữ session/file trong instance) → user rớt phiên khi bị LB đổi instance.
- **Quên scale-in** → giữ nguyên đỉnh 24/7, đốt tiền cho tải không tồn tại.
- **Tối ưu theo cảm tính** không đo đạc → sửa nhầm chỗ không phải nghẽn.
- **Nhìn latency trung bình** bỏ qua p95/p99 → không thấy cái đuôi làm khổ user thật.
- **Thêm Redis/Kafka/K8s "cho sẵn sàng tương lai"** khi tải còn nhỏ → gánh vận hành vô ích.
- **Không đặt max cho autoscale** → một đợt tải bất thường/bug làm hóa đơn phi mã.

## Ghi nhớ

Scale **ngang** (cần app **stateless**) là đường của hệ thống lớn; **vertical** đơn giản nhưng có
trần. **Autoscale** cả out lẫn **in** — scale-in mới là chỗ tiết kiệm. Săn lãng phí cloud ở
**over-provision, idle, egress, zombie resource**. **Load test** tìm nghẽn trước production và đọc
**p95/p99** thay vì trung bình. Và nguyên tắc bao trùm: **đo trước, tối ưu sau** — biết khi nào
CHƯA cần scale để tránh over-engineering cũng quan trọng như biết cách scale.
