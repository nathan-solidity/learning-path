---
level: "intermediate"
order: 12
title: "Thiết kế & chất lượng code"
est: "6-8 giờ"
checklist:
  - "Áp dụng layered architecture với quy tắc phụ thuộc 1 chiều Controller→Service→Repository"
  - "Nhận ra và áp dụng SOLID thực tế mà không lạm dụng interface"
  - "Dùng đúng design pattern (Strategy, Factory, Builder, Template Method) trong ngữ cảnh Spring"
  - "Map entity↔DTO bằng MapStruct hoặc mapper thủ công, tránh entity lọt ra API"
  - "Thiết lập mã lỗi nghiệp vụ thống nhất và checklist review code"
  - "Đo chất lượng bằng Checkstyle/Spotless, SonarQube, JaCoCo coverage"
---

## Layered architecture

Chia app thành các tầng, mỗi tầng một trách nhiệm, **phụ thuộc chỉ đi xuống**:

```
Controller   →  nhận request, validate, trả response (KHÔNG chứa business logic)
   ↓
Service      →  business logic, transaction, điều phối
   ↓
Repository   →  truy cập DB
   ↓
Database
```

> **Quy tắc phụ thuộc 1 chiều**: Controller gọi Service, Service gọi Repository. **Không**
> đi ngược (Repository không biết Service) và **không** nhảy cóc (Controller không gọi thẳng
> Repository). Vi phạm → logic rải khắp nơi, khó test.

![So sánh fat controller (nhồi logic + query vào controller) với layered architecture phụ thuộc 1 chiều Controller → Service → Repository → DB](/images/java-layered-arch.png)

Anti-pattern "fat controller" (nhồi logic vào controller) và "anemic service" (service chỉ
gọi thẳng repository, logic nằm ở controller) đều làm code khó bảo trì.

## SOLID áp dụng thực tế

| Nguyên tắc | Ý nghĩa ngắn | Thực tế |
|-----------|-------------|---------|
| **S**RP | Mỗi class 1 lý do thay đổi | Tách `OrderService` khỏi `EmailService` |
| **O**CP | Mở để mở rộng, đóng để sửa | Thêm loại mới bằng class mới, không sửa switch cũ |
| **L**SP | Con thay được cha | Đừng override làm sai hợp đồng cha |
| **I**SP | Interface nhỏ, chuyên biệt | Đừng ép cài method không dùng |
| **D**IP | Phụ thuộc abstraction | Service phụ thuộc interface Repository |

> **Đừng lạm dụng interface.** Không phải class nào cũng cần `XxxService` + `XxxServiceImpl`.
> Chỉ tách interface khi thật sự có **nhiều cài đặt** hoặc cần **mock để test tầng khác**.
> Một interface một cài đặt thường là boilerplate thừa.

## Design pattern hay dùng (trong Spring)

**Strategy** — chọn thuật toán lúc runtime (Spring inject sẵn nhiều bean cùng interface):

```java
public interface PaymentProcessor { void pay(Order o); }

@Service("momo") class MomoProcessor implements PaymentProcessor { ... }
@Service("vnpay") class VnpayProcessor implements PaymentProcessor { ... }

@Service
public class PaymentService {
    private final Map<String, PaymentProcessor> processors;   // Spring inject theo tên bean
    public PaymentService(Map<String, PaymentProcessor> processors) {
        this.processors = processors;
    }
    public void pay(String method, Order o) {
        processors.get(method).pay(o);
    }
}
```

**Builder** — tạo object nhiều field rõ ràng (Lombok `@Builder`):

```java
User u = User.builder().name("Nhân").email("n@x.com").role("USER").build();
```

**Factory** — tập trung logic tạo object; **Template Method** — khung chung, con điền chi
tiết (vd `AbstractProcessor` với các bước cố định); **Adapter** — bọc API bên thứ 3 sau một
interface của mình để dễ thay thế.

> Pattern là **công cụ giải quyết vấn đề cụ thể**, không phải mục tiêu. Đừng nhét pattern chỉ
> để "trông chuyên nghiệp" — code đơn giản mà đủ tốt hơn code đầy pattern không cần thiết.

