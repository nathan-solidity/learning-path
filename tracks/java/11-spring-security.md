---
level: "intermediate"
order: 11
title: "Spring Security & JWT"
est: "8-10 giờ"
checklist:
  - "Giải thích được filter chain và cấu hình SecurityFilterChain kiểu bean (Spring Security 6)"
  - "Phân biệt authentication vs authorization; cài UserDetailsService"
  - "Mã hoá mật khẩu bằng BCrypt và hiểu vì sao không lưu plaintext"
  - "Cài JWT access + refresh token: ký, xác thực, lưu ở đâu"
  - "Phân quyền theo role (@PreAuthorize) và theo bản ghi (ownership)"
  - "Nhận diện và phòng OWASP Top 10 phổ biến trong Spring (SQLi, XSS, IDOR, mass assignment)"
related:
  - "skill:nta-security-audit"
  - "skill:nta-code-review"
---

## Filter chain hoạt động thế nào

Mọi request đi qua một chuỗi **filter** trước khi tới controller. Spring Security cắm các
filter của nó vào chuỗi này để xác thực & phân quyền.

```
Request → [ ... → JwtAuthFilter → UsernamePasswordAuthFilter → Authorization ... ] → Controller
```

![Request kèm Bearer token đi qua JwtAuthFilter (xác thực) rồi Authorization (kiểm quyền) mới tới Controller; token sai → 401, thiếu quyền → 403](/images/java-jwt-filter.png)

Cấu hình theo **kiểu bean** (Spring Security 6+; `WebSecurityConfigurerAdapter` đã bị **xóa**):

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity           // bật @PreAuthorize
public class SecurityConfig {

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http, JwtAuthFilter jwtFilter) throws Exception {
        http
            .csrf(csrf -> csrf.disable())                       // stateless API: tắt CSRF
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()    // login/register công khai
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated())
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }
}
```

## Authentication vs Authorization

- **Authentication** (xác thực): "bạn là ai?" — kiểm tra email/mật khẩu, cấp token.
- **Authorization** (phân quyền): "bạn được làm gì?" — role/permission cho từng endpoint.

`UserDetailsService` nạp thông tin user từ DB cho quá trình xác thực:

```java
@Service
public class AppUserDetailsService implements UserDetailsService {
    private final UserRepository repo;
    public AppUserDetailsService(UserRepository repo) { this.repo = repo; }

    @Override
    public UserDetails loadUserByUsername(String email) {
        User u = repo.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException(email));
        return org.springframework.security.core.userdetails.User
            .withUsername(u.getEmail())
            .password(u.getPassword())            // đã mã hoá BCrypt
            .roles(u.getRole())                   // "USER" / "ADMIN"
            .build();
    }
}
```

## BCrypt — mã hoá mật khẩu

**Không bao giờ lưu mật khẩu dạng plaintext**, cũng không dùng MD5/SHA thường (bị bẻ nhanh).
BCrypt là hàm băm 1 chiều có **salt** và **chậm có chủ đích** (chống brute-force).

```java
// Khi đăng ký
user.setPassword(passwordEncoder.encode(rawPassword));   // băm trước khi lưu

// Khi đăng nhập — so sánh
boolean ok = passwordEncoder.matches(rawPassword, user.getPassword());
```

> BCrypt tự sinh salt khác nhau mỗi lần, nên cùng một mật khẩu băm ra 2 chuỗi khác nhau —
> đó là điều bình thường và an toàn.

## JWT — access token + refresh token

**JWT** (JSON Web Token) là token tự chứa thông tin, được **ký** để chống giả mạo. Server
không cần lưu session — mỗi request gửi kèm token trong header `Authorization: Bearer <token>`.

```java
@Component
public class JwtService {
    private final SecretKey key = Keys.hmacShaKeyFor(secret.getBytes());

