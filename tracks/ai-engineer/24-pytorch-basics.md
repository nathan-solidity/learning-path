---
level: "ai-adv-ml"
order: 24
title: "PyTorch cơ bản"
est: "6-7 giờ"
checklist:
  - "Tạo và thao tác được tensor, hiểu shape/dtype/device"
  - "Giải thích được autograd tự tính gradient thế nào (requires_grad, backward)"
  - "Định nghĩa được một model bằng nn.Module với __init__ và forward"
  - "Viết được training loop đủ 5 bước: forward → loss → zero_grad → backward → step"
  - "Dùng được Dataset/DataLoader để nạp dữ liệu theo batch"
  - "Train được một mạng nhỏ trên MNIST chạy ra kết quả accuracy hợp lý"
related:
  - "glossary:pytorch"
  - "glossary:neural-network"
---

## Vì sao quan trọng

Bài 22-23 cho bạn lý thuyết: ML học bằng gradient descent, neural network học bằng forward +
backprop. **PyTorch** là công cụ để **hiện thực hoá** những thứ đó bằng code chạy được — thư
viện deep learning phổ biến nhất, đứng sau vô số model bạn đã dùng qua API. Bài này bạn tự tay
dựng và train một mạng nơ-ron thật.

> Vẫn theo tinh thần cấp Nâng cao: đây là để **HIỂU và tối ưu** — khi bạn cần fine-tune model,
> tự train một classifier nhỏ, hay debug hành vi model. Người chỉ gọi API LLM không bắt buộc,
> nhưng nắm PyTorch mở cánh cửa tự train và can thiệp sâu vào model.

## Tensor

**Tensor** là kiểu dữ liệu lõi của PyTorch — như mảng NumPy nhưng chạy được trên GPU và biết
tự tính gradient. Mọi thứ trong PyTorch (dữ liệu, weight, output) đều là tensor.

```python
# Python 3.12+ — cài: pip install torch
import torch

x = torch.tensor([[1.0, 2.0], [3.0, 4.0]])   # tensor 2x2 từ list
print(x.shape)   # torch.Size([2, 2]) — kích thước từng chiều
print(x.dtype)   # torch.float32 — kiểu số

zeros = torch.zeros(3, 4)      # tensor 3x4 toàn số 0
rand = torch.randn(2, 3)       # 2x3 số ngẫu nhiên phân phối chuẩn
y = x @ x                      # nhân ma trận (@ = matmul)

# Chuyển sang GPU nếu có — device quyết định phép tính chạy ở đâu
device = "cuda" if torch.cuda.is_available() else "cpu"
x = x.to(device)
```

> Ba thuộc tính luôn cần để ý: **shape** (kích thước — sai shape là lỗi phổ biến nhất),
> **dtype** (kiểu số — thường `float32`), **device** (CPU hay GPU — hai tensor khác device
> không tính chung được).

## Autograd

**Autograd** là tính năng tự động tính gradient — chính là backprop ở bài 23, nhưng PyTorch làm
hết cho bạn. Đặt `requires_grad=True`, PyTorch **ghi lại** mọi phép tính, rồi `.backward()`
lan ngược để tính gradient.

```python
import torch

# Bài toán tí hon: tìm w để loss = (w - 3)^2 nhỏ nhất (đáp án: w = 3)
w = torch.tensor([0.0], requires_grad=True)   # theo dõi gradient cho w
loss = (w - 3) ** 2                            # forward: tính loss
loss.backward()                                # backward: tính d(loss)/d(w)
print(w.grad)                                  # tensor([-6.]) — độ dốc tại w=0
```

Gradient `-6` cho biết: tăng `w` sẽ **giảm** loss. Optimizer sẽ dùng đúng con số này để cập
nhật `w` về phía 3. Bạn không tự tính đạo hàm — autograd làm nhờ chain rule ở bài 23.

## nn.Module: định nghĩa model

`nn.Module` là lớp cơ sở cho mọi model PyTorch. Bạn kế thừa nó, khai báo các layer trong
`__init__`, và mô tả **forward pass** (bài 23) trong `forward`.

```python
import torch.nn as nn

class SmallNet(nn.Module):
    def __init__(self):
        super().__init__()
        self.fc1 = nn.Linear(28 * 28, 128)   # input 784 → hidden 128
        self.fc2 = nn.Linear(128, 10)        # hidden 128 → output 10 lớp
        self.relu = nn.ReLU()                # activation cho hidden (bài 23)

    def forward(self, x):
        x = x.view(x.size(0), -1)   # trải ảnh 28x28 thành vector 784
        x = self.relu(self.fc1(x))  # layer 1 + ReLU
        return self.fc2(x)          # output thô (logits) cho 10 lớp
```

> `nn.Linear` là layer nhân weight + bias ở bài 23 — PyTorch tự khởi tạo và quản lý weight.
> Output là **logits** (số thô); ta không thêm softmax vì loss `CrossEntropyLoss` bên dưới đã
> gộp softmax vào rồi.

## Dataset và DataLoader

