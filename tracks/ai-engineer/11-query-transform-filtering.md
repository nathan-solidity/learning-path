---
level: "ai-inter-rag"
order: 11
title: "Query transformation + metadata filtering"
est: "5-6 giờ"
checklist:
  - "Giải thích được vì sao câu hỏi thô của user thường không tối ưu cho retrieval"
  - "Áp dụng được query rewriting/expansion để làm rõ câu hỏi trước khi tìm"
  - "Giải thích được HyDE và multi-query giải quyết vấn đề gì"
  - "Lọc được kết quả theo metadata (phòng ban, thời gian, quyền truy cập) trước/khi retrieve"
  - "Định tuyến (routing) được câu hỏi tới đúng nguồn/collection phù hợp"
related:
  - "glossary:rag"
  - "skill:nta-security-audit"
---

## Vì sao quan trọng

Bài 10 tối ưu *cách tìm* (hybrid + rerank). Bài này tối ưu *cái đem đi tìm* — bản thân **câu
hỏi**. Câu hỏi user gõ ra thường mơ hồ, thiếu ngữ cảnh, dùng từ khác với tài liệu, hoặc gộp
nhiều ý. Nếu đưa thẳng câu thô đó đi retrieve, kết quả kém ngay từ gốc. **Query transformation**
sửa câu hỏi *trước khi tìm*; **metadata filtering** thu hẹp *phạm vi tìm*. Cả hai đều nâng
precision của retrieval mà không cần đổi vector DB.

## Vì sao câu hỏi thô thường không tối ưu

- **Thiếu ngữ cảnh**: "nó có hỗ trợ cái đó không?" — "nó", "cái đó" là gì? Trong hội thoại,
  câu hỏi phụ thuộc lượt trước.
- **Lệch từ vựng**: user hỏi "nghỉ đẻ", tài liệu ghi "chế độ thai sản" — vector search có bắt
  được phần nào, nhưng làm rõ trước vẫn tốt hơn.
- **Gộp nhiều ý**: "so sánh chính sách nghỉ phép 2023 và 2024" — một lần retrieve khó lấy đủ
  cả hai; nên tách.
- **Quá ngắn / quá mơ hồ**: "lương" — cần expand thành câu đủ nghĩa để embedding rõ hơn.

## Query rewriting & expansion

**Rewriting**: viết lại câu hỏi cho rõ, chèn ngữ cảnh hội thoại, chuẩn hoá từ vựng.
**Expansion**: thêm từ đồng nghĩa/liên quan để tăng khả năng khớp. Cả hai đều là bước gọi LLM
nhẹ *trước* retrieval.

```python
# Python 3.12+ — cài: pip install anthropic
# Viết lại câu hỏi hội thoại thành câu độc lập, đủ ngữ cảnh cho retrieval.
import os
from anthropic import Anthropic

client = Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

def rewrite_query(history: str, question: str) -> str:
    """Biến câu hỏi phụ thuộc ngữ cảnh thành câu độc lập, rõ ràng để đem đi tìm."""
    prompt = f"""Viết lại câu hỏi sau thành MỘT câu độc lập, đầy đủ ngữ cảnh, phù hợp để tìm
kiếm tài liệu. Thay đại từ (nó, cái đó...) bằng danh từ cụ thể dựa trên hội thoại. Chuẩn hoá
từ khẩu ngữ sang thuật ngữ trong tài liệu (vd "nghỉ đẻ" → "chế độ thai sản"). CHỈ trả về câu
đã viết lại, không giải thích.

<hoi_thoai>
{history}
</hoi_thoai>

Câu hỏi: {question}"""
    resp = client.messages.create(
        model="claude-sonnet-5",
        max_tokens=128,
        temperature=0,
        messages=[{"role": "user", "content": prompt}],
    )
    return resp.content[0].text.strip()

print(rewrite_query(
    history="User: Công ty có chế độ thai sản không?\nAssistant: Có, 6 tháng.",
    question="Thế nó áp dụng cho hợp đồng thử việc không?",
))
# → "Chế độ thai sản có áp dụng cho nhân viên đang trong thời gian thử việc không?"
```

