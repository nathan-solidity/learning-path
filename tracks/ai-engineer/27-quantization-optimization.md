---
level: "ai-adv-llm"
order: 27
title: "Quantization và tối ưu inference"
est: "6-7 giờ"
checklist:
  - "Phân biệt được các precision fp32/fp16/bf16/int8/int4 và ý nghĩa bộ nhớ của mỗi loại"
  - "Giải thích được quantization là gì và đánh đổi chất lượng ↔ bộ nhớ/tốc độ"
  - "Phân biệt được ở mức khái niệm GPTQ, AWQ và bitsandbytes dùng khi nào"
  - "Hiểu KV cache tăng tốc sinh text thế nào và vì sao nó ngốn bộ nhớ theo độ dài"
  - "Giải thích được flash attention giải quyết nút thắt bộ nhớ của attention ra sao (khái niệm)"
  - "Ước lượng thô được VRAM cần để chạy một model theo số tham số và precision"
related:
  - "glossary:quantization"
  - "glossary:transformer"
  - "skill:nta-code-review"
---

## Vì sao quan trọng

Bài 25 cho thấy attention tốn kém theo **bình phương độ dài**; bài 26 dùng QLoRA để fine-tune
trên GPU nhỏ. Cả hai chạm tới cùng một thực tế phũ phàng: **model lớn ngốn bộ nhớ và tốc độ**.
Bài này trả lời câu hỏi vận hành: *"Làm sao chạy được model này trên phần cứng tôi có, đủ
nhanh, mà không hỏng chất lượng?"* Đây là kỹ năng phân biệt người **dùng API** với người
**tự deploy** model — và ngay cả khi bạn chỉ gọi API, hiểu nó giúp bạn đọc đúng các thông số
model và biết vì sao model rẻ hơn thường là bản đã tối ưu.

> Quantize/deploy model tự host cần **GPU**. Phần lý thuyết dưới đây đọc được không cần GPU,
> nhưng để *thực hành* nạp model quantized thì cần card đủ VRAM.

## Precision: model "nặng" bao nhiêu là do đây

Mỗi tham số của model là một con số, lưu ở một **precision** (độ chính xác) nhất định. Số bit
mỗi con số quyết định trực tiếp bộ nhớ.

| Precision | Bit/tham số | Đặc điểm |
|-----------|-------------|----------|
| **fp32** (full) | 32 (4 byte) | Chính xác nhất, nặng nhất; hiếm dùng cho inference LLM |
| **fp16** (half) | 16 (2 byte) | Nửa bộ nhớ; chuẩn phổ biến, đôi khi kém ổn định số học |
| **bf16** (brain float) | 16 (2 byte) | Cùng cỡ fp16 nhưng dải giá trị rộng hơn → ổn định hơn khi train |
| **int8** | 8 (1 byte) | Quantize; ~1/4 so với fp32, chất lượng hụt nhẹ |
| **int4** | 4 (0.5 byte) | Quantize mạnh; ~1/8 so với fp32, hụt nhiều hơn nhưng thường chấp nhận được |

**Quy tắc ước lượng VRAM thô** (chỉ riêng trọng số, chưa tính KV cache/overhead):

> VRAM ≈ **số tham số × số byte mỗi tham số**.
> Model 7 tỉ tham số ở fp16 (2 byte) ≈ 7 × 2 = **~14 GB**. Cũng model đó ở int4 (0.5 byte)
> ≈ 7 × 0.5 = **~3.5 GB** → vừa một GPU tiêu dùng. Đây là lý do quantization tồn tại.

## Quantization: nén precision, đánh đổi chất lượng

**Quantization** = biểu diễn trọng số ở precision thấp hơn (vd fp16 → int4) để **giảm bộ nhớ
và tăng tốc**. Trực giác: thay vì lưu mỗi số với độ chính xác cao, ta ánh xạ chúng vào một tập
nhỏ hơn các mức rời rạc — như làm tròn, nhưng có kỹ thuật để giữ mất mát nhỏ nhất.

