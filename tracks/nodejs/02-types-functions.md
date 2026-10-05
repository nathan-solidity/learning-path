---
level: "node-core"
order: 2
title: "Kiểu nâng cao & hàm trong TypeScript"
est: "4-5 giờ"
checklist:
  - "Dùng được union type, literal type và type alias đúng chỗ"
  - "Viết được hàm có kiểu tham số/trả về rõ ràng, kể cả arrow function"
  - "Phân biệt được interface và type, biết khi nào dùng cái nào"
  - "Dùng generic để viết hàm/kiểu tái sử dụng (vd một hàm cho nhiều kiểu)"
  - "Xử lý được giá trị có thể null/undefined với optional chaining và nullish coalescing"
  - "Đọc được kiểu do TS suy luận (type inference) mà không cần khai báo thừa"
---

## Vì sao học sâu hệ kiểu

Kiểu trong TS không chỉ để "báo lỗi". Kiểu tốt là **tài liệu sống**: đọc chữ ký hàm là biết
nó nhận gì, trả gì, có thể null không. Khi API lớn dần, kiểu chặt chẽ giúp refactor không
sợ vỡ. Bài này là công cụ bạn dùng mỗi ngày khi viết Express/NestJS sau này.

## Union & literal type

```typescript
// Union: giá trị có thể là MỘT trong nhiều kiểu
let id: string | number;
id = "abc";     // OK
id = 123;       // OK

// Literal type: chỉ nhận đúng các giá trị liệt kê — như enum nhẹ
type Status = "pending" | "active" | "banned";
let s: Status = "active";     // OK
// s = "xoá";                 // ❌ không nằm trong danh sách
```

Literal type cực hữu ích cho trạng thái, role, HTTP method — TS tự gợi ý và chặn giá trị
sai.

## type vs interface

```typescript
interface User {
  id: number;
  name: string;
}

type Point = { x: number; y: number };
```

| | `interface` | `type` |
|---|---|---|
| Mô tả shape object | ✅ | ✅ |
| Union / literal / tuple | ❌ | ✅ (`type S = "a" \| "b"`) |
| Mở rộng (extends / &) | ✅ `extends` | ✅ `&` (intersection) |
| Gộp khai báo trùng tên | ✅ (declaration merging) | ❌ |

> **Quy tắc thực dụng**: shape của object/entity → dùng `interface`; union, literal, hàm,
> tuple → dùng `type`. Đừng tranh cãi quá nhiều, chọn một và nhất quán trong team.

## Hàm có kiểu

```typescript
// Hàm thường
function add(a: number, b: number): number {
  return a + b;
}

// Arrow function (dùng nhiều trong callback, Express handler)
const greet = (name: string): string => `Xin chào ${name}`;

// Tham số optional & mặc định
function log(msg: string, level: "info" | "error" = "info"): void {
  console.log(`[${level}] ${msg}`);
}
log("khởi động");            // level mặc định "info"
log("sập rồi", "error");
```

`void` = hàm không trả giá trị. TS thường tự suy được kiểu trả về, nhưng khai báo rõ với
hàm public giúp đọc dễ hơn.

## Generic — viết một lần, dùng cho nhiều kiểu

Không muốn viết `getFirstString`, `getFirstNumber`... riêng cho từng kiểu:

```typescript
// <T> là "kiểu chưa biết", TS điền vào khi gọi
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}

first([1, 2, 3]);         // T = number → trả number
first(["a", "b"]);        // T = string → trả string

// Generic cho kiểu — hay dùng cho response API
interface ApiResponse<T> {
  data: T;
  error: string | null;
}
const res: ApiResponse<User> = { data: user, error: null };
```

Generic là nền tảng của Promise (`Promise<User>`), mảng (`Array<T>`), và hầu hết thư viện
Node hiện đại.

## Null / undefined — nơi bug hay ẩn

```typescript
interface Config { db?: { host: string } }
const config: Config = {};

// ❌ có thể nổ: config.db là undefined
// console.log(config.db.host);

// ✅ optional chaining: dừng an toàn nếu gặp undefined
console.log(config.db?.host);          // => undefined, không nổ

// ✅ nullish coalescing: giá trị mặc định khi null/undefined
const host = config.db?.host ?? "localhost";   // "localhost"
```

> `??` khác `||`: `??` chỉ thay khi giá trị là `null`/`undefined`. `0 ?? 5` → `0`, nhưng
> `0 || 5` → `5`. Với số/boolean, dùng `??` để không nuốt nhầm giá trị hợp lệ.

## Cạm bẫy hay gặp

- Dùng `any` để "cho qua lỗi" → mất toàn bộ kiểm tra kiểu; ưu tiên `unknown` rồi thu hẹp.
- Khai báo kiểu thừa khi TS đã suy được (`const n: number = 5`) → để TS tự suy cho gọn.
- Nhầm `||` với `??` khiến `0` hoặc `""` bị thay bằng mặc định ngoài ý muốn.
- Quên `?.` khi truy cập dữ liệu từ ngoài (API, DB) → `Cannot read properties of undefined`.
- Lạm dụng generic khi một kiểu cụ thể là đủ → code khó đọc mà không lợi ích.

## Ghi nhớ

Union/literal mô tả "giá trị nào hợp lệ", generic giúp tái dùng, `?.` và `??` xử lý an toàn
dữ liệu thiếu. Viết kiểu như viết tài liệu: người đọc chữ ký hàm phải hiểu ngay nó làm gì.
Dùng `unknown` thay `any` khi chưa chắc kiểu.
</content>
