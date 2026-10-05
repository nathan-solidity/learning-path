---
level: "techniques"
order: 20
title: "Techniques: Requirements Analysis & Design Definition"
est: "6-8 giờ"
checklist:
  - "Chọn đúng technique để mô hình hóa (dữ liệu / quy trình / trạng thái / quyết định) cho một yêu cầu cụ thể"
  - "Lập được một Data Dictionary định nghĩa field: kiểu, ràng buộc, giá trị hợp lệ"
  - "Vẽ được state model cho một đối tượng có nhiều trạng thái (đơn hàng, ticket...)"
  - "Viết được Decision Table đầy đủ tổ hợp điều kiện, không sót nhánh"
  - "Phân tích được NFR (performance, security, usability...) và viết thành yêu cầu kiểm chứng được"
  - "Dùng Functional Decomposition để chẻ một tính năng lớn thành các phần nhỏ có thể estimate"
related:
  - "glossary:nfr"
  - "glossary:db"
  - "skill:nta-diagram-gen"
  - "skill:nta-spec-review"
---

## Về nhóm technique này

**Requirements Analysis & Design Definition (RADD)** là knowledge area lớn nhất của BABOK —
nơi BA biến yêu cầu thô thành mô hình rõ ràng cho dev/QA dùng. Nhóm này gồm nhiều technique
mô hình hóa; mấu chốt là **chọn đúng loại mô hình cho đúng loại thông tin**: dữ liệu, quy
trình, trạng thái, hay logic quyết định.

Một số technique đã có bài riêng trong lộ trình — bài này tóm tắt ngắn rồi trỏ sang, tập
trung chiều sâu vào các technique chưa có bài.

### Bảng chọn technique theo mục đích

| Cần mô tả gì | Technique | Bài chi tiết |
|--------------|-----------|--------------|
| Dữ liệu chảy qua hệ thống | Data Flow Diagram | (mục dưới) |
| Cấu trúc dữ liệu & quan hệ | Data Modelling (ERD) | (mục dưới) + bài *SQL cho BA* |
| Luồng nghiệp vụ theo bước | Process Modelling (BPMN) | bài *Vẽ luồng nghiệp vụ* (05) |
| Vòng đời trạng thái 1 đối tượng | State Modelling | (mục dưới) |
| Luồng gọi giữa các thành phần | Sequence Diagram | bài *Vẽ diagram* (13) |
| Tương tác người dùng ↔ hệ thống | Use Cases & Scenarios | (mục dưới) |
| Yêu cầu từ góc người dùng | User Stories | bài *User Story & AC* (04) |
| Định nghĩa field/thuật ngữ | Data Dictionary, Glossary | (mục dưới) |
| Logic "nếu... thì..." nhiều nhánh | Decision Modelling | (mục dưới) |
| Ràng buộc phi chức năng | NFR Analysis | (mục dưới) |

---

## Đã có bài riêng — chỉ nhắc nhanh

- **Process Modelling** (BPMN, flowchart, swimlane): mô tả quy trình nghiệp vụ theo bước và
  vai trò. Xem bài *Vẽ luồng nghiệp vụ* (05).
- **Sequence Diagram**: mô tả thứ tự gọi giữa actor/hệ thống/API theo thời gian. Xem bài
  *Vẽ diagram & workflow* (13).
- **User Stories**: yêu cầu từ góc người dùng theo mẫu "Là... tôi muốn... để...". Xem bài
  *User Story & AC* (04).

---

## Data Modelling (ERD)

### Là gì
Mô hình hóa **các thực thể dữ liệu và quan hệ** giữa chúng (khách hàng — đơn hàng — dòng
hàng). Thể hiện bằng ERD với ký hiệu crow's foot cho quan hệ một–nhiều.

### Khi nào dùng
Khi thiết kế/hiểu cấu trúc dữ liệu, trước khi dev tạo bảng. BA dùng để đối chiếu "nghiệp vụ
cần lưu gì" với "DB thực tế có gì".

### Ví dụ thực tế
Khách Nhật gửi spec màn hình quản lý đơn nhưng không nói rõ "1 đơn có nhiều mặt hàng hay 1".
BA vẽ ERD `orders ||──o{ order_items` để xác nhận: **một đơn — nhiều dòng hàng**. Gửi lại
BrSE confirm trước khi dev code — tránh phải sửa schema sau này.

> **Cạm bẫy**: BA vẽ ERD theo suy đoán rồi coi là đã chốt. ERD chỉ có giá trị khi được
> stakeholder confirm. Xem thêm bài *SQL cho BA* để đọc ERD từ góc query.


