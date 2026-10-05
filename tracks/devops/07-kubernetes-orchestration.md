---
level: "intermediate"
order: 5
title: "Kubernetes & orchestration"
est: "6-8 giờ"
checklist:
  - "Giải thích được vấn đề orchestration giải quyết mà 'docker run' đơn lẻ không làm được"
  - "Phân biệt Pod, Deployment, Service, và biết mỗi cái chịu trách nhiệm gì"
  - "Hiểu cơ chế self-healing và scaling: ReplicaSet giữ số pod mong muốn, HPA scale theo tải"
  - "Đọc hiểu một manifest Deployment + Service và ý nghĩa của liveness/readiness probe"
  - "Giải thích Service và Ingress định tuyến traffic vào pod như thế nào"
---

## Vì sao cần orchestration

Chạy một container bằng `docker run` thì dễ. Nhưng production cần: chạy **nhiều bản sao** để
chịu tải, **tự khởi động lại** khi container chết, **scale lên/xuống** theo lưu lượng, **rolling
update** không downtime, và **phân phối** container qua nhiều máy. Làm tay những việc này không
khả thi — đó là việc của **orchestrator**, và **Kubernetes (K8s)** là chuẩn de-facto.

> Docker trả lời "chạy một container thế nào". Kubernetes trả lời "chạy hàng trăm container qua
> nhiều máy, luôn sống, tự phục hồi thế nào". Đây là bước nhảy từ một service lên một hệ thống.

## Các khái niệm cốt lõi

K8s hoạt động theo mô hình **khai báo**: bạn mô tả **trạng thái mong muốn**, K8s liên tục điều
chỉnh thực tế cho khớp.

| Đối tượng | Là gì | Vai trò |
|-----------|-------|---------|
| **Pod** | Đơn vị chạy nhỏ nhất, bọc 1 (hoặc vài) container | Ephemeral — sinh ra, chết đi liên tục |
| **ReplicaSet** | Giữ đúng N bản sao pod | Pod chết → tạo lại ngay (self-healing) |
| **Deployment** | Quản lý ReplicaSet + rollout | Rolling update, rollback, khai báo version image |
| **Service** | IP/DNS ổn định đứng trước nhóm pod | Pod đổi IP liên tục; Service cho địa chỉ cố định |
| **Ingress** | Định tuyến HTTP từ ngoài vào Service | Domain/path → Service nào, TLS |

> Pod là **ephemeral** — đừng bao giờ gọi thẳng IP của pod. Luôn đi qua **Service**, vì pod có
> thể bị xóa và tạo lại với IP mới bất cứ lúc nào.

## Deployment + Service

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
spec:
  replicas: 3                    # muốn luôn có 3 pod
  selector:
    matchLabels: { app: web }
  template:
    metadata:
      labels: { app: web }
    spec:
      containers:
        - name: web
          image: myapp:1.4.0     # pin version, KHÔNG :latest
          ports:
            - containerPort: 8080
          resources:
            requests: { cpu: "100m", memory: "128Mi" }   # cần tối thiểu
            limits:   { cpu: "500m", memory: "256Mi" }   # trần tối đa
          readinessProbe:        # sẵn sàng nhận traffic chưa?
            httpGet: { path: /healthz, port: 8080 }
          livenessProbe:         # còn sống không? chết thì restart
            httpGet: { path: /healthz, port: 8080 }
---
apiVersion: v1
kind: Service
metadata:
  name: web
spec:
  selector: { app: web }         # gom mọi pod có label app=web
  ports:
    - port: 80
      targetPort: 8080
```

- **readinessProbe**: pod chưa sẵn sàng thì Service **không gửi traffic** tới — tránh gửi
  request vào pod đang khởi động/nạp cache.
- **livenessProbe**: pod treo/chết thì K8s **tự restart** — self-healing.
- **requests/limits**: scheduler dựa vào `requests` để xếp pod lên node; `limits` chặn một pod
  ngốn hết tài nguyên của cả node.

## Self-healing & scaling

- **Self-healing**: xóa một pod → ReplicaSet thấy thiếu so với `replicas: 3` → tạo pod mới ngay.
  Node chết → pod được lên lịch lại trên node khác.
- **Manual scale**: `kubectl scale deployment/web --replicas=5`.
- **Auto scale (HPA)**: HorizontalPodAutoscaler tự tăng/giảm số pod theo CPU/metric:

```bash
# CPU trung bình vượt 70% → tự thêm pod (tối đa 10), tải giảm → co lại (tối thiểu 3)
kubectl autoscale deployment web --cpu-percent=70 --min=3 --max=10
```

## Lệnh vận hành hằng ngày

```bash
kubectl get pods -o wide           # pod nào đang chạy, ở node nào
kubectl describe pod <pod>         # sự kiện, lý do pod không lên được
kubectl logs -f <pod>              # xem log realtime
kubectl rollout status deploy/web  # theo dõi rolling update
kubectl rollout undo deploy/web    # rollback về version trước
```

## Cạm bẫy hay gặp

- **Gọi thẳng IP pod** thay vì qua Service → hỏng ngay khi pod tái tạo với IP mới.
- **Thiếu readiness probe** → traffic được gửi vào pod chưa sẵn sàng, user gặp lỗi khi deploy.
- **Không đặt `requests/limits`** → một pod ngốn RAM làm chết cả node, hoặc scheduler xếp pod sai.
- **Dùng `image: latest`** → rolling update không biết chắc đang chạy version nào, rollback vô nghĩa.
- **Nhét state vào pod** (ghi file local) → pod chết là mất; state phải ra ngoài (DB, volume, object storage).
- **Lạm dụng K8s cho app nhỏ** → một service đơn giản không cần cụm K8s; over-engineering tốn công vận hành.

## Ghi nhớ

Kubernetes giải quyết bài toán chạy **nhiều container qua nhiều máy, luôn sống, tự phục hồi**.
Mô hình **khai báo**: **Deployment** giữ N **Pod** qua **ReplicaSet**, **Service** cho địa chỉ
ổn định, **Ingress** định tuyến HTTP từ ngoài. **Probe** lo self-healing & readiness, **HPA** lo
auto-scaling, **requests/limits** lo tài nguyên. Pod là **ephemeral** — state luôn để ra ngoài,
và đừng dùng K8s khi một service đơn giản là đủ.
