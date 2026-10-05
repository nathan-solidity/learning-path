---
level: "ai-inter-app"
order: 17
title: "Caching và kiểm soát chi phí"
est: "5-6 giờ"
checklist:
  - "Cache được câu trả lời trùng lặp (exact-match) để không gọi lại model cho cùng một câu hỏi"
  - "Giải thích được semantic cache và khi nào nó cứu chi phí so với exact cache"
  - "Dùng được prompt caching để giảm giá phần context lặp lại giữa nhiều request"
  - "Định tuyến (route) tác vụ đơn giản sang model rẻ, chỉ dùng model mạnh khi thật cần"
  - "Đo và giới hạn được token/chi phí mỗi request và mỗi người dùng, đặt rate limit"
related:
  - "glossary:token"
  - "glossary:embedding"
  - "skill:nta-perf-audit"
---

## Vì sao quan trọng

Trong demo, mỗi lời gọi LLM tốn vài xu và bạn gọi vài chục lần — không ai để ý. Lên
production với hàng nghìn người dùng, **token chính là hóa đơn**: cùng một câu hỏi phổ biến
được hỏi 10.000 lần, mỗi lần trả tiền lại; một prompt hệ thống dài kèm mỗi request nhân lên
theo lưu lượng. Kỹ sư AI phân biệt với người làm demo ở chỗ **kiểm soát được chi phí trước
khi hóa đơn nổ**: cache thứ lặp lại, chọn đúng model cho đúng việc, và đo/chặn token từ ngày đầu.

> Demo tối ưu cho "chạy được". Production tối ưu cho "chạy được **với chi phí kiểm soát
> được**". Một endpoint AI không giới hạn token là một vòi tiền không có van khóa.

## Cache exact-match: câu hỏi trùng thì đừng gọi lại

Rất nhiều request là **lặp lại y hệt**: cùng câu FAQ, cùng đoạn text cần phân loại. Gọi model
lại cho câu đã trả lời là đốt tiền vô nghĩa. Cache đơn giản nhất: **hash input → lưu output**.

```python
# Python 3.12+ — exact cache bằng Redis (bền, chia sẻ giữa nhiều worker)
import os, hashlib, json
import redis
from anthropic import Anthropic

r = redis.Redis(host="localhost", port=6379, db=2)
client = Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

def cache_key(question: str, model: str) -> str:
    # Hash cả model vào key: đổi model → kết quả khác → không dùng nhầm cache cũ
    raw = json.dumps({"q": question, "m": model}, ensure_ascii=False)
    return "llm:" + hashlib.sha256(raw.encode()).hexdigest()

def ask_cached(question: str, ttl: int = 3600) -> str:
    key = cache_key(question, "claude-sonnet-5")
    if (hit := r.get(key)) is not None:
        return hit.decode()                     # cache hit → 0 token, ~0ms
    resp = client.messages.create(
        model="claude-sonnet-5", max_tokens=512,
        messages=[{"role": "user", "content": question}],
    )
    answer = resp.content[0].text
    r.setex(key, ttl, answer)                    # đặt TTL để dữ liệu không cũ mãi
    return answer
```

Điểm cần nhớ: **đặt TTL** (dữ liệu và câu trả lời tốt sẽ cũ đi), và **đưa mọi thứ ảnh hưởng
kết quả vào key** (model, temperature, phiên bản prompt). Với câu trả lời cần tất định thì để
`temperature=0`, nếu không cùng input vẫn ra khác nhau và cache thành ra sai lệch.

## Semantic cache: câu hỏi *gần giống* cũng dùng lại được

Exact cache trượt ngay khi user diễn đạt khác đi: *"Nghỉ phép mấy ngày?"* và *"Công ty cho
nghỉ phép bao nhiêu ngày một năm?"* là cùng ý nhưng khác chữ → hai lần gọi model. **Semantic
cache** dùng lại bài 7: **embedding** câu hỏi, tìm trong cache câu cũ **gần nghĩa** nhất; nếu
độ tương đồng vượt ngưỡng thì trả lại câu trả lời cũ.

Pattern (không phụ thuộc thư viện cụ thể):

1. Với mỗi câu hỏi mới, tính **embedding** của nó.
2. Tìm trong vector store các câu hỏi cũ có **cosine similarity** cao nhất.
3. Nếu similarity ≥ ngưỡng (ví dụ 0.95) → trả câu trả lời đã lưu, **không gọi model**.
4. Nếu không đạt → gọi model, rồi lưu cặp (embedding câu hỏi, câu trả lời) vào cache.

| | Exact cache | Semantic cache |
|--|-------------|----------------|
| Khớp khi | Input trùng từng ký tự | Input gần nghĩa (đo bằng embedding) |
| Hit rate | Thấp (chữ phải y hệt) | Cao hơn cho câu hỏi tự nhiên |
| Rủi ro | Gần như không | Ngưỡng quá thấp → trả sai câu; cần chọn ngưỡng cẩn thận |
| Chi phí thêm | Không | Một lần embedding mỗi câu hỏi (rẻ hơn nhiều so với một lời gọi LLM) |

> Semantic cache mạnh nhưng có rủi ro: ngưỡng đặt thấp quá thì hai câu *khác ý* bị coi là
> giống → trả câu trả lời sai. Đặt ngưỡng cao, và cân nhắc tắt semantic cache cho tác vụ đòi
> độ chính xác cao (số liệu, pháp lý).

## Prompt caching: giảm giá phần context lặp lại

