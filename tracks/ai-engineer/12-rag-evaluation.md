---
level: "ai-inter-rag"
order: 12
title: "RAG evaluation"
est: "5-6 giờ"
checklist:
  - "Tách được hai tầng cần đo: retrieval (tìm đúng chunk?) và generation (trả lời đúng?)"
  - "Tính và diễn giải được recall@k và MRR cho retrieval"
  - "Đo được faithfulness và answer relevance cho generation"
  - "Dùng được LLM-as-judge để chấm điểm khi không có đáp án chuẩn"
  - "Xây được vòng lặp: đo → tìm khâu yếu → sửa (bài 10/11) → đo lại"
related:
  - "glossary:rag"
  - "skill:nta-perf-audit"
  - "skill:nta-test-data"
---

## Vì sao quan trọng

Bài 10 và 11 cho bạn nhiều "nút vặn": hybrid search, reranking, query rewriting, HyDE,
multi-query, filtering, routing. Nhưng ở cuối cả hai bài đều lặp một câu: **"đo trước, bật
sau"**. Bài này chính là cái "đo" đó. Không có evaluation, bạn chỉ *đoán* rằng thay đổi có
giúp ích — và ở cuối bài 9 ta đã ghi giới hạn: *"không có cách đo RAG trả đúng bao nhiêu %"*.
Đây là bài đóng cấp Production RAG: biến RAG từ "có vẻ chạy tốt" thành **con số đo được** để
cải thiện có căn cứ.

## Hai tầng phải đo riêng

RAG hỏng ở hai chỗ khác nhau, và **phải đo tách** để biết sửa chỗ nào:

| Tầng | Câu hỏi | Hỏng ở đây nghĩa là | Sửa bằng |
|------|---------|---------------------|----------|
| **Retrieval** | Có lấy đúng chunk chứa đáp án không? | Chunk đúng không lọt top-k | Bài 10 (hybrid/rerank), 11 (query, filter) |
| **Generation** | Từ chunk đó, LLM trả lời đúng không? | Có chunk đúng nhưng trả lời sai/bịa | Prompt (bài 9), chọn model |

> Nếu chỉ nhìn câu trả lời cuối, bạn không phân biệt được: retrieve sai (thiếu dữ kiện) hay
> generate sai (có dữ kiện mà vẫn bịa). Đo tách hai tầng mới biết vặn nút nào.

## Đo retrieval: recall@k và MRR

Cần một **bộ eval**: danh sách câu hỏi, mỗi câu kèm (các) chunk đúng — gọi là *ground truth*.
Có thể tự viết tay ~30-50 câu, hoặc dùng LLM sinh câu hỏi từ chunk rồi người soát lại.

- **recall@k**: trong top-k chunk retrieve được, có bao nhiêu % câu hỏi mà chunk đúng **lọt
  vào** top-k. Đo "có tìm ra đáp án không". recall@5 = 0.8 nghĩa là 80% câu hỏi có chunk đúng
  trong top 5.
- **MRR (Mean Reciprocal Rank)**: chunk đúng nằm ở **hạng mấy**? Nếu ở hạng 1 → điểm 1, hạng
  2 → 1/2, hạng 3 → 1/3... Lấy trung bình. Đo "đáp án ở top có *cao* không" — quan trọng vì
  LLM đọc chunk đầu kỹ hơn.