    public String generateAccessToken(String email, String role) {
        return Jwts.builder()
            .subject(email)
            .claim("role", role)
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + 15 * 60_000))  // 15 phút
            .signWith(key)
            .compact();
    }

    public String extractEmail(String token) {
        return Jwts.parser().verifyWith(key).build()
            .parseSignedClaims(token).getPayload().getSubject();
    }
}
```

| | Access token | Refresh token |
|---|---|---|
| Sống | Ngắn (5-15 phút) | Dài (ngày/tuần) |
| Dùng để | Gọi API | Lấy access token mới |
| Lưu ở đâu | Bộ nhớ client (không localStorage nếu lo XSS) | HttpOnly cookie / DB (revoke được) |

> **Đánh đổi của JWT**: không revoke được ngay (khác session). Access token để **sống ngắn**;
> muốn "đăng xuất tức thì" thì quản lý refresh token trong DB (xoá là chặn cấp mới) hoặc
> dùng blacklist.

Filter đọc & xác thực token mỗi request:

```java
@Component
public class JwtAuthFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res,
                                    FilterChain chain) throws ServletException, IOException {
        String header = req.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            // xác thực token, set SecurityContext...
        }
        chain.doFilter(req, res);
    }
}
```

## OAuth2 / OpenID Connect

Cho phép đăng nhập bằng Google/GitHub... Spring hỗ trợ 2 vai trò:
- **OAuth2 Login** (client) — app của bạn cho user đăng nhập qua Google.
- **Resource Server** — app xác thực JWT do một Authorization Server (Keycloak, Auth0) cấp.

```yaml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: https://your-auth-server/realms/app
```

## Phân quyền: role & ownership

```java
// Theo role
@PreAuthorize("hasRole('ADMIN')")
public void deleteUser(Long id) { ... }

// Theo bản ghi (ownership) — chỉ chủ sở hữu mới sửa được
@PreAuthorize("#todo.ownerId == authentication.name or hasRole('ADMIN')")
public void update(Todo todo) { ... }
```

> **IDOR** (Insecure Direct Object Reference) là lỗi hay gặp: user A gọi
> `PUT /api/todos/5` sửa todo của user B chỉ vì biết id. Luôn kiểm tra **ownership**, không
> chỉ "đã đăng nhập".

## OWASP Top 10 trong Spring

| Lỗi | Phòng trong Spring |
|-----|-------------------|
| **SQL Injection** | Dùng JPA/parameterized query; **không** nối chuỗi vào native query |
| **XSS** | Escape output ở frontend; `@RequestBody` + validation; không trả HTML thô |
| **IDOR** | Kiểm tra ownership (`@PreAuthorize` theo bản ghi) |
| **Mass assignment** | Dùng DTO riêng — không bind thẳng request vào entity |
| **Sensitive data lộ** | `@JsonIgnore` field nhạy cảm; che trong log |
| **Broken auth** | BCrypt, token sống ngắn, rate-limit login |

```java
// ❌ SQLi — nối chuỗi
@Query(value = "SELECT * FROM users WHERE email = '" + email + "'", nativeQuery = true)

// ✅ Parameterized
@Query(value = "SELECT * FROM users WHERE email = :email", nativeQuery = true)
List<User> findByEmail(@Param("email") String email);
```

## Che dữ liệu nhạy cảm & quản lý secret

- **Đừng log** mật khẩu, token, số thẻ, PII. Che bằng masking (`****`).
- Secret (JWT key, DB password) để ở **biến môi trường** / Vault / AWS Secrets Manager —
  không commit vào git.
- Bật HTTPS ở production; token luôn qua kênh mã hoá.

## Cạm bẫy hay gặp

- **Dùng `WebSecurityConfigurerAdapter`** (đã xóa ở Spring Security 6) → dùng bean
  `SecurityFilterChain`.
- **Lưu mật khẩu plaintext / MD5** → BCrypt.
- **Chỉ check "đã đăng nhập" mà quên ownership** → IDOR.
- **Bind request thẳng vào entity** → mass assignment (client set field không được phép).
- **Access token sống quá lâu** → bị lộ là nguy. Dùng token ngắn + refresh.
- **Để JWT secret trong code / yếu** → ai cũng ký được token giả. Secret dài, ngẫu nhiên,
  ở env.

## Ghi nhớ

Security 6 cấu hình bằng **bean `SecurityFilterChain`**. Mật khẩu luôn **BCrypt**. API
stateless dùng **JWT** (access ngắn + refresh dài). Phân quyền không chỉ theo role mà còn
theo **ownership** để tránh IDOR. Và nhớ: **DTO tách entity** chặn mass assignment,
parameterized query chặn SQLi.
