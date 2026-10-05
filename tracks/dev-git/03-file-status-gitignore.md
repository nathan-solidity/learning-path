---
level: "basic"
order: 3
title: "Trạng thái file & .gitignore"
est: "1-2 giờ"
checklist:
  - "Phân biệt được 4 trạng thái file: untracked / unmodified / modified / staged"
  - "Đọc được output của git status và biết file đang ở trạng thái nào"
  - "Viết được .gitignore để bỏ qua node_modules, .env, file build"
  - "Hiểu vì sao không được commit secret (.env, key) lên repo"
related:
  - "glossary:gitignore"
  - "skill:nta-env-gen"
---

## 4 trạng thái của file trong Git

Mỗi file trong repo luôn ở một trong các trạng thái sau. Hiểu chúng thì đọc `git status`
không còn bối rối:

| Trạng thái | Ý nghĩa |
|-----------|---------|
| **Untracked** | File mới, Git chưa theo dõi |
| **Unmodified** | File đã theo dõi, không thay đổi so với commit cuối |
| **Modified** | File đã theo dõi và **đã bị sửa**, chưa stage |
| **Staged** | File đã `git add`, sẵn sàng để commit |

Vòng đời: một file mới là **untracked** → `git add` → **staged** → `git commit` →
**unmodified** → sửa file → **modified** → `git add` lại → **staged**...

![Vòng đời trạng thái file trong Git](/images/git-file-lifecycle.png)

```bash
git status          # xem trạng thái tất cả file
git status -s       # dạng gọn: ?? = untracked, M = modified, A = added
```

## .gitignore — bỏ qua file không nên theo dõi

Không phải file nào cũng nên vào Git. Những thứ **không bao giờ** commit:

- Thư mục dependency: `node_modules/`, `vendor/`, `__pycache__/`
- File build/tạm: `dist/`, `build/`, `*.log`
- File nhạy cảm: `.env`, key, credential
- File cấu hình cá nhân của IDE: `.idea/`, `.vscode/`

Tạo file `.gitignore` ở gốc repo và liệt kê pattern:

```gitignore
node_modules/
.env
*.log
dist/
__pycache__/
.DS_Store
```

Git sẽ bỏ qua các file khớp pattern — chúng không hiện trong `git status` và không bị `add`.

> **Lưu ý:** `.gitignore` chỉ có tác dụng với file **untracked**. Nếu file đã lỡ commit
> rồi, thêm vào `.gitignore` **không** gỡ nó ra — phải `git rm --cached <file>` (xem bài
> *Sửa sai*).

## Tuyệt đối không commit secret

Đây là lỗi bảo mật phổ biến và nguy hiểm. **Không bao giờ** commit:

- `.env`, file chứa password, API key, token, private key.
- Ngay cả khi xóa ở commit sau — **key vẫn nằm trong lịch sử Git** và ai clone repo cũng
  đọc được. Coi như key đã lộ, phải xoay (rotate) lại.

Cách đúng: đưa `.env` vào `.gitignore` ngay từ đầu, commit một file mẫu `.env.example`
(không có giá trị thật) để đồng đội biết cần biến gì.

> Muốn sinh `.env.example` từ codebase và phát hiện secret lỡ commit: dùng skill `/nta-env-gen`.
