# Backend TLU Students - Tổng Quan Dự Án

## 📋 Thông Tin Cơ Bản

**Tên Dự Án**: tempapp (TLU Students Management System)  
**Framework**: NestJS 11.0.1  
**Ngôn Ngữ**: TypeScript  
**Cơ Sở Dữ Liệu**: PostgreSQL  
**ORM**: Prisma  
**Phiên Bản**: 0.0.1

---

## 🏗️ Kiến Trúc Dự Án

### Cấu Trúc Thư Mục

```
src/
├── admin-chat/                  # Quản lý chat admin
├── attendance/                  # Quản lý điểm danh
├── attendance-warning/          # Hệ thống cảnh báo vắng mặt
├── auth/                        # Xác thực và phép cấp (JWT, OAuth2)
├── chat/                        # Chat AI với Gemini
├── class-enrollments/           # Quản lý đăng ký lớp học
├── common/                      # Utilities, decorators, filters, interceptors
├── course-classes/              # Quản lý lớp học
├── document-types/              # Loại tài liệu
├── face-recognition/            # Nhận dạng khuôn mặt
├── fcm/                         # Firebase Cloud Messaging (push notifications)
├── grades/                      # Quản lý điểm số
├── lecturers/                   # Quản lý giảng viên
├── mail/                        # Gửi email
├── messaging/                   # Tin nhắn trực tiếp
├── notifications/               # Thông báo
├── posts/                       # Bài đăng thông báo
├── prisma/                      # Cấu hình ORM
├── reports/                     # Báo cáo
├── semesters/                   # Quản lý kỳ học
├── service-requests/            # Yêu cầu dịch vụ
├── statistics/                  # Thống kê
├── students/                    # Quản lý sinh viên
├── subjects/                    # Quản lý môn học
├── tuition/                     # Quản lý học phí
├── uploads/                     # Xử lý tải lên file
└── users/                       # Quản lý người dùng
```

---

## 🔑 Các Module Chính

### 1. **Authentication & Authorization** (`auth/`)

- JWT token-based authentication
- OAuth2 (Google)
- Local strategy
- Role-based access control (ADMIN, STUDENT, LECTURER)
- Decorators cho authorization

### 2. **User Management** (`users/`)

- Quản lý tài khoản người dùng
- Hỗ trợ 3 vai trò: ADMIN, STUDENT, LECTURER
- Hồ sơ người dùng, avatar, reset password

### 3. **Sinh Viên** (`students/`)

- Thông tin chi tiết sinh viên
- Quản lý hồ sơ học tập

### 4. **Giảng Viên** (`lecturers/`)

- Thông tin giảng viên
- Quản lý thông tin giảng dạy

### 5. **Học Tập**

- **Semesters** (`semesters/`): Quản lý kỳ học
- **Subjects** (`subjects/`): Quản lý môn học
- **Course Classes** (`course-classes/`): Quản lý lớp học
- **Grades** (`grades/`): Quản lý điểm số, GPA
- **Class Enrollments** (`class-enrollments/`): Đăng ký lớp học

### 6. **Điểm Danh** (`attendance/`)

- Quản lý điểm danh sinh viên
- Hỗ trợ nhiều phương thức: FACE_ID, MANUAL, QR_CODE
- Class reminder scheduler

### 7. **Cảnh Báo Vắng Mặt** (`attendance-warning/`)

- Theo dõi vắng mặt sinh viên
- Thông báo tự động khi vắng mặt
- Severity levels: Low, Medium, High
- Scheduler tự động gửi cảnh báo

### 8. **Chat & Tin Nhắn**

- **Chat** (`chat/`): Chat AI sử dụng Gemini, Knowledge Base
- **Admin Chat** (`admin-chat/`): Chat admin WebSocket
- **Messaging** (`messaging/`): Tin nhắn trực tiếp (Direct Messages)
- **WebSocket Gateway**: Real-time communication

### 9. **Thông Báo** (`notifications/`, `fcm/`, `posts/`)

- Push notifications qua Firebase Cloud Messaging
- Thông báo trong ứng dụng
- Bài đăng thông báo (hỗ trợ nhiều nhóm sinh viên)

### 10. **Dịch Vụ Sinh Viên** (`service-requests/`)

- Yêu cầu dịch vụ từ sinh viên
- Xử lý và theo dõi yêu cầu

### 11. **Học Phí** (`tuition/`)

- Quản lý học phí
- Tích hợp VNPay thanh toán
- Trạng thái thanh toán: UNPAID, PAID, OVERDUE

### 12. **Nhận Dạng Khuôn Mặt** (`face-recognition/`)

- Nhận dạng khuôn mặt cho điểm danh
- Tích hợp Cloudinary cho lưu trữ ảnh

### 13. **Báo Cáo & Thống Kê** (`reports/`, `statistics/`)

- Tạo báo cáo (hỗ trợ Excel)
- Thống kê dữ liệu

