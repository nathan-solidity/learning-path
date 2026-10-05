---
level: "ai-adv-llm"
order: 26
title: "Fine-tuning và LoRA"
est: "6-7 giờ"
checklist:
  - "Quyết định được đúng lúc dùng prompting vs RAG vs fine-tuning cho một bài toán cụ thể"
  - "Giải thích được vì sao full fine-tune tốn kém và PEFT/LoRA giải quyết điều đó thế nào"
  - "Mô tả được trực giác LoRA: đóng băng model gốc, chỉ học adapter rank thấp"
  - "Hiểu QLoRA thêm quantization để fine-tune trên GPU nhỏ, và đánh đổi của nó"
  - "Chuẩn bị được dataset instruction đúng định dạng (input–output) và biết vì sao chất lượng > số lượng"
  - "Kể được pattern dùng Hugging Face peft/transformers để LoRA (không cần nhớ signature chính xác)"
related:
  - "glossary:fine-tuning"
  - "glossary:lora"
  - "glossary:rag"
---

## Vì sao quan trọng

Bài 22-24 bạn hiểu training/DL, bài 25 mổ xẻ Transformer. Giờ tới câu hỏi **thực tế nhất mà
AI Engineer phải trả lời**: *"Model chưa làm đúng ý tôi — tôi nên chỉnh prompt, gắn RAG, hay
fine-tune?"* Chọn sai hướng ở đây tốn hàng tuần công và hàng nghìn đô GPU cho thứ đáng lẽ chỉ
cần sửa một prompt. Bài này cho bạn **khung quyết định** đó trước, rồi mới đi vào *cách*
fine-tune hiệu quả bằng **LoRA/QLoRA**.

> Fine-tune cần **GPU** (thường VRAM lớn) và pipeline train. Đây là việc nặng — đừng chọn nó
> chỉ vì nghe "xịn". Phần lớn bài toán *không* cần fine-tune.

## Quyết định lớn: prompting vs RAG vs fine-tuning

Ba công cụ giải **ba vấn đề khác nhau**. Nhầm lẫn ở đây là sai lầm đắt nhất của người mới.

| Công cụ | Giải vấn đề gì | KHÔNG giải được | Chi phí |
|---------|----------------|-----------------|---------|
| **Prompting** | Định hướng hành vi, định dạng, giọng điệu | Thêm *kiến thức* mới model chưa có | Gần như 0 |
| **RAG** (bài 9) | Cho model *kiến thức/dữ kiện* mới, cập nhật, riêng tư | Dạy *kỹ năng/hành vi* mới | Thấp–vừa |
| **Fine-tuning** | Dạy *hành vi/phong cách/định dạng* mới, nhất quán, sâu | Nhồi kiến thức hay đổi liên tục (tốn kém, dễ lỗi thời) | Cao |

Quy tắc thực dụng, theo thứ tự **rẻ → đắt**:

1. **Thử prompting trước.** 80% vấn đề "model làm chưa đúng" là prompt chưa rõ. Rẻ nhất.
2. **Cần dữ kiện/kiến thức mới, riêng, hay đổi?** → **RAG**. Đừng fine-tune để "nhét kiến
   thức" — kiến thức đổi thì phải train lại, còn RAG chỉ cần cập nhật tài liệu.
3. **Cần hành vi/định dạng đặc thù, ổn định mà prompt dài dòng mãi vẫn không đạt?** →
   **fine-tune**. Ví dụ: luôn xuất đúng một schema JSON nghiệp vụ lạ, giữ giọng thương hiệu
   riêng, phân loại theo taxonomy nội bộ phức tạp.

> Câu thần chú: **RAG dạy model *biết gì*, fine-tuning dạy model *cư xử thế nào*.** Rất nhiều
> team đốt tiền fine-tune để "dạy kiến thức công ty" trong khi RAG làm việc đó tốt hơn, rẻ
> hơn, cập nhật dễ hơn. Và thường **RAG + prompt tốt** đã đủ, không cần fine-tune.

## Full fine-tune vs PEFT: vì sao LoRA ra đời

