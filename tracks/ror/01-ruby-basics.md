---
level: "ruby"
order: 1
title: "Cú pháp & kiểu dữ liệu cơ bản"
est: "4-5 giờ"
checklist:
  - "Khai báo và thao tác được String, Integer, Array, Hash, Symbol, Boolean"
  - "Dùng string interpolation `#{}` thay vì cộng chuỗi"
  - "Giải thích được khác biệt Symbol vs String và vì sao Rails ưu tiên Symbol"
  - "Viết được if/unless/case đúng idiom, không lồng if thừa"
  - "Duyệt Array/Hash bằng `each` thay vì `for`, hiểu vì sao"
  - "Đọc được một Hash lồng nhau (nested hash) như params trong Rails"
---

## Vì sao nắm chắc kiểu dữ liệu trước

Rails dựng trên Ruby. Khi bạn viết `params[:user][:email]` hay `render json: { status: :ok }`,
bạn đang thao tác Hash và Symbol thuần Ruby. Không chắc kiểu dữ liệu → copy code Rails mà
không hiểu, và bí khi lỗi. Bài này là nền cho mọi bài sau.

## Kiểu dữ liệu cơ bản

```ruby
name    = "Nhân"        # String
age     = 30            # Integer
price   = 19.99         # Float
active  = true          # Boolean (true / false)
nothing = nil           # nil — "không có gì" (giống null)

# String interpolation — dùng cái này, ĐỪNG cộng chuỗi
puts "Xin chào #{name}, #{age} tuổi"   # => Xin chào Nhân, 30 tuổi
puts "Xin chào " + name                # chạy được nhưng kém, lỗi nếu nối số
```

> **Cạm bẫy**: `"tuổi: " + age` báo lỗi vì không cộng String với Integer. Interpolation
> `#{age}` tự gọi `.to_s`, luôn an toàn hơn.

## Array — danh sách có thứ tự

```ruby
fruits = ["táo", "cam", "xoài"]

fruits[0]        # => "táo"     (index từ 0)
fruits[-1]       # => "xoài"    (index âm đếm từ cuối)
fruits << "nho"  # thêm cuối: ["táo", "cam", "xoài", "nho"]
fruits.length    # => 4
fruits.first     # => "táo"
fruits.include?("cam")  # => true
```

## Hash — cặp key-value

Hash là kiểu **quan trọng nhất** trong Rails (params, config, options đều là Hash).

```ruby
# Cú pháp hiện đại: key là Symbol
user = { name: "Nhân", age: 30, active: true }

user[:name]           # => "Nhân"  (truy cập bằng Symbol)
user[:email] = "n@x"  # thêm key mới
user.keys             # => [:name, :age, :active, :email]

# Hash lồng nhau — GIỐNG params trong Rails
params = { user: { name: "Nhân", roles: ["admin", "editor"] } }
params[:user][:name]      # => "Nhân"
params[:user][:roles][0]  # => "admin"
```

## Symbol vs String — điểm hay nhầm

Cả hai đều biểu diễn "text", nhưng khác nhau về mục đích và bộ nhớ:

| | String `"name"` | Symbol `:name` |
|---|---|---|
| Mục đích | Dữ liệu (nội dung thay đổi) | Định danh/nhãn (cố định) |
| Bộ nhớ | Mỗi lần tạo là object mới | Chỉ tạo 1 lần, tái dùng |
| Dùng làm Hash key | Được, nhưng nặng hơn | **Ưu tiên** — nhanh, ít RAM |

```ruby
"name".object_id == "name".object_id   # => false (2 object khác nhau)
:name.object_id  == :name.object_id    # => true  (cùng 1 object)
```

Vì thế Rails dùng Symbol khắp nơi: `params[:id]`, `status: :active`, `validates :email`.
Coi Symbol là "cái tên/nhãn không đổi", String là "nội dung do người dùng nhập".

## Câu điều kiện

```ruby
# if / elsif / else
if age >= 18
  puts "Người lớn"
elsif age >= 13
  puts "Thiếu niên"
else
  puts "Trẻ em"
end

# unless = "if không" — dùng khi điều kiện phủ định đọc tự nhiên hơn
puts "Chưa kích hoạt" unless active   # thay vì: if !active

# case — gọn hơn if lồng nhiều tầng
grade = case score
        when 90..100 then "A"
        when 80..89  then "B"
        else "C"
        end
```

> **Idiom**: dạng "hậu tố" `puts x if cond` rất phổ biến trong Ruby/Rails cho câu 1 dòng.
> Đừng lồng `if` nhiều tầng khi `case` diễn đạt gọn hơn.

## Vòng lặp — dùng `each`, không dùng `for`

```ruby
# ĐÚNG idiom Ruby: each
fruits.each do |fruit|
  puts fruit
end

# times — lặp n lần
3.times { |i| puts "Lần #{i}" }   # 0, 1, 2

# while — khi chưa biết số vòng
n = 1
while n <= 3
  puts n
  n += 1
end

# Duyệt Hash
user.each do |key, value|
  puts "#{key}: #{value}"
end
```

Vì sao **không** dùng `for`? `for` trong Ruby không tạo scope riêng (biến rò ra ngoài) và
không phải phong cách Ruby. `each` là block — đọc tự nhiên, đóng gói biến, và là nền cho
`map`/`select`/`reduce` sau này. Trong cả codebase Rails bạn gần như không thấy `for`.

## Cạm bẫy hay gặp

- **`nil` khác `false` nhưng cùng "falsy"**: chỉ `nil` và `false` là falsy; `0` và `""` đều **truthy** trong Ruby (khác nhiều ngôn ngữ khác).
- **Truy cập key không tồn tại trả `nil`**: `user[:xyz]` → `nil`, không báo lỗi. Rồi `nil.upcase` mới nổ — lỗi kinh điển "undefined method for nil".
- **`=` vs `==`**: `if x = 5` là gán (luôn đúng), `if x == 5` mới là so sánh.

## Ghi nhớ

Hash + Symbol là bộ đôi bạn gặp mỗi ngày trong Rails. Nếu đọc trôi `params[:user][:name]`
và biết vì sao `:name` là Symbol chứ không phải String, bạn đã sẵn sàng cho Rails nền tảng.