Nhiều app đính kèm một khối **context cố định** vào mỗi request: system prompt dài, tài liệu
tham chiếu, ví dụ few-shot. Phần này giống hệt qua mọi request nhưng vẫn bị tính token mỗi
lần. **Prompt caching** (do provider hỗ trợ) cho phép đánh dấu khối lặp lại đó để nhà cung
cấp cache phía họ: các lần sau, phần đã cache được tính giá **rẻ hơn nhiều** so với token thường.

Cách dùng: đánh dấu điểm cắt cache trên khối nội dung ổn định (system prompt, tài liệu nền)
trong request gửi lên. Đặt **phần tĩnh lên đầu, phần thay đổi (câu hỏi người dùng) xuống
cuối** để tối đa phần dùng lại được.

> Cú pháp đánh dấu cache khác nhau giữa các provider và thay đổi theo thời gian — tra tài
> liệu API hiện hành thay vì chép cứng. Nguyên tắc bất biến: **tách phần lặp lại ra khỏi
> phần thay đổi**, đặt phần lặp lại ở đầu prompt.

## Model routing: đừng dùng dao mổ trâu giết gà

Không phải tác vụ nào cũng cần model mạnh nhất. Phân loại một câu, trích một trường JSON,
kiểm duyệt spam — model nhỏ/rẻ làm tốt và nhanh hơn. **Model routing** là chọn model theo
độ khó của tác vụ: rẻ cho việc dễ, đắt chỉ khi thật cần.

```python
# Định tuyến theo loại tác vụ — model mạnh chỉ dành cho việc khó
def route_model(task_type: str) -> str:
    cheap = "claude-haiku-4-5"     # phân loại, trích field, kiểm duyệt — rẻ, nhanh
    strong = "claude-sonnet-5"   # suy luận, viết dài, tổng hợp phức tạp
    simple_tasks = {"classify", "extract", "moderate", "detect_language"}
    return cheap if task_type in simple_tasks else strong
```

Một biến thể nâng cao: **cascade** — thử model rẻ trước, nếu nó tự báo "không chắc" (hoặc
kết quả không đạt kiểm tra) mới nâng cấp lên model mạnh. Đa số request giải quyết ở tầng rẻ,
chỉ phần khó mới chạm tầng đắt.

## Đo và giới hạn token/chi phí

Không đo thì không kiểm soát. Response API trả về **usage** (số token input/output) — dùng
nó để tính tiền, ghi log, và **chặn trần**.

```python
# Đo token thực tế từ response và ước tính chi phí
# Đơn giá dưới đây là ví dụ minh họa — tra bảng giá provider hiện hành cho số thật.
PRICE = {"in": 3.0 / 1_000_000, "out": 15.0 / 1_000_000}   # USD mỗi token (ví dụ)

def call_and_measure(question: str) -> dict:
    resp = client.messages.create(
        model="claude-sonnet-5", max_tokens=512,
        messages=[{"role": "user", "content": question}],
    )
    u = resp.usage   # có input_tokens / output_tokens
    cost = u.input_tokens * PRICE["in"] + u.output_tokens * PRICE["out"]
    return {"answer": resp.content[0].text,
            "tokens_in": u.input_tokens, "tokens_out": u.output_tokens,
            "cost_usd": round(cost, 6)}
```

Trên nền số liệu này, đặt các van khóa:

- **Trần token mỗi request**: `max_tokens` phía server (đã nói ở bài 16).
- **Hạn mức mỗi người dùng**: đếm token/chi phí theo user trong ngày, vượt thì chặn hoặc hạ
  cấp model.
- **Rate limit**: giới hạn số request/phút mỗi client (theo API key hoặc IP) để chống lạm dụng
  và tăng đột biến chi phí.
- **Cảnh báo ngân sách**: cộng dồn chi phí toàn hệ thống, vượt ngưỡng thì báo động (nối với
  bài 18).

Muốn soi chỗ nào ngốn token/tài nguyên bất thường trong code, chạy `/nta-perf-audit`.

## Cạm bẫy hay gặp

- **Không đưa model/temperature vào cache key** → đổi cấu hình vẫn trả kết quả cache cũ, sai.
- **Cache không TTL** → câu trả lời cũ sống mãi kể cả khi dữ liệu nguồn đã đổi.
- **Semantic cache ngưỡng thấp** → hai câu khác ý bị coi là giống, trả nhầm câu trả lời.
- **Dùng model mạnh cho mọi việc** → hóa đơn cao gấp nhiều lần mà chất lượng không hơn cho
  việc dễ.
- **Không đo usage** → không biết tiền chảy đi đâu, không phát hiện được request đốt token.
- **Không rate limit** → một client (hoặc bug loop) có thể đốt sạch ngân sách trong vài phút.

## Ghi nhớ

**Token là hóa đơn — kiểm soát nó từ ngày đầu.** Cache phần lặp lại: **exact cache** (hash
input → output, có TTL, đưa model/temperature vào key) cho câu trùng, **semantic cache**
(embedding + similarity) cho câu gần nghĩa, và **prompt caching** để giảm giá khối context
cố định — nhớ đặt phần tĩnh lên đầu. Dùng **model routing**: model rẻ cho việc dễ (phân loại,
trích field), model mạnh chỉ khi thật cần, có thể cascade từ rẻ lên đắt. Cuối cùng **đo và
chặn**: đọc `usage` để tính token/chi phí, đặt trần token mỗi request, hạn mức mỗi user, và
**rate limit** — không có van khóa thì một endpoint AI là vòi tiền không đáy.