## HyDE — tìm bằng câu trả lời giả định

**HyDE** (Hypothetical Document Embeddings): thay vì embed *câu hỏi*, ta bảo LLM **viết một
câu trả lời giả định** cho câu hỏi rồi embed *câu trả lời đó* đi tìm. Lý do: câu trả lời giả
định *giống với đoạn tài liệu thật* (cùng văn phong, cùng thuật ngữ) hơn là câu hỏi ngắn —
nên vector của nó gần các chunk đúng hơn.

> Câu hỏi "nghỉ phép mấy ngày?" ngắn và khác xa văn phong tài liệu. Câu trả lời giả định
> "Nhân viên được nghỉ phép năm 12 ngày làm việc, cộng dồn tối đa 6 ngày..." trông y hệt một
> đoạn policy thật → embedding khớp trúng chunk chứa đáp án.

Câu trả lời giả định **có thể sai dữ kiện** — không sao, ta chỉ dùng nó để *tìm*, còn đáp án
cuối vẫn do LLM sinh từ chunk thật lấy được. HyDE hữu ích khi câu hỏi ngắn/mơ hồ và kho tài
liệu văn phong đồng nhất.

## Multi-query — hỏi nhiều cách, gộp kết quả

Một câu hỏi có thể diễn đạt nhiều cách; mỗi cách retrieve ra tập chunk hơi khác. **Multi-query**
sinh ra vài biến thể của câu hỏi, retrieve từng biến thể, rồi **hợp nhất** (dùng RRF như bài 10).

```python
# Sinh nhiều biến thể của một câu hỏi để retrieve rộng hơn, tránh bỏ sót góc nhìn.
def expand_to_multi_query(question: str, n: int = 3) -> list[str]:
    prompt = f"""Sinh {n} cách diễn đạt KHÁC NHAU cho câu hỏi dưới đây, mỗi cách trên một
dòng, để tăng khả năng tìm đúng tài liệu. Không đánh số, không giải thích.

Câu hỏi: {question}"""
    resp = client.messages.create(
        model="claude-sonnet-5",
        max_tokens=256,
        temperature=0.5,                 # cần đa dạng chút → temperature > 0
        messages=[{"role": "user", "content": prompt}],
    )
    variants = [line.strip() for line in resp.content[0].text.splitlines() if line.strip()]
    return [question] + variants          # giữ luôn câu gốc

# for q in expand_to_multi_query("chế độ thai sản"):
#     ...retrieve từng q rồi hợp nhất bằng RRF (bài 10)
```

> Multi-query và HyDE đều **thêm lượt gọi LLM** trước mỗi retrieval → tăng latency + chi phí.
> Đừng bật mặc định; bật khi đo thấy recall thấp (bài 12).

## Metadata filtering — thu hẹp phạm vi tìm

Từ bài 8, mỗi chunk gắn **metadata** (nguồn, phòng ban, ngày, mức truy cập). **Filtering** dùng
metadata để **loại bớt chunk trước/khi** so vector — vừa nhanh hơn, vừa chính xác hơn, vừa an
toàn hơn (chặn rò rỉ). Vector DB cho lọc ngay trong truy vấn:

```python
# Lọc theo metadata NGAY trong truy vấn: chỉ tìm trong tài liệu HR, còn hiệu lực,
# và user được phép xem. Chroma nhận điều kiện qua tham số `where`.
def search_scoped(query: str, department: str, allowed_levels: list[str], top_k: int = 5):
    hits = col.query(
        query_texts=[query],
        n_results=top_k,
        where={                                   # cú pháp filter tuỳ vector DB
            "$and": [
                {"department": {"$eq": department}},
                {"access_level": {"$in": allowed_levels}},
            ]
        },
    )
    return hits["documents"][0]

# search_scoped("chính sách nghỉ phép", department="HR", allowed_levels=["public", "staff"])
```

