---
level: "data-analysis"
order: 18
title: "Visualization"
est: "5-6 giờ"
checklist:
  - "Vẽ được 4 loại biểu đồ cơ bản với matplotlib: line, bar, scatter, histogram"
  - "Dùng seaborn để vẽ biểu đồ thống kê (boxplot, heatmap) gọn hơn matplotlib"
  - "Vẽ nhanh trực tiếp từ DataFrame bằng df.plot"
  - "Chọn đúng loại biểu đồ theo bản chất dữ liệu (xu hướng/so sánh/phân bố/quan hệ)"
  - "Đặt tiêu đề, nhãn trục, chú thích và lưu hình ra file (savefig)"
  - "Nhận biết và tránh biểu đồ gây hiểu sai (trục y không từ 0, pie quá nhiều lát)"
related:
  - "glossary:dataframe"
  - "skill:nta-perf-audit"
---

## Vì sao quan trọng

Phân tích xong mà không truyền đạt được thì vô nghĩa. **Biểu đồ** là cách nhanh nhất để thấy
xu hướng, so sánh, và bất thường mà bảng số khô khan che giấu. **matplotlib** là nền tảng vẽ
của Python; **seaborn** xây trên matplotlib để vẽ biểu đồ thống kê đẹp và ngắn gọn hơn. Bài
này dùng chính code làm ví dụ vì bản thân nó nói về hình ảnh.

## matplotlib — nền tảng

```python
import matplotlib.pyplot as plt

months = ["1", "2", "3", "4"]
revenue = [120, 150, 130, 180]

fig, ax = plt.subplots(figsize=(8, 4))  # tạo khung vẽ, đặt kích thước
ax.plot(months, revenue, marker="o")    # line chart
ax.set_title("Doanh thu theo tháng")    # tiêu đề
ax.set_xlabel("Tháng")                   # nhãn trục x
ax.set_ylabel("Triệu đồng")              # nhãn trục y
plt.show()
```

> Dùng lối **object-oriented** (`fig, ax = plt.subplots()` rồi gọi `ax.*`) thay vì gọi
> `plt.*` liên tục. Cách này rõ ràng khi vẽ nhiều biểu đồ trong một hình.

## 4 loại biểu đồ cơ bản

```python
# BAR — so sánh giữa các nhóm
ax.bar(["Áo", "Quần", "Mũ"], [50, 30, 80])

# SCATTER — quan hệ giữa hai biến số
ax.scatter(df["price"], df["qty"])

# HISTOGRAM — phân bố của một biến số
ax.hist(df["price"], bins=20)

# LINE — xu hướng theo thời gian
ax.plot(df["order_date"], df["total"])
```

## seaborn — biểu đồ thống kê gọn hơn

seaborn hiểu DataFrame trực tiếp: chỉ cần trỏ tên cột.

```python
import seaborn as sns

# boxplot: phân bố giá theo từng sản phẩm — matplotlib phải viết dài hơn nhiều
sns.boxplot(data=df, x="product", y="price")

# heatmap: ma trận tương quan giữa các cột số
sns.heatmap(df.corr(numeric_only=True), annot=True, cmap="coolwarm")

# so sánh có phân nhóm chỉ bằng tham số hue
sns.barplot(data=df, x="product", y="total", hue="region")
```

## Vẽ nhanh từ DataFrame với df.plot

Khi chỉ cần nhìn nhanh, gọi thẳng `.plot` trên DataFrame/Series:

```python
df.groupby("product")["total"].sum().plot(kind="bar")   # tổng hợp rồi vẽ luôn
df["price"].plot(kind="hist", bins=15)
df.plot(x="order_date", y="total", kind="line")
```

> `df.plot` gọi matplotlib ngầm — tiện cho khám phá dữ liệu. Khi cần hình chỉn chu để báo
> cáo thì quay lại `fig, ax` để kiểm soát tiêu đề, nhãn, màu.

## Chọn đúng loại biểu đồ

| Câu hỏi dữ liệu | Loại biểu đồ | Ví dụ |
|-----------------|--------------|-------|
| Thay đổi theo thời gian? | **line** | doanh thu theo tháng |
| So sánh giữa các nhóm? | **bar** | doanh thu theo sản phẩm |
| Phân bố một biến? | **histogram / boxplot** | phân bố giá |
| Quan hệ hai biến số? | **scatter** | giá vs số lượng bán |
| Tương quan nhiều biến? | **heatmap** | ma trận correlation |

> Dùng sai loại làm người xem hiểu sai. Ví dụ dùng line cho dữ liệu danh mục (sản phẩm) là
> vô nghĩa vì các điểm không có thứ tự liên tục — dùng bar.

## Lưu hình ra file

```python
fig.savefig("revenue.png", dpi=150, bbox_inches="tight")  # PNG cho web/báo cáo
fig.savefig("revenue.svg")                                 # SVG cho in ấn, phóng to không vỡ
plt.close(fig)   # đóng để giải phóng bộ nhớ khi vẽ hàng loạt trong vòng lặp
```

> `savefig` phải gọi **trước** `plt.show()`; sau `show()` figure có thể đã bị dọn nên file
> ra trắng. `bbox_inches="tight"` cắt lề thừa cho gọn.

## Cạm bẫy hay gặp

- Trục y không bắt đầu từ 0 ở bar chart → phóng đại chênh lệch, gây hiểu sai.
- Pie chart quá nhiều lát (>5) → mắt khó so sánh; đổi sang bar chart.
- Quên `set_xlabel`/`set_ylabel`/`set_title` → biểu đồ vô nghĩa với người khác.
- Gọi `savefig` sau `plt.show()` → file ảnh trắng.
- Vẽ nhiều hình trong vòng lặp mà không `plt.close()` → rò rỉ bộ nhớ, cảnh báo quá nhiều
  figure mở.

## Ghi nhớ

**matplotlib** là nền tảng (dùng `fig, ax`), **seaborn** vẽ biểu đồ thống kê từ DataFrame
gọn hơn, **`df.plot`** để khám phá nhanh. Chọn loại theo câu hỏi: **line** cho xu hướng,
**bar** cho so sánh, **histogram/boxplot** cho phân bố, **scatter** cho quan hệ. Luôn đặt
tiêu đề/nhãn trục, để **trục y từ 0** với bar, và `savefig` **trước** `show()`.