### 14. **Tải Lên File** (`uploads/`)

- Xử lý tải lên và lưu trữ file
- Tích hợp Cloudinary

---

## 🔧 Công Nghệ & Dependencies Chính

### Core Framework

- `@nestjs/core`, `@nestjs/common` - NestJS framework
- `@nestjs/platform-express` - HTTP server

### Database

- `@prisma/client` - ORM client
- `@prisma/adapter-pg` - PostgreSQL adapter
- `pg` - PostgreSQL driver

### Authentication

- `@nestjs/jwt` - JWT
- `@nestjs/passport` - Passport integration
- `passport`, `passport-jwt`, `passport-local`, `passport-google-oauth20`
- `bcrypt` - Password hashing

### Real-time Communication

- `@nestjs/websockets` - WebSocket
- `@nestjs/platform-socket.io` - Socket.io
- `socket.io`

### External Services

- `firebase-admin` - Firebase Cloud Messaging
- `cloudinary` - Image storage
- `nodemailer` - Email sending
- `vnpay` - Payment gateway

### AI & Chat

- `@google/genai` - Google Generative AI (Gemini)

### Message Queue

- `amqplib`, `amqp-connection-manager` - RabbitMQ

### Scheduling

- `@nestjs/schedule` - Task scheduling

### Others

- `class-transformer`, `class-validator` - DTO validation
- `exceljs` - Excel generation
- `pdf-parse` - PDF parsing
- `@nestjs/event-emitter` - Event handling
- `@nestjs/swagger` - API documentation

---

## 📊 Database Schema (Prisma)

### Core Models

- **User**: Người dùng (ADMIN, STUDENT, LECTURER)
- **Student**: Thông tin sinh viên
- **Lecturer**: Thông tin giảng viên

### Academic Models

- **Semester**: Kỳ học
- **Subject**: Môn học
- **CourseClass**: Lớp học
- **ClassEnrollment**: Đăng ký lớp
- **Grade**: Điểm số, GPA

### Attendance Models

- **AttendanceRecord**: Bản ghi điểm danh
- **WarningLog**: Nhật ký cảnh báo vắng mặt

### Communication Models

- **ChatSession**: Phiên chat AI
- **Conversation**: Cuộc trò chuyện trực tiếp
- **DirectMessage**: Tin nhắn trực tiếp
- **Post**: Bài đăng thông báo
- **Notification**: Thông báo

### Transaction Models

- **ServiceRequest**: Yêu cầu dịch vụ
- **Tuition**: Học phí
- **Payment**: Giao dịch thanh toán

---

## 🚀 Các Tính Năng Chính

### ✅ Quản Lý Học Tập

- Quản lý sinh viên, giảng viên, lớp học
- Quản lý điểm số, GPA, kỳ học
- Điểm danh bằng khuôn mặt, mã QR hoặc thủ công

### ✅ Thông Báo & Giao Tiếp

- Push notifications qua Firebase
- Chat AI (Gemini)
- Tin nhắn trực tiếp (WebSocket)
- Bài đăng thông báo cho sinh viên:
  - Gửi cho tất cả sinh viên
  - Gửi cho lớp học cụ thể
  - Gửi theo khoa (với danh sách khoa có sẵn)
- Cảnh báo vắng mặt tự động

### ✅ Thanh Toán

- Quản lý học phí
- Tích hợp VNPay
- Theo dõi trạng thái thanh toán

### ✅ Bảo Mật

- JWT authentication
- OAuth2 (Google)
- Role-based access control
- Password hashing (bcrypt)
- Thay đổi mật khẩu cho user đã đăng nhập
- Quên mật khẩu với OTP verification

### ✅ Báo Cáo

- Xuất báo cáo Excel
- Thống kê sinh viên, điểm, điểm danh
- PDF parsing từ tài liệu

---

## 📝 Scripts Có Sẵn

```bash
# Development
npm run start        # Khởi động server
npm run start:dev    # Watch mode
npm run start:debug  # Debug mode

# Production
npm run build        # Build project
npm run start:prod   # Chạy production build

# Code Quality
npm run format       # Format code với Prettier
npm run lint         # ESLint check & fix

# Testing
npm run test         # Unit tests (Jest)
npm run test:watch   # Watch mode
npm run test:cov     # Coverage report
npm run test:debug   # Debug tests
npm run test:e2e     # E2E tests
```

---

## 🔐 Biến Môi Trường (Environment)

Dự án sử dụng các biến môi trường cho:

- **PORT**: Cổng server (default: 3000)
- **DATABASE_URL**: PostgreSQL connection string
- **JWT_SECRET**: Secret key cho JWT
- **FIREBASE\_\***: Firebase configuration
- **CLOUDINARY\_\***: Cloudinary API keys
- **GOOGLE\_\***: Google OAuth configuration
- **MAIL\_\***: Email configuration
- **VNPAY\_\***: VNPay configuration