**Full fine-tuning** = cập nhật *toàn bộ* tham số của model (hàng tỉ). Vấn đề:

- **Tốn VRAM khủng**: phải giữ trọng số + gradient + trạng thái optimizer cho *mọi* tham số.
- **Mỗi task một bản copy khổng lồ**: fine-tune 5 task = 5 model đầy đủ để lưu và deploy.
- **Dễ hỏng**: dữ liệu ít mà chỉnh cả model → dễ "quên" năng lực cũ (catastrophic forgetting).

**PEFT** (Parameter-Efficient Fine-Tuning) là họ kỹ thuật chỉ chỉnh **một phần rất nhỏ** tham
số, giữ nguyên phần còn lại. **LoRA** là kỹ thuật PEFT phổ biến nhất.

### Trực giác LoRA: adapter rank thấp

Ý tưởng LoRA: **đóng băng toàn bộ model gốc**, không đụng vào một tham số nào của nó. Thay vào
đó, cạnh mỗi lớp cần điều chỉnh, chèn thêm một cặp ma trận **nhỏ** — gọi là **adapter** — và
chỉ train hai ma trận nhỏ này.

Vì sao ma trận nhỏ mà đủ? Trực giác: sự "điều chỉnh" cần thiết để thích nghi model với một
task cụ thể thường **đơn giản hơn nhiều** so với toàn bộ tri thức model đã có. Sự điều chỉnh
đó có thể biểu diễn bằng ma trận **rank thấp** — thay vì một ma trận lớn n×n, dùng tích của
hai ma trận gầy n×r và r×n với **r rất nhỏ** (ví dụ 8, 16). Số tham số phải train giảm từ
hàng tỉ xuống còn vài triệu.

```
Model gốc (đóng băng, hàng tỉ tham số — KHÔNG train)
        │
        ▼
   [lớp attention]  ⊕  adapter LoRA (A: n×r, B: r×n, r nhỏ — CHỈ train phần này)
        │
        ▼
   output = output_gốc + output_adapter
```

Lợi ích:

- **VRAM giảm mạnh** — chỉ train vài triệu tham số thay vì vài tỉ.
- **Adapter siêu nhẹ để lưu/chia sẻ** (vài MB). Một model gốc + nhiều adapter cho nhiều task,
  hoán đổi lúc chạy.
- **Ít hỏng model gốc** vì phần gốc bị đóng băng.

### QLoRA: LoRA trên GPU nhỏ

**QLoRA** = **quantize** model gốc xuống 4-bit (bài 27) *rồi* mới gắn adapter LoRA lên trên.
Model gốc đóng băng nên nén xuống 4-bit không cần độ chính xác cao; adapter train ở precision
cao hơn. Kết quả: fine-tune được model lớn trên **một GPU tiêu dùng** thay vì cả cụm.

> Đánh đổi: nén 4-bit có thể hụt chất lượng chút ít so với LoRA thường, đổi lấy khả năng chạy
> trên phần cứng rẻ. Với đa số bài toán thực tế, đánh đổi này rất đáng.

## Chuẩn bị dataset instruction

Fine-tune một model trợ lý thường dùng dữ liệu **instruction**: cặp *yêu cầu → câu trả lời
mẫu* để model học cách phản hồi. Định dạng phổ biến (JSONL, mỗi dòng một ví dụ):

```jsonl
{"instruction": "Phân loại review này thành tích cực/tiêu cực", "input": "Giao hàng chậm, đóng gói tệ", "output": "tiêu cực"}
{"instruction": "Phân loại review này thành tích cực/tiêu cực", "input": "Sản phẩm tốt, đúng mô tả", "output": "tích cực"}
```

Nguyên tắc quan trọng:

- **Chất lượng > số lượng.** Vài trăm ví dụ *sạch, nhất quán, đúng định dạng đích* thường hơn
  hàng chục nghìn ví dụ nhiễu. Rác vào → rác ra, còn tệ hơn vì model học thẳng cái rác.
