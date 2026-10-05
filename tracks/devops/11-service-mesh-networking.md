---
level: "advanced"
order: 11
title: "Service mesh & networking nội bộ"
est: "4-5 giờ"
checklist:
  - "Giải thích vấn đề service mesh giải quyết khi số microservice tăng lên (traffic, security, observability)"
  - "Hiểu mô hình sidecar proxy và data plane vs control plane"
  - "Kể được các năng lực mesh cung cấp mà không cần sửa code app: mTLS, retry, timeout, circuit breaking"
  - "Giải thích mTLS zero-trust: mọi service-to-service đều mã hóa và xác thực lẫn nhau"
  - "Nhận ra khi nào CHƯA cần service mesh để tránh gánh vận hành thừa"
---

## Vì sao sinh ra service mesh

Khi hệ thống tách thành nhiều microservice, việc **service gọi service** nảy sinh cả rừng vấn
đề: retry khi lỗi, timeout, load balancing nội bộ, mã hóa traffic, biết request đi qua những
service nào. Nếu mỗi team tự code những thứ này vào từng service → trùng lặp, không nhất quán.

**Service mesh** tách toàn bộ logic mạng đó ra **một lớp hạ tầng riêng**, để app chỉ lo business
logic. Ví dụ: Istio, Linkerd.

> Không có mesh, mỗi service phải tự nhúng thư viện retry/timeout/mTLS — mỗi ngôn ngữ một kiểu,
> khó đồng bộ. Mesh chuyển những mối lo này xuống hạ tầng, **app không cần sửa code** vẫn có
> đủ retry, mã hóa, tracing.

## Sidecar proxy

Cơ chế lõi: bên cạnh mỗi container app, mesh chèn thêm một **sidecar proxy** (thường là Envoy).
**Mọi traffic vào/ra app đều đi qua proxy này:**

```
Pod A                          Pod B
┌─────────────┐                ┌─────────────┐
│  app A      │                │  app B      │
│    ↕        │                │    ↕        │
│  sidecar ───┼── mTLS, retry ─┼─→ sidecar   │
└─────────────┘                └─────────────┘
```

- **Data plane**: tập hợp các sidecar proxy — nơi traffic thực sự chảy qua, thực thi rule.
- **Control plane**: bộ não cấu hình toàn bộ sidecar (rule routing, policy, cert) — bạn khai
  báo ở đây, control plane đẩy config xuống các proxy.

## Mesh cho gì mà không cần sửa code app

| Năng lực | Ý nghĩa |
|----------|---------|
| **mTLS** | Mã hóa + xác thực hai chiều mọi kết nối service-to-service |
| **Retry / timeout** | Tự thử lại request lỗi tạm thời, cắt request treo quá lâu |
| **Circuit breaking** | Service đích đang hỏng → ngừng gửi để không kéo sập theo (nối bài SRE) |
| **Traffic splitting** | Chia % traffic giữa version (nền cho canary ở bài GitOps) |
| **Observability** | Tự sinh metric/trace cho mọi call nội bộ — thấy request đi qua đâu |

## mTLS & zero-trust

Mạng nội bộ **không tự nhiên an toàn** — nếu kẻ tấn công lọt vào một pod, nó có thể nghe/giả
mạo traffic giữa các service. Mô hình **zero-trust**: **không tin cậy mặc định**, mọi kết nối
phải được mã hóa và xác thực, kể cả bên trong cluster.

Mesh bật **mTLS** (mutual TLS) tự động cho mọi cặp service:

> mTLS nghĩa là **cả hai phía cùng chứng minh danh tính** bằng cert (không chỉ client tin
> server như HTTPS thường). Service A biết chắc mình đang nói với B thật, và ngược lại — traffic
> mã hóa, không ai chen giữa. Mesh cấp và **xoay cert tự động**, app không phải lo gì.

## Khi nào CHƯA cần service mesh

Mesh mạnh nhưng **rất nặng vận hành** — thêm control plane để trông coi, thêm sidecar vào mọi
pod (tốn tài nguyên, thêm một điểm có thể hỏng), thêm độ phức tạp khi debug.

> Vài service thì **đừng dùng mesh**. Retry/timeout có thể xử ở library hoặc API gateway; mTLS
> có thể làm ở tầng khác. Mesh chỉ đáng khi bạn có **hàng chục+ microservice** và thật sự đau vì
> quản lý traffic/security/observability giữa chúng. Với monolith hay ít service, mesh là
> over-engineering điển hình — bạn gánh cả một hệ thống chỉ để giải quyết vấn đề chưa có.

## Cạm bẫy hay gặp

- **Cài mesh cho vài service** → gánh vận hành khổng lồ để giải quyết vấn đề chưa tồn tại.
- **Coi mạng nội bộ là an toàn** → không bật mTLS, một pod bị chiếm là nghe lén được cả cụm.
- **Quên sidecar ngốn tài nguyên** → mỗi pod +1 proxy, nhân lên hàng trăm pod là đáng kể.
- **Debug không tính tới sidecar** → traffic đi qua proxy, lỗi mạng có thể nằm ở proxy chứ không phải app.
- **Bật hết tính năng mesh cùng lúc** → khó cô lập khi có sự cố; nên bật dần (mTLS trước, rồi routing...).

## Ghi nhớ

**Service mesh** (Istio/Linkerd) tách logic mạng service-to-service ra **lớp hạ tầng** qua
**sidecar proxy** — app không sửa code vẫn có **mTLS, retry, timeout, circuit breaking,
observability**. **Data plane** (proxy) chảy traffic, **control plane** cấu hình. mTLS mang lại
**zero-trust**: mọi kết nối nội bộ đều mã hóa & xác thực hai chiều. Nhưng mesh **rất nặng** —
chỉ dùng khi có nhiều microservice và thật sự đau; ít service thì đó là over-engineering.
