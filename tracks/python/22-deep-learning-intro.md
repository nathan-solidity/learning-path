---
level: "machine-learning"
order: 22
title: "Giới thiệu Deep Learning"
est: "6-7 giờ"
checklist:
  - "Nói được khi nào nên dùng deep learning và khi nào scikit-learn là đủ"
  - "Giải thích khái niệm neuron, layer, activation, loss, gradient descent ở mức trực giác"
  - "Tạo và thao tác được tensor cơ bản trong PyTorch"
  - "Đọc hiểu một model đơn giản (nn.Module) và một training loop trong PyTorch"
  - "Hiểu vai trò của GPU và biết chuyển tensor/model sang device"
  - "Có lộ trình học tiếp rõ ràng sau bài giới thiệu này"
related:
  - "glossary:neural-network"
  - "glossary:machine-learning"
  - "skill:nta-explain"
---

## Vì sao quan trọng

scikit-learn xử lý tốt dữ liệu dạng bảng, nhưng khi bài toán là **ảnh, âm thanh, hoặc text
tự do** — nơi đặc trưng quá nhiều và quá trừu tượng để làm tay — thì **deep learning** vào
cuộc. Nhận diện khuôn mặt, dịch máy, ChatGPT đều là deep learning.

Bài này chỉ **giới thiệu** ở mức khái niệm để bạn có bản đồ tổng thể — không nhằm biến bạn
thành chuyên gia. Nhưng lưu ý: nguyên tắc **đánh giá đúng quan trọng hơn model phức tạp**
vẫn giữ nguyên. Một mạng neural to mà đánh giá cẩu thả còn tệ hơn một LogisticRegression được
đo cẩn thận.

## Khi nào cần deep learning

| Tình huống | Nên dùng |
|---|---|
| Dữ liệu bảng vài nghìn dòng | scikit-learn (nhanh, dễ giải thích) |
| Ảnh, video | Deep learning (CNN) |
| Text, ngôn ngữ tự nhiên | Deep learning (Transformer) |
| Dữ liệu ít, cần giải thích được | scikit-learn |
| Dữ liệu rất lớn, quan hệ phức tạp | Deep learning |

> **Đừng mặc định dùng deep learning cho mọi thứ.** Nó cần nhiều dữ liệu, nhiều tính toán,
> khó giải thích và khó debug. Với dữ liệu bảng nhỏ, một model sklearn thường thắng cả về
> độ chính xác lẫn công sức.

## Neural network là gì

Một mạng neural là các **layer** xếp chồng. Mỗi layer gồm nhiều **neuron**. Mỗi neuron nhận
đầu vào, nhân với **weight** (trọng số), cộng lại, rồi cho qua một hàm **activation** để tạo
tính phi tuyến (giúp model học được quan hệ phức tạp, không chỉ đường thẳng).

![Mạng neural đơn giản: các neuron ở input layer nối tới các neuron ở hidden layer, rồi nối tiếp tới output layer; mỗi mũi tên là một trọng số](/images/python-neural-network.png)

Quá trình học:
1. **Forward**: đẩy dữ liệu qua mạng để ra dự đoán.
2. **Loss**: đo dự đoán sai bao nhiêu so với đáp án (một con số).
3. **Gradient descent**: tính hướng cần chỉnh weight để loss giảm, rồi nhích weight theo hướng đó.
4. Lặp lại hàng nghìn lần cho tới khi loss đủ nhỏ.

> Trực giác gradient descent: bạn đứng trên sườn núi trong sương mù, muốn xuống thung lũng
> (loss thấp nhất). Bạn sờ xem hướng nào dốc xuống rồi bước một bước nhỏ theo hướng đó. Lặp
> lại. **Learning rate** chính là độ dài mỗi bước — quá lớn thì vọt qua, quá nhỏ thì đi mãi không tới.

## Tensor trong PyTorch

**PyTorch** là thư viện deep learning phổ biến. Đơn vị dữ liệu cơ bản là **tensor** — giống
mảng NumPy nhưng chạy được trên GPU và tự tính được gradient:

