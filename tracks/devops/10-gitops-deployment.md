---
level: "advanced"
order: 10
title: "GitOps & continuous deployment"
est: "5-6 giờ"
checklist:
  - "Giải thích được GitOps: git là single source of truth, cluster tự kéo trạng thái từ git"
  - "Phân biệt mô hình push (CI đẩy vào cluster) và pull (agent trong cluster tự sync) và ưu điểm của pull"
  - "Hiểu vai trò ArgoCD/Flux: phát hiện drift và tự reconcile về đúng trạng thái khai báo"
  - "Phân biệt continuous delivery và continuous deployment, biết khi nào cần manual gate"
  - "Giải thích progressive delivery: canary/blue-green tự động cùng auto-rollback theo metric"
---

## GitOps — git là nguồn sự thật duy nhất

Nối tiếp IaC (hạ tầng thành code) và CI/CD (tự động build/deploy), **GitOps** đẩy ý tưởng đi xa
hơn: **toàn bộ trạng thái mong muốn của hệ thống nằm trong git**, và một agent trong cluster
**liên tục kéo** trạng thái đó về áp dụng. Muốn đổi gì — sửa git, tạo PR, merge. Cluster tự khớp.

> Với GitOps, câu hỏi "production đang chạy version nào, cấu hình gì" luôn có câu trả lời chính
> xác: **nhìn vào git**. Không còn cảnh ai đó `kubectl edit` tay rồi không ai biết. Git vừa là
> nguồn sự thật, vừa là audit log, vừa là nút rollback (revert commit).

## Push vs pull

| Mô hình | Cách hoạt động | Nhược/ưu |
|---------|----------------|----------|
| **Push** | CI pipeline chạy `kubectl apply` đẩy thẳng vào cluster | CI cần credential cluster (rủi ro); không tự phát hiện drift |
| **Pull (GitOps)** | Agent **trong** cluster tự kéo git & apply | Credential không rời cluster; tự sync & tự sửa drift |

> Mô hình **pull** an toàn hơn: CI không cần cầm chìa khóa cluster. Agent nằm sẵn bên trong,
> chỉ đọc git — bề mặt tấn công nhỏ hơn nhiều so với việc phát credential production cho pipeline.

## ArgoCD / Flux — reconciliation

**ArgoCD** và **Flux** là hai công cụ GitOps phổ biến. Cơ chế lõi là **reconciliation loop**:

```
Vòng lặp liên tục:
  1. Đọc trạng thái mong muốn từ git (manifest/Helm/Kustomize)
  2. Đọc trạng thái thực tế trong cluster
  3. Khác nhau (drift)? → apply để kéo thực tế về khớp git
```

- Ai đó sửa tay trong cluster (`kubectl edit`) → agent phát hiện **drift** → **tự sửa lại** theo
  git. Muốn thay đổi bền vững thì phải qua git.
- ArgoCD có **UI** hiển thị app nào **synced/out-of-sync/healthy** — nhìn phát biết cluster có
  khớp git không.

## Delivery vs deployment

| Thuật ngữ | Nghĩa |
|-----------|-------|
| **Continuous Delivery** | Mỗi thay đổi **luôn sẵn sàng** deploy, nhưng bước lên prod cần **người bấm nút** |
| **Continuous Deployment** | Mỗi thay đổi qua test **tự động lên prod**, không cần người |

> Continuous **deployment** (tự động hoàn toàn) chỉ an toàn khi bạn có test tốt, monitoring tốt,
> và **auto-rollback**. Với hệ thống nhạy cảm, giữ một **manual gate** trước prod là hợp lý —
> tự động hóa không có nghĩa là bỏ hết người khỏi vòng lặp ở nơi rủi ro cao.

## Progressive delivery — auto-rollback theo metric

Thay vì đẩy version mới cho 100% user cùng lúc, **progressive delivery** thả từ từ và tự lùi
nếu xấu:

```
Canary: đẩy version mới cho 5% traffic
  → theo dõi error rate / latency trong X phút
  → tốt?  tăng dần 5% → 25% → 50% → 100%
  → xấu?  TỰ ĐỘNG rollback về version cũ, không cần người thức đêm
```

Công cụ như Argo Rollouts / Flagger tự động hóa quy trình này, gắn với metric từ Prometheus
(nối lại bài monitoring): **metric là điều kiện để tiến hoặc lùi**.

## Cạm bẫy hay gặp

- **Sửa tay trong cluster** khi đã dùng GitOps → agent reconcile đè lại, thay đổi biến mất, gây bối rối.
- **Commit secret thô vào git** (vì "git là nguồn sự thật") → lộ secret; phải dùng Sealed Secrets/SOPS/external secret.
- **Push model phát credential cluster cho CI** → mở rộng bề mặt tấn công không cần thiết.
- **Bật continuous deployment khi test/monitoring còn yếu** → bug tự động lên thẳng prod.
- **Không có auto-rollback trong canary** → version xấu vẫn tăng dần tới 100%, mất luôn tác dụng canary.
- **Một repo git khổng lồ cho mọi cluster** → khó phân quyền, một PR lỡ ảnh hưởng tất cả môi trường.

## Ghi nhớ

**GitOps** biến git thành **nguồn sự thật duy nhất** — agent trong cluster (**ArgoCD/Flux**) liên
tục **reconcile** thực tế về khớp git và tự sửa **drift**. Ưu tiên mô hình **pull** để credential
không rời cluster. Phân biệt **delivery** (người bấm nút) và **deployment** (tự động) — giữ manual
gate ở nơi rủi ro cao. Và dùng **progressive delivery** (canary + **auto-rollback theo metric**) để
đẩy version mới an toàn thay vì đổi 100% cùng lúc.