- **Nhất quán tuyệt đối về định dạng output.** Nếu muốn model luôn xuất một schema, *mọi* ví
  dụ phải đúng schema đó — model sẽ bắt chước y hệt, kể cả lỗi bạn để lọt.
- **Bao phủ đủ đa dạng** các trường hợp thật, gồm cả edge case.
- **Tách train/validation** để đo overfit (bài 24).

> Trước khi fine-tune, review dataset như review code — một nhãn sai lẫn vào sẽ được model
> "học thuộc".

## Pattern dùng Hugging Face (không phải để nhớ signature)

Hệ sinh thái phổ biến nhất: thư viện **`transformers`** (nạp model/tokenizer) + **`peft`**
(gắn LoRA) + **`bitsandbytes`** (quantize cho QLoRA) + **`trl`**/`Trainer` (vòng lặp train).
Signature các thư viện này **đổi theo phiên bản** — luôn tra docs chính thức, đừng chép trí
nhớ. Đây là *hình dạng* quy trình, không phải code chạy được:

```python
# Python 3.12+ — CẦN GPU. Pattern khái niệm, tra docs HF cho API chính xác theo version.
# pip install transformers peft bitsandbytes trl datasets

# 1. Nạp model gốc + tokenizer (QLoRA: cấu hình nạp ở 4-bit qua bitsandbytes)
# 2. Cấu hình LoRA: chọn rank r (vd 8/16), các lớp target (thường lớp attention),
#    alpha, dropout → bọc model bằng peft để chèn adapter
# 3. Nạp dataset instruction (JSONL) → tokenize theo template hội thoại của model
# 4. Đưa vào Trainer/SFTTrainer: đặt learning rate, số epoch, batch size → train()
# 5. Chỉ LƯU adapter (vài MB), không lưu cả model gốc
# 6. Khi dùng: nạp lại model gốc + đắp adapter lên → suy luận
```

Ba tham số bạn sẽ chạm nhiều: **rank `r`** (lớn hơn = học nhiều hơn nhưng nặng hơn, thường
8-64), **learning rate** (thường nhỏ), **số epoch** (ít thôi — nhiều quá là overfit ngay vì
dữ liệu fine-tune thường nhỏ).

## Cạm bẫy hay gặp

- **Fine-tune để nhồi kiến thức** → dùng RAG (bài 9); kiến thức đổi thì phải train lại, tốn
  và dễ lỗi thời.
- **Bỏ qua prompting, nhảy thẳng vào fine-tune** → phần lớn vấn đề chỉ cần prompt rõ hơn.
- **Dataset bẩn/không nhất quán** → model học thẳng cái sai; chất lượng quan trọng hơn số lượng.
- **Full fine-tune khi LoRA đủ** → đốt VRAM và tiền vô ích cho đa số task.
- **Train quá nhiều epoch trên dữ liệu nhỏ** → overfit, model "học vẹt" mất khả năng tổng quát.
- **Chép signature `peft`/`transformers` từ trí nhớ** → API đổi theo version; luôn tra docs.

## Ghi nhớ

Trước khi fine-tune, đi theo thứ tự rẻ → đắt: **prompting → RAG → fine-tuning**. Nhớ câu thần
chú: **RAG dạy model *biết gì*, fine-tuning dạy model *cư xử thế nào*** — đừng fine-tune để
nhồi kiến thức. Khi *thật sự* cần fine-tune, tránh **full fine-tune** (tốn VRAM, mỗi task một
bản copy khổng lồ) mà dùng **PEFT/LoRA**: **đóng băng model gốc, chỉ train adapter rank thấp**
(vài triệu tham số, adapter chỉ vài MB). **QLoRA** thêm **quantize 4-bit** model gốc để fine-tune
trên GPU nhỏ, đổi chút chất lượng lấy phần cứng rẻ. Dataset **instruction** phải **sạch, nhất
quán định dạng, chất lượng hơn số lượng**. Dùng hệ `transformers` + `peft` + `bitsandbytes`,
nhưng luôn **tra docs cho signature** vì API đổi theo phiên bản. Mọi bước fine-tune cần **GPU**.
