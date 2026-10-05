---
level: "advanced"
order: 15
title: "Chaos engineering & resilience testing"
est: "4-5 giờ"
checklist:
  - "Giải thích chaos engineering: chủ động tiêm lỗi để tìm điểm yếu TRƯỚC khi production tự phát hiện hộ"
  - "Mô tả quy trình một thí nghiệm chaos: giả thuyết → blast radius nhỏ → tiêm lỗi → quan sát → rút bài học"
  - "Kể các dạng lỗi hay tiêm: kill instance, thêm latency, ngắt mạng, cạn tài nguyên"
  - "Giải thích vì sao phải giới hạn blast radius và có nút dừng khẩn trước khi thử ở prod"
  - "Nhận ra điều kiện tiên quyết: cần monitoring và độ chín vận hành trước khi làm chaos"
---

## Đừng chờ production dạy bạn hệ thống yếu ở đâu

Bài SRE lo **xử lý sự cố khi nó xảy ra**. Chaos engineering đi trước một bước: **chủ động gây ra
sự cố có kiểm soát** để phát hiện điểm yếu **trong giờ hành chính, có sẵn người**, thay vì để nó
nổ lúc 3 giờ sáng.

> Mọi hệ thống phân tán đều có giả định ngầm "cái này sẽ luôn chạy". Chaos engineering là kỷ luật
> **kiểm chứng những giả định đó** bằng cách phá chúng có chủ đích. Bạn thà biết "mất một replica
> DB thì app treo" trong một thí nghiệm 10 phút, còn hơn biết nó khi khách hàng đang thanh toán.

## Quy trình một thí nghiệm chaos

Chaos không phải "rút dây điện xem sao" — đó là **thí nghiệm khoa học có kiểm soát**:

```
1. Giả thuyết   : "Nếu 1 pod app chết, LB sẽ định tuyến sang pod khác, user không nhận ra."
2. Blast radius : bắt đầu ở staging, hoặc 1% traffic prod — giới hạn thiệt hại tối đa.
3. Tiêm lỗi     : kill pod đó.
4. Quan sát     : error rate/latency có tăng không? Giả thuyết đúng hay sai?
5. Rút bài học  : đúng → tăng tự tin & blast radius. Sai → tìm ra điểm yếu, đi sửa.
```

> **Có giả thuyết trước.** Nếu bạn tiêm lỗi mà không dự đoán kết quả, bạn chỉ đang phá phách. Giá
> trị nằm ở khoảng cách giữa "tôi tưởng hệ thống sẽ chịu được" và "thực tế nó gục" — chỗ đó chính
> là điểm yếu cần sửa.

## Các dạng lỗi hay tiêm

| Dạng | Mô phỏng điều gì |
|------|------------------|
| **Kill instance/pod** | Node/pod chết đột ngột — test self-healing & failover |
| **Thêm latency** | Mạng chậm, service phụ thuộc lề mề — test timeout & circuit breaker |
| **Ngắt mạng / packet loss** | Mất kết nối giữa service — test retry & degradation |
| **Cạn tài nguyên** | CPU/RAM/disk đầy — test limit & backpressure |
| **Ngắt dependency** | DB/cache/API bên thứ ba down — test fallback & graceful degradation |

Đây là nơi kiểm chứng những thứ đã học: probe/self-healing (K8s), circuit breaking (service
mesh), retry/timeout, và fallback khi dependency chết.

## Blast radius & nút dừng khẩn

An toàn là điều kiện bắt buộc, không phải tùy chọn:

- **Giới hạn blast radius**: bắt đầu nhỏ nhất (một pod, staging, 1% traffic), mở rộng dần khi tự
  tin. Không bao giờ thí nghiệm đầu tiên chạy ở 100% prod.
- **Nút dừng khẩn (abort/halt)**: luôn có cách **dừng thí nghiệm ngay** và khôi phục, trước khi
  bắt đầu. Nếu metric vượt ngưỡng nguy hiểm → tự động abort.
- **Báo trước & có người trực**: chạy khi team sẵn sàng, không phải lén lút.

> Chaos engineering **giả lập** sự cố chứ không **gây ra** sự cố thật cho khách hàng. Ranh giới là
> blast radius và nút dừng. Không có hai thứ đó, bạn không làm chaos engineering — bạn đang tự tạo
> incident.

## Điều kiện tiên quyết — đừng làm quá sớm

> Chaos engineering **yêu cầu monitoring tốt trước đã**. Nếu bạn tiêm lỗi mà không **quan sát**
> được hệ thống phản ứng thế nào, bạn học được gì? Làm chaos trước khi có observability là mù mà
> đi phá. Cần trước: metric/log/trace (bài monitoring), độ chín xử lý incident (bài SRE), và một
> hệ thống *được thiết kế* để chịu lỗi. Team còn đang cháy vì sự cố thật hằng ngày thì **chưa phải
> lúc** tự tạo thêm.

## Cạm bẫy hay gặp

- **Tiêm lỗi không có giả thuyết** → chỉ phá phách, không rút ra bài học rõ ràng.
- **Thí nghiệm đầu chạy thẳng 100% prod** → biến thí nghiệm thành incident thật.
- **Không có nút dừng khẩn** → khi metric xấu, không kịp cắt.
- **Làm chaos khi chưa có monitoring** → tiêm lỗi mà không quan sát được, vô nghĩa.
- **Chỉ chạy một lần rồi thôi** → hệ thống đổi liên tục; điểm yếu mới sinh ra sau mỗi thay đổi.
- **Không sửa gì sau khi tìm ra điểm yếu** → biết mà không hành động thì thí nghiệm phí công.

## Ghi nhớ

**Chaos engineering** chủ động **tiêm lỗi có kiểm soát** để tìm điểm yếu trước khi production tự
phát hiện hộ. Mỗi thí nghiệm là khoa học: **giả thuyết → blast radius nhỏ → tiêm lỗi → quan sát →
rút bài học**. Luôn **giới hạn blast radius** và có **nút dừng khẩn** — chaos giả lập sự cố, không
gây sự cố thật. Và nó có **điều kiện tiên quyết**: cần **monitoring** và độ chín vận hành trước;
làm quá sớm chỉ là phá phách trong bóng tối.
