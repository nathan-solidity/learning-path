---
level: "beginner"
order: 6
title: "Collections & Generics"
est: "4-5 giờ"
checklist:
  - "Chọn đúng List / Set / Map theo nhu cầu và độ phức tạp thao tác"
  - "Phân biệt ArrayList vs LinkedList, HashSet vs TreeSet, HashMap vs TreeMap"
  - "Dùng Queue/Deque cho hàng đợi và ngăn xếp"
  - "Khai báo generic <T> và đọc được wildcard ? extends / ? super"
  - "Duyệt Map đúng cách (entrySet) và tránh sửa collection khi đang duyệt"
related:
  - "skill:nta-code-review"
  - "skill:nta-perf-audit"
---

## Ba nhóm Collection chính

```java
import java.util.*;

List<String> list = new ArrayList<>();   // có thứ tự, cho trùng, truy cập theo index
Set<String>  set  = new HashSet<>();     // không trùng, không đảm bảo thứ tự
Map<String, Integer> map = new HashMap<>(); // cặp key → value, key không trùng
```

## List — danh sách có thứ tự

```java
List<String> fruits = new ArrayList<>();
fruits.add("táo");
fruits.add("cam");
fruits.get(0);            // "táo" — truy cập theo index
fruits.set(1, "xoài");    // sửa phần tử
fruits.remove("táo");
fruits.contains("cam");   // true
fruits.size();
```

| | ArrayList | LinkedList |
|---|---|---|
| Cấu trúc | Mảng động | Danh sách liên kết |
| Truy cập theo index `get(i)` | Nhanh O(1) | Chậm O(n) |
| Thêm/xóa ở giữa | Chậm O(n) | Nhanh O(1) nếu có con trỏ |
| Thực tế | **Mặc định — dùng cái này** | Hiếm khi cần |

> **Mặc định dùng `ArrayList`.** `LinkedList` chỉ hơn khi thêm/xóa liên tục ở đầu/giữa với
> số lượng lớn — trường hợp hiếm.

## Set — không trùng lặp

```java
Set<String> tags = new HashSet<>();
tags.add("java");
tags.add("java");        // bị bỏ qua — Set không chứa trùng
tags.size();             // 1
```

- `HashSet` — nhanh nhất, **không có thứ tự**.
- `LinkedHashSet` — giữ **thứ tự thêm vào**.
- `TreeSet` — tự **sắp xếp tăng dần**, chậm hơn (dùng khi cần thứ tự).

> Set dựa vào `hashCode()`/`equals()` (bài OOP nâng cao) để biết trùng. Object tự viết mà
> quên override 2 method này → Set không loại được trùng.

## Map — cặp key-value

```java
Map<String, Integer> stock = new HashMap<>();
stock.put("táo", 10);
stock.put("cam", 5);
stock.get("táo");                    // 10
stock.getOrDefault("nho", 0);        // 0 (không có key → trả mặc định)
stock.putIfAbsent("táo", 99);        // không ghi đè vì "táo" đã có

// Duyệt Map — dùng entrySet
for (Map.Entry<String, Integer> e : stock.entrySet()) {
    System.out.println(e.getKey() + " = " + e.getValue());
}

// Đếm/gộp tiện lợi
stock.merge("táo", 1, Integer::sum);   // tăng số lượng táo thêm 1
```

`HashMap` (nhanh, không thứ tự) / `LinkedHashMap` (giữ thứ tự) / `TreeMap` (sắp theo key).

## Queue & Deque

```java
// Queue — FIFO (vào trước ra trước)
Queue<String> queue = new LinkedList<>();
queue.offer("A");        // thêm cuối
queue.poll();            // lấy & xóa đầu → "A"

// Deque — hai đầu, dùng làm Stack (LIFO) luôn
Deque<Integer> stack = new ArrayDeque<>();
stack.push(1);
stack.push(2);
stack.pop();             // 2 (vào sau ra trước)
```

> Đừng dùng class `Stack` cũ (đồng bộ, chậm). Dùng `ArrayDeque` cho cả stack lẫn queue.

## Generics — an toàn kiểu

Generics cho collection biết **kiểu phần tử**, để trình biên dịch bắt lỗi và khỏi ép kiểu:

```java
List<String> names = new ArrayList<>();
names.add("Nhân");
String n = names.get(0);        // không cần ép kiểu — biết chắc là String
// names.add(123);              // ❌ lỗi biên dịch — an toàn!
```

Viết class/method generic của riêng bạn:

```java
public class Box<T> {           // T là kiểu tùy biến
    private T value;
    public void set(T value) { this.value = value; }
    public T get() { return value; }
}

Box<String> b = new Box<>();
b.set("hello");
```

## Wildcard — ? extends / ? super

Khi nhận collection với kiểu "linh hoạt":

```java
// ? extends Number — đọc được (Number hoặc con của nó): Integer, Double...
double sum(List<? extends Number> nums) {
    double total = 0;
    for (Number n : nums) total += n.doubleValue();   // đọc OK
    return total;
}
sum(List.of(1, 2, 3));        // List<Integer> OK
sum(List.of(1.5, 2.5));       // List<Double> OK

// ? super Integer — ghi được (Integer hoặc cha của nó)
void addNumbers(List<? super Integer> list) {
    list.add(42);             // ghi OK
}
```

> Mẹo nhớ **PECS**: *Producer Extends, Consumer Super*. Collection **cung cấp** dữ liệu cho
> bạn đọc → `? extends`. Collection **nhận** dữ liệu bạn ghi vào → `? super`.

## Cạm bẫy hay gặp

- **Sửa collection khi đang for-each** → `ConcurrentModificationException`. Dùng
  `iterator.remove()` hoặc `list.removeIf(...)`.
- **Object tự viết làm key Map/phần tử Set** mà quên `equals`/`hashCode` → trùng lặp/không
  tìm thấy.
- **`List.of(...)` bất biến** → gọi `.add()` ném `UnsupportedOperationException`. Cần sửa
  thì `new ArrayList<>(List.of(...))`.
- **Dùng `LinkedList` "cho nhanh"** — thường chậm hơn `ArrayList` trong thực tế.
- **Raw type** `List list = ...` (không có `<>`) → mất an toàn kiểu, cảnh báo. Luôn khai
  báo kiểu phần tử.

## Ghi nhớ

Mặc định: `ArrayList`, `HashSet`, `HashMap`, `ArrayDeque`. Chỉ đổi sang biến thể `Tree*`
(cần sắp xếp) hay `Linked*` (cần giữ thứ tự) khi có lý do. Generics cho bạn an toàn kiểu
miễn phí — luôn khai báo `<T>`, và nhớ **PECS** khi gặp wildcard.
