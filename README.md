# HiCAS HRM

HiCAS HRM là hệ thống quản trị nhân sự dùng cho demo đồ án: quản lý hồ sơ nhân viên, nghỉ phép, chấm công, thông báo, tài sản, phòng họp và báo cáo thống kê.

Dự án gồm:

- Frontend: React, TypeScript, Vite, Ant Design, Tailwind CSS, TanStack React Query, Zustand.
- Backend: FastAPI, SQLModel, JWT, layered architecture theo `routers -> services -> repositories -> models`.
- Database demo: SQLite local `demo_hicas.db`.
- Database triển khai: MySQL qua biến môi trường `DB_URL`.

## Chạy Nhanh Demo

Khuyến nghị dùng cách này khi cần mở hệ thống ngay để test giao diện và luồng nghiệp vụ.

### 1. Cài môi trường

Yêu cầu:

- Python 3.11 hoặc 3.12
- Node.js 18+
- npm

Cài backend:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

Cài frontend:

```powershell
npm install
```

### 2. Sinh dữ liệu mẫu

Seed chính hiện tại nằm ở `seed/seed_data.py`. Script này tự tạo hoặc cập nhật database SQLite `demo_hicas.db`, đồng thời nạp đủ tài khoản, 20 hồ sơ nhân sự và dữ liệu cho các module demo.

```powershell
$env:DB_URL = "sqlite:///./demo_hicas.db"
$env:ENVIRONMENT = "seed"
.\.venv\Scripts\python.exe -m seed.seed_data
```

Khi chạy thành công sẽ thấy thông báo:

```text
Seed data ready. Demo accounts: hcns/admin/quanly/nhanvien @hicas.com.vn, password Hicas@123
```

### 3. Chạy backend

```powershell
$env:DB_URL = "sqlite:///./demo_hicas.db"
$env:ENVIRONMENT = "seed"
.\.venv\Scripts\python.exe tools\run_demo_backend.py
```

Backend chạy tại:

```text
http://127.0.0.1:8000
```

Swagger/OpenAPI:

```text
http://127.0.0.1:8000/docs
```

Health check:

```text
http://127.0.0.1:8000/health
```

### 4. Chạy frontend

Mở terminal khác:

```powershell
npm run dev -- --host 127.0.0.1 --port 5173
```

Mở trình duyệt:

```text
http://localhost:5173/dang-nhap
```

## Tài Khoản Demo

Tất cả tài khoản seed chính dùng chung mật khẩu:

```text
Hicas@123
```

| Vai trò | Email | Mã nhân viên | Mục đích demo |
| --- | --- | --- | --- |
| Admin | `admin@hicas.com.vn` | `NV002` | Quản trị hệ thống, phân quyền, toàn quyền dữ liệu |
| HCNS | `hcns@hicas.com.vn` | `NV001` | Quản lý hồ sơ, duyệt nghỉ phép, thông báo, tài sản, báo cáo |
| Quản lý | `quanly@hicas.com.vn` | `NV003` | Xem dữ liệu theo vai trò quản lý, duyệt nghiệp vụ phù hợp |
| Nhân viên | `nhanvien@hicas.com.vn` | `NV004` | Tạo đơn nghỉ phép, xem hồ sơ cá nhân, xem chấm công |

Ngoài 4 tài khoản trên, seed còn tạo thêm các tài khoản nhân viên `NV005` đến `NV018` theo email trong hồ sơ nhân sự, cũng dùng mật khẩu `Hicas@123`. Hai hồ sơ `NV019`, `NV020` là nhân sự đã nghỉ nên tài khoản bị khóa.

## Luồng Demo Gợi Ý

### 1. Đăng nhập

1. Mở `http://localhost:5173/dang-nhap`.
2. Đăng nhập bằng `hcns@hicas.com.vn` / `Hicas@123`.
3. Sau khi vào hệ thống, kiểm tra menu trái và thông tin người dùng trên thanh trên cùng.

### 2. Hồ sơ nhân sự

1. Vào `Hồ sơ nhân sự`.
2. Kiểm tra danh sách 20 nhân sự bên trái.
3. Chọn `Đặng Kim Ngân` hoặc một nhân sự bất kỳ.
4. Xem thông tin chung, liên hệ, hợp đồng, trình độ, ngành nghề, kỹ năng và file hợp đồng.
5. Dùng tài khoản nhân viên để kiểm tra phân quyền: nhân viên chỉ xem hồ sơ của chính mình.

### 3. Nghỉ phép

1. Đăng nhập tài khoản nhân viên `nhanvien@hicas.com.vn`.
2. Vào `Nghỉ phép > Tạo đơn phép`.
3. Tạo đơn nghỉ phép mới.
4. Đăng xuất, đăng nhập HCNS `hcns@hicas.com.vn`.
5. Vào `Nghỉ phép > Danh sách đơn`.
6. Duyệt hoặc từ chối đơn vừa tạo.
7. Kiểm tra `Bảng phép` để xem số ngày đã dùng/chờ duyệt.

### 4. Chấm công

1. Vào `Chấm công`.
2. Chọn tháng `07/2026`.
3. Xem bảng công, chi tiết bảng công, số giờ logtime, giờ thực tế, số lần đi muộn.
4. Với tài khoản có quyền quản lý, vào màn duyệt/chốt bảng công nếu cần.

File mẫu import chấm công có thể tạo bằng:

