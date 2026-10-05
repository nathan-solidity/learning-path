---
level: "intermediate"
order: 10
title: "Lưu trữ cục bộ — preferences, secure storage & SQLite"
est: "5-6 giờ"
checklist:
  - "Lưu cài đặt đơn giản bằng `shared_preferences`"
  - "Lưu token/dữ liệu nhạy cảm bằng `flutter_secure_storage`"
  - "Chọn đúng giải pháp DB cục bộ (sqflite/Drift/Isar/Hive) theo nhu cầu"
  - "Thiết kế cache offline: đọc cache trước, đồng bộ mạng sau"
  - "Biết KHÔNG lưu gì vào SharedPreferences (dữ liệu nhạy cảm, khối lượng lớn)"
related:
  - "skill:nta-code-review"
  - "skill:nta-security-audit"
---

## Chọn công cụ theo nhu cầu

| Nhu cầu | Công cụ | Ghi chú |
|---------|---------|---------|
| Cài đặt nhỏ (theme, cờ, ngôn ngữ) | `shared_preferences` | Key-value, **không mã hóa** |
| Token, mật khẩu, dữ liệu nhạy cảm | `flutter_secure_storage` | Dùng Keychain (iOS) / Keystore (Android) |
| Dữ liệu quan hệ, truy vấn phức tạp | `sqflite` / `Drift` | SQLite; Drift có type-safe queries |
| Dữ liệu lớn, nhanh, NoSQL | `Isar` / `Hive` | Nhanh, object DB |

## shared_preferences — cài đặt đơn giản

```bash
flutter pub add shared_preferences
```

```dart
final prefs = await SharedPreferences.getInstance();
await prefs.setBool('dark_mode', true);
await prefs.setString('lang', 'vi');

final dark = prefs.getBool('dark_mode') ?? false;   // mặc định nếu chưa có
```

> **KHÔNG** lưu token, mật khẩu, thông tin cá nhân vào `shared_preferences` — nó **không mã
> hóa**, đọc được nếu thiết bị bị root/jailbreak. Dùng secure storage cho dữ liệu nhạy cảm.

## flutter_secure_storage — dữ liệu nhạy cảm

```bash
flutter pub add flutter_secure_storage
```

```dart
const storage = FlutterSecureStorage();
await storage.write(key: 'access_token', value: token);
final token = await storage.read(key: 'access_token');
await storage.delete(key: 'access_token');   // khi đăng xuất
```

Dữ liệu được lưu vào **Keychain** (iOS) và **Keystore/EncryptedSharedPreferences** (Android)
— mã hóa ở tầng hệ điều hành.

## SQLite với sqflite

Cho dữ liệu quan hệ, cần truy vấn:

```bash
flutter pub add sqflite path
```

```dart
final db = await openDatabase(
  join(await getDatabasesPath(), 'app.db'),
  version: 1,
  onCreate: (db, v) => db.execute(
    'CREATE TABLE notes(id INTEGER PRIMARY KEY, title TEXT, body TEXT)'),
);

await db.insert('notes', {'title': 'A', 'body': '...'});
final rows = await db.query('notes', orderBy: 'id DESC');
```

**Drift** đặt lên trên SQLite cung cấp truy vấn **type-safe** (sinh code, bắt lỗi lúc biên
dịch) — khuyến nghị khi schema phức tạp. **Isar/Hive** phù hợp khi không cần SQL, ưu tiên tốc độ.

## Mẫu cache offline

Cho trải nghiệm mượt và dùng được khi mất mạng: **đọc cache trước, gọi mạng sau, cập nhật cache**.

```dart
Future<List<Article>> getArticles() async {
  final cached = await localDb.getArticles();   // hiện ngay dữ liệu cũ
  try {
    final fresh = await api.fetchArticles();     // tải mới
    await localDb.saveArticles(fresh);           // cập nhật cache
    return fresh;
  } catch (_) {
    return cached;                               // mạng lỗi → vẫn có cache
  }
}
```

Kết hợp với Riverpod: repository trả cache trước, rồi phát bản mới — UI luôn có gì đó để hiện.

## Cạm bẫy hay gặp

- Lưu token vào `shared_preferences` → rủi ro bảo mật. Dùng secure storage.
- Mở/đóng database mỗi lần truy vấn → chậm. Giữ một instance dùng lại.
- Quên `version`/`onUpgrade` cho sqflite → không migrate được khi đổi schema.
- Lưu blob lớn (ảnh) vào DB/prefs → phình dung lượng; lưu file rồi giữ đường dẫn.

## Ghi nhớ

Chọn đúng công cụ theo dữ liệu: **prefs** cho cài đặt nhỏ, **secure storage** cho token,
**SQLite/Drift/Isar** cho dữ liệu có cấu trúc. Nguyên tắc bảo mật: **không bao giờ** để dữ
liệu nhạy cảm trong storage không mã hóa. Cache offline (đọc cache → sync mạng) làm app
nhanh và bền với mạng chập chờn.
