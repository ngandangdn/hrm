# HRM Project Overview

Đây là dự án HRM (Human Resource Management) được xây dựng theo kiến trúc full-stack:

- Frontend: React + TypeScript + Vite
- UI: Ant Design, Tailwind CSS
- State/Data: Zustand, TanStack React Query, Axios
- Backend: FastAPI + Python
- Database layer: mô hình theo hướng repository/service, có khởi tạo CSDL khi chạy ở môi trường `dev`

## Mục tiêu dự án

Dự án được phát triển để xây dựng một nền tảng quản lý nhân sự có các nhóm chức năng chính:

- Quản lý hồ sơ nhân sự
- Quản lý chấm công và bảng công
- Quản lý nghỉ phép
- Quản lý nghỉ việc
- Phê duyệt nghiệp vụ
- Phân quyền người dùng
- Danh mục hệ thống
- Thông báo
- Quản lý tài sản
- Báo cáo

## Những gì đã làm trong dự án

### 1. Khởi tạo nền tảng frontend

- Dựng ứng dụng bằng Vite + React + TypeScript
- Thiết lập `ReactDOM.createRoot` trong `src/main.tsx`
- Bọc toàn bộ app bằng:
  - `QueryClientProvider` cho React Query
  - `ConfigProvider` của Ant Design
- Cấu hình ngôn ngữ giao diện tiếng Việt cho Ant Design
- Áp dụng theme tùy biến qua `src/theme/tokens.ts`
- Tách CSS chính vào `src/styles.css`

### 2. Thiết lập điều hướng và layout

- Tạo router tập trung trong `src/app/router.tsx`
- Xây dựng layout chính và layout đăng nhập:
  - `src/layouts/MainLayout.tsx`
  - `src/layouts/AuthLayout.tsx`
- Có bảo vệ route bằng `ProtectedRoute`
- Có cơ chế tự đăng xuất khi không hoạt động thông qua `useIdleLogout`

### 3. Xây dựng module xác thực

- Tạo màn hình đăng nhập tại `src/features/auth/LoginPage.tsx`
- Tách type riêng cho auth trong `src/features/auth/types.ts`
- Tách layer gọi API auth trong `src/features/auth/api.ts`
- Có store xác thực bằng Zustand tại `src/stores/authStore.ts`
- Backend có router, schema và service cho auth:
  - `app/routers/auth_router.py`
  - `app/schemas/auth_schema.py`
  - `app/services/auth_service.py`
  - `app/core/security.py`

### 4. Xây dựng backend FastAPI

- Tạo entrypoint backend tại `app/main.py`
- Khởi tạo FastAPI app với CORS cho frontend chạy local
- Thêm health check endpoint `/health`
- Tự động init database khi môi trường là `dev`
- Khởi động scheduler khi app lên
- Tổ chức router theo từng nghiệp vụ

### 5. Tổ chức kiến trúc backend theo lớp

Backend được chia tương đối rõ thành các lớp:

- `models`: định nghĩa entity / bảng dữ liệu
- `schemas`: định nghĩa dữ liệu vào/ra
- `repositories`: thao tác dữ liệu
- `services`: xử lý nghiệp vụ
- `routers`: expose API
- `core`: cấu hình hệ thống, database, scheduler, response, security, RBAC

Các thành phần chính đã có:

- `app/core/config.py`
- `app/core/database.py`
- `app/core/scheduler.py`
- `app/core/rbac.py`
- `app/core/response.py`
- `app/core/security.py`

### 6. Phát triển các phân hệ nghiệp vụ

#### Hồ sơ nhân sự

- Quản lý hồ sơ nhân viên
- Quản lý hồ sơ cá nhân
- Có luồng yêu cầu cập nhật hồ sơ

Các file tiêu biểu:

- `app/models/nhan_vien.py`
- `app/models/ho_so.py`
- `app/models/ho_so_ca_nhan.py`
- `app/models/yeu_cau_cap_nhat_ho_so.py`
- `app/services/ho_so_ca_nhan_service.py`
- `app/services/yeu_cau_cap_nhat_service.py`

#### Chấm công

- Quản lý bảng công
- Tính công tổng hợp
- Tính công theo nguồn Redmine
- Xem bảng công
- Nhập công và duyệt bảng công

Các thành phần tiêu biểu:

- `app/models/bang_cong.py`
- `app/services/cham_cong_scope.py`
- `app/services/import_cham_cong_service.py`
- `app/services/duyet_bang_cong_service.py`
- `app/services/xem_bang_cong_service.py`
- `app/utils/tinh_cong_tingop.py`
- `app/utils/tinh_cong_redmine.py`
- `app/routers/cham_cong_router.py`

#### Nghỉ phép và nghỉ việc

