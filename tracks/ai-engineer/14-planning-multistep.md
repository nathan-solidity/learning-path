---
level: "ai-inter-agent"
order: 14
title: "Planning & Xử lý tác vụ nhiều bước"
est: "5-6 giờ"
checklist:
  - "Giải thích được vì sao tác vụ phức tạp cần phân rã thành bước nhỏ thay vì làm một phát"
  - "So sánh được plan-then-execute vs ReAct: lập kế hoạch trước vs vừa làm vừa nghĩ, khi nào chọn cái nào"
  - "Xử lý được lỗi giữa các bước: bắt lỗi tool, trả lỗi cho model, retry có giới hạn thay vì crash cả agent"
  - "Cài được reflection/self-correction: cho model tự soi lại kết quả và sửa trước khi chốt"
  - "Nhận ra khi agent kẹt (lặp lại lỗi cũ) và có cơ chế thoát an toàn"
related:
  - "glossary:agent"
---

## Vì sao quan trọng

Bài 13 dựng được vòng lặp agent cơ bản, nhưng để agent lười suy nghĩ thì với tác vụ phức tạp
nó dễ **lạc đường, bỏ bước, hoặc gặp lỗi là chết cứng**. Bài này thêm ba năng lực biến agent
"chạy được" thành "làm được việc thật": **phân rã tác vụ** (chia to thành nhỏ), **xử lý lỗi &
retry** giữa các bước (một tool hỏng không kéo sập cả agent), và **reflection** (agent tự soi
lại và sửa). Đây là ranh giới giữa demo agent và agent đi làm được.

## Vì sao phải phân rã tác vụ

LLM giỏi nhất khi giải **một việc rõ ràng một lúc**. Ném cho nó tác vụ to, mơ hồ, nhiều ràng
buộc — nó dễ nhảy cóc, quên điều kiện, hoặc trả lời nửa vời. Phân rã (task decomposition) chia
tác vụ lớn thành chuỗi bước nhỏ, mỗi bước một mục tiêu rõ.

> "Lập báo cáo doanh thu quý và gửi cho quản lý" là *một* yêu cầu nhưng *nhiều* bước: tra dữ
> liệu → tính tổng → so sánh quý trước → soạn báo cáo → (con người duyệt) → gửi. Tách ra thì
> mỗi bước kiểm soát được, sai ở đâu thấy ở đó.

Phân rã cho bạn ba lợi ích: mỗi bước **dễ đúng hơn**, **dễ debug hơn** (biết bước nào hỏng),
và **dễ chèn kiểm soát** (vd chặn bước "gửi" lại để người duyệt).

## Plan-then-execute vs ReAct

Hai cách tổ chức tác vụ nhiều bước, đánh đổi khác nhau:

| Tiêu chí | Plan-then-execute | ReAct (bài 13) |
|----------|-------------------|----------------|
| Cách làm | Lập **kế hoạch đầy đủ trước**, rồi thực thi từng bước | Vừa làm vừa nghĩ, quyết bước sau dựa kết quả bước trước |
| Hợp với | Tác vụ đường đi rõ, ít phụ thuộc kết quả trung gian | Tác vụ khám phá, phải dựa dữ kiện mới để rẽ hướng |
| Ưu điểm | Nhìn được toàn bộ kế hoạch trước khi chạy, dễ duyệt | Linh hoạt, thích nghi khi thực tế khác dự tính |
| Nhược điểm | Kế hoạch cứng, gặp bất ngờ giữa chừng thì lệch | Không thấy toàn cảnh trước, dễ đi lòng vòng |

Thực tế hay **kết hợp**: model lập một kế hoạch phác thảo (plan), rồi thực thi theo kiểu ReAct
và **cập nhật kế hoạch** khi gặp dữ kiện mới. Với tác vụ đơn giản 2-3 bước, ReAct thuần là đủ —
đừng bắt agent lập kế hoạch hoành tráng cho việc nhỏ.

```python
# Ý tưởng plan-then-execute (giản lược, dựa trên vòng lặp bài 13)
# Bước 1: yêu cầu model TRẢ VỀ kế hoạch dạng danh sách bước (structured output, bài 5)
plan = ask_model_for_plan(task)     # ví dụ: ["tra dữ liệu quý", "tính tổng", "so sánh"]

# Bước 2: thực thi từng bước bằng vòng lặp agent, mang kết quả bước trước sang bước sau
context = ""
for step in plan:
    context = run_agent_step(step, prior=context)   # mỗi bước là một mini vòng lặp ReAct
```

> Đừng bịa API "planner" của thư viện. Bản chất plan chỉ là: cho model **liệt kê các bước
> trước** (dùng structured output ở bài 5), rồi bạn chạy từng bước. Framework agent chỉ đóng
> gói mẫu này lại.

## Xử lý lỗi & retry giữa các bước

Tác vụ nhiều bước thì **lỗi giữa chừng là bình thường**: API timeout, tool trả rác, tham số
sai. Nguyên tắc: **một bước hỏng không được kéo sập cả agent** — hãy để model *biết* lỗi và
tự xoay xở.