Đánh đổi cốt lõi:

> **Bộ nhớ ↓, tốc độ ↑, chất lượng ↓ (một chút).** Nghệ thuật của các phương pháp tốt là làm
> phần "chất lượng ↓" **nhỏ tới mức gần như không cảm nhận được**, đổi lấy bộ nhớ giảm 2-4 lần.

int8 thường gần như không mất chất lượng đáng kể; int4 mất nhiều hơn nhưng với phương pháp
tốt vẫn thường chấp nhận được cho phần lớn ứng dụng. Càng nén sâu, rủi ro càng cao ở các tác
vụ khó (reasoning, code) — nên **luôn đo lại chất lượng** sau khi quantize, đừng tin mặc định.

## GPTQ, AWQ, bitsandbytes: dùng cái nào

Ba cái tên bạn sẽ gặp liên tục. Ở mức khái niệm:

| Phương pháp | Bản chất | Thường dùng khi |
|-------------|----------|-----------------|
| **bitsandbytes** | Quantize **on-the-fly** lúc nạp model, không cần bước hiệu chỉnh trước | Nhanh gọn để chạy/thử, và nền cho **QLoRA** (bài 26) |
| **GPTQ** | Quantize *sau khi train*, dùng một tập dữ liệu nhỏ để **hiệu chỉnh** giảm sai số | Chuẩn bị model int4 chất lượng tốt để **deploy inference** |
| **AWQ** | Cũng post-training, ưu tiên giữ nguyên các trọng số **quan trọng** (activation-aware) | Inference int4 chất lượng cao, thường nhanh khi phục vụ |

> Trực giác chung: **bitsandbytes** tiện cho phát triển/fine-tune; **GPTQ/AWQ** cho ra model
> int4 đã nén sẵn, tối ưu để *phục vụ* production. Nhiều model chia sẻ công khai đã có sẵn bản
> GPTQ/AWQ để bạn tải về chạy thẳng.

Signature các thư viện này đổi theo phiên bản — **tra docs**, đừng chép trí nhớ. Pattern khái
niệm khi nạp một model quantized:

```python
# Python 3.12+ — CẦN GPU. Pattern khái niệm, tra docs thư viện cho API chính xác.
# Ý tưởng: chỉ cho biết "nạp model này ở dạng quantized", thư viện lo phần còn lại.
#   - bitsandbytes: truyền cấu hình nạp 4-bit/8-bit khi load model gốc
#   - GPTQ/AWQ: tải model ĐÃ được quantize sẵn (bản _GPTQ / _AWQ) rồi nạp qua loader tương ứng
# Sau khi nạp, dùng model để sinh text như bình thường — chỉ khác là nó nhẹ hơn nhiều.
```

## KV cache: tăng tốc sinh text

Nhớ bài 25: sinh text là lặp **dự đoán token → nối vào → lặp**. Vấn đề: mỗi bước attention cần
Key/Value của *tất cả* token trước đó. Nếu mỗi bước tính lại K/V cho toàn bộ lịch sử thì cực
lãng phí — lịch sử đâu có đổi.

**KV cache** giải điều đó: **lưu lại K và V** đã tính của các token cũ, mỗi bước chỉ tính K/V
cho **token mới nhất** rồi tái dùng phần đã cache. Đây là một trong những tối ưu quan trọng
nhất khiến LLM sinh text đủ nhanh để dùng thật.

Đánh đổi: KV cache **ngốn bộ nhớ tăng theo độ dài chuỗi** — chuỗi càng dài, cache càng phình.

> Hệ quả thực tế: với chuỗi dài, KV cache có thể chiếm bộ nhớ *nhiều hơn cả trọng số model*.
> Đây là lý do khác (bên cạnh chi phí attention n² ở bài 25) khiến context dài vừa chậm vừa
> tốn — và vì sao các model context lớn cần kỹ thuật quản lý bộ nhớ tinh vi.

## Flash attention: gỡ nút thắt bộ nhớ (khái niệm)