| Loại filter | Ví dụ | Vì sao cần |
|-------------|-------|-----------|
| Phòng ban | `department = "HR"` | Không lẫn tài liệu phòng khác |
| Thời gian | `year >= 2024` | Bỏ tài liệu đã hết hiệu lực |
| Quyền truy cập | `access_level ∈ user_perms` | **Chặn rò rỉ** dữ liệu ngoài quyền |
| Ngôn ngữ / loại | `lang = "vi"`, `type = "policy"` | Đúng loại nội dung |

> **Lọc quyền là vấn đề bảo mật, không phải tối ưu.** Nếu để user hỏi ra chunk của phòng/người
> khác là **rò rỉ dữ liệu**. Luôn lọc `access_level` theo quyền *thực* của user, tính ở
> server — đừng tin client. Chạy `/nta-security-audit` để soát đường rò rỉ này.

## Routing — định tuyến tới đúng nguồn

Khi có **nhiều** collection/nguồn (policy HR, tài liệu kỹ thuật, FAQ, DB đơn hàng), không nên
tìm mù ở tất cả. **Routing** dùng LLM (hoặc luật) phân loại câu hỏi → chọn nguồn phù hợp rồi
mới retrieve ở đó.

```python
# Định tuyến câu hỏi tới đúng collection. Dùng structured/enum để câu trả lời gọn, tất định.
def route(question: str) -> str:
    prompt = f"""Phân loại câu hỏi vào ĐÚNG MỘT nhóm, chỉ trả về nhãn:
- hr        : nghỉ phép, lương, thai sản, hợp đồng
- tech      : hướng dẫn kỹ thuật, cấu hình, lỗi hệ thống
- orders    : tra cứu đơn hàng, mã SKU, tồn kho

Câu hỏi: {question}
Nhãn:"""
    resp = client.messages.create(
        model="claude-sonnet-5",
        max_tokens=8,
        temperature=0,
        messages=[{"role": "user", "content": prompt}],
    )
    return resp.content[0].text.strip().lower()

# label = route(question)          # "hr" | "tech" | "orders"
# col = collections[label]; col.query(...)   # chỉ tìm trong collection đúng
```

Routing giảm nhiễu (không lôi chunk từ nguồn không liên quan) và cho phép mỗi nguồn có filter/
cấu hình riêng. Với ít nguồn, một câu prompt phân loại là đủ; nhiều nguồn phức tạp thì cân
nhắc classifier riêng.

## Cạm bẫy hay gặp

- **Rewrite làm sai ý user** → viết lại quá tay khiến lệch câu hỏi gốc; giữ temperature 0 và ràng buộc "chỉ làm rõ, không đổi ý".
- **Bật HyDE/multi-query mặc định** → tăng latency + chi phí (mỗi câu thêm 1-4 lượt LLM) mà chưa chắc cải thiện; đo trước (bài 12).
- **Quên lọc quyền** → user hỏi ra tài liệu ngoài quyền = rò rỉ dữ liệu; lọc `access_level` theo quyền thực, tính ở server.
- **Tin metadata do client gửi** để lọc quyền → user tự sửa được; nguồn quyền phải từ server/session.
- **Route sai gom hết về một nhãn** → nhãn mơ hồ/prompt lỏng; định nghĩa nhóm rõ, thêm nhãn "khác" và fallback tìm rộng khi không chắc.

## Ghi nhớ

Câu hỏi thô của user thường **mơ hồ, lệch từ vựng, thiếu ngữ cảnh** — nên tối ưu *trước khi
tìm*. **Query rewriting/expansion** làm rõ và chuẩn hoá câu hỏi; **HyDE** embed một *câu trả
lời giả định* (giống tài liệu thật hơn câu hỏi) để tìm trúng hơn; **multi-query** sinh nhiều
biến thể rồi hợp nhất bằng RRF. **Metadata filtering** thu hẹp phạm vi theo phòng ban/thời
gian/**quyền truy cập** — trong đó lọc quyền là **bảo mật**, phải tính ở server, đừng tin
client. **Routing** định tuyến câu hỏi tới đúng nguồn để giảm nhiễu. Các kỹ thuật này **thêm
lượt gọi LLM** → **đo trước, bật sau (bài 12)**, và luôn canh **rò rỉ dữ liệu** qua filter quyền.