```powershell
.\.venv\Scripts\python.exe tools\create_cham_cong_import_templates.py
```

Sau khi chạy, kiểm tra các file mẫu sinh ra trong thư mục `docs` hoặc thư mục output mà script thông báo.

### 5. Thông báo

1. Vào `Thông báo`.
2. Xem danh sách thông báo đã đọc/chưa đọc.
3. Tạo thông báo mới nếu đăng nhập bằng HCNS/Admin.
4. Kiểm tra badge số thông báo chưa đọc trên thanh điều hướng.

### 6. Tài sản

1. Vào `Tài sản`.
2. Xem danh sách tài sản mẫu.
3. Cấp phát tài sản cho nhân viên.
4. Thu hồi tài sản và nhập tình trạng thu hồi.
5. Kiểm tra lịch sử giao nhận/luân chuyển theo phân quyền.

### 7. Phòng họp

1. Vào `Phòng họp`.
2. Tạo lịch họp mới, chọn phòng, thời gian và thành viên tham gia.
3. Vào màn duyệt lịch họp bằng HCNS/Admin.
4. Duyệt, từ chối hoặc can thiệp lịch họp.
5. Kiểm tra danh sách thành viên trong lịch họp.

### 8. Báo cáo thống kê

1. Vào `Báo cáo`.
2. Chọn kỳ `01/07/2026 - 31/07/2026`.
3. Xem lần lượt 4 loại:
   - Hành chính
   - Hiệu suất
   - Tổng hợp
   - Quản trị
4. Bấm `Xuất báo cáo` để tải Excel/PDF.

Số liệu mẫu tháng `07/2026` hiện có:

- Hành chính: 18 nhân viên đang làm, 2 đã nghỉ, 4 hợp đồng còn hiệu lực sắp hết hạn, 3 đơn nghỉ việc trong kỳ.
- Hiệu suất: 7 dự án với tổng giờ công khác nhau.
- Quản trị: 22 tài sản đang sử dụng, 10 sẵn sàng, 32 lượt luân chuyển, 7 phòng họp, 19 lịch họp trong kỳ.

## Cấu Trúc Dự Án

```text
app/
  core/            Cấu hình, database, JWT, RBAC, response chuẩn
  models/          SQLModel models
  repositories/    Truy vấn dữ liệu
  services/        Business rules và xử lý nghiệp vụ
  routers/         FastAPI routers
  schemas/         Request/response schemas
  utils/           Tiện ích import/export/tính toán

src/
  api/             API client frontend
  app/             Router frontend
  components/      Component dùng chung
  features/        Module giao diện theo nghiệp vụ
  layouts/         Layout đăng nhập và layout chính
  stores/          Zustand stores

seed/
  seed_data.py     Seed dữ liệu demo chính

tools/
  run_demo_backend.py
  create_cham_cong_import_templates.py

uploads/
  hopdong/         File hợp đồng mẫu upload/serve qua backend

docs/
  demo-data.sql    SQL demo cũ cho MySQL, chỉ dùng khi cần tham khảo/import thủ công
```

## Backend API Chính

Một số nhóm endpoint:

- `POST /api/auth/login`: đăng nhập.
- `GET /api/ho-so-ca-nhan/*`: hồ sơ nhân sự/cá nhân.
- `GET /api/nghi-phep/*`: nghỉ phép, quỹ phép, duyệt đơn.
- `GET /api/cham-cong/*`: bảng công, import, giải trình, chốt công.
- `GET /api/thong-bao/*`: thông báo.
- `GET /api/tai-san/*`: tài sản, cấp phát, thu hồi, lịch sử.
- `GET /api/danh-muc/*`: phòng họp, lịch họp, thành viên lịch họp.
- `GET /api/bao-cao/*`: báo cáo thống kê và xuất file.

Xem đầy đủ contract tại:

```text
http://127.0.0.1:8000/docs
```

## Chạy Với MySQL

Nếu muốn dùng MySQL thay vì SQLite demo:

1. Tạo database, ví dụ:

```sql
CREATE DATABASE datn_hrm0 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Cấu hình biến môi trường:

```powershell
$env:DB_URL = "mysql+pymysql://root:password@localhost:3306/datn_hrm0"
$env:ENVIRONMENT = "dev"
```

3. Chạy backend để tạo bảng:

```powershell
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

4. Seed dữ liệu vào MySQL:

```powershell
$env:DB_URL = "mysql+pymysql://root:password@localhost:3306/datn_hrm0"
$env:ENVIRONMENT = "seed"
.\.venv\Scripts\python.exe -m seed.seed_data
```

Lưu ý: `docs/demo-data.sql` là dữ liệu mẫu cũ, có thể không đầy đủ bằng `seed/seed_data.py`.

## Build Frontend

Kiểm tra TypeScript và build production:

```powershell
npm run build
```

Chạy preview build:

```powershell
npm run preview
```

## Lỗi Thường Gặp

### Không đăng nhập được

Kiểm tra:

- Backend có đang chạy ở `http://127.0.0.1:8000` không.
- Frontend có chạy ở `http://localhost:5173` hoặc `http://127.0.0.1:5173` không.
- Đã chạy seed chưa:

```powershell
$env:DB_URL = "sqlite:///./demo_hicas.db"
$env:ENVIRONMENT = "seed"
.\.venv\Scripts\python.exe -m seed.seed_data
```

- Dùng đúng tài khoản, ví dụ `hcns@hicas.com.vn` / `Hicas@123`.