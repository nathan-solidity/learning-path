---
level: "beginner"
order: 7
title: "Exception, Optional & I/O"
est: "4-5 giờ"
checklist:
  - "Phân biệt checked vs unchecked exception và khi nào dùng loại nào"
  - "Dùng try-catch-finally và try-with-resources đúng cách"
  - "Tự định nghĩa exception và quyết định throw/log ở tầng nào"
  - "Dùng Optional đúng cách, tránh Optional.get() bừa bãi"
  - "Đọc/ghi file text và CSV bằng java.nio.file (Path, Files)"
related:
  - "skill:nta-debug"
  - "skill:nta-code-review"
---

## Checked vs Unchecked exception

```
Throwable
├── Error            (lỗi JVM nghiêm trọng — OutOfMemory, đừng bắt)
└── Exception
    ├── IOException, SQLException...   → CHECKED (buộc xử lý)
    └── RuntimeException              → UNCHECKED (không buộc)
        ├── NullPointerException
        ├── IllegalArgumentException
        └── IndexOutOfBoundsException
```

- **Checked** (`IOException`, `SQLException`): trình biên dịch **bắt buộc** bạn `try-catch`
  hoặc khai báo `throws`. Dùng cho lỗi **có thể phục hồi** (file không tồn tại, mất mạng).
- **Unchecked** (`RuntimeException` và con): không bắt buộc xử lý. Thường là **lỗi lập
  trình** (null, index sai, tham số không hợp lệ).

```java
// Checked — buộc xử lý
try {
    Files.readString(Path.of("data.txt"));
} catch (IOException e) {
    // xử lý hoặc ném tiếp
}

// Unchecked — ném khi input sai, không cần khai báo
if (age < 0) throw new IllegalArgumentException("Tuổi không âm");
```

## try-catch-finally & try-with-resources

```java
// finally luôn chạy — dù có lỗi hay không
try {
    process();
} catch (IllegalStateException e) {
    log.error("Lỗi trạng thái", e);
} finally {
    cleanup();          // luôn chạy: đóng tài nguyên, giải phóng...
}
```

**try-with-resources** — tự đóng tài nguyên (file, connection), thay cho `finally` thủ công:

```java
// Tài nguyên khai trong (), tự gọi close() khi xong — kể cả khi có lỗi
try (var reader = Files.newBufferedReader(Path.of("data.txt"))) {
    String line = reader.readLine();
}   // reader tự đóng ở đây — không cần finally
```

> **Luôn ưu tiên try-with-resources** cho mọi thứ cần đóng (file, DB connection, stream).
> Quên đóng → rò tài nguyên (resource leak), lỗi khó tìm khi chạy lâu.

## Tự định nghĩa exception & throw/log ở đâu

```java
public class UserNotFoundException extends RuntimeException {
    public UserNotFoundException(Long id) {
        super("Không tìm thấy user id=" + id);
    }
}

// Tầng service: ném exception nghiệp vụ
public User findById(Long id) {
    return repository.findById(id)
        .orElseThrow(() -> new UserNotFoundException(id));
}
```

> **Nguyên tắc throw & log**: ném exception ở nơi **phát hiện** lỗi, **log ở nơi xử lý cuối
> cùng** (thường là tầng controller / global handler). **Đừng vừa log vừa ném lại** ở mỗi
> tầng — sẽ log trùng nhiều lần cùng một lỗi. (Trong Spring, một `@RestControllerAdvice`
> gom lỗi và log tập trung — xem bài Spring Boot.)

## Optional — tránh null

`Optional<T>` biểu diễn "có thể có hoặc không có giá trị", buộc người gọi xử lý trường hợp
rỗng thay vì quên → NPE.

```java
Optional<User> found = repository.findByEmail(email);

// ✅ Dùng đúng — xử lý cả 2 nhánh
String name = found.map(User::getName).orElse("Khách");
found.ifPresent(u -> sendWelcome(u));
User u = found.orElseThrow(() -> new UserNotFoundException(email));

// ❌ SAI — get() không kiểm tra = null trá hình
User bad = found.get();     // ném NoSuchElementException nếu rỗng
```

> **Cạm bẫy**: `Optional.get()` không kiểm tra `isPresent()` trước = tự bắn vào chân. Dùng
> `orElse` / `orElseThrow` / `map` / `ifPresent`. Cũng **đừng** dùng `Optional` cho field
> hay tham số — chỉ dùng cho **kiểu trả về** khi có thể rỗng.

## I/O & File với java.nio.file

`java.nio.file` (Path, Files) là API hiện đại, gọn hơn `java.io.File` cũ:

```java
import java.nio.file.*;

Path path = Path.of("data", "users.txt");   // data/users.txt

// Ghi
Files.writeString(path, "Nhân,30\nAnh,25\n");

// Đọc toàn bộ
String content = Files.readString(path);

// Đọc theo dòng
List<String> lines = Files.readAllLines(path);

// Đọc dạng stream (file lớn, không nạp hết vào RAM)
try (var stream = Files.lines(path)) {
    stream.filter(l -> !l.isBlank()).forEach(System.out::println);
}
```

Đọc/ghi CSV đơn giản (file nhỏ — file lớn nên dùng thư viện như OpenCSV):

```java
for (String line : Files.readAllLines(Path.of("users.csv"))) {
    String[] cols = line.split(",");
    String name = cols[0];
    int age = Integer.parseInt(cols[1].trim());
}
```

## Cạm bẫy hay gặp

- **`catch (Exception e) {}`** rỗng — nuốt lỗi, mất dấu vết. Ít nhất log lại `e` (cả stack
  trace).
- **Quên đóng tài nguyên** → dùng try-with-resources, đừng đóng thủ công dễ sót.
- **`Optional.get()` không kiểm tra** → NPE trá hình. Dùng `orElse`/`orElseThrow`.
- **Bắt `Exception` chung chung** khi chỉ định bắt được loại cụ thể → che mất lỗi khác.
- **Ném checked exception qua nhiều tầng** → cân nhắc bọc thành unchecked (RuntimeException)
  cho gọn API, nhưng giữ nguyên `cause`.

## Ghi nhớ

Checked = lỗi phục hồi được (buộc xử lý), unchecked = lỗi lập trình. **try-with-resources**
cho mọi thứ cần đóng. `Optional` để diễn đạt "có thể rỗng" ở kiểu trả về — nhưng **không bao
giờ `.get()` mà chưa kiểm tra**. Log lỗi một lần ở tầng ngoài cùng, đừng log trùng mỗi tầng.