Attention chuẩn tạo ra một ma trận điểm số **n×n** khổng lồ trong bộ nhớ (mọi token với mọi
token — bài 25). Với chuỗi dài, ma trận này là nút thắt: không phải vì thiếu sức tính, mà vì
**đọc/ghi bộ nhớ** GPU quá nhiều.

**Flash attention** là cách tính attention **thông minh hơn về bộ nhớ**: chia phép tính thành
các khối nhỏ, tính từng khối và gộp kết quả *mà không bao giờ dựng nguyên ma trận n×n đầy đủ*
trong bộ nhớ chậm. Kết quả **giống hệt** attention chuẩn về mặt toán học, nhưng nhanh hơn và
tốn ít bộ nhớ hơn nhiều với chuỗi dài.

> Bạn hiếm khi tự cài flash attention — nó nằm sẵn trong các thư viện/engine inference hiện
> đại. Điều cần nhớ: nó là lý do lớn khiến context window dài trở nên **khả thi** về mặt kỹ
> thuật. Đây là tối ưu *engineering* (cách dùng bộ nhớ GPU), không đổi kết quả model.

## Bức tranh tổng: các đòn bẩy khi tự deploy

| Nút thắt | Đòn bẩy | Đánh đổi |
|----------|---------|----------|
| Trọng số quá nặng để nạp | **Quantization** (int8/int4) | Chất lượng hụt nhẹ |
| Sinh text chậm (tính lại lịch sử) | **KV cache** | Ngốn bộ nhớ theo độ dài |
| Attention nghẽn bộ nhớ với chuỗi dài | **Flash attention** | Gần như không — cùng kết quả |

Chọn đòn bẩy theo *nút thắt thật* của bạn, đo trước và sau. Đừng tối ưu mù. Dùng
`/nta-code-review` để soát script deploy/benchmark trước khi tin số liệu.

## Cạm bẫy hay gặp

- **Quantize rồi tin chất lượng không đổi** → int4 có thể hụt rõ ở tác vụ khó; luôn đo lại.
- **Quên KV cache khi tính VRAM** → chỉ tính trọng số, đến chuỗi dài thì tràn bộ nhớ bất ngờ.
- **Nhầm flash attention là quantization** → nó là tối ưu *cách tính*, không đổi precision hay
  kết quả; hai chuyện khác nhau.
- **Chọn nhầm phương pháp quantize** → bitsandbytes tiện để thử/QLoRA, GPTQ/AWQ cho deploy;
  dùng ngược thì thiệt tốc độ hoặc chất lượng.
- **Chép signature thư viện từ trí nhớ** → API bitsandbytes/GPTQ/AWQ đổi theo version; tra docs.
- **Nén sâu nhất có thể "cho nhẹ"** → int4 cho reasoning/code có thể hỏng; cân theo tác vụ.

## Ghi nhớ

Bộ nhớ model quyết định bởi **precision**: fp32 (4 byte) → fp16/bf16 (2 byte) → int8 (1 byte)
→ int4 (0.5 byte). Ước lượng VRAM thô = **số tham số × byte mỗi tham số** (model 7B ở int4 ≈
3.5 GB). **Quantization** nén precision để **giảm bộ nhớ, tăng tốc, đổi lấy chút chất lượng** —
int8 thường gần như không mất, int4 mất nhiều hơn nhưng thường chấp nhận được; **luôn đo lại**.
Chọn phương pháp: **bitsandbytes** (nhanh gọn, nền cho QLoRA), **GPTQ/AWQ** (nén sẵn cho deploy
inference). **KV cache** tái dùng Key/Value cũ để sinh text nhanh, nhưng **ngốn bộ nhớ theo độ
dài** — có khi hơn cả trọng số. **Flash attention** tính attention tiết kiệm bộ nhớ mà **không
đổi kết quả**, làm context dài khả thi. Mọi tối ưu deploy đều cần **GPU** và luôn **đo trước–sau**.
