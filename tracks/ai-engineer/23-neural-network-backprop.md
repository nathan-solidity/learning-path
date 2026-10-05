---
level: "ai-adv-ml"
order: 23
title: "Neural Network và Backpropagation"
est: "6-7 giờ"
checklist:
  - "Vẽ/mô tả được cấu trúc neuron, layer và cách nối input → hidden → output"
  - "Giải thích được vai trò activation và chọn đúng ReLU/sigmoid/softmax theo tình huống"
  - "Kể được forward pass tính ra dự đoán và loss thế nào"
  - "Giải thích backpropagation bằng lời (lan ngược lỗi, chain rule) mà không cần toán nặng"
  - "Phân biệt được vai trò optimizer (SGD/Adam) và ảnh hưởng của learning rate"
  - "Nhận ra dấu hiệu learning rate quá cao/thấp và biết hướng chỉnh"
related:
  - "glossary:neural-network"
  - "glossary:machine-learning"
  - "skill:nta-explain"
---

## Vì sao quan trọng

Neural network là **động cơ** đằng sau mọi thứ AI hiện đại bạn đã dùng: LLM, embedding, model
thị giác. Ở bài 22 bạn đã hiểu ML học bằng cách giảm loss qua gradient descent. Bài này mở
neural network ra xem **các con số chảy qua nó thế nào** (forward pass) và nó **tự sửa mình
ra sao** (backpropagation) — cơ chế học đứng sau Transformer và LLM.

> Vẫn theo tinh thần bài 22: đây là để **HIỂU và tối ưu** model. Người chỉ gọi API không bắt
> buộc phải nắm backprop từng bước — nhưng hiểu nó giúp bạn biết vì sao fine-tune hoạt động,
> vì sao learning rate quan trọng, và vì sao model đôi khi "không chịu học".

## Neuron và Layer

Một **neuron** là một phép tính rất đơn giản: nhận vài số vào, **nhân với trọng số** (weight),
cộng lại, cộng thêm **bias**, rồi cho qua một hàm **activation**.

> Trực giác: neuron là một "công tắc thông minh". Nó cân nhắc các input theo mức quan trọng
> (weight), rồi quyết định phát tín hiệu mạnh hay yếu ra ngoài.

Xếp nhiều neuron song song thành một **layer**. Nối nhiều layer nối tiếp thành **neural network**:

| Layer | Vai trò |
|-------|---------|
| **Input layer** | Nhận dữ liệu thô (pixel ảnh, số đo, embedding) |
| **Hidden layer(s)** | Biến đổi dần dần, học đặc trưng phức tạp hơn qua từng lớp |
| **Output layer** | Cho ra kết quả (xác suất các lớp, một con số dự đoán) |

Sức mạnh đến từ **chiều sâu**: mỗi hidden layer học đặc trưng trừu tượng hơn lớp trước — cạnh
→ hình khối → khuôn mặt. Đó là lý do gọi là **Deep** Learning.

## Activation: ReLU, Sigmoid, Softmax

Nếu chỉ nhân-cộng tuyến tính, chồng bao nhiêu layer cũng chỉ tương đương một layer. **Activation**
thêm tính **phi tuyến** — đây là thứ cho phép network học pattern phức tạp. Ba hàm hay gặp:

| Activation | Cho ra | Dùng ở đâu |
|------------|--------|------------|
| **ReLU** | `max(0, x)` — âm thành 0, dương giữ nguyên | **Hidden layer** (mặc định, nhanh, ổn định) |
| **Sigmoid** | Ép về khoảng (0, 1) | Output **nhị phân** (xác suất 1 lớp) |
| **Softmax** | Biến vector thành phân phối xác suất cộng bằng 1 | Output **đa lớp** (chọn 1 trong nhiều) |

> Quy tắc thực dụng: hidden layer dùng **ReLU**, output phân loại nhiều lớp dùng **softmax**,
> output nhị phân dùng **sigmoid**. Bạn sẽ dùng đúng bộ này 90% trường hợp.

## Forward pass: tính ra dự đoán

**Forward pass** là cho dữ liệu **chảy xuôi** từ input đến output:

1. Input đi vào layer đầu, mỗi neuron nhân weight + bias, qua activation → ra output layer đó.
2. Output layer này thành input của layer sau. Lặp lại qua các hidden layer.
3. Output layer cuối cho ra **dự đoán** (ví dụ softmax → "70% mèo, 30% chó").
4. So dự đoán với nhãn thật bằng **loss function** (bài 22) → ra một con số **loss**.

Loss cao = dự đoán lệch nhiều. Mục tiêu học: chỉnh weight/bias để loss nhỏ lại. Nhưng chỉnh
theo hướng nào? Đó là việc của backpropagation.

## Backpropagation và chain rule (trực giác)

