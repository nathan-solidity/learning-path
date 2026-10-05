---
level: "ai-adv-serving"
order: 30
title: "GPU, scaling và chi phí: self-host hay API"
est: "6-7 giờ"
checklist:
  - "Ước lượng được VRAM cần thiết cho một model theo số tham số và độ chính xác (FP16/quantize)"
  - "Chọn được cấp GPU phù hợp với kích thước model thay vì mặc định lấy GPU to nhất"
  - "Giải thích được cold start ở LLM khác web thường thế nào và cách giảm nhẹ"
  - "Nêu được autoscaling LLM khó ở đâu (thời gian khởi động, GPU đắt) và hướng xử lý"
  - "Tính được cost per 1M token của phương án self-host và so với giá API"
  - "Quyết định được khi nào self-host rẻ hơn API và ngược lại, dựa trên khối lượng"
related:
  - "glossary:llm"
---

## Vì sao quan trọng

Bài 28-29 lo *chạy* và *chạy nhanh*. Bài này lo câu hỏi kinh tế: **chạy trên phần cứng gì,
scale ra sao, và tốn bao nhiêu** — cuối cùng dẫn tới quyết định lớn nhất: **tự host hay cứ
gọi API?** Trả lời sai hướng nào cũng đắt: tự host khi khối lượng nhỏ = trả tiền GPU nằm
không; gọi API khi khối lượng khổng lồ = hoá đơn token gấp nhiều lần. Đây là bài giúp bạn ra
quyết định bằng con số, không bằng cảm tính.

> Mọi con số VRAM/giá GPU dưới đây là **khoảng tham khảo để ước lượng**, không phải giá
> tuyệt đối. Luôn kiểm tra giá thực tế của cloud provider và spec GPU tại thời điểm mua.

## Chọn GPU: VRAM là ràng buộc số một

Câu hỏi đầu tiên không phải "GPU nhanh cỡ nào" mà "**model có vừa VRAM không**". Không vừa
thì không chạy được, chấm hết. Ước lượng thô VRAM cho **trọng số model**:

```
VRAM cho weights ≈ (số tham số) × (số byte mỗi tham số)
  FP16/BF16 : 2 byte/tham số   →  model 7B ≈ 14 GB
  INT8      : 1 byte/tham số   →  model 7B ≈ 7 GB
  INT4      : ~0.5 byte/tham số →  model 7B ≈ 3.5 GB
```

Nhưng weights **chưa phải tất cả**: còn **KV cache** (bài 29, phình theo độ dài × số request
đồng thời) và overhead. Quy tắc ngón tay cái: chuẩn bị **VRAM ≈ 1.2-2× cỡ weights** để có
chỗ cho KV cache và batch. Model 7B FP16 (~14GB weights) thực tế nên nhắm GPU ~24GB trở lên.

| Cỡ model | VRAM weights (FP16) | Cấp GPU tham khảo | Ghi chú |
|----------|---------------------|-------------------|---------|
| 7-8B | ~14-16 GB | GPU ~24GB (vd A10, L4, RTX 4090) | Vừa 1 GPU thoải mái |
| 13B | ~26 GB | GPU ~40-48GB (vd A100 40GB) | Hoặc quantize để vừa 24GB |
| 30-34B | ~60-70 GB | GPU 80GB (A100/H100 80GB) | Bắt đầu cần GPU cao cấp |
| 70B | ~140 GB | **Nhiều GPU** (2× 80GB) | Phải chia model qua nhiều GPU |

> **Quantize** (INT8/INT4) là đòn bẩy lớn nhất để nhét model to vào GPU nhỏ hơn — đổi lại
> chất lượng giảm nhẹ. Với nhiều tác vụ, INT8 gần như không phân biệt được. Đừng mặc định
> lấy GPU to nhất: model 8B chạy tốt trên GPU ~24GB, thuê H100 80GB cho nó là đốt tiền.

## Cold start: nỗi đau riêng của LLM

Với web app thường, khởi động một instance mới mất vài giây. Với LLM, **cold start rất
nặng**: phải kéo model (nhiều GB) từ storage, load vào VRAM, khởi tạo runtime — có thể mất
**hàng chục giây đến vài phút**. Điều này phá vỡ giả định "scale-to-zero rồi bật lại khi có
request" mà web thường dùng thoải mái.

Cách giảm nhẹ:

- **Giữ ít nhất 1 instance ấm** (warm) thay vì scale về 0, để không ai gặp cold start.
- **Cache model gần compute** (đĩa cục bộ/volume nhanh) thay vì kéo lại từ registry mỗi lần.
- **Pre-load / snapshot** VRAM nếu nền tảng hỗ trợ, để bỏ qua bước load.
- Chấp nhận cold start chỉ cho tải **bursty, không nhạy latency** (job batch ban đêm).

## Autoscaling LLM: vì sao khó

Autoscale theo CPU như web thường **không hợp** với LLM, vì hai lý do:

1. **Instance mới lên chậm** (cold start ở trên) → khi traffic tăng vọt, thêm GPU không kịp
   cứu; request dồn ứ trước khi instance mới sẵn sàng.
2. **GPU đắt và khan** → mỗi instance thừa là tiền lớn nằm không; đôi khi cloud **không có
   sẵn** GPU để scale ngay.

Hướng thực dụng:

- Scale theo **hàng đợi / concurrency đang chờ**, không theo CPU%. Với LLM, tín hiệu tốt là
  số request đang chờ và độ dài queue, vì đó là thứ đẩy latency lên.