---

## � Endpoints Xác Thực (Auth Module)

### Login & Token

- `POST /auth/login` - Đăng nhập (username/password)
- `POST /auth/logout` - Đăng xuất
- `POST /auth/refresh` - Làm mới Access Token

### OAuth2

- `GET /auth/google` - Chuyển hướng đăng nhập Google
- `GET /auth/google/callback` - Callback từ Google

### Password Management

- `POST /auth/forgot-password` - Yêu cầu OTP để quên mật khẩu
  - Request: `{ email: string }`
- `POST /auth/verify-otp` - Xác thực OTP
  - Request: `{ email: string, otp: string }`
- `POST /auth/reset-password` - Đặt lại mật khẩu bằng OTP
  - Request: `{ email: string, otp: string, newPassword: string }`

- **`POST /auth/change-password`** ⭐ **NEW** - Thay đổi mật khẩu cho user đã đăng nhập
  - **Auth**: Yêu cầu JWT token (Bearer)
  - **Request**:
    ```json
    {
      "currentPassword": "string",
      "newPassword": "string (min 6 ký tự)"
    }
    ```
  - **Response**: `{ message: "Thay đổi mật khẩu thành công." }`
  - **Errors**:
    - 401 Unauthorized: Mật khẩu hiện tại không chính xác
    - 400 Bad Request: User không tồn tại
    - 401 Unauthorized: Không có JWT token

---
## 👥 Endpoints Quản Lý Sinh Viên (Students Module)

### Danh sách & Chi tiết

- `GET /students` - Lấy danh sách tất cả sinh viên (Admin, Lecturer)
- `GET /students/:code` - Lấy thông tin sinh viên theo mã (Admin, Lecturer)
- `POST /students` - Tạo sinh viên mới (Admin)
- `PATCH /students/:code` - Cập nhật thông tin sinh viên (Admin)
- `DELETE /students/:code` - Xóa sinh viên (Admin)

### Thời Khóa Biểu

- `GET /students/me/schedule` - Xem thời khóa biểu của sinh viên hiện tại (Student)
  - Query: `semester_id` (tuỳ chọn)
- `GET /students/:code/schedule` - Xem thời khóa biểu của sinh viên theo mã (Admin, Lecturer)
  - Query: `semester_id` (tuỳ chọn)

### Khoa/Department

- **`GET /students/departments`** ⭐ **NEW** - Lấy danh sách tất cả khoa (Admin, Lecturer)
  - **Response**: 
    ```json
    {
      "statusCode": 200,
      "message": "Lấy danh sách khoa thành công",
      "data": [
        "Khoa CNTT",
        "Khoa Kinh Tế",
        "Khoa Kỹ Thuật"
      ]
    }
    ```
  - **Dùng để**: Admin có thể chọn khoa khi gửi thông báo theo khoa (`POST /posts`)

### Hồ Sơ Cá Nhân

- `PATCH /students/profile/me` - Sinh viên cập nhật hồ sơ cá nhân (Student)
  - Fields: `phone_number`, `address`, `email`, `avatar_url`

---
## �🐳 Docker

Dự án có hỗ trợ Docker với:

- `Dockerfile` - Image definition
- `docker-compose.yml` - Multi-container orchestration

---

## 📚 API Documentation

API documentation được sinh tự động bằng Swagger:

- **URL**: `/api/docs`
- **Format**: OpenAPI 3.0
- **Authentication**: Bearer token

---

## ⚙️ Middleware & Interceptors

### Interceptors

- **TransformInterceptor**: Chuẩn hóa response format
- **Global pipes**: Validation, transformation

### Filters

- **HttpExceptionFilter**: Xử lý HTTP exceptions

### Pipes

- **ValidationPipe**: DTO validation & transformation

---

## 🔄 Real-time Features

### WebSocket Events

- Admin chat gateway
- Direct messaging
- Notification delivery
- Real-time updates

---

## 📦 Static Files

Server phục vụ static files từ `/uploads` directory:

- Hình ảnh người dùng
- Tài liệu
- Báo cáo

---

## 🛠️ Công Cụ Phát Triển

- **NestJS CLI**: `nest` command
- **TypeScript**: Type checking
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Jest**: Unit testing
- **Swagger**: API documentation

---

## 📝 Ghi Chú

- Hỗ trợ BigInt serialization cho JSON
- Hỗ trợ Decimal serialization từ Prisma
- CORS enabled
- Global error handling
- Centralized logging (if configured)

---

## 🤝 Tích Hợp Bên Ngoài

1. **Firebase** - Push notifications
2. **Google Generative AI** - AI chatbot
3. **Cloudinary** - Image storage & CDN
4. **VNPay** - Payment processing
5. **Google OAuth** - Social login
6. **NodeMailer** - Email service
7. **RabbitMQ** - Message queue (amqp)

---

**Cập Nhật**: May 30, 2026