![Data model mẫu (ERD): quan hệ giữa khách hàng, đơn hàng, dòng hàng và sản phẩm](/images/ba-data-model.png)

## Data Flow Diagram (DFD)

### Là gì
Mô tả **dữ liệu đi từ đâu đến đâu** qua các process, data store, external entity — không
quan tâm thứ tự thời gian (khác sequence diagram).

### Khi nào dùng
Khi cần hiểu luồng dữ liệu tổng thể của hệ thống: dữ liệu nhập ở đâu, xử lý ở process nào,
lưu vào store nào, xuất ra cho ai.

### Ví dụ thực tế
Hệ thống import CSV đơn hàng: DFD cho thấy `File CSV → [Validate] → [Transform] → DB đơn
hàng → [Gửi mail xác nhận] → Khách`. Nhìn DFD, BA phát hiện thiếu nhánh xử lý dòng lỗi —
đặt câu hỏi cho khách.

> **Cạm bẫy**: nhầm DFD với flowchart. DFD mô tả *dữ liệu chảy*, flowchart mô tả *thứ tự
> hành động/quyết định*.

## State Modelling (State Diagram)

### Là gì
Mô tả **vòng đời trạng thái** của một đối tượng: các trạng thái có thể có, và sự kiện nào
chuyển từ trạng thái này sang trạng thái khác.

### Khi nào dùng
Khi một đối tượng có nhiều trạng thái và quy tắc chuyển trạng thái phức tạp: đơn hàng,
ticket, hồ sơ duyệt, tài khoản.

### Ví dụ thực tế
Đơn hàng: `Nháp → Chờ duyệt → Đã duyệt → Đang giao → Hoàn thành`, và nhánh `Chờ duyệt → Bị
từ chối`. Vẽ state diagram giúp phát hiện câu hỏi ẩn: "Đơn *Đang giao* có được phép hủy
không?" — nếu spec không nói, BA phải hỏi.

```
[Nháp] --submit--> [Chờ duyệt] --approve--> [Đã duyệt] --ship--> [Đang giao] --deliver--> [Hoàn thành]
                        |
                     reject
                        v
                  [Bị từ chối]
```

> **Cạm bẫy**: bỏ sót chuyển trạng thái ngược/hủy. Trạng thái nào cũng nên trả lời được:
> "vào bằng sự kiện gì, ra bằng sự kiện gì, có ngõ cụt không?"

## Use Cases & Scenarios

### Là gì
Mô tả **tương tác giữa actor và hệ thống** để đạt mục tiêu: luồng chính (main flow) và các
luồng thay thế/ngoại lệ (alternate/exception flow).

### Khi nào dùng
Khi cần mô tả hành vi hệ thống chi tiết hơn user story, đặc biệt luồng có nhiều rẽ nhánh.

### Ví dụ thực tế
Use case "Thanh toán đơn hàng": main flow (chọn phương thức → nhập thông tin → xác nhận →
thành công); alternate (thẻ bị từ chối → hiện lỗi → cho nhập lại). Liệt kê đủ exception là
nơi BA tạo giá trị — dev/QA thường chỉ nghĩ main flow.

> **Cạm bẫy**: chỉ viết main flow, bỏ exception. 80% bug nằm ở luồng ngoại lệ.

## Decision Modelling (Decision Table / DMN)

### Là gì
Mô hình hóa **logic quyết định**: khi có nhiều điều kiện tổ hợp cho ra nhiều kết quả, bảng
quyết định liệt kê đủ tổ hợp để không sót nhánh.

### Khi nào dùng
Khi nghiệp vụ có nhiều rule "nếu A và B thì X, nếu A và không B thì Y...": tính phí ship,
xét duyệt hạn mức, phân loại khách.

### Template — Decision Table
Ví dụ tính phí ship theo *hạng thành viên* × *giá trị đơn*:

| Rule | Thành viên VIP? | Đơn ≥ 500k? | → Phí ship |
|------|-----------------|-------------|-----------|
| R1 | Có | Có | 0đ |
| R2 | Có | Không | 15.000đ |
| R3 | Không | Có | 20.000đ |
| R4 | Không | Không | 30.000đ |

2 điều kiện nhị phân → **4 tổ hợp**, phải có đủ 4 dòng. Nếu điều kiện thứ 3 xuất hiện → 8
dòng. Bảng buộc BA nghĩ hết mọi tổ hợp.

