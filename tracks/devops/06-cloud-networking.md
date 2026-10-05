---
level: "intermediate"
order: 3
title: "Cloud & networking nâng cao"
est: "5-6 giờ"
checklist:
  - "Giải thích được VPC/subnet public vs private và vì sao DB nên nằm ở subnet private"
  - "Phân biệt vai trò của load balancer, DNS, và CDN trong đường đi của một request"
  - "Đọc hiểu security group / firewall rule và áp dụng least-privilege cho network"
  - "Hiểu IAM: user vs role vs policy, và vì sao dùng role thay cho access key cắm cứng"
  - "Kể được đường đi đầy đủ của một HTTPS request từ trình duyệt tới container"
---

## Vì sao DevOps phải hiểu networking cloud

Khi app chạy local, mọi thứ nói chuyện qua `localhost`. Lên cloud, mỗi service nằm ở một chỗ
khác nhau, ngăn cách bởi **network ảo** và **firewall**. Hiểu lớp mạng này là điều kiện để
debug "sao service A không gọi được service B", và để không vô tình phơi DB ra Internet.

## VPC & subnet

**VPC** (Virtual Private Cloud) là **mạng riêng ảo** của bạn trên cloud — một không gian IP
biệt lập. Bên trong VPC chia thành **subnet**:

| Loại subnet | Có route ra Internet? | Đặt gì ở đây |
|-------------|----------------------|--------------|
| **Public** | Có (qua Internet Gateway) | Load balancer, bastion host |
| **Private** | Không trực tiếp (ra ngoài qua NAT) | App server, **database**, cache |

> Nguyên tắc vàng: **DB không bao giờ nằm ở public subnet**. App ở private subnet gọi DB nội
> bộ; chỉ load balancer ở public subnet nhận request từ ngoài. Một request từ Internet không
> có đường nào chạm thẳng tới DB.

## Đường đi của một request

Khi user gõ `https://app.example.com`, request đi qua nhiều chặng:

```
Trình duyệt
  → DNS         (phân giải tên miền → IP của load balancer)
  → CDN         (trả cache asset tĩnh nếu có, chặn bớt tải)
  → Load Balancer (phân phối request tới nhiều instance khỏe mạnh)
  → App container (private subnet)
  → Database    (private subnet, chỉ app gọi được)
```

- **DNS**: sổ danh bạ của Internet — dịch `app.example.com` thành địa chỉ IP. Record hay gặp:
  `A` (→ IPv4), `CNAME` (→ tên khác), `TXT` (xác thực domain).
- **Load balancer (LB)**: đứng trước nhiều instance, chia đều tải và **health check** —
  instance nào chết thì ngừng gửi request tới. Đây cũng là nơi thường **terminate TLS** (giải
  mã HTTPS) trước khi chuyển tiếp nội bộ.
- **CDN**: mạng cache đặt gần user theo địa lý, phục vụ ảnh/JS/CSS mà không phải chạm origin —
  giảm latency và tải cho server gốc.

## Security group / firewall

**Security group** là firewall ảo gắn vào mỗi resource, kiểm soát **traffic vào/ra** theo
port và nguồn:

```
# LB security group: cho phép Internet vào port 443
Inbound:  443  từ 0.0.0.0/0

# App security group: CHỈ nhận từ LB, không phải cả Internet
Inbound:  8080  từ <security-group-của-LB>

# DB security group: CHỈ nhận từ app
Inbound:  5432  từ <security-group-của-app>
```

> Đừng mở `0.0.0.0/0` cho port DB (5432/3306) hay SSH (22). Mở SSH cho cả thế giới là một
> trong những lỗi cấu hình bị scan và khai thác nhanh nhất. Chỉ mở đúng nguồn cần thiết.

## IAM — ai được làm gì

**IAM** (Identity and Access Management) quản lý **quyền** trên cloud:

- **User**: một con người (có thể có mật khẩu/access key).
- **Role**: một danh tính **tạm thời** mà service hoặc user "khoác vào" để lấy quyền — không
  có credential cố định.
- **Policy**: tài liệu mô tả **được/không được làm gì** (action) trên resource nào, gắn vào
  user hoặc role.

```json
// Policy least-privilege: chỉ được đọc 1 bucket, không hơn
{
  "Effect": "Allow",
  "Action": ["s3:GetObject"],
  "Resource": "arn:aws:s3:::my-bucket/*"
}
```

> **Dùng role thay cho access key cắm cứng.** Access key nhét trong code/env dễ lộ và tồn tại
> mãi. Role cấp credential tạm, tự hết hạn — instance/container "khoác role" là có quyền, không
> cần lưu key ở đâu cả. Đây là chuẩn least-privilege cho máy móc.

## Cạm bẫy hay gặp

- **Đặt DB ở public subnet** hoặc mở security group `0.0.0.0/0` cho port DB → phơi data ra Internet.
- **Mở SSH (22) cho cả thế giới** → bị brute-force/scan ngay lập tức.
- **Cắm access key vào code/env** thay vì dùng role → key lộ là mất quyền dài hạn.
- **Quên health check ở LB** → request vẫn được gửi tới instance đã chết.
- **Không dùng CDN cho asset tĩnh** → origin gánh cả tải ảnh/JS, chậm và tốn.
- **Gán policy `*` (full admin)** cho tiện → vi phạm least-privilege, một danh tính lộ = mất tất cả.

## Ghi nhớ

App trên cloud sống trong **VPC** chia **public/private subnet** — LB ở public, **app và DB ở
private**. Một request đi qua **DNS → CDN → LB → app → DB**. **Security group** kiểm soát traffic
theo least-privilege (chỉ mở đúng nguồn cần). **IAM** quản quyền: ưu tiên **role tạm thời** thay
cho **access key cắm cứng**, và không bao giờ gán quyền rộng hơn mức cần thiết.