```python
# Python 3.12+ — không cần thư viện ngoài. Đo retrieval bằng ground truth tự chuẩn bị.
# eval_set: mỗi câu hỏi kèm tập id chunk đúng (relevant).
eval_set = [
    {"q": "Nộp đơn nghỉ phép trước mấy ngày?", "relevant": {"c0"}},
    {"q": "Nghỉ phép năm bao nhiêu ngày?",      "relevant": {"c1"}},
]

def retrieve_ids(query: str, k: int) -> list[str]:
    """Thay bằng pipeline retrieval thật của bạn (hybrid/rerank...). Trả về id đã xếp hạng."""
    ...  # hits = col.query(query_texts=[query], n_results=k); return hits["ids"][0]

def evaluate_retrieval(eval_set: list[dict], k: int = 5) -> dict:
    recall_hits, rr_total = 0, 0.0
    for item in eval_set:
        ranked = retrieve_ids(item["q"], k)
        relevant = item["relevant"]

        # recall@k: chunk đúng có lọt top-k không
        if relevant & set(ranked):
            recall_hits += 1

        # reciprocal rank: 1/(hạng của chunk đúng đầu tiên), 0 nếu không có
        rr = 0.0
        for rank, doc_id in enumerate(ranked, start=1):
            if doc_id in relevant:
                rr = 1.0 / rank
                break
        rr_total += rr

    n = len(eval_set)
    return {"recall@k": recall_hits / n, "MRR": rr_total / n}

# print(evaluate_retrieval(eval_set, k=5))   # {"recall@k": 0.9, "MRR": 0.78}
```

recall@k thấp → khâu **retrieval** yếu → quay lại bài 10/11 (hybrid, rerank, query rewrite).
MRR thấp dù recall cao → chunk đúng *có* nhưng nằm sâu → **reranking** (bài 10) là nút cần vặn.

## Đo generation: faithfulness & answer relevance

Retrieval đúng chưa đủ; còn phải xem LLM có dùng đúng chunk để trả lời không. Hai chỉ số then
chốt:

- **Faithfulness (bám dữ kiện)**: câu trả lời có **chỉ** dựa trên chunk cung cấp không, hay có
  câu bịa ngoài context? Đây là chỉ số **chống hallucination** — quan trọng nhất với RAG.
- **Answer relevance (đúng trọng tâm)**: câu trả lời có **đúng vào** câu hỏi không, hay lan man/
  lạc đề?

Cả hai khó đo bằng luật (không có đáp án cố định) → dùng **LLM-as-judge**.

## LLM-as-judge — chấm điểm khi không có đáp án chuẩn

Ý tưởng: dùng một LLM làm **giám khảo**, đưa cho nó (câu hỏi, context, câu trả lời) và **rubric
rõ ràng**, bảo nó chấm điểm. Rẻ và mở rộng được, nhưng phải **rubric chặt + tất định** thì mới
tin được.

```python
# LLM-as-judge chấm faithfulness: câu trả lời có bám hoàn toàn vào context không?
# Dùng structured output để nhận điểm số máy đọc được, temperature 0 cho ổn định.
import os
from anthropic import Anthropic

client = Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

def judge_faithfulness(question: str, context: str, answer: str) -> dict:
    prompt = f"""Bạn là giám khảo đánh giá độ BÁM DỮ KIỆN của câu trả lời RAG.
Chấm 1-5: mọi khẳng định trong CÂU TRẢ LỜI có được NGỮ CẢNH chống lưng không?
- 5: mọi ý đều có trong ngữ cảnh, không bịa.
- 3: phần lớn đúng nhưng có ý không thấy trong ngữ cảnh.
- 1: nhiều ý bịa, không dựa ngữ cảnh.

<ngu_canh>{context}</ngu_canh>
<cau_hoi>{question}</cau_hoi>
<cau_tra_loi>{answer}</cau_tra_loi>"""
    resp = client.messages.create(
        model="claude-sonnet-5",
        max_tokens=256,
        temperature=0,                       # giám khảo cần tất định
        output_config={                      # ép trả JSON đúng schema
            "format": {
                "type": "json_schema",
                "schema": {
                    "type": "object",
                    "properties": {
                        "score": {"type": "integer", "enum": [1, 2, 3, 4, 5]},
                        "reason": {"type": "string"},
                    },
                    "required": ["score", "reason"],
                    "additionalProperties": False,
                },
            }
        },
        messages=[{"role": "user", "content": prompt}],
    )
    import json
    text = next(b.text for b in resp.content if b.type == "text")
    return json.loads(text)                   # {"score": 5, "reason": "..."}

# judge_faithfulness(question, context, answer) → {"score": 4, "reason": "..."}
```

> LLM-as-judge **không tuyệt đối đúng**: nó cũng là LLM, có thể lệch. Giảm rủi ro bằng rubric
> cụ thể (mô tả rõ từng mức điểm), temperature 0, và **soát tay một mẫu** để kiểm giám khảo có
> chấm hợp lý không trước khi tin cả loạt.