## Mapping entity ↔ DTO

Không để entity lọt ra API (bài Spring Boot đã giải thích lý do). Hai cách map:

```java
// Thủ công — rõ ràng, không magic, hợp khi ít field
public TodoResponse toResponse(Todo t) {
    return new TodoResponse(t.getId(), t.getTitle(), t.isDone(), t.getCreatedAt());
}

// MapStruct — sinh code lúc biên dịch, nhanh, ít lỗi tay
@Mapper(componentModel = "spring")
public interface TodoMapper {
    TodoResponse toResponse(Todo entity);
    Todo toEntity(TodoRequest request);
}
```

> MapStruct sinh mapper lúc **compile** (không reflection runtime) → nhanh và an toàn kiểu.
> Ưu tiên MapStruct khi có nhiều DTO; mapper thủ công vẫn ổn cho dự án nhỏ. Tránh
> `BeanUtils.copyProperties` (chậm, không an toàn kiểu, dễ sót).

## Mã lỗi nghiệp vụ thống nhất

```java
public enum ErrorCode {
    TODO_NOT_FOUND("TODO_001", "Không tìm thấy todo"),
    UNAUTHORIZED("AUTH_001", "Không có quyền");

    final String code; final String message;
    ErrorCode(String code, String message) { this.code = code; this.message = message; }
}
```

Trả lỗi có `code` ổn định giúp client xử lý theo mã (không parse message tiếng người), và
đội hỗ trợ tra cứu nhanh.

## Đo & giữ chất lượng

| Công cụ | Làm gì |
|---------|--------|
| **Spotless / Checkstyle** | Format & kiểm tra style tự động (chạy trong CI) |
| **SonarQube** | Phát hiện code smell, bug, lỗ hổng, đo nợ kỹ thuật |
| **JaCoCo** | Đo test coverage (đặt ngưỡng tối thiểu, vd 70%) |

```xml
<!-- Spotless: format tự động khi build -->
<plugin>
  <groupId>com.diffplug.spotless</groupId>
  <artifactId>spotless-maven-plugin</artifactId>
</plugin>
```

> Coverage cao **không** đồng nghĩa test tốt — 90% coverage mà toàn assert vặt vẫn vô dụng.
> Coverage là sàn tối thiểu, không phải mục tiêu.

## Refactor & review

- **Đặt tên** rõ nghĩa: `calculateTotalPrice()` hơn `calc()`. Tên tốt = tài liệu sống.
- **Tách method** khi một method làm quá nhiều việc (giảm cyclomatic complexity — số nhánh
  if/for lồng nhau).
- **Guard clause** thay if lồng sâu:
  ```java
  if (user == null) return;           // return sớm
  if (!user.isActive()) return;
  process(user);                       // luồng chính không thụt lề sâu
  ```
- **Checklist review**: đúng nghiệp vụ chưa? edge case & null? có test? bảo mật (input,
  quyền)? tên rõ chưa? có lặp code không?

## Cạm bẫy hay gặp

- **Fat controller** — logic nghiệp vụ trong controller → đẩy xuống service.
- **Nhảy cóc tầng** — controller gọi thẳng repository → phá layered.
- **Interface + Impl cho mọi service** dù chỉ 1 cài đặt → boilerplate thừa.
- **Nhồi design pattern** không cần thiết → phức tạp hóa.
- **`BeanUtils.copyProperties`** / map bằng reflection → chậm, sót field âm thầm.
- **Đuổi theo coverage %** mà bỏ chất lượng assertion → test giả tạo.

## Ghi nhớ

Giữ **layered** với phụ thuộc 1 chiều, áp dụng SOLID có chừng mực (**đừng** interface hóa mọi
thứ), dùng pattern khi giải đúng vấn đề. Tách **DTO** khỏi entity (MapStruct hoặc tay), mã lỗi
nghiệp vụ thống nhất, và để **Spotless/Sonar/JaCoCo** trong CI canh chất lượng tự động.