```python
def run_tool(name, args, impl):
    try:
        return {"ok": True, "output": impl[name](**args)}
    except Exception as e:
        # Trả LỖI lại cho model như một quan sát, thay vì raise làm chết agent
        return {"ok": False, "output": f"Lỗi khi gọi {name}: {e}"}

# Trong vòng lặp agent: đưa cả thông báo lỗi vào tool_result.
# Model đọc "Lỗi ..." rồi tự quyết: sửa tham số gọi lại, hoặc đổi cách, hoặc báo không làm được.
```

Kèm **retry có giới hạn**: cho model thử lại tối đa N lần một bước lỗi, quá thì dừng bước đó
và báo rõ. Đừng retry vô hạn — ghép với trần số vòng ở bài 13.

> Chốt an toàn khi retry: **KHÔNG tự động retry hành động có tác dụng phụ không idempotent**
> (gửi mail, trừ tiền, tạo đơn). Retry mù một lệnh "trừ tiền" có thể trừ hai lần. Chỉ retry
> tự do với thao tác **đọc-only** hoặc thao tác an toàn khi lặp.

## Reflection / self-correction

**Reflection** là cho model **tự soi lại kết quả của chính nó** rồi sửa trước khi chốt — như
lập trình viên đọc lại code trước khi commit. Mẫu đơn giản:

1. Model tạo kết quả nháp (bản trả lời / kế hoạch / đoạn code).
2. Bạn hỏi lại model: *"Soi lại kết quả trên: có sai sót, thiếu bước, hay chưa đúng yêu cầu
   không? Nếu có, sửa lại."*
3. Model chỉ ra vấn đề và đưa bản sửa. Có thể lặp 1-2 vòng.

```python
draft = generate(task)                    # bản nháp
critique = review(task, draft)            # "bước 3 thiếu điều kiện lọc theo quý"
final = generate(task, feedback=critique) # bản sửa dựa trên phê bình
```

Reflection nhặt được lỗi mà một-lượt-sinh hay bỏ sót. Nhưng **có giá**: mỗi vòng reflection là
thêm lần gọi API (thêm token, thêm độ trễ). Dùng cho tác vụ **đáng để soi kỹ** (báo cáo gửi
khách, code sẽ chạy thật), không phải mọi câu trả lời vặt.

> Reflection mạnh hơn khi **critic có góc nhìn tươi**: cho một lượt gọi riêng đóng vai người
> phê bình, tách khỏi lượt sinh nháp — nó khắt khe hơn là bảo model "tự chấm bài mình" trong
> cùng mạch.

## Nhận diện agent bị kẹt

Agent nhiều bước dễ **kẹt**: lặp lại đúng lỗi cũ, gọi tới gọi lui hai tool mà không tiến, hoặc
"sửa" xong lại hỏng chỗ khác. Cần cơ chế thoát:

- **Trần số bước / số retry** (bài 13) — chốt chặn cứng, luôn phải có.
- **Phát hiện lặp**: nếu model lặp lại y hệt lời gọi tool + tham số đã lỗi → dừng, đừng cho
  quay vòng.
- **Thoát an toàn**: khi kẹt, agent nên **báo không hoàn thành được và nêu lý do**, thay vì
  giả vờ xong hoặc chạy mãi. "Tôi không tra được dữ liệu quý 3 vì API lỗi" là kết cục *đúng*.

## Cạm bẫy hay gặp

- **Ném tác vụ to không phân rã** → agent nhảy cóc, bỏ bước, sai ràng buộc.
- **Bắt phân rã/plan cầu kỳ cho việc nhỏ** → over-engineer; việc 2-3 bước ReAct thuần là đủ.
- **Lỗi tool làm raise, chết cả agent** → hãy *trả lỗi lại cho model* để nó tự xoay.
- **Retry vô hạn hoặc retry hành động có tác dụng phụ** → đốt tiền / gửi mail hai lần / trừ tiền lặp.
- **Reflection cho mọi thứ** → tốn token & chậm; chỉ soi kỹ tác vụ đáng giá.
- **Không có cơ chế thoát khi kẹt** → agent quay vòng lặp lại lỗi cũ mãi.

## Ghi nhớ

Tác vụ phức tạp phải **phân rã** thành bước nhỏ — mỗi bước dễ đúng, dễ debug, dễ chèn kiểm
soát. **Plan-then-execute** (lập kế hoạch trước) hợp đường đi rõ và cần duyệt trước; **ReAct**
(vừa làm vừa nghĩ) hợp tác vụ phải rẽ hướng theo dữ kiện mới — thực tế hay kết hợp, và **đừng
over-plan việc nhỏ**. Xử lý lỗi giữa bước bằng cách **trả lỗi lại cho model** thay vì raise
chết agent, kèm **retry có giới hạn** — nhưng **không retry hành động có tác dụng phụ**.
**Reflection** cho model tự soi & sửa nâng chất lượng nhưng tốn token, dùng cho tác vụ đáng
giá; critic có góc nhìn tươi thì khắt khe hơn. Luôn có **cơ chế thoát khi kẹt**: báo không làm
được và nêu lý do, đừng chạy vòng vô tận.