```python
import torch

x = torch.tensor([[1.0, 2.0], [3.0, 4.0]])  # tensor 2x2
print(x.shape)          # torch.Size([2, 2])
print(x @ x)            # nhân ma trận
print(x.mean())         # các phép toán như NumPy
```

## Một model đơn giản

Model kế thừa `nn.Module`. Ta khai báo các layer, rồi định nghĩa dữ liệu chảy qua chúng thế nào:

```python
import torch.nn as nn

class SimpleNet(nn.Module):
    def __init__(self):
        super().__init__()
        self.fc1 = nn.Linear(4, 16)   # input 4 feature -> hidden 16 neuron
        self.fc2 = nn.Linear(16, 3)   # hidden 16 -> output 3 lớp

    def forward(self, x):
        x = torch.relu(self.fc1(x))   # activation ReLU tạo phi tuyến
        return self.fc2(x)            # output thô (logits)

model = SimpleNet()
```

## Training loop

Khác với sklearn (gọi `.fit()` là xong), PyTorch để bạn **tự viết vòng lặp huấn luyện** —
đổi lại được toàn quyền kiểm soát:

```python
loss_fn = nn.CrossEntropyLoss()                       # hàm loss cho classification
optimizer = torch.optim.Adam(model.parameters(), lr=0.01)  # thuật toán gradient descent

for epoch in range(100):                # lặp 100 lần qua dữ liệu
    optimizer.zero_grad()               # xóa gradient cũ
    outputs = model(X_train_tensor)     # forward: dự đoán
    loss = loss_fn(outputs, y_train_tensor)  # đo sai lệch
    loss.backward()                     # backward: tính gradient
    optimizer.step()                    # cập nhật weight theo gradient
```

Bốn dòng trong vòng lặp — `zero_grad`, `backward`, `step` và tính loss — là khuôn mẫu lặp
lại của gần như mọi training loop PyTorch.

## GPU

Deep learning cần rất nhiều phép nhân ma trận — GPU làm việc này nhanh gấp hàng chục lần CPU.
Chuyển model và dữ liệu sang GPU nếu có:

```python
device = "cuda" if torch.cuda.is_available() else "cpu"  # dùng GPU nếu có
model = model.to(device)
X_train_tensor = X_train_tensor.to(device)
```

Lưu ý: model và dữ liệu phải **cùng device**, nếu không PyTorch báo lỗi ngay.

## Lời khuyên học tiếp

- **Đừng bỏ qua sklearn.** Phần lớn bài toán thực tế ở công ty là dữ liệu bảng — sklearn giải quyết gọn hơn.
- Học chắc **đánh giá model** (bài trước) trước khi lao vào kiến trúc mạng phức tạp.
- Khi sẵn sàng đi sâu: CNN cho ảnh, Transformer cho text, và tìm hiểu transfer learning
  (dùng lại model đã train sẵn thay vì train từ đầu).
- Dùng skill `/nta-explain` để bóc tách code model có sẵn khi đọc dự án thật.

## Cạm bẫy hay gặp

- Dùng deep learning cho dữ liệu bảng nhỏ → chậm, khó giải thích, thường thua sklearn.
- Quên `optimizer.zero_grad()` → gradient cộng dồn qua các vòng, model học sai bét.
- Để model ở GPU nhưng dữ liệu ở CPU (hoặc ngược lại) → lỗi device mismatch.
- Learning rate quá lớn → loss nhảy loạn không giảm; quá nhỏ → train mãi không tới.
- Chỉ nhìn loss giảm mà quên đánh giá trên tập test → overfitting vẫn rình rập như mọi model ML.

## Ghi nhớ

Deep learning tỏa sáng với **dữ liệu lớn và phi cấu trúc** (ảnh, text) — còn dữ liệu bảng thì
**sklearn thường là đủ**. Mạng neural là các **layer** neuron, học qua vòng lặp
**forward → loss → gradient descent**. Trong **PyTorch**, dữ liệu là **tensor**, model kế
thừa **nn.Module**, và bạn **tự viết training loop** (`zero_grad`, `backward`, `step`). **GPU**
tăng tốc nhưng model và dữ liệu phải cùng device. Học chắc đánh giá model trước khi đuổi theo
kiến trúc phức tạp.