> **Cạm bẫy**: sót tổ hợp (spec chỉ nói VIP và đơn lớn, quên nói khách thường + đơn nhỏ).
> Số dòng phải = tích số giá trị của mọi điều kiện.

## Non-Functional Requirements (NFR) Analysis

### Là gì
Phân tích các yêu cầu **phi chức năng**: hệ thống phải *tốt như thế nào*, không phải *làm
gì*. Gồm performance, security, usability, reliability, scalability, khả năng bảo trì...

### Khi nào dùng
Luôn — nhưng đặc biệt khi spec chỉ liệt kê chức năng mà quên "chạy nhanh cỡ nào, chịu bao
nhiêu user, bảo mật ra sao".

### Ví dụ thực tế
Spec khách Nhật: "màn hình danh sách đơn". NFR bị thiếu → BA bổ sung câu hỏi: "Danh sách có
bao nhiêu bản ghi tối đa? Tải trong bao lâu là chấp nhận được? Cần phân trang không?". NFR
mơ hồ ("phải nhanh") → viết lại kiểm chứng được ("tải ≤ 2 giây với 10.000 bản ghi").

| NFR mơ hồ ❌ | NFR kiểm chứng được ✅ |
|-------------|----------------------|
| "Hệ thống phải nhanh" | "95% request trả về < 500ms khi có 200 user đồng thời" |
| "Phải bảo mật" | "Mật khẩu hash bcrypt; session hết hạn sau 30 phút không hoạt động" |
| "Dễ dùng" | "User mới hoàn thành đặt đơn ≤ 3 phút không cần hướng dẫn" |

## Data Dictionary & Glossary

### Là gì
- **Data Dictionary**: định nghĩa chính xác từng **field dữ liệu** — kiểu, độ dài, ràng
  buộc, giá trị hợp lệ, bắt buộc hay không.
- **Glossary**: định nghĩa **thuật ngữ nghiệp vụ** để cả team hiểu giống nhau.

### Khi nào dùng
Data Dictionary khi thiết kế form/DB/API. Glossary ngay từ đầu dự án, đặc biệt offshore —
tránh "khách hiểu từ này kiểu A, dev hiểu kiểu B".

### Template — Data Dictionary
| Field | Kiểu | Bắt buộc | Ràng buộc / Giá trị hợp lệ | Ghi chú |
|-------|------|----------|----------------------------|---------|
| `order_status` | enum | Có | draft / pending / approved / shipped / done / rejected | Xem state diagram |
| `total_amount` | decimal(12,2) | Có | ≥ 0 | Đơn vị: VND |
| `customer_email` | string(255) | Có | định dạng email hợp lệ | Dùng để gửi xác nhận |

> **Cạm bẫy**: Glossary lập rồi bỏ đó không cập nhật. Thuật ngữ mới phát sinh trong dự án
> phải bổ sung ngay, nếu không nó tự động "trôi nghĩa".

## Interface Analysis & Functional Decomposition

### Interface Analysis
Xác định các **điểm giao tiếp** giữa hệ thống với hệ thống khác/người dùng: API, file
import/export, tích hợp bên thứ ba. Với dự án offshore hay tích hợp hệ thống khách, đây là
nơi hay thiếu spec nhất ("API bên kia trả field gì? Định dạng ngày là gì? Lỗi trả ra sao?").

### Functional Decomposition
Chẻ một tính năng/hệ thống lớn thành các phần nhỏ dần đến mức estimate/giao việc được:

```
Quản lý đơn hàng
├── Tạo đơn
│   ├── Chọn sản phẩm
│   ├── Tính phí ship (→ decision table)
│   └── Xác nhận & lưu
├── Duyệt đơn (→ state model)
└── Theo dõi giao hàng
```

Dùng để lập WBS, estimate, và đảm bảo không sót chức năng con.

> **Cạm bẫy**: chẻ quá sâu hoặc quá nông. Dừng khi mỗi lá đủ nhỏ để 1 người estimate được.

## Ghi nhớ

RADD không phải "vẽ cho đẹp" — mỗi technique là **một cách buộc mình nghĩ hết**: state
model buộc nghĩ hết chuyển trạng thái, decision table buộc nghĩ hết tổ hợp, NFR buộc nghĩ
"tốt cỡ nào". Chọn technique theo *loại thông tin cần làm rõ*, và luôn để stakeholder
confirm mô hình trước khi coi là đã chốt.

Công cụ: `/nta-diagram-gen` sinh ERD/sequence/flowchart từ mô tả; `/nta-spec-review` kiểm
tra spec thiếu NFR/edge case.
