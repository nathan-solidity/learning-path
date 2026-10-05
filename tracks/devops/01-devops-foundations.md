---
level: "basic"
order: 1
title: "DevOps là gì & nền tảng"
est: "3-4 giờ"
checklist:
  - "Giải thích được DevOps là văn hóa (không phải một tool) và vòng CI/CD gồm những giai đoạn nào"
  - "Dùng được các lệnh Linux/shell cơ bản: ls, cd, grep, ps, tail, chmod, ssh"
  - "Phân biệt port, DNS, HTTP status code và kiểm tra được một service có sống không"
  - "Đọc và hiểu Git workflow (branch, PR, tag) dưới góc nhìn ops"
  - "Biết ba chỉ số DORA và vì sao chúng đo được năng lực DevOps của team"
---

## DevOps là văn hóa, không phải một chức danh

**DevOps** là cách làm việc gộp **Dev** (viết code) và **Ops** (vận hành) thành một dòng
chảy liền mạch, mục tiêu: đưa thay đổi lên production **nhanh, an toàn, tự động, lặp lại được**.
Nó không phải một tool bạn cài đặt, mà là tập hợp thói quen: tự động hóa, đo lường, và
chia sẻ trách nhiệm giữa các nhóm.

> Sai lầm phổ biến: nghĩ "mua Jenkins/Kubernetes là có DevOps". Tool chỉ là phương tiện.
> Nếu dev vẫn "ném code qua tường" cho ops và không ai chịu trách nhiệm khi production sập,
> thì đó chưa phải DevOps.

## Vòng CI/CD

Vòng đời một thay đổi code thường đi qua các giai đoạn:

```
Plan → Code → Build → Test → Release → Deploy → Operate → Monitor → (quay lại Plan)
```

- **CI** (Continuous Integration): mỗi commit tự động **build + test** để phát hiện lỗi sớm.
- **CD** (Continuous Delivery/Deployment): thay đổi đã pass test được **đóng gói và đưa lên**
  môi trường một cách tự động.

## Linux & shell — công cụ hàng ngày

DevOps sống trên terminal. Một số lệnh phải thuộc lòng:

```bash
ls -la                 # liệt kê file, cả file ẩn + quyền
grep -r "ERROR" /var/log/app/   # tìm chuỗi trong log
ps aux | grep nginx    # process nginx có đang chạy không
tail -f /var/log/app.log        # xem log realtime
chmod +x deploy.sh     # cấp quyền thực thi
ssh user@server.example.com     # kết nối server từ xa
df -h && free -m       # kiểm tra ổ đĩa & RAM còn bao nhiêu
```

> `tail -f` là bạn thân khi debug production: mở nó ra rồi tái hiện lỗi để xem log chảy ra
> ngay lúc đó.

## Networking cơ bản

| Khái niệm | Ý nghĩa | Ví dụ |
|-----------|---------|-------|
| **Port** | Cổng dịch vụ lắng nghe trên một máy | 80 (HTTP), 443 (HTTPS), 5432 (Postgres) |
| **DNS** | Dịch tên miền → IP | `api.example.com` → `203.0.113.10` |
| **HTTP status** | Kết quả request | 2xx OK, 3xx redirect, 4xx lỗi client, 5xx lỗi server |

Kiểm tra nhanh một service có sống không:

```bash
curl -I https://api.example.com/health   # xem status code trả về
nc -zv api.example.com 443               # port 443 có mở không
dig api.example.com                      # DNS phân giải ra IP nào
```

## Git workflow dưới góc nhìn ops

Ops không chỉ đọc code mà còn dùng Git để **kích hoạt deploy** và **truy vết**:

- **Branch** `main`/`release` thường gắn với môi trường (main → staging, tag → production).
- **Tag** (`v1.4.0`) đánh dấu bản release — pipeline thường deploy production khi có tag mới.
- Khi production lỗi, ops dùng `git log`/`git tag` để biết **chính xác commit nào đang chạy**
  và cần rollback về đâu.

## Đo năng lực DevOps: 4 chỉ số DORA

| Chỉ số | Ý nghĩa |
|--------|---------|
| **Deployment Frequency** | Tần suất deploy — càng cao càng tốt |
| **Lead Time for Changes** | Thời gian từ commit đến production |
| **Change Failure Rate** | Tỷ lệ deploy gây lỗi |
| **MTTR** (Mean Time To Restore) | Thời gian trung bình khôi phục sau sự cố |

## Cạm bẫy hay gặp

- **Coi DevOps là một người/team riêng** làm hết → đúng ra là trách nhiệm chung của cả dev
  và ops.
- **Deploy thủ công bằng tay** (SSH vào server, copy file) → không lặp lại được, dễ sai.
  Phải tự động hóa.
- **Không đo gì cả** → không biết team đang tốt hay tệ. Bắt đầu với 4 chỉ số DORA.
- **Nhớ lệnh nhưng không hiểu port/DNS** → khi service "không truy cập được" thì bó tay.

## Ghi nhớ

DevOps là **văn hóa tự động hóa + đo lường + trách nhiệm chung**, không phải một tool. Vòng
**CI/CD** biến mỗi commit thành một bản deploy an toàn. Nền tảng bắt buộc: **Linux/shell**,
**networking** (port/DNS/HTTP), và **Git** như công cụ vận hành. Đo bằng **4 chỉ số DORA**
để biết mình đang ở đâu.