- Quản lý đơn nghỉ phép
- Quản lý quỹ phép
- Quản lý đơn nghỉ việc
- Quản lý quyết định nghỉ việc

Thành phần liên quan:

- `app/models/don_nghi_phep.py`
- `app/models/quy_phep.py`
- `app/models/don_nghi_viec.py`
- `app/models/quyet_dinh_nghi_viec.py`
- `app/services/nghi_phep_service.py`
- `app/services/nghi_viec_service.py`

#### Phê duyệt

- Xây dựng luồng phê duyệt nghiệp vụ
- Tách riêng router và schema cho phê duyệt

Thành phần tiêu biểu:

- `app/routers/phe_duyet_router.py`
- `app/schemas/phe_duyet_schema.py`
- `app/services/phe_duyet_service.py`

#### Phân quyền

- Thiết kế vai trò và quyền
- Mapping vai trò - quyền
- Hỗ trợ RBAC trong backend

Thành phần tiêu biểu:

- `app/models/vai_tro.py`
- `app/models/quyen.py`
- `app/models/vai_tro_quyen.py`
- `app/services/phan_quyen_service.py`
- `app/core/rbac.py`

#### Danh mục hệ thống

- Chuẩn hóa dữ liệu danh mục dùng chung
- Tách riêng schema, repository, service và router

Thành phần tiêu biểu:

- `app/schemas/danh_muc_schema.py`
- `app/services/danh_muc_service.py`
- `app/routers/danh_muc_router.py`

#### Thông báo

- Có mô hình thông báo
- Có layer xử lý service/repository/router tương ứng

Thành phần tiêu biểu:

- `app/models/thong_bao.py`
- `app/services/thong_bao_service.py`
- `app/routers/thong_bao_router.py`

#### Tài sản

- Quản lý tài sản
- Quản lý giao nhận tài sản
- Có schema và service riêng

Thành phần tiêu biểu:

- `app/models/tai_san.py`
- `app/models/giao_nhan_tai_san.py`
- `app/services/tai_san_service.py`

#### Báo cáo

- Tạo lớp xử lý báo cáo
- Có repository, service và router riêng cho báo cáo

Thành phần tiêu biểu:

- `app/repositories/bao_cao_repo.py`
- `app/services/bao_cao_service.py`
- `app/routers/bao_cao_router.py`
- `app/utils/xuat_bao_cao.py`

### 7. Cấu trúc phụ trợ

- Có file `requirements.txt` cho backend Python
- Có cấu hình `tailwind.config.js` và `postcss.config.js`
- Có cấu hình TypeScript:
  - `tsconfig.json`
  - `tsconfig.node.json`
- Có cấu hình build Vite trong `vite.config.ts`

## Cấu trúc thư mục

```text
app/      # Backend FastAPI
src/      # Frontend React + TypeScript
dist/     # Build output frontend
```

## Cách chạy dự án

## Đăng nhập demo

Sau khi backend đã tạo bảng và đã import data mẫu trong [docs/demo-data.sql](docs/demo-data.sql), dùng một trong các tài khoản sau:

| Vai trò | Email | Mật khẩu |
| --- | --- | --- |
| Admin | `admin@hicas.vn` | `Demo@123456` |
| HCNS | `hcns@hicas.vn` | `Demo@123456` |
| Nhân viên | `nhanvien@hicas.vn` | `Nhanvien@123456` |

Hướng dẫn chạy đầy đủ và import data mẫu nằm tại [docs/huong-dan-su-dung.md](docs/huong-dan-su-dung.md).

### Frontend

```bash
npm install
npm run dev
```

### Build frontend

```bash
npm run build
```

### Backend

Tùy theo môi trường Python của bạn, cài dependencies từ `requirements.txt` rồi chạy ứng dụng FastAPI.

## Ghi chú

- Frontend đang dùng giao diện tiếng Việt theo Ant Design locale `vi_VN`
- Backend có CORS cho `http://localhost:5173`

## Demo data quick start

Nếu MySQL local chưa import được ngay, chạy SQLite demo ngoài backend:

```powershell
python tools/setup_demo_sqlite.py
$env:DB_URL = "sqlite:///./demo_hicas.db"
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Mở frontend bằng `http://localhost:5173/dang-nhap`.

Tài khoản mẫu:
- `admin@hicas.vn` / `Demo@123456`
- `hcns@hicas.vn` / `Demo@123456`
- `nhanvien@hicas.vn` / `Nhanvien@123456`
- `nhanvien2@hicas.vn` / `Nhanvien@123456`

Mã data mẫu hay dùng: `YC-DEMO-001`, `DNV-DEMO-001`, `DNV-DEMO-002`, `QDNV-DEMO-001`.
- Dự án đang đi theo hướng module hóa rõ ràng để dễ mở rộng thêm các nghiệp vụ HRM khác
