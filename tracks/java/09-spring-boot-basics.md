---
level: "beginner"
order: 9
title: "Spring Boot cơ bản — REST API hoàn chỉnh"
est: "10-12 giờ"
checklist:
  - "Tạo project Spring Boot bằng Initializr và hiểu cấu trúc thư mục chuẩn"
  - "Giải thích IoC & Dependency Injection; dùng constructor injection đúng cách"
  - "Viết REST controller với @GetMapping/@PostMapping, @PathVariable, @RequestParam"
  - "Tách DTO khỏi Entity và giải thích vì sao không expose entity ra API"
  - "Validate input bằng @Valid và xử lý lỗi tập trung bằng @RestControllerAdvice"
  - "Dùng Spring Data JPA: Entity, Repository, quan hệ @OneToMany/@ManyToOne, @Transactional"
  - "Viết unit test (JUnit 5 + Mockito) và test API bằng @WebMvcTest + MockMvc"
  - "Hoàn thành To-do API: CRUD + validation + xử lý lỗi + test"
related:
  - "skill:nta-code-review"
  - "skill:nta-test-gen"
---

## Tạo project & cấu trúc

Dùng [Spring Initializr](https://start.spring.io): chọn **Maven, Java 21, Spring Boot 3.x**,
thêm dependency: **Spring Web, Spring Data JPA, Validation, PostgreSQL Driver** (hoặc H2 để
học), **Lombok**.

```
src/main/java/com/example/todo/
├── TodoApplication.java        # class main có @SpringBootApplication
├── controller/                 # REST endpoint
├── service/                    # business logic
├── repository/                 # truy cập DB
├── entity/                     # JPA entity (bảng DB)
├── dto/                        # request/response object
└── exception/                  # exception & handler
src/main/resources/
└── application.yml             # cấu hình
```

```java
@SpringBootApplication
public class TodoApplication {
    public static void main(String[] args) {
        SpringApplication.run(TodoApplication.class, args);
    }
}
```

`@SpringBootApplication` bật **auto-configuration** — Spring tự cấu hình web server, JPA...
dựa trên các starter dependency có trong classpath.

## IoC & Dependency Injection

**Inversion of Control**: bạn không tự `new` object; Spring tạo và quản lý chúng (gọi là
**bean**), rồi "tiêm" (inject) vào nơi cần. Điều này giúp code lỏng lẻo (loose coupling) và
dễ test (thay bean thật bằng mock).

```java
@Service
public class TodoService {
    private final TodoRepository repository;

    // Constructor injection — Spring tự truyền repository vào
    public TodoService(TodoRepository repository) {
        this.repository = repository;
    }
}
```

> **Luôn dùng constructor injection** (không dùng `@Autowired` trên field). Lý do: field
> `final` bất biến, bắt buộc phụ thuộc lúc tạo, và **test dễ** (truyền mock qua constructor).
> Từ Spring 4.3, class có 1 constructor thì `@Autowired` là tùy chọn.

![Spring IoC Container tạo và tiêm bean Controller → Service → Repository qua constructor; bạn không tự new object](/images/java-spring-di.png)

Các stereotype annotation (đều là bean, khác nhau về ý nghĩa):

| Annotation | Dùng cho |
|-----------|----------|
| `@RestController` | Tầng web, trả JSON |
| `@Service` | Business logic |
| `@Repository` | Truy cập dữ liệu |
| `@Component` | Bean chung chung |
| `@Configuration` + `@Bean` | Định nghĩa bean thủ công |

## Cấu hình — application.yml & profile

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/todo
    username: ${DB_USER}          # đọc từ biến môi trường
    password: ${DB_PASSWORD}
  jpa:
    hibernate:
      ddl-auto: validate          # đừng dùng update/create ở prod
    show-sql: true

---
spring:
  config:
    activate:
      on-profile: dev             # profile riêng cho dev
  jpa:
    show-sql: true
```

Chạy với profile: `java -jar app.jar --spring.profiles.active=dev`. Bí mật (mật khẩu) để ở
**biến môi trường**, không hardcode trong file.

## REST controller

```java
@RestController
@RequestMapping("/api/todos")
public class TodoController {
    private final TodoService service;
    public TodoController(TodoService service) { this.service = service; }

    @GetMapping                                   // GET /api/todos
    public List<TodoResponse> list() {
        return service.findAll();
    }

    @GetMapping("/{id}")                          // GET /api/todos/1
    public TodoResponse get(@PathVariable Long id) {
        return service.findById(id);
    }

    @GetMapping("/search")                        // GET /api/todos/search?done=true
    public List<TodoResponse> search(@RequestParam boolean done) {
        return service.findByDone(done);
    }

    @PostMapping                                  // POST /api/todos
    @ResponseStatus(HttpStatus.CREATED)           // trả 201
    public TodoResponse create(@Valid @RequestBody TodoRequest req) {
        return service.create(req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)        // trả 204
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
```

## DTO tách khỏi Entity — vì sao

**Entity** ánh xạ bảng DB. **DTO** là dữ liệu trao đổi qua API. **Đừng expose entity trực
tiếp**:

```java
// Request DTO — dữ liệu client gửi lên (kèm validation)
public record TodoRequest(
    @NotBlank(message = "Tiêu đề không được trống")
    @Size(max = 200) String title,
    boolean done
) {}

// Response DTO — dữ liệu trả về (kiểm soát field lộ ra)
public record TodoResponse(Long id, String title, boolean done, LocalDateTime createdAt) {}
```

> **Vì sao tách?** (1) Không lộ field nhạy cảm/nội bộ (password, cột kỹ thuật). (2) Tránh
> vòng lặp vô hạn khi entity có quan hệ 2 chiều. (3) API ổn định khi schema DB đổi. (4) Đặt
> validation ở DTO, không làm bẩn entity.

## Bean Validation

```java
public record TodoRequest(
    @NotBlank String title,
    @Size(max = 500) String description,
    @NotNull @Future LocalDate dueDate
) {}
```

`@Valid` trong controller kích hoạt validation; sai → ném `MethodArgumentNotValidException`
(xử lý ở handler bên dưới). Các annotation hay dùng: `@NotNull`, `@NotBlank`, `@Size`,
`@Min`/`@Max`, `@Email`, `@Pattern`.

## Xử lý lỗi tập trung

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(TodoNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ErrorResponse handleNotFound(TodoNotFoundException e) {
        return new ErrorResponse("NOT_FOUND", e.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleValidation(MethodArgumentNotValidException e) {
        String msg = e.getBindingResult().getFieldErrors().stream()
            .map(err -> err.getField() + ": " + err.getDefaultMessage())
            .collect(Collectors.joining(", "));
        return new ErrorResponse("VALIDATION_ERROR", msg);
    }
}

public record ErrorResponse(String code, String message) {}
```

> Gom xử lý lỗi một chỗ để **format lỗi thống nhất** toàn API và **log tập trung**, thay vì
> rải try-catch khắp controller.

## Logging với SLF4J

```java
private static final Logger log = LoggerFactory.getLogger(TodoService.class);
// hoặc dùng Lombok: @Slf4j rồi gọi log.info(...)

log.info("Tạo todo mới: {}", title);      // dùng {} placeholder, KHÔNG nối chuỗi
log.error("Lỗi khi lưu todo", exception);  // truyền exception để in stack trace
```

## Spring Data JPA

```java
@Entity
@Table(name = "todos")
public class Todo {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private boolean done;

    @ManyToOne(fetch = FetchType.LAZY)     // nhiều todo thuộc 1 user
    @JoinColumn(name = "user_id")
    private User user;

    @CreationTimestamp
    private LocalDateTime createdAt;
    // getter/setter...
}
```

Repository — chỉ cần khai báo interface, Spring tự sinh cài đặt:

```java
public interface TodoRepository extends JpaRepository<Todo, Long> {
    List<Todo> findByDone(boolean done);              // sinh query từ tên method
    List<Todo> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT t FROM Todo t WHERE t.title LIKE %:kw%")
    List<Todo> search(@Param("kw") String keyword);   // JPQL tùy biến
}
```

Quan hệ cơ bản: `@OneToMany`, `@ManyToOne`, `@ManyToMany`. `@Transactional` trên method
service để một chuỗi thao tác DB chạy trong 1 transaction (rollback nếu lỗi):

```java
@Service
public class TodoService {
    @Transactional
    public TodoResponse create(TodoRequest req) {
        Todo todo = new Todo();
        todo.setTitle(req.title());
        return toResponse(repository.save(todo));
    }
}
```

> `ddl-auto: validate` + **Flyway** (migration) là cách chuẩn quản lý schema ở dự án thật —
> đừng để Hibernate tự `create`/`update` bảng ở production.

## Test — JUnit 5, Mockito, MockMvc

```java
// Unit test service — mock repository
@ExtendWith(MockitoExtension.class)
class TodoServiceTest {
    @Mock TodoRepository repository;
    @InjectMocks TodoService service;

    @Test
    void create_savesTodo() {
        var req = new TodoRequest("Học Java", false);
        when(repository.save(any())).thenAnswer(i -> i.getArgument(0));

        var result = service.create(req);

        assertThat(result.title()).isEqualTo("Học Java");   // AssertJ
        verify(repository).save(any(Todo.class));
    }
}

// Test API — @WebMvcTest chỉ nạp tầng web
@WebMvcTest(TodoController.class)
class TodoControllerTest {
    @Autowired MockMvc mvc;
    @MockBean TodoService service;

    @Test
    void get_returns404_whenNotFound() throws Exception {
        when(service.findById(99L)).thenThrow(new TodoNotFoundException(99L));

        mvc.perform(get("/api/todos/99"))
           .andExpect(status().isNotFound());
    }
}
```

- `@WebMvcTest` — chỉ tầng controller (nhanh). `@SpringBootTest` — nạp cả context (integration).
- Mockito: `when(...).thenReturn(...)` để giả kết quả, `verify(...)` để kiểm tra được gọi.

## Dự án nhỏ — To-do API (mục tiêu Beginner)

Hoàn thành để coi như "xong Beginner":

- [ ] CRUD đầy đủ: tạo / xem danh sách / xem 1 / sửa / xóa todo.
- [ ] Validation input (`@Valid`) + xử lý lỗi tập trung (`@RestControllerAdvice`).
- [ ] Tách DTO khỏi Entity (request/response riêng).
- [ ] Lưu DB thật (PostgreSQL/H2) qua Spring Data JPA.
- [ ] Quan hệ Todo–User (`@ManyToOne`).
- [ ] Test tầng service (Mockito) và tầng API (MockMvc).
- [ ] Đóng gói `Dockerfile` và chạy được bằng `docker compose` (xem track DevOps / bài
      Advanced để làm sâu hơn).

Sau đó thử **Blog API** (phân trang, sắp xếp, tìm kiếm, quan hệ Post–Comment–User) và thêm
**đăng nhập JWT** — sẽ học kỹ ở bài Spring Security (Intermediate).

## Cạm bẫy hay gặp

- **Field injection `@Autowired`** → dùng constructor injection (test dễ, final an toàn).
- **Expose entity ra API** → lộ field nhạy cảm & vòng lặp JSON. Luôn qua DTO.
- **`ddl-auto: update` ở prod** → nguy hiểm, mất/hỏng dữ liệu. Dùng migration (Flyway).
- **Nối chuỗi trong log** `log.info("x=" + x)` → dùng placeholder `log.info("x={}", x)`.
- **Không đặt `@Transactional`** cho thao tác nhiều bước ghi DB → dữ liệu nửa vời khi lỗi.
- **Bắt exception ngay trong controller** rải rác → gom về `@RestControllerAdvice`.

## Ghi nhớ

Spring Boot lo phần hạ tầng; bạn tập trung vào 3 tầng **Controller → Service → Repository**,
tách **DTO** khỏi **Entity**, validate bằng `@Valid`, gom lỗi ở `@RestControllerAdvice`, và
**test** từng tầng. Làm xong To-do API có test là bạn đã sẵn sàng cho Intermediate.
