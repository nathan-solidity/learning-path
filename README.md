# Learning Path

Web **lộ trình học tập theo vai trò** (BA, Dev, QA, PM...). Người dùng chọn vai trò của
mình → vào lộ trình từ **cơ bản đến nâng cao** dạng roadmap trực quan, đọc từng bài, và
**tự đánh giá kiến thức** qua checklist. Tiến độ hiển thị theo % (tổng / theo cấp độ / theo
bài) và tự lưu trên trình duyệt.

Khác với 3 tool anh em trong `tools/`:
- `term-glossary` — **từ điển thuật ngữ** ("từ này nghĩa là gì").
- `role-playbook` — **tình huống/incident thực tế** theo vai trò & giai đoạn.
- `skills-playbook` — **catalog công cụ/skill** ("có skill nào cho việc X").
- `learning-path` (tool này) — **giáo trình + tự kiểm tra** ("học gì, theo thứ tự nào, đã
  nắm chưa"). Mỗi bài link sang glossary/playbook/skill để tra cứu sâu hơn.

## Chạy thử

```bash
cd tools/learning-path
pip install -r requirements.txt
python3 server.py
```

Mở `http://localhost:5032`.

Chạy bằng pm2 (giống các tool khác trong `tools/`):

```bash
pm2 start ecosystem.config.js
```

## Tính năng

- **Survey chọn vai trò**: màn hình đầu tiên liệt kê các track (vai trò). Mỗi card hiện %
  hoàn thành hiện tại.
- **Roadmap trực quan**: sidebar hiển thị các cấp độ (Cơ bản → Trung cấp → Nâng cao), mỗi
  bài là một node có chấm trạng thái (chưa học / đang học / đã xong).
- **Tự đánh giá**: mỗi bài có checklist "Tự kiểm tra kiến thức". Tick khi tự tin đã nắm;
  tiến độ tính theo số item đã tick.
- **Progress bám sát**: % tổng ở đầu sidebar, % theo từng cấp độ, và `x/y` theo từng bài.
  Học xong một bài có toast gợi ý bài tiếp theo.
- **Lưu & mang đi**: tiến độ lưu ở `localStorage` (mỗi người một máy, không cần login/DB).
  Nút **Export** lưu ra file JSON để backup/chuyển máy; **Import** nạp lại.
- **Đổi vai trò** bất kỳ lúc nào; tool tự mở lại track gần nhất và bài chưa hoàn thành đầu
  tiên khi quay lại.
- **Dark/light mode** theo cùng phong cách các tool khác.

Phần tra cứu/học tập **không cần API key**. Riêng panel "Hỏi thêm" cần Gemini (xem dưới).

## Panel "Hỏi thêm" (chat Gemini, optional)

Nút **💬 Hỏi thêm** ở góc phải (hiện khi đã chọn vai trò) mở panel chat để hỏi tự do, ví
dụ "REST và SOAP khác nhau chỗ nào?", "Cho ví dụ Acceptance Criteria tốt và xấu". Server
lấy **nội dung các bài trong track đang học** làm context nhét vào prompt, để câu trả lời
bám sát lộ trình thay vì Gemini tự do sáng tác. Câu hỏi ngoài phạm vi sẽ được nói rõ
"Nội dung này chưa có trong lộ trình" trước khi trả lời bằng kiến thức chung. Bài học liên
quan hiện thành nút bên dưới câu trả lời — bấm để nhảy tới bài đó.

Lịch sử hỏi-đáp lưu ở `localStorage` (theo từng track, tối đa 50 câu gần nhất), không lưu
server-side.

### Hướng dẫn cho người dùng: dùng Gemini key riêng

#### Vì sao mỗi người nên dùng key riêng?

- **Key chung = quota chung.** Gemini API giới hạn số request/phút và /ngày theo từng key.
  Khi nhiều người cùng hỏi bằng một key, quota hết rất nhanh → câu trả lời **rất chậm** hoặc
  báo **lỗi** (vượt giới hạn request), ảnh hưởng tới tất cả mọi người.
- **Key riêng = quota riêng.** Bạn có hạn mức của riêng mình, không bị người khác làm chậm.
- **Miễn phí.** Tạo key ở gói miễn phí không cần thẻ thanh toán.
- **Bạn tự kiểm soát.** Có thể xóa hoặc thu hồi key bất cứ lúc nào (xem bên dưới).

#### Tạo key (khoảng 1 phút)

1. Mở [aistudio.google.com/apikey](https://aistudio.google.com/apikey), đăng nhập bằng
   tài khoản Google.
2. Bấm **Create API key**, chọn (hoặc tạo) một Google Cloud project.
3. Copy key vừa tạo (dạng `AIza...`).
4. Trên web Learning Path: bấm **💬 Hỏi thêm** → nút **🔑** → dán key vào ô → bấm **Lưu**.
   Trạng thái chuyển sang đã có key là dùng được.

Lưu ý:
- Key được mã hóa và **chỉ lưu trên trình duyệt bạn đang dùng**. Đổi máy/trình duyệt thì
  phải nhập lại. Server không lưu, không ghi log key.
- Không chia sẻ key cho người khác, không dán key vào chat/tài liệu.
- Gói miễn phí: Google có thể dùng dữ liệu bạn gửi để cải thiện sản phẩm (xem
  [điều khoản Gemini API](https://ai.google.dev/gemini-api/terms)) — **không hỏi nội dung
  bí mật/nội bộ của dự án**.

#### Xóa / thu hồi key

| Muốn | Cách làm | Kết quả |
|---|---|---|
| Xóa key khỏi trình duyệt này | Panel **🔑** → bấm **Xóa key khỏi trình duyệt này** | Web không còn dùng key; key **vẫn còn hiệu lực** phía Google |
| Thu hồi hẳn key | Mở [aistudio.google.com/apikey](https://aistudio.google.com/apikey) → bấm biểu tượng thùng rác cạnh key | Key ngừng hoạt động ở mọi nơi |
| Nghi key bị lộ | Thu hồi ngay (như trên) → tạo key mới → nhập lại vào panel **🔑** | Key cũ vô hiệu, dùng key mới |

### Key của người dùng (BYOK)

Mặc định chat dùng **key chung** (`GEMINI_API_KEY` của server). Khi người dùng chưa có key
riêng, panel hiện gợi ý "Bạn có muốn tạo key riêng để câu trả lời nhanh hơn không?" (bấm
**Để sau** thì ẩn trong phiên hiện tại; gặp lỗi khi dùng key chung thì gợi ý hiện lại). Key
riêng nhập qua nút **🔑** — panel có hướng dẫn tạo key và cách xóa/thu hồi.

- Key mã hóa AES-GCM (WebCrypto), ciphertext ở `localStorage` (`learning-path-gemini-key-v1`),
  khóa giải mã là `CryptoKey` non-extractable trong IndexedDB (`learning-path-crypto`).
  Chống đọc trộm dữ liệu trình duyệt, **không** chống được XSS — nên câu trả lời Gemini được
  sanitize 2 lớp (server bỏ HTML thô khi render markdown, client lọc allowlist tag/attr).
- Mỗi lần hỏi, key gửi qua header `X-Gemini-Key`; server tạo client riêng cho request, không
  lưu, không log. Export tiến độ không chứa key.
- Cần HTTPS hoặc `localhost` (WebCrypto chỉ chạy trong secure context).
- Không có key riêng → server dùng `GEMINI_API_KEY` (bên dưới). Không đặt biến này thì người
  dùng bắt buộc phải nhập key riêng mới hỏi được.

### Cấu hình key chung của server

Copy `.env.example` thành `.env` trong `tools/learning-path/`, điền `GEMINI_API_KEY` (lấy
từ [aistudio.google.com/apikey](https://aistudio.google.com/apikey)). Khi deploy, đặt biến
này ở Environment của Render. Lưu ý: mọi người dùng chưa có key riêng đều dùng quota của key
này.

```bash
cp .env.example .env
# sửa .env, điền GEMINI_API_KEY=...
```

`GEMINI_MODEL` để trống dùng mặc định `gemini-3.6-flash`. Nếu không có `GEMINI_API_KEY`,
phần học tập vẫn chạy bình thường — chỉ nút "Gửi" trong chat báo lỗi rõ ràng, không crash.

Cần thêm `google-genai` và `python-dotenv` (đã có trong `requirements.txt`).

## Deploy lên Render (free)

Cấu hình trên dashboard Render → **New → Web Service** → chọn repo:

| Mục | Giá trị |
|---|---|
| Root Directory | `tools/learning-path` |
| Runtime | Python 3 |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `gunicorn server:app --bind 0.0.0.0:$PORT --workers 2 --threads 4 --timeout 120` |
| Instance Type | Free |
| Environment | `PYTHON_VERSION` = `3.12.13` (bản đang dùng local); `GEMINI_API_KEY` = key chung |

- `--timeout 120`: gửi cả nội dung track làm context nên Gemini có thể trả lời > 30s (mặc
  định của gunicorn).
- Gói free tự ngủ khi không có truy cập; lần mở đầu chờ server thức dậy.
- Sửa bài: push lên branch Render theo dõi → Render tự build lại. `/api/reload` chỉ nạp lại
  trong process đang chạy, không cần dùng trên Render.
- Pill "Tra cứu thêm" (glossary/playbook/skills) chỉ hiện khi chạy `localhost` vì các tool
  đó không được deploy.

## Nhúng diagram vào bài học

Bài học là markdown nên nhúng ảnh bình thường: `![mô tả](/images/tên-ảnh.png)`. Ảnh đặt
trong `images/` và được server phục vụ ở route `/images/<tên>`.

Các diagram trong track BA và Git & GitHub được vẽ bằng **draw.io CLI** (đã cài sẵn:
`/opt/homebrew/bin/drawio`) từ nguồn Mermaid `.mmd`, để dễ tái tạo/chỉnh sửa. Nguồn `.mmd`
nằm cạnh ảnh trong `images/` (diagram Git dùng prefix `git-`):

```bash
cd images
# flowchart duyệt đơn (swimlane-style)
drawio -x -f png --scale 2 -b 20 --mermaid-image true \
  -o ba-order-approval-flow.png order-flow.mmd
# sequence đăng nhập
drawio -x -f png --scale 2 -b 20 --mermaid-image true \
  -o ba-login-sequence.png login-seq.mmd
```

Muốn diagram phức tạp hơn hoặc từ mô tả tự nhiên/codebase, dùng skill `/nta-diagram-gen`
(sinh `.drawio` + render PNG/SVG).

## Cấu trúc dữ liệu — thêm track / ngôn ngữ / framework mới

Mỗi **track** (vai trò hoặc chủ đề học) là một thư mục trong `tracks/`:

```
tracks/
  ba/
    _track.md          # metadata track + intro (bắt buộc)
    01-vai-tro-ba.md   # các bài học, đánh số để sắp thứ tự
    02-loai-tai-lieu.md
    ...
```

### `_track.md` — định nghĩa track & các cấp độ

```markdown
---
track: "ba"
role: "ba"
title: "Business Analyst (BA)"
icon: "📋"
summary: "Mô tả ngắn hiện trên card survey."
levels:
  - key: "basic"
    title: "Cơ bản"
    desc: "Mô tả cấp độ."
  - key: "intermediate"
    title: "Trung cấp"
    desc: "..."
  - key: "advanced"
    title: "Nâng cao"
    desc: "..."
---

Nội dung intro (markdown) — hiện khi chưa chọn bài nào.
```

Nếu bỏ `levels`, tool dùng mặc định basic / intermediate / advanced.

### Gom nhiều track thành một vai trò (group / variant)

Một **vai trò** (vd Dev) có thể có nhiều **nhánh** — mỗi nhánh là một track (thư mục)
riêng, dùng chung một card ở màn survey. Bấm card → chọn nhánh → mới vào lộ trình. Khai báo
bằng các trường group trong `_track.md` của từng nhánh:

```markdown
---
track: "ror"
role: "dev-ror"
group: "dev"                       # cùng group → gom chung 1 card vai trò
group_title: "Developer"           # tên vai trò trên card (lấy từ nhánh đầu tiên)
group_icon: "💻"
group_summary: "Mô tả vai trò hiện trên card gom nhóm."
variant: "Ruby on Rails"           # tên nhánh hiện ở màn chọn nhánh
variant_desc: "Mô tả ngắn của nhánh này."
title: "Ruby on Rails Developer"   # vẫn dùng khi đã vào lộ trình
icon: "💎"
...
```

Thêm nhánh mới (vd Java): tạo `tracks/dev-java/` với cùng `group: "dev"`, đặt `variant`,
`variant_desc` riêng — tự động xuất hiện trong màn chọn nhánh của Dev, không cần sửa code.

Track **không có `group`** là vai trò đơn (1 lộ trình), hiện thẳng 1 card như BA.

### Vai trò "Sắp có" (chưa có bài)

Đặt `coming_soon: true` trong `_track.md` → card hiện ở survey nhưng làm mờ, gắn nhãn
"Sắp có", không bấm vào được. Dùng cho các vai trò đã có khung nhưng chưa biên soạn bài
(QA, DevOps, PM, Comtor, C-Leader). Với group, nếu **mọi** nhánh đều `coming_soon` thì cả
card vai trò cũng "Sắp có".

### File bài học — 1 topic 1 file `.md`

```markdown
---
level: "basic"          # phải khớp một key trong levels
order: 1                # thứ tự trong lộ trình
title: "Vai trò của BA trong dự án"
est: "2-3 giờ"          # thời lượng ước tính (tuỳ chọn)
checklist:
  - "Câu tự đánh giá 1 — tick khi tự tin đã nắm"
  - "Câu tự đánh giá 2"
related:
  - "glossary:ba"       # link sang term-glossary (port 5030)
  - "playbook:ba"       # link sang role-playbook (port 5025)
  - "skill:nta-clarify" # link sang skills-playbook (port 5031)
---

## Nội dung bài học (markdown)
Bảng, code block, blockquote... đều render được.
```

**Thêm một ngôn ngữ/framework mới** (vd Java, React): tạo `tracks/java/`, thêm `_track.md`
và các file bài `.md`. Không cần sửa code. Sau khi thêm/sửa file, gọi reload hoặc restart:

```bash
curl -X POST http://localhost:5032/api/reload
```

### Trường `related` — cú pháp

`kind:value`, trong đó `kind` là `glossary` | `playbook` | `skill`. Pill sẽ link sang tool
tương ứng đang chạy cục bộ (5030 / 5025 / 5031). Với `skill:`, `value` là tên skill (hiện
thành `/value`).

## API

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/tracks` | Danh sách cho màn survey — mỗi entry là `kind="track"` (vai trò đơn) hoặc `kind="group"` (vai trò nhiều nhánh, có mảng `variants`) |
| GET | `/api/track/<key>` | Chi tiết 1 track: levels + topics (HTML + checklist) |
| POST | `/api/ask` | Hỏi Gemini (body: `question`, `track`); context = nội dung bài trong track |
| POST | `/api/reload` | Nạp lại dữ liệu từ `tracks/` (sau khi sửa `.md`) |

## Ghi chú

- Tiến độ lưu client-side (`localStorage`), key `learning-path-progress-v1`. Leader muốn
  xem tiến độ toàn team thì cần bản server-side (SQLite) — hiện chưa làm theo thiết kế.
- Vai trò hiện có nội dung: **BA** (track đơn) và **Developer** (group, các nhánh: **Git &
  GitHub**, **Ruby on Rails**, **Java / Spring Boot**, **Node.js / Express / NestJS**,
  **Python**, **SQL**, và **Secure Coding (Bảo mật)** — 12 bài / 3 cấp (Nền tảng & tư duy /
  Lỗ hổng web thường gặp / Bảo mật hệ thống & quy trình), bám OWASP Top 10, trọng tâm "DEV
  cần làm gì để hạn chế tối đa lỗi bảo mật").
- Nhân rộng: thêm nhánh Dev mới (Java, React...) → tạo thư mục cùng `group: "dev"`; thêm
  vai trò mới → tạo thư mục track, bỏ `coming_soon` khi đã có bài.
