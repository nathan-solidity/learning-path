---
level: "advanced"
order: 13
title: "Secret & config management chuyên sâu"
est: "4-5 giờ"
checklist:
  - "Phân biệt config và secret, và tách chúng khỏi code/image (12-factor)"
  - "Giải thích static secret vs dynamic secret, và vì sao dynamic secret giảm rủi ro rò rỉ"
  - "Hiểu secret rotation và vì sao secret sống lâu là nợ bảo mật"
  - "Nạp secret an toàn vào K8s/CI mà không commit vào git (External Secrets, SOPS, Sealed Secrets)"
  - "Xử lý đúng khi một secret bị lộ: revoke trước, xoay, rồi mới tìm nguồn rò"
related:
  - "skill:nta-env-gen"
  - "skill:nta-devops-security"
---

## Config và secret là hai thứ khác nhau

Bài IaC/security đã chạm "đừng commit secret". Bài này đi sâu vào **quản lý vòng đời** của
config và secret — một kỹ năng riêng vì làm sai chỗ này là nguồn rò rỉ số một.

| Loại | Ví dụ | Nhạy cảm? |
|------|-------|-----------|
| **Config** | URL service, feature flag, log level, timeout | Không — có thể để lộ |
| **Secret** | DB password, API key, TLS private key, token | Có — lộ là sự cố |

Nguyên tắc **12-factor**: cả hai đều **tách khỏi code**, nạp qua môi trường lúc chạy. Nhưng
secret cần lớp bảo vệ mạnh hơn config nhiều — mã hóa, audit, xoay định kỳ.

## Static vs dynamic secret

| Kiểu | Cách hoạt động | Rủi ro |
|------|----------------|--------|
| **Static** | Một password DB cố định, dùng mãi | Lộ là mở toang tới khi ai đó nhớ đổi |
| **Dynamic** | Vault sinh credential **tạm thời** theo yêu cầu, tự hết hạn | Lộ cũng chỉ dùng được vài phút/giờ |

```bash
# Dynamic: Vault sinh 1 cặp user/pass DB dùng trong 1 giờ rồi tự thu hồi
vault read database/creds/app-role
# → username: v-app-x7f2, password: <tạm-thời>, ttl: 1h
```

> Dynamic secret đảo ngược thế trận: thay vì một secret sống mãi mà bạn *hy vọng* không lộ, mỗi
> service lấy credential **ngắn hạn, riêng biệt, tự hết hạn**. Lộ một cái thì thiệt hại bị đóng
> khung trong TTL — và bạn biết chính xác role nào rò để thu hồi.

## Secret rotation

**Rotation** = đổi secret định kỳ, kể cả khi chưa lộ.

> Một secret tồn tại 3 năm là 3 năm cơ hội cho nó rò qua log, backup cũ, laptop nghỉ việc, ảnh
> chụp màn hình. Secret sống càng lâu, xác suất lộ tích lũy càng cao. Rotation biến "lộ vĩnh
> viễn" thành "lộ trong một cửa sổ thời gian ngắn".

Dynamic secret là rotation tự động ở mức cực đại (mỗi lần lấy là một secret mới). Với static
secret bắt buộc, ít nhất phải có lịch xoay và quy trình xoay không downtime.

## Nạp secret vào K8s/CI mà không commit git

Bài GitOps nêu nghịch lý: git là nguồn sự thật, nhưng **không được để secret thô trong git**.
Ba cách phổ biến giải quyết:

| Cách | Ý tưởng |
|------|---------|
| **External Secrets Operator** | Manifest chỉ *tham chiếu* tên secret; operator kéo giá trị thật từ Vault/cloud secret manager lúc runtime |
| **SOPS** | Mã hóa file secret trước khi commit; chỉ ai có khóa mới giải mã được |
| **Sealed Secrets** | Mã hóa secret thành dạng "sealed" an toàn để commit; controller trong cluster giải mã |

```yaml
# External Secrets: git chỉ chứa tham chiếu, KHÔNG chứa giá trị
apiVersion: external-secrets.io/v1
kind: ExternalSecret
spec:
  secretStoreRef: { name: vault-backend, kind: SecretStore }
  data:
    - secretKey: db-password
      remoteRef: { key: prod/db, property: password }  # giá trị nằm ở Vault
```

Trong CI: dùng **secret store của nền tảng** (GitHub/GitLab secrets, OIDC lấy token cloud tạm)
— không dán key vào biến plaintext hay log.

## Khi secret bị lộ — thứ tự xử lý

> Khi phát hiện secret lộ, **revoke/xoay trước, điều tra sau**. Nhiều người lao vào tìm "ai
> commit, rò qua đâu" trong khi credential vẫn còn hiệu lực — kẻ tấn công đang có thời gian.
> Vô hiệu hóa nó ngay (thiệt hại dừng lại), rồi mới bình tĩnh truy nguồn và vá quy trình.

Lưu ý: xóa secret khỏi commit **không đủ** — nó vẫn nằm trong git history và có thể đã bị nhân
bản. Đã lộ thì phải coi như đã lộ vĩnh viễn: **xoay nó**, đừng chỉ xóa.

## Cạm bẫy hay gặp

- **Commit `.env`/key vào git** rồi nghĩ xóa file là xong → history vẫn còn, phải xoay secret.
- **Một secret dùng chung nhiều service** → không biết cái nào rò, xoay một chỗ ảnh hưởng tất cả.
- **Secret không bao giờ xoay** → tích lũy rủi ro nhiều năm.
- **Nhét secret vào ConfigMap** (K8s ConfigMap không mã hóa) thay vì Secret/external store.
- **Log ra secret** khi debug (`print(config)`) → rò vào hệ thống log tập trung.
- **Điều tra trước khi revoke** khi đã lộ → kéo dài cửa sổ tấn công.

## Ghi nhớ

**Config** để lộ được, **secret** thì không — cả hai tách khỏi code (12-factor), nhưng secret cần
mã hóa + audit + rotation. Ưu tiên **dynamic secret** (tạm thời, tự hết hạn) hơn static; secret
sống lâu là **nợ bảo mật**. Nạp vào K8s/CI qua **External Secrets/SOPS/Sealed Secrets** để git chỉ
giữ *tham chiếu*, không giữ giá trị. Và khi lộ: **revoke/xoay trước, điều tra sau** — xóa khỏi
commit không bao giờ đủ.