Dữ liệu thật quá lớn để nhồi một lần. **Dataset** đại diện cho tập dữ liệu; **DataLoader** cắt
nó thành **batch** nhỏ và trộn ngẫu nhiên (shuffle) — đúng tinh thần SGD ở bài 23.

```python
from torch.utils.data import DataLoader
from torchvision import datasets, transforms

# cài thêm: pip install torchvision
transform = transforms.ToTensor()   # ảnh PIL → tensor, chuẩn hoá về [0,1]
train_set = datasets.MNIST("./data", train=True, download=True, transform=transform)
test_set = datasets.MNIST("./data", train=False, download=True, transform=transform)

train_loader = DataLoader(train_set, batch_size=64, shuffle=True)
test_loader = DataLoader(test_set, batch_size=1000)
```

## Training loop: train một mạng nhỏ trên MNIST

Ghép hết lại: đây là **vòng lặp huấn luyện** — trái tim của PyTorch. Năm bước lặp lại đúng như
bài 23 (forward → loss → backward → cập nhật).

```python
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision import datasets, transforms

device = "cuda" if torch.cuda.is_available() else "cpu"

# --- dữ liệu ---
transform = transforms.ToTensor()
train_set = datasets.MNIST("./data", train=True, download=True, transform=transform)
test_set = datasets.MNIST("./data", train=False, download=True, transform=transform)
train_loader = DataLoader(train_set, batch_size=64, shuffle=True)
test_loader = DataLoader(test_set, batch_size=1000)

# --- model, loss, optimizer ---
model = SmallNet().to(device)
criterion = nn.CrossEntropyLoss()                      # loss cho phân loại đa lớp
optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)   # Adam, lr 1e-3 (bài 23)

# --- huấn luyện ---
for epoch in range(3):                                 # duyệt toàn bộ dữ liệu 3 lượt
    model.train()
    for images, labels in train_loader:
        images, labels = images.to(device), labels.to(device)

        outputs = model(images)              # 1) forward: dự đoán
        loss = criterion(outputs, labels)    # 2) tính loss so với nhãn thật

        optimizer.zero_grad()                # 3) xoá gradient cũ (nếu quên → cộng dồn sai)
        loss.backward()                      # 4) backward: autograd tính gradient
        optimizer.step()                     # 5) cập nhật weight theo gradient
    print(f"Epoch {epoch+1} — loss lô cuối: {loss.item():.4f}")

# --- đánh giá trên test set ---
model.eval()
correct = total = 0
with torch.no_grad():                        # không cần gradient khi đánh giá → nhanh + đỡ tốn RAM
    for images, labels in test_loader:
        images, labels = images.to(device), labels.to(device)
        preds = model(images).argmax(dim=1)  # lớp có logit cao nhất
        correct += (preds == labels).sum().item()
        total += labels.size(0)
print(f"Accuracy trên test: {correct / total:.2%}")
```

Chạy đoạn này (CPU cũng được, vài phút), bạn sẽ thấy loss giảm dần qua các epoch và accuracy
test đạt khoảng **95%+**. Bạn vừa tự train một mạng nơ-ron thật — không còn là hộp đen.

> **Thứ tự 5 bước phải đúng.** Nhớ mẹo: `zero_grad → backward → step`. Quên `zero_grad` là lỗi
> kinh điển: gradient cộng dồn qua các batch → model học sai hoặc không học.

## Cạm bẫy hay gặp

- **Quên `optimizer.zero_grad()`** → gradient tích luỹ qua các batch, model học loạn. Lỗi số 1.
- **Sai thứ tự** loss/backward/step → gradient tính trên loss cũ; luôn forward → loss → backward → step.
- **Tensor khác device** (một ở CPU, một ở GPU) → lỗi runtime; nhớ `.to(device)` cả model lẫn dữ liệu.
- **Thêm softmax trước `CrossEntropyLoss`** → softmax bị áp hai lần, model học kém; để output là logits thô.
- **Quên `model.eval()` + `torch.no_grad()`** khi đánh giá → chậm, tốn RAM, và sai với layer như dropout.
- **Sai shape** khi nối layer (input `nn.Linear` không khớp) → lỗi; kiểm tra `.shape` khi nghi ngờ.

## Ghi nhớ

**PyTorch** biến lý thuyết bài 22-23 thành code chạy được. **Tensor** là dữ liệu lõi (nhớ
**shape/dtype/device**); **autograd** tự tính gradient qua `requires_grad` + `.backward()` —
chính là backprop tự động. Định nghĩa model bằng **`nn.Module`** (layer trong `__init__`,
forward pass trong `forward`); nạp dữ liệu theo batch bằng **Dataset/DataLoader**. Trái tim là
**training loop** năm bước: **forward → loss → `zero_grad` → `backward` → `step`** — nhớ đúng
thứ tự và đừng quên `zero_grad`. Với `CrossEntropyLoss` + `Adam(lr=1e-3)`, một mạng nhỏ train
trên MNIST vài phút đạt 95%+ accuracy. Từ đây bạn có nền để fine-tune và can thiệp sâu vào
model, thay vì chỉ gọi API.