## Dùng bộ eval có sẵn (RAGAS)

Không cần tự viết mọi chỉ số. **RAGAS** là framework chuyên đánh giá RAG, có sẵn các metric
`faithfulness`, `answer_relevancy`, `context_precision`, `context_recall`... — phần lớn dựa
trên LLM-as-judge bên dưới. Bạn cung cấp dataset (câu hỏi, context retrieve được, câu trả lời,
và ground truth nếu có), RAGAS trả về điểm từng metric.

> Cú pháp/tên hàm chính xác của RAGAS (cách dựng dataset, gọi `evaluate`, chọn LLM chấm) thay
> đổi theo phiên bản — **xem docs chính thức của RAGAS** thay vì đoán API. Ý tưởng không đổi:
> đưa dataset vào, nhận điểm các metric ra. Có thể dùng `/nta-test-data` để sinh bộ câu hỏi
> eval ban đầu rồi soát tay.

## Vòng lặp cải thiện

Evaluation chỉ có giá trị khi nằm trong **vòng lặp**:

1. **Đo** baseline: chạy eval-set qua pipeline hiện tại, ghi recall@k, MRR, faithfulness,
   relevance.
2. **Chẩn**: recall@k thấp → retrieval yếu; MRR thấp → thiếu rerank; faithfulness thấp →
   prompt/model; relevance thấp → query hoặc prompt.
3. **Sửa** đúng khâu: thêm hybrid/rerank (bài 10), rewrite/HyDE/filter (bài 11), siết prompt
   (bài 9).
4. **Đo lại** trên **cùng eval-set** → so con số, giữ thay đổi nào *thực sự* cải thiện, bỏ
   thay đổi làm tệ đi hoặc chỉ tăng chi phí.

> Đây là lý do các bài trước cứ nhắc "đo trước, bật sau". Không có vòng lặp này, mỗi lần thêm
> reranking hay HyDE bạn chỉ **cảm giác** tốt hơn — có khi tăng latency (soi bằng
> `/nta-perf-audit`) mà chất lượng không đổi.

## Cạm bẫy hay gặp

- **Chỉ nhìn câu trả lời cuối** → không biết retrieve sai hay generate sai; đo tách hai tầng.
- **Không có eval-set** → không đo được gì; bỏ công viết 30-50 câu + ground truth trước tiên.
- **Tin LLM-as-judge mù quáng** → giám khảo cũng lệch; rubric cụ thể, temperature 0, soát tay một mẫu.
- **Đổi eval-set giữa các lần đo** → không so được; cố định eval-set để so con số qua từng thay đổi.
- **Tối ưu một chỉ số, quên chỉ số khác** → tăng recall bằng cách nhồi nhiều chunk có thể tụt faithfulness (nhiễu); nhìn cả bộ chỉ số.
- **Bật hết nút cùng lúc** rồi đo → không biết nút nào giúp; đổi từng thứ, đo lại từng lần.

## Ghi nhớ

Không đo thì mọi tối ưu (bài 10/11) chỉ là **đoán**. RAG hỏng ở hai tầng phải đo **tách**:
**retrieval** (đo bằng **recall@k** — chunk đúng có lọt top-k, và **MRR** — nó nằm ở hạng bao
cao) và **generation** (đo **faithfulness** — bám dữ kiện, chống hallucinate — và **answer
relevance** — đúng trọng tâm). Khi không có đáp án chuẩn, dùng **LLM-as-judge** với **rubric
chặt + temperature 0**, và **soát tay một mẫu** vì giám khảo cũng có thể lệch. Bộ eval như
**RAGAS** gói sẵn các metric này (tra docs cho cú pháp chính xác). Quan trọng nhất là **vòng
lặp**: đo baseline → chẩn khâu yếu → sửa đúng nút → **đo lại trên cùng eval-set** → chỉ giữ
thay đổi thật sự cải thiện. Đó là cách biến Production RAG từ "có vẻ ổn" thành **đo được và
tốt lên có căn cứ**.