- **Đặt trần concurrency mỗi instance** dựa trên VRAM cho KV cache (bài 29), để một instance
  không nhận quá tải rồi OOM.
- **Provision trước cho đỉnh dự đoán được** (giờ cao điểm) thay vì phản ứng sau.

## Self-host vs API: quyết định bằng con số

Không có câu trả lời chung. Nó phụ thuộc **khối lượng token/tháng** và **tỉ lệ sử dụng GPU**.

**Cost per 1M token khi self-host** — ước lượng từ giá thuê GPU và throughput đo được:

```
chi phí/giờ của GPU        (vd GPU ~24GB tham khảo ~0.5-1 USD/giờ — KIỂM TRA giá thật)
throughput                 (vd đo được ~1500 token/giây dưới tải, từ bài 29)

token mỗi giờ  = 1500 token/s × 3600 s        = 5.4 triệu token/giờ (LÝ TƯỞNG, GPU chạy 100%)
cost/1M token  = (giá GPU/giờ) / (token mỗi giờ / 1M)
               ≈ 1.0 / 5.4                     ≈ 0.19 USD / 1M token  (ở tải bão hoà)
```

**Cạm bẫy lớn nhất**: phép tính trên giả định GPU chạy **100% công suất 24/7**. Thực tế tải
lên xuống — GPU rảnh **vẫn tính tiền**. Nếu GPU chỉ dùng 20% thời gian, chi phí thực **/1M
token cao gấp ~5 lần** con số lý tưởng. So sánh phải dùng **tỉ lệ sử dụng thật**, không phải
throughput đỉnh.

| Yếu tố | Nghiêng về **API** | Nghiêng về **self-host** |
|--------|--------------------|--------------------------|
| Khối lượng | Thấp / biến động mạnh | Cao, đều, dự đoán được |
| Tỉ lệ dùng GPU | Thấp (GPU sẽ nằm không) | Cao (GPU bão hoà phần lớn thời gian) |
| Dữ liệu | Không nhạy cảm | Nhạy cảm, không được rời hạ tầng |
| Model | Cần model mạnh nhất/mới nhất | Open-weight (Llama/Qwen/Mistral) đủ dùng |
| Nhân lực vận hành | Ít, không muốn lo hạ tầng | Có team lo GPU/serving/monitoring |

> Quy tắc thô: **khối lượng nhỏ hoặc bấp bênh → API rẻ và nhàn hơn** (trả đúng những gì
> dùng, không nuôi GPU nằm không). **Khối lượng lớn, đều, GPU bão hoà → self-host rẻ hơn
> đáng kể** và kiểm soát được dữ liệu. Đừng self-host chỉ vì "nghe pro" — hãy self-host khi
> **con số** ủng hộ.

## Spot instance: cắt chi phí, đổi lấy rủi ro

GPU **spot** (preemptible) rẻ hơn nhiều so với on-demand, nhưng cloud có thể **thu hồi bất
cứ lúc nào** với thông báo rất ngắn. Với serving realtime, mất instance giữa chừng = rớt
request. Dùng spot khôn ngoan:

- Hợp cho **job batch** chịu được gián đoạn (embedding cả kho tài liệu, xử lý offline).
- Với serving realtime: **trộn** — nền là on-demand đủ SLA, phần đỉnh dùng spot để tiết
  kiệm; thiết kế để mất một instance spot không sập dịch vụ.
- Luôn có **checkpoint/retry** để tiếp tục khi bị thu hồi.

## Cạm bẫy hay gặp

- **Chọn GPU chỉ theo weights, quên KV cache** → OOM khi tải lên; chừa VRAM ~1.2-2× cỡ weights.
- **Lấy GPU to nhất cho model nhỏ** → đốt tiền; 8B chạy tốt trên GPU ~24GB, không cần H100.
- **Scale-to-zero với LLM** → người dùng dính cold start hàng chục giây; giữ 1 instance ấm.
- **So chi phí bằng throughput đỉnh** → bỏ qua GPU nằm không; tính theo **tỉ lệ sử dụng thật**.
- **Self-host theo cảm tính** → nuôi GPU rảnh đắt hơn API nhiều; chỉ self-host khi khối lượng
  và tỉ lệ dùng ủng hộ.
- **Dùng spot cho serving realtime không có dự phòng** → mất instance là rớt request.

## Ghi nhớ

Chọn GPU bắt đầu từ **VRAM**: weights ≈ số tham số × byte/tham số (FP16 = 2 byte → 7B ≈
14GB), chừa thêm **1.2-2×** cho **KV cache** và batch; **quantize** (INT8/INT4) để nhét model
to vào GPU nhỏ hơn, đừng mặc định lấy GPU to nhất. LLM có **cold start** rất nặng (kéo +
load model hàng chục giây tới phút) nên **giữ instance ấm**, và **autoscale theo hàng đợi/
concurrency** chứ không theo CPU%. Quyết định **self-host vs API** bằng **con số**: tính
**cost/1M token** theo giá GPU và throughput, nhưng dùng **tỉ lệ sử dụng thật** (GPU rảnh vẫn
tính tiền) — khối lượng nhỏ/biến động → **API** rẻ và nhàn; khối lượng lớn, đều, GPU bão hoà,
dữ liệu nhạy cảm → **self-host**. **Spot** cắt chi phí cho job batch, nhưng cần dự phòng cho
serving realtime. Mọi số VRAM/giá ở đây là tham khảo — **luôn kiểm tra giá và spec thực tế.**
