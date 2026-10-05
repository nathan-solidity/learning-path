---
level: "sec-hardening"
order: 12
title: "Đưa bảo mật vào quy trình dev (Secure SDLC)"
est: "2-3 giờ"
checklist:
  - "Nghĩ về threat model khi thiết kế: ai tấn công, tấn công cái gì"
  - "Đưa security vào code review (có checklist), không để cuối dự án"
  - "Tự động hóa: SAST/DAST, dependency scan, secret scan trong CI/CD"
  - "Log sự kiện bảo mật (login fail, access denied) nhưng KHÔNG log secret/PII"
  - "Cập nhật kiến thức bảo mật (OWASP Top 10) và dùng skill hỗ trợ"
related:
  - "glossary:dev"
  - "skill:nta-checklist"
---

## Vì sao quan trọng

Bảo mật **không phải một bước** làm ở cuối trước khi release — nó là **thói quen xuyên suốt**
quá trình phát triển. Vá lỗ hổng sau khi lên production đắt gấp nhiều lần so với chặn nó lúc
thiết kế/code. Bài này gom các lớp phòng thủ đã học thành một **quy trình** (Secure SDLC) để
lỗi được bắt sớm và đều đặn, không phụ thuộc trí nhớ từng người.

## Threat modeling nhẹ — nghĩ như kẻ tấn công

Khi thiết kế một tính năng, dừng lại hỏi ba câu:

- **Ai** có thể muốn tấn công cái này? (người ngoài, người dùng khác, insider)
- **Cái gì** đáng giá ở đây? (dữ liệu, quyền, tiền)
- **Vào đâu** dữ liệu không tin cậy đi vào hệ thống? (mọi input ở bài 01)

Không cần mô hình hình thức phức tạp — chỉ cần **thói quen đặt câu hỏi** này khi thiết kế đã
loại bỏ nhiều lỗ hổng trước khi viết dòng code đầu tiên (OWASP: Insecure Design).

## Security trong code review

Đưa bảo mật thành **mục cố định** khi review, với checklist ngắn:

- Input từ ngoài có được validate/tham số hóa không? (injection, XSS)
- Endpoint có kiểm quyền ở server không, đúng chủ sở hữu tài nguyên? (access control)
- Có secret hard-code, có log dữ liệu nhạy cảm không?
- Dữ liệu nhạy cảm có đi qua HTTPS, có mã hóa/băm đúng không?

Review thủ công bắt được lỗi **ngữ cảnh nghiệp vụ** mà công cụ tự động bỏ sót (vd phân quyền
sai theo logic).

## Tự động hóa trong CI/CD

Công cụ chạy đều, không quên, không mệt — đưa vào pipeline:

| Loại | Bắt gì | Ví dụ |
|------|--------|-------|
| **SAST** | Lỗ hổng trong source | Semgrep, CodeQL |
| **DAST** | Lỗ hổng khi app chạy | OWASP ZAP |
| **Dependency scan** | CVE trong thư viện | npm audit, Dependabot, Snyk |
| **Secret scan** | Key/credential bị commit | gitleaks, trufflehog |

Đặt build **fail** khi phát hiện lỗ hổng nghiêm trọng — để lỗi **không lên được** production.

## Logging & monitoring đúng cách

Nhóm **Security Logging & Monitoring Failures** trong OWASP: không có log thì **không phát
hiện** được tấn công. Log các **sự kiện bảo mật**:

- Đăng nhập thất bại, khóa tài khoản, đổi mật khẩu.
- Access denied (403), truy cập tài nguyên nhạy cảm.
- Thay đổi quyền, hành động của admin.

> **Nhưng KHÔNG log**: mật khẩu, token, số thẻ, PII. Log là nơi rò rỉ dữ liệu phổ biến —
> log an toàn cũng quan trọng như log đầy đủ.

## Cập nhật kiến thức & dùng công cụ hỗ trợ

Lỗ hổng và kỹ thuật tấn công thay đổi liên tục. Theo dõi **OWASP Top 10** (cập nhật vài năm
một lần), đọc các vụ sự cố thực tế. Trong bộ skill này, dùng:

- `/nta-security-audit` — rà OWASP Top 10 trên code.
- `/nta-code-review` — review tổng hợp gồm cả bảo mật.
- `/nta-dep-audit` — CVE và package lỗi thời.
- `/nta-env-gen` — phát hiện secret bị commit.
- `/nta-devops-security` — quét cấu hình/hạ tầng.
- `/nta-checklist` — checklist pre-commit / pre-release có mục bảo mật.

## Tổng kết lộ trình — các lớp phòng thủ

Nhìn lại toàn bộ track như một hệ phòng thủ nhiều lớp:

```
Tư duy: không tin input, least privilege, fail securely
  └─ Validation & encoding: chặn dữ liệu xấu ở vào/ra
      └─ Chống lỗ hổng: injection, XSS, CSRF/SSRF, auth, access control
          └─ Hardening: secret, dependency, HTTPS, cấu hình, header
              └─ Quy trình: threat model, review, CI scan, log/monitor
```

Không lớp nào đủ một mình — mạnh nằm ở **có đủ mọi lớp**.

## Ghi nhớ

Bảo mật là **quy trình xuyên suốt**, không phải bước cuối. Áp dụng: **threat modeling nhẹ**
khi thiết kế, **security trong code review** (có checklist), **tự động hóa** trong CI/CD
(SAST/DAST, dependency scan, secret scan) với build fail khi lỗi nghiêm trọng, và **logging
sự kiện bảo mật** (nhưng **không log secret/PII**). Cập nhật theo **OWASP Top 10** và dùng
các skill hỗ trợ. Bảo mật vững = **đủ nhiều lớp**, không phải một kỹ thuật đơn lẻ. Dùng
`/nta-checklist` để chạy checklist bảo mật trước commit/release.
