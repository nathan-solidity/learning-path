---
level: "advanced"
order: 8
title: "Infrastructure as Code & bảo mật pipeline"
est: "6-8 giờ"
checklist:
  - "Giải thích được IaC là gì và lợi ích so với dựng hạ tầng thủ công (lặp lại, review, versioned)"
  - "Đọc hiểu một file Terraform, Helm chart, hoặc K8s manifest cơ bản"
  - "Quản lý secret an toàn: không commit, dùng Vault/secret manager, biết vì sao env var có giới hạn"
  - "Cấu hình image scan trong pipeline và hiểu SBOM + image signing giải quyết vấn đề gì"
  - "Áp dụng nguyên tắc least-privilege cho service account và pipeline"
---

## Infrastructure as Code (IaC)

**IaC** là mô tả hạ tầng (server, network, DB, cluster) bằng **file code** thay vì click chuột
trên console. Lợi ích: **lặp lại được**, **review qua PR**, **versioned trong git**, và
**dựng lại y hệt** khi cần.

> Hạ tầng dựng tay không ai nhớ đã cấu hình gì. Khi server chết hoặc cần môi trường mới, bạn
> mò lại từ đầu. IaC biến hạ tầng thành thứ tái tạo được trong vài phút.

**Terraform** — khai báo tài nguyên cloud (cloud-agnostic):

```hcl
resource "aws_instance" "web" {
  ami           = "ami-0abcd1234"
  instance_type = "t3.small"
  tags = { Name = "web-server", Env = "prod" }
}
```

**Kubernetes manifest** — khai báo trạng thái mong muốn của workload:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  replicas: 3
  template:
    spec:
      containers:
        - name: myapp
          image: myapp:1.4.0
          resources:
            limits: { cpu: "500m", memory: "256Mi" }
```

**Helm** đóng gói nhiều manifest K8s thành **chart** có tham số hóa (`values.yaml`) — cài
một app phức tạp bằng một lệnh `helm install`, đổi cấu hình qua values thay vì sửa từng file.

## Quản lý secret

Secret (DB password, API key, TLS cert) là điểm yếu nhất của pipeline:

| Cách | Đánh giá |
|------|----------|
| Hard-code trong code/manifest | ❌ Tuyệt đối không — lộ ngay trong git |
| Biến môi trường | ⚠️ Ổn cho dev, nhưng dễ lộ qua log/`ps`/child process |
| **Secret manager / Vault** | ✅ Lưu tập trung, mã hóa, có audit log, xoay secret định kỳ |

```bash
# ✅ Lấy secret lúc runtime từ Vault, không lưu trong file
export DB_PASSWORD=$(vault kv get -field=password secret/prod/db)

# ✅ K8s: mount secret, không nhét vào image
kubectl create secret generic db-cred --from-literal=password='<PLACEHOLDER>'
```

> Env var an toàn hơn hard-code nhưng vẫn bị lộ qua log lỗi, `docker inspect`, hoặc process
> con. Với secret nhạy cảm, đọc từ Vault/secret manager lúc runtime là chuẩn nhất.

## Bảo mật chuỗi cung ứng (supply chain)

Image bạn deploy chứa hàng trăm dependency — mỗi cái là một rủi ro. Ba lớp phòng thủ:

- **Image scan**: quét CVE trong image trước khi deploy (Trivy, Grype).

```yaml
# GitHub Actions — chặn deploy nếu có lỗ hổng HIGH/CRITICAL
- name: Scan image
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: myapp:${{ github.sha }}
    severity: HIGH,CRITICAL
    exit-code: "1"          # có CVE nặng → fail pipeline
```

- **SBOM** (Software Bill of Materials): "danh sách nguyên liệu" liệt kê mọi thành phần trong
  image. Khi một CVE mới công bố (như Log4Shell), bạn tra SBOM để biết ngay image nào dính.
- **Image signing** (Cosign/Sigstore): **ký** image sau khi build và **verify chữ ký** lúc
  deploy — đảm bảo image không bị tráo giữa đường.

## Least-privilege

Cấp **đúng quyền tối thiểu** cần thiết, không hơn:

```yaml
# K8s ServiceAccount + Role: chỉ được đọc pod trong 1 namespace, không hơn
kind: Role
rules:
  - apiGroups: [""]
    resources: ["pods"]
    verbs: ["get", "list"]     # KHÔNG cấp create/delete/*
```

- Service account CI chỉ deploy được đúng namespace của nó, không phải cả cluster.
- Token pipeline scope hẹp (chỉ push registry X), hết hạn ngắn.
- Không dùng account `admin`/`root` cho tác vụ tự động.

> Nguyên tắc: nếu một credential bị lộ, thiệt hại bị giới hạn bởi phạm vi quyền của nó. Quyền
> càng rộng, sự cố càng lớn.

## Cạm bẫy hay gặp

- **Sửa hạ tầng bằng tay** rồi quên cập nhật IaC → "config drift", file code không còn khớp thực tế.
- **Commit `terraform.tfstate` hoặc secret** vào git → lộ toàn bộ hạ tầng & credential.
- **Bỏ qua image scan** → deploy image dính CVE đã biết.
- **Dùng service account quyền `*`** cho pipeline → một token lộ = mất cả cluster.
- **Không có SBOM** → CVE mới nổ ra mà không biết mình có dính không.
- **Không giới hạn resource** (`limits`) cho container → một pod ngốn hết RAM node.

## Ghi nhớ

**IaC** biến hạ tầng thành code **versioned, review được, tái tạo được** (Terraform/Helm/K8s
manifest). Secret **không bao giờ commit** — dùng **Vault/secret manager** lúc runtime. Bảo
vệ **supply chain** bằng **image scan + SBOM + signing**. Và luôn theo **least-privilege**:
mỗi service account/token chỉ có đúng quyền tối thiểu để hạn chế thiệt hại khi bị lộ.