**Backpropagation** trả lời câu hỏi: *mỗi weight nên tăng hay giảm để loss nhỏ đi?* Nó làm
điều đó bằng cách **lan ngược lỗi** từ output về input.

> Trực giác: hình dung một dây chuyền sản xuất cho ra sản phẩm lỗi (loss cao). Bạn muốn biết
> **công đoạn nào góp bao nhiêu vào lỗi** để chỉnh đúng chỗ. Backprop đi ngược dây chuyền,
> tính "trách nhiệm" của từng weight với lỗi cuối cùng.

Cái nối các công đoạn lại chính là **chain rule** (quy tắc chuỗi trong đạo hàm): output cuối
phụ thuộc layer cuối, layer cuối phụ thuộc layer trước nó... Chain rule cho phép **nhân dồn**
các ảnh hưởng dọc chuỗi để biết mỗi weight đầu chuỗi ảnh hưởng loss cuối chuỗi thế nào.

Kết quả backprop cho ra là **gradient** của loss theo từng weight — chính là "độ dốc" ở bài 22.
Vòng học một bước gồm: **forward** (tính loss) → **backward** (backprop tính gradient) →
**cập nhật weight** (optimizer). Lặp lại hàng nghìn lần trên dữ liệu, loss giảm dần, model học.

> Điểm mấu chốt: bạn **không phải tự tính** backprop. PyTorch (bài 24) làm tự động qua
> **autograd**. Nhưng hiểu nó đang làm gì giúp bạn debug khi model không học.

## Optimizer: SGD và Adam

Backprop cho biết **hướng** cần đi (gradient). **Optimizer** quyết định **đi thế nào**:

- **SGD** (Stochastic Gradient Descent) — bước theo gradient trên từng lô nhỏ dữ liệu (batch).
  Đơn giản, đáng tin, nhưng có thể chậm và cần chỉnh learning rate cẩn thận.
- **Adam** — SGD "thông minh": tự điều chỉnh bước cho từng weight dựa trên lịch sử gradient.
  Hội tụ nhanh, ít phải chỉnh tay. **Mặc định tốt** cho hầu hết bài toán deep learning.

> Không biết chọn gì → dùng **Adam** với learning rate quanh `1e-3`. Đây là điểm khởi đầu an
> toàn cho phần lớn model.

## Learning rate

**Learning rate** là **độ dài mỗi bước** khi cập nhật weight — hyperparameter quan trọng nhất:

| Learning rate | Hậu quả | Dấu hiệu |
|---------------|---------|----------|
| **Quá cao** | Bước quá dài, vọt qua đáy | Loss nhảy loạn, tăng vọt, hoặc thành `NaN` |
| **Quá thấp** | Bước quá ngắn, học ì ạch | Loss giảm rất chậm, như đứng yên |
| **Vừa** | Loss giảm đều và mượt | Đường loss đi xuống ổn định |

> Trực giác lại về ngọn đồi ở bài 22: learning rate quá lớn = nhảy vọt qua thung lũng sang
> sườn bên kia; quá nhỏ = nhích từng phân, cả ngày không tới đáy. Nếu thấy loss `NaN` hoặc
> nổ tung, **giảm learning rate** là việc đầu tiên nên thử.

## Cạm bẫy hay gặp

- **Quên activation phi tuyến** → mạng nhiều layer sập thành một layer tuyến tính, không học nổi.
- **Sai activation output** — dùng ReLU ở output phân loại thay vì softmax → xác suất vô nghĩa.
- **Learning rate mặc định bừa** → loss nổ (`NaN`) hoặc không giảm; đây là thủ phạm số 1.
- **Quên chuẩn hoá input** → weight khó hội tụ, một số feature át hết feature khác.
- **Tưởng phải tự code backprop** → không cần; autograd của PyTorch làm hết (bài 24).

## Ghi nhớ

**Neural network** xếp các **neuron** (nhân weight + bias → **activation**) thành **layer**, nối
input → hidden → output. **Activation** phi tuyến (**ReLU** cho hidden, **softmax**/**sigmoid**
cho output) là thứ cho phép học pattern phức tạp. **Forward pass** cho dữ liệu chảy xuôi ra dự
đoán rồi tính **loss**; **backpropagation** lan lỗi **ngược** về, dùng **chain rule** để biết
mỗi weight góp bao nhiêu vào lỗi — cho ra **gradient**. **Optimizer** (**Adam** là mặc định tốt,
**SGD** cơ bản) dùng gradient để cập nhật weight, với **learning rate** là độ dài bước — quá cao
loss nổ, quá thấp học ì. Vòng lặp **forward → backward → update** chạy nhiều lần chính là cách
mọi mạng nơ-ron — kể cả LLM — học. Bài sau bạn tự tay dựng vòng lặp này bằng PyTorch.
