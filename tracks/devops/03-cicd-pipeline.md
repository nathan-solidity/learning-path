---
level: "intermediate"
order: 4
title: "CI/CD pipeline"
est: "5-6 giờ"
checklist:
  - "Kể tên và mô tả các stage chính của pipeline: build, test, scan, deploy"
  - "Viết được workflow GitHub Actions (hoặc GitLab CI) chạy khi push/PR"
  - "Truyền artifact giữa các job và cache dependencies để tăng tốc"
  - "Quản lý secret trong pipeline đúng cách (không hard-code, dùng secret store)"
  - "Phân biệt và chọn được deploy strategy: rolling, blue-green, canary"
---

## Các stage của một pipeline

Một pipeline CI/CD điển hình chạy tuần tự (fail ở đâu dừng ở đó):

```
build → test → scan → deploy
```

| Stage | Làm gì | Fail thì sao |
|-------|--------|--------------|
| **build** | Biên dịch, đóng gói (image/jar/binary) | Không có artifact → dừng |
| **test** | Unit + integration test, đo coverage | Có bug → chặn merge/deploy |
| **scan** | Quét lỗ hổng dependency & image, lint, SAST | Có CVE nghiêm trọng → dừng |
| **deploy** | Đưa artifact lên môi trường | Rollback |

## GitHub Actions — cú pháp cơ bản

Workflow là file YAML trong `.github/workflows/`. Chạy theo **event** (push, PR, tag):

```yaml
name: CI/CD
on:
  push:
    branches: [main]
  pull_request:

jobs:
  build-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm          # cache dependencies theo package-lock
      - run: npm ci
      - run: npm test
      - name: Upload build artifact
        uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/

  deploy:
    needs: build-test          # chỉ chạy khi build-test pass
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4
        with: { name: dist }
      - run: ./deploy.sh
        env:
          DEPLOY_TOKEN: ${{ secrets.DEPLOY_TOKEN }}   # từ secret store
```

GitLab CI tương đương dùng file `.gitlab-ci.yml` với các `stages:` và `job:` — khái niệm
giống hệt, chỉ khác cú pháp.

## Artifact & cache

- **Artifact**: sản phẩm build (image, binary, report) truyền **giữa các job** hoặc lưu để
  tải về sau. Ví dụ job `build` upload `dist/`, job `deploy` download về dùng.
- **Cache**: lưu lại thứ **tái tạo được** (như `node_modules`, `~/.m2`) để job sau chạy nhanh.

> Đừng nhầm cache với artifact: mất cache thì build lại vẫn ra kết quả đúng (chỉ chậm hơn);
> mất artifact thì mất luôn sản phẩm cần deploy.

## Secret trong pipeline

Không bao giờ viết token/password thẳng vào file YAML (nó nằm trong git, ai cũng đọc được):

```yaml
# ❌ SAI — lộ secret trong repo
env:
  API_KEY: "sk-live-abc123realkey"

# ✅ ĐÚNG — tham chiếu từ secret store của CI
env:
  API_KEY: ${{ secrets.API_KEY }}
```

Secret được cấu hình trong Settings của repo/org (GitHub Secrets, GitLab CI Variables) hoặc
lấy từ Vault. Chúng được **mask** trong log tự động.

## Deploy strategy

| Strategy | Cách làm | Ưu / Nhược |
|----------|----------|------------|
| **Rolling** | Thay dần từng instance sang version mới | Đơn giản; lúc chuyển có 2 version cùng chạy |
| **Blue-green** | Dựng môi trường mới (green) song song, switch traffic 1 phát | Rollback tức thì; tốn gấp đôi tài nguyên |
| **Canary** | Đẩy version mới cho **một phần nhỏ** user, theo dõi rồi mở rộng | An toàn nhất; cần metric & routing tốt |

```
Blue-green:   [Blue v1] ←traffic     →   dựng [Green v2]  →  switch traffic → [Green v2]
Canary:       95% → v1 , 5% → v2  →  ổn định  →  50/50  →  100% → v2
```

> Chọn strategy theo mức rủi ro: thay đổi nhỏ dùng rolling; release lớn cần rollback nhanh
> dùng blue-green; thay đổi rủi ro cao (thuật toán, thanh toán) dùng canary để "thử nước".

## Cạm bẫy hay gặp

- **Hard-code secret trong YAML** → lộ ngay khi repo bị đọc. Luôn dùng secret store.
- **Không có stage scan** → deploy cả dependency dính CVE lên production.
- **Deploy stage chạy cả trên PR/branch phụ** → dùng `if:` giới hạn đúng branch/tag.
- **Không cache** → pipeline chạy 15 phút cho việc đáng lẽ 3 phút.
- **Chọn blue-green khi hạ tầng không đủ** → thiếu tài nguyên, switch thất bại.
- **Pipeline "xanh" nhưng không có test thật** → cảm giác an toàn giả.

## Ghi nhớ

Pipeline đi qua **build → test → scan → deploy**, fail ở đâu dừng đó. Dùng **artifact** để
truyền sản phẩm giữa job, **cache** để tăng tốc. **Secret luôn lấy từ store**, không bao giờ
hard-code. Chọn **deploy strategy** theo rủi ro: rolling (đơn giản), blue-green (rollback
nhanh), canary (an toàn nhất).
