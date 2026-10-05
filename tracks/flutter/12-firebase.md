---
level: "intermediate"
order: 12
title: "Firebase — Auth, Firestore & Push Notification"
est: "7-8 giờ"
checklist:
  - "Kết nối Firebase vào Flutter bằng FlutterFire CLI, khởi tạo trong `main`"
  - "Đăng nhập bằng Firebase Auth (email/password, Google) và theo dõi trạng thái đăng nhập"
  - "Đọc/ghi Firestore và lắng nghe realtime qua snapshots"
  - "Nhận push notification bằng FCM (foreground & background)"
  - "Đặt Firestore Security Rules cơ bản để chặn truy cập trái phép"
related:
  - "skill:nta-security-audit"
  - "skill:nta-code-review"
---

## Firebase là gì & khi nào dùng

**Firebase** là backend-as-a-service của Google: xác thực, database realtime (Firestore),
push notification (FCM), storage, analytics... Rất phổ biến với Flutter vì tích hợp tốt và
dựng backend nhanh — hợp cho MVP, app realtime (chat), hoặc khi không muốn tự viết server.

## Kết nối bằng FlutterFire CLI

```bash
dart pub global activate flutterfire_cli
flutterfire configure         # chọn project Firebase → sinh firebase_options.dart
flutter pub add firebase_core
```

```dart
Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
  runApp(const ProviderScope(child: MyApp()));
}
```

## Firebase Auth — đăng nhập

```bash
flutter pub add firebase_auth
```

```dart
final auth = FirebaseAuth.instance;

// đăng ký / đăng nhập email
await auth.createUserWithEmailAndPassword(email: e, password: p);
await auth.signInWithEmailAndPassword(email: e, password: p);
await auth.signOut();
```

**Theo dõi trạng thái đăng nhập** bằng stream — dùng để tự chuyển màn login/home:

```dart
final authStateProvider = StreamProvider<User?>((ref) =>
    FirebaseAuth.instance.authStateChanges());

// trong widget gốc
ref.watch(authStateProvider).when(
  data: (user) => user == null ? const LoginScreen() : const HomeScreen(),
  loading: () => const SplashScreen(),
  error: (e, _) => ErrorScreen('$e'),
);
```

Đăng nhập Google/Apple cần thêm `google_sign_in`/`sign_in_with_apple` và cấu hình OAuth
(Apple Sign-In là **bắt buộc** nếu app có đăng nhập bên thứ ba khác — điều kiện của App Store).

## Firestore — database realtime

```bash
flutter pub add cloud_firestore
```

```dart
final db = FirebaseFirestore.instance;

// ghi
await db.collection('todos').add({'title': 'Mua sữa', 'done': false});

// đọc 1 lần
final snap = await db.collection('todos').get();
final todos = snap.docs.map((d) => Todo.fromJson(d.data())).toList();

// lắng nghe REALTIME (stream) → UI tự cập nhật khi dữ liệu đổi
Stream<List<Todo>> watchTodos() => db.collection('todos').snapshots().map(
    (s) => s.docs.map((d) => Todo.fromJson(d.data())).toList());
```

Ghép `watchTodos()` vào `StreamProvider` (bài 11) → danh sách tự đồng bộ giữa các thiết bị.

## Security Rules — đừng bỏ qua

Firestore mặc định có thể mở toang. **Luôn** đặt rule để chỉ chủ dữ liệu truy cập được:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {
    match /todos/{id} {
      allow read, write: if request.auth != null
                         && request.auth.uid == resource.data.ownerId;
    }
  }
}
```

> **Cảnh báo bảo mật**: không bao giờ để rule `allow read, write: if true` lên production —
> ai cũng đọc/ghi được toàn bộ dữ liệu. Rule là tầng bảo vệ chính của Firestore.

## FCM — push notification

```bash
flutter pub add firebase_messaging
```

```dart
final fcm = FirebaseMessaging.instance;
await fcm.requestPermission();                 // iOS bắt buộc xin quyền
final token = await fcm.getToken();            // gửi token này lên server để nhắm gửi

// nhận khi app đang mở
FirebaseMessaging.onMessage.listen((msg) {
  print('Thông báo: ${msg.notification?.title}');
});

// nhận khi app ở background/terminated (handler top-level)
FirebaseMessaging.onBackgroundMessage(_bgHandler);
```

iOS cần cấu hình thêm **APNs key** trong Firebase Console và bật capability *Push
Notifications* + *Background Modes* trong Xcode (sẽ nhắc lại ở bài triển khai iOS).

## Cạm bẫy hay gặp

- Quên `WidgetsFlutterBinding.ensureInitialized()` trước `Firebase.initializeApp` → crash.
- Để Security Rules mở → lộ toàn bộ dữ liệu. Cấu hình rule trước khi lên production.
- Không xin quyền notification trên iOS → không nhận được push.
- Đọc Firestore bằng `.get()` khi cần realtime → dùng `.snapshots()` (stream).

## Ghi nhớ

Firebase dựng backend nhanh: **Auth** (theo dõi `authStateChanges` để điều hướng login/home),
**Firestore** (`.snapshots()` cho realtime, ghép StreamProvider), **FCM** (push). Quan trọng
nhất về an toàn: **Security Rules** — không để mở. Đây là lựa chọn tốt cho MVP và app realtime.
