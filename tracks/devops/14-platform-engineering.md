---
level: "advanced"
order: 14
title: "Platform engineering & IDP"
est: "4-5 giờ"
checklist:
  - "Giải thích platform engineering: coi hạ tầng/DevOps như một sản phẩm phục vụ dev nội bộ"
  - "Hiểu Internal Developer Platform (IDP) và golden path giúp dev self-service"
  - "Phân biệt paved road (đường có sẵn, khuyến khích) với việc bắt buộc cứng nhắc"
  - "Nhận ra dấu hiệu cần platform team và khi nào CHƯA cần (team nhỏ)"
  - "Giải thích cognitive load và vì sao mục tiêu là giảm gánh nặng cho dev, không phải thêm cổng kiểm soát"
---

## Từ "DevOps làm hộ" sang "DevOps làm nền tảng"

Khi tổ chức lớn lên, một nhóm DevOps làm-hộ-mọi-thứ trở thành nút thắt cổ chai: mọi team dev
phải xếp hàng chờ DevOps dựng pipeline, cấp môi trường, sửa deploy. **Platform engineering** giải
quyết bằng cách coi hạ tầng như một **sản phẩm nội bộ**: xây nền tảng để dev **tự phục vụ**, thay
vì DevOps làm tay từng yêu cầu.

> Đổi câu hỏi từ "làm sao tôi deploy hộ team này" thành "làm sao team này **tự deploy** an toàn mà
> không cần biết chi tiết hạ tầng". Platform team xây con đường, dev tự đi — DevOps thôi làm nút thắt.

## Internal Developer Platform (IDP)

**IDP** là lớp tự phục vụ để dev làm việc mà không phải hiểu sâu K8s/Terraform/cloud bên dưới:

- Tạo service mới, môi trường preview, hay database — qua một cổng/CLI/template, vài phút, không
  cần ticket.
- Hạ tầng phức tạp (cluster, network, secret, monitoring) được **đóng gói và ẩn đi** sau những
  lựa chọn đơn giản.

Ví dụ công cụ: Backstage (developer portal), Crossplane / template Terraform, PR-based provisioning.

## Golden path / paved road

**Golden path** (hay **paved road**) là **con đường được chuẩn bị sẵn** để làm một việc đúng
cách: một template service đã kèm CI/CD, monitoring, security scan, logging — dev chỉ việc dùng.

| Cách tiếp cận | Hàm ý |
|---------------|-------|
| **Paved road** (khuyến khích) | Đi đường có sẵn thì nhanh & an toàn; muốn khác vẫn được nhưng tự lo |
| **Bắt buộc cứng** (cấm đường khác) | Nhanh nhưng chặn sáng tạo, dev tìm cách lách |

> Paved road hiệu quả vì nó làm **cách đúng trở thành cách dễ nhất**. Dev chọn nó không phải vì
> bị ép, mà vì nó tiết kiệm công. Ép buộc cứng thường phản tác dụng — người ta lách hoặc bực bội.
> Xây đường tốt tới mức không ai muốn đi đường khác.

## Cognitive load — thước đo thật sự

Mục tiêu platform engineering **không phải** thêm cổng kiểm soát, mà **giảm gánh nặng nhận thức**
(cognitive load) cho dev: bớt số thứ họ phải nhớ/hiểu để giao được phần mềm.

> Nếu nền tảng của bạn khiến dev phải học thêm 5 công cụ để deploy một service, bạn đã **tăng**
> cognitive load, không giảm. Platform tốt là platform vô hình — dev tập trung vào business
> logic, phần hạ tầng "vừa hoạt động". Nếu dev phàn nàn phải học nền tảng nhiều hơn học K8s, nền
> tảng đó đã thất bại mục đích của nó.

## Khi nào CHƯA cần platform team

> Team 5-10 người **chưa cần** IDP. Xây platform cho vài dev là over-engineering kinh điển — bạn
> bỏ công xây sản phẩm nội bộ cho một "khách hàng" quá nhỏ. Platform engineering đáng đầu tư khi
> có **nhiều team dev** cùng chật vật với hạ tầng, và DevOps đã rõ ràng thành nút thắt. Trước đó,
> một paved road nhẹ (vài template + tài liệu tốt) là đủ.

Dấu hiệu đã đến lúc: nhiều team hỏi cùng câu; DevOps xếp hàng ticket dựng môi trường; mỗi team
tự chế một kiểu CI/CD khác nhau, không nhất quán.

## Cạm bẫy hay gặp

- **Xây IDP cho team quá nhỏ** → over-engineering, sản phẩm nội bộ không có đủ "người dùng".
- **Bắt buộc cứng thay vì paved road** → dev lách hoặc bất mãn, nền tảng bị né.
- **Platform làm tăng cognitive load** (thêm 5 tool phải học) → đi ngược mục đích.
- **Xây platform mà không coi dev là khách hàng** → không lắng nghe feedback, làm ra thứ không ai dùng.
- **Platform team ôm luôn việc làm-hộ** → lại thành nút thắt, đúng thứ định xóa bỏ.
- **Không đo lường** (adoption, thời gian onboard service mới) → không biết platform có thật sự giúp.

## Ghi nhớ

**Platform engineering** coi hạ tầng như **sản phẩm nội bộ**, để dev **self-service** thay vì DevOps
làm-hộ và thành nút thắt. **IDP** ẩn độ phức tạp K8s/cloud sau lựa chọn đơn giản; **golden
path/paved road** làm **cách đúng thành cách dễ nhất** (khuyến khích, không ép cứng). Thước đo thật
là **giảm cognitive load** cho dev — nếu nền tảng bắt học nhiều hơn, nó thất bại. Và team nhỏ thì
**chưa cần** IDP; chỉ xây khi nhiều team thật sự chật vật.
