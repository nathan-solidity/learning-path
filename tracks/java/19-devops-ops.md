---
level: "advanced"
order: 19
title: "DevOps & vận hành"
est: "8-10 giờ"
checklist:
  - "Viết Dockerfile multi-stage cho image nhỏ, chạy non-root"
  - "Thiết lập CI/CD: build → test → scan → deploy"
  - "Triển khai lên Kubernetes: deployment, service, configmap/secret, probe, HPA"
  - "Expose health/metrics qua Actuator và cấu hình liveness/readiness probe"
  - "Thiết lập monitoring (Prometheus + Grafana) và alert cơ bản"
  - "Log có cấu trúc (JSON) kèm trace id, tập trung về ELK/Loki"
related:
  - "skill:nta-docker-gen"
  - "skill:nta-devops-security"
---

## Dockerfile multi-stage

Build và runtime tách stage → image cuối **nhỏ, không chứa build tool**, chạy **non-root**:

```dockerfile
# Stage 1: build
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY . .
RUN ./mvnw clean package -DskipTests

# Stage 2: runtime — chỉ JRE + jar
FROM eclipse-temurin:21-jre AS runtime
WORKDIR /app
RUN useradd -r -u 1001 appuser        # tạo user thường
COPY --from=build /app/target/*.jar app.jar
USER appuser                          # KHÔNG chạy root
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

> Image nhỏ hơn nữa: dùng **jlink** (JRE tùy biến chỉ chứa module cần) hoặc base
> **distroless**. Chạy **non-root** là yêu cầu bảo mật cơ bản — container bị chiếm cũng khó
> leo thang.

## CI/CD pipeline

Tự động hoá: mỗi push → build, test, quét bảo mật, deploy.

```yaml
# GitHub Actions
name: ci
on: { push: { branches: [main] } }
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with: { distribution: temurin, java-version: '21', cache: maven }
      - run: ./mvnw verify                       # build + test
      - run: ./mvnw org.owasp:dependency-check-maven:check   # scan CVE dependency
      - run: docker build -t myapp:${{ github.sha }} .
      # - deploy step (đẩy image + rollout)
```

Các chặng chuẩn: **build → unit/integration test → static analysis (Sonar) → security scan
(dependency + image) → build image → deploy**. Fail sớm ở chặng rẻ nhất.

## Kubernetes cơ bản

```yaml
apiVersion: apps/v1
kind: Deployment
metadata: { name: order-service }
spec:
  replicas: 3
  selector: { matchLabels: { app: order-service } }
  template:
    metadata: { labels: { app: order-service } }
    spec:
      containers:
        - name: app
          image: myapp:1.0.0
          ports: [{ containerPort: 8080 }]
          envFrom:
            - configMapRef: { name: order-config }
            - secretRef: { name: order-secret }
          resources:
            requests: { cpu: "250m", memory: "512Mi" }
            limits:   { cpu: "500m", memory: "512Mi" }
          readinessProbe:
            httpGet: { path: /actuator/health/readiness, port: 8080 }
          livenessProbe:
            httpGet: { path: /actuator/health/liveness, port: 8080 }
```

| Đối tượng | Vai trò |
|-----------|---------|
| **Deployment** | Quản lý pod (số bản, rolling update) |
| **Service** | Địa chỉ ổn định + load balance tới pod |
| **Ingress** | Định tuyến HTTP từ ngoài vào Service |
| **ConfigMap / Secret** | Cấu hình & bí mật tách khỏi image |
| **HPA** | Tự scale pod theo CPU/metric |

```yaml
# HPA — tự tăng/giảm pod theo tải
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
spec:
  scaleTargetRef: { kind: Deployment, name: order-service }
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource: { name: cpu, target: { type: Utilization, averageUtilization: 70 } }
```

## Actuator — health, probe, metrics

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health, metrics, prometheus
  endpoint:
    health:
      probes:
        enabled: true      # tách /health/liveness và /health/readiness
```

- **Liveness**: app còn sống không? Fail → K8s restart pod.
- **Readiness**: app sẵn sàng nhận traffic chưa? Fail → K8s ngừng gửi request (không
  restart). Quan trọng lúc khởi động (chờ DB/cache sẵn sàng).

## Monitoring & alert

```
App (Actuator /prometheus) → Prometheus (scrape metric) → Grafana (dashboard) + Alertmanager
```

Metric cốt lõi cần theo dõi: request rate, error rate, latency (p95/p99), JVM heap, GC, DB
pool. Alert rule ví dụ: "error rate > 5% trong 5 phút" hoặc "p99 > 2s". Đặt alert **có thể
hành động**, tránh alert nhiễu (alert fatigue).

## Log tập trung & có cấu trúc

Nhiều pod → không thể SSH từng cái đọc log. Gom về **ELK** (Elasticsearch+Logstash+Kibana)
hoặc **Loki+Grafana**. Log dạng **JSON** để máy parse được, kèm **trace id** để nối log của
1 request qua nhiều service.

```
{"timestamp":"...","level":"ERROR","traceId":"abc123","service":"order","msg":"..."}
```

## Chiến lược deploy an toàn

- **Rolling update** (mặc định K8s): thay pod dần, không downtime.
- **Blue-green**: chạy song song 2 phiên bản, chuyển traffic một lần → rollback tức thì.
- **Canary**: đẩy phiên bản mới cho % nhỏ user, theo dõi rồi mở rộng.
- **Feature flag**: bật/tắt tính năng runtime không cần deploy lại.

## Cloud AWS cơ bản

| Dịch vụ | Dùng cho |
|---------|----------|
| ECS / EKS | Chạy container (EKS = Kubernetes quản lý) |
| RDS | DB quản lý (PostgreSQL/MySQL) |
| S3 | Lưu file/ảnh/backup |
| ALB | Load balancer HTTP |
| IAM | Phân quyền — nguyên tắc least privilege |
| CloudWatch | Log & metric |

## Cạm bẫy hay gặp

- **Chạy container bằng root** → rủi ro bảo mật. Luôn `USER` non-root.
- **Không đặt resource requests/limits** → pod bị OOMKilled hoặc ăn hết node.
- **Không có readiness probe** → traffic vào pod chưa sẵn sàng → lỗi lúc deploy.
- **Secret trong image / ConfigMap** → dùng Secret (và cân nhắc Vault/Sealed Secret).
- **Log không cấu trúc, không trace id** → không debug nổi hệ phân tán.
- **Alert quá nhiều** → team lờ đi (alert fatigue); chỉ alert việc cần hành động.
- **`ddl-auto: update` trong container prod** → dùng migration (Flyway) trong pipeline.

## Ghi nhớ

Đóng gói **multi-stage, non-root, image nhỏ**. CI/CD tự động **build→test→scan→deploy**, fail
sớm. Trên K8s: Deployment + Service + Config/Secret + **probe** (liveness restart, readiness
gate traffic) + **HPA**. Vận hành cần **monitoring (Prometheus/Grafana) + log JSON có trace
id tập trung + alert hành động được**. Deploy an toàn bằng rolling/canary + feature flag.
