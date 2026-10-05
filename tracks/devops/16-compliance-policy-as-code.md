---
level: "advanced"
order: 16
title: "Compliance & policy as code"
est: "4-5 giờ"
checklist:
  - "Giải thích policy as code: mã hóa quy tắc tổ chức thành luật máy kiểm tra tự động"
  - "Phân biệt policy chặn ở pipeline (shift-left) và policy chặn ở runtime (admission control)"
  - "Hiểu audit trail và vì sao GitOps + IaC khiến 'ai đổi gì, khi nào' luôn truy được"
  - "Kể ví dụ policy hay gặp: cấm image latest, bắt buộc resource limit, chặn bucket public"
  - "Nhận ra khi nào compliance là bắt buộc (regulated) và khi nào nhẹ tay để không cản team"
---

## Governance mà không thành nút thắt

Ở môi trường lớn hoặc bị quản lý (tài chính, y tế, dữ liệu cá nhân), có những quy tắc **bắt
buộc**: không bucket public, mọi resource phải mã hóa, mọi thay đổi phải truy được. Kiểm tra tay
thì chậm và bỏ sót. **Policy as code** biến quy tắc thành **luật máy tự kiểm** — governance chạy
ở tốc độ tự động hóa, không phải tốc độ review tay.

> Compliance kiểu cũ = một người cầm checklist duyệt từng thay đổi → nút thắt, và con người thì bỏ
> sót. Policy as code = quy tắc thành code, **cổng tự động** chặn thứ vi phạm ngay lúc tạo ra. Vừa
> nhanh hơn, vừa nhất quán hơn, vừa không ai lách được vì "reviewer hôm nay dễ tính".

## Policy as code

Viết quy tắc dưới dạng code máy đánh giá được (ví dụ OPA/Rego, Kyverno, Sentinel):

```rego
# Ví dụ: từ chối mọi Deployment dùng image :latest
deny[msg] {
  input.kind == "Deployment"
  image := input.spec.template.spec.containers[_].image
  endswith(image, ":latest")
  msg := "Cấm dùng image :latest — phải pin version cụ thể"
}
```

Cùng bộ luật này áp cho mọi team, mọi lúc — không phụ thuộc ai đang review.

## Shift-left vs runtime

Có hai chỗ để đặt cổng policy, và nên đặt **cả hai**:

| Chỗ chặn | Khi nào | Ưu điểm |
|----------|---------|---------|
| **Pipeline (shift-left)** | Lúc PR/CI, trước khi merge/deploy | Phản hồi sớm cho dev, chặn trước khi vào cluster |
| **Runtime (admission control)** | Lúc apply vào K8s | Chặn cả thứ lách qua pipeline hoặc sửa tay |

> Chặn ở pipeline cho dev feedback nhanh nhất (sai là biết ngay lúc CI đỏ), nhưng **không đủ** —
> ai đó vẫn có thể `kubectl apply` tay lách qua. **Admission controller** ở runtime là hàng rào
> cuối: cluster từ chối nhận resource vi phạm dù nó tới từ đâu. Shift-left để nhanh, runtime để chắc.

## Audit trail — ai đổi gì, khi nào

Compliance đòi **truy được mọi thay đổi**. Đây là chỗ những bài trước cộng hưởng:

- **GitOps**: mọi thay đổi qua PR merge → git history *chính là* audit log, có tác giả, thời
  gian, người duyệt, lý do.
- **IaC**: hạ tầng thành code → thay đổi hạ tầng cũng để lại dấu vết như thay đổi code.
- **Cloud audit log** (CloudTrail...): ghi lại mọi API call trên cloud.

> Khi auditor hỏi "ai mở bucket này ra public, khi nào, được ai duyệt", câu trả lời không nên là
> "để tôi hỏi quanh". Với GitOps + IaC + audit log, đó là một câu `git log`/query — sự thật có
> sẵn, không phải đi phục dựng.

## Policy hay gặp

| Policy | Ngăn chặn |
|--------|-----------|
| Cấm image `:latest` | Build không tái lập, rollback vô nghĩa (bài Docker/K8s) |
| Bắt buộc `resources.limits` | Một pod ngốn hết node (bài K8s) |
| Chặn security group `0.0.0.0/0` cho port nhạy cảm | Phơi DB/SSH ra Internet (bài networking) |
| Chặn bucket/storage public | Rò rỉ dữ liệu |
| Bắt buộc mã hóa at-rest | Vi phạm yêu cầu bảo mật dữ liệu |
| Bắt buộc image đã scan & ký | Chặn supply chain attack (bài IaC/security) |

## Khi nào nhẹ tay

> Không phải team nào cũng cần bộ policy khắt khe của ngân hàng. Với môi trường **không bị quản
> lý**, một rừng policy chặn tứ phía làm dev bực và tìm cách lách. Bắt đầu bằng vài policy **giá
> trị cao, ít gây tranh cãi** (cấm `:latest`, chặn bucket public), đặt ở chế độ **cảnh báo** trước
> khi **chặn cứng**, rồi siết dần. Compliance là để bảo vệ, không phải để cản đường — cân theo mức
> rủi ro thật của tổ chức.

## Cạm bẫy hay gặp

- **Chỉ chặn ở pipeline** → bỏ ngỏ đường `kubectl apply` tay; cần cả admission control.
- **Bật hàng loạt policy chặn cứng ngay** → vỡ mọi deploy đang chạy, dev nổi loạn; nên warn trước.
- **Policy không giải thích lý do** → dev thấy CI đỏ mà không hiểu vi phạm gì; message phải rõ.
- **Coi compliance là việc một lần** → quy tắc và rủi ro đổi theo thời gian, phải rà lại.
- **Áp policy ngân hàng cho startup nhỏ** → over-engineering governance, cản tốc độ vô ích.
- **Không có audit trail** (sửa tay, không qua git/IaC) → tới lúc audit không truy được nguồn.

## Ghi nhớ

**Policy as code** biến quy tắc tổ chức thành **luật máy tự kiểm** — governance ở tốc độ tự động,
nhất quán, không ai lách. Đặt cổng **cả hai chỗ**: **pipeline (shift-left)** cho feedback nhanh và
**runtime (admission control)** làm hàng rào cuối. **GitOps + IaC + cloud audit log** cho **audit
trail** truy được "ai đổi gì, khi nào". Chọn policy theo **mức rủi ro thật**: regulated thì siết,
môi trường nhẹ thì bắt đầu warn vài rule giá trị cao rồi siết dần — compliance để bảo vệ, không để cản.
