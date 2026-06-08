# 📋 Hướng Dẫn Quản Lý FaceID - Dành Cho Frontend Admin

## 🎯 Tổng Quan Hệ Thống

Hệ thống FaceID là một giải pháp nhận diện khuôn mặt tích hợp cho phép:
- **Đăng ký khuôn mặt**: Admin/Lecturer tải lên ảnh khuôn mặt của sinh viên (tối đa 5 ảnh/SV)
- **Điểm danh tự động**: Sinh viên tải lên ảnh để tự động nhận diện và điểm danh
- **Quản lý kho lưu trữ**: Xem, xóa, quản lý ảnh khuôn mặt đã lưu trữ
- **Xác minh vị trí (GPS)**: Đảm bảo sinh viên điểm danh từ đúng vị trí lớp học

---

## 🏗️ Kiến Trúc Hệ Thống

```
┌─────────────────────────────────────────────────────┐
│         FRONTEND (Admin Dashboard)                  │
├─────────────────────────────────────────────────────┤
│  - Trang quản lý khuôn mặt sinh viên                │
│  - Quản lý ảnh (thêm/xóa/xem)                       │
│  - Thống kê, báo cáo                                │
└────────────────────┬────────────────────────────────┘
                     │ API Calls
┌────────────────────▼────────────────────────────────┐
│         NestJS Backend API                          │
├─────────────────────────────────────────────────────┤
│  - Face Recognition Controller                      │
│  - Face Recognition Service                         │
└────────────────┬──────────────────────────┬─────────┘
                 │                          │
    ┌────────────▼──────────┐   ┌──────────▼──────────┐
    │  Python Face Service  │   │  Cloudinary (CDN)   │
    ├──────────────────────┤   ├────────────────────┤
    │  - Extract Embedding │   │  - Store Images    │
    │  - Compare Faces     │   │  - Optimize        │
    │  - Detect Faces      │   │  - Serve URLs      │
    └──────────────────────┘   └────────────────────┘
                 │                          │
    ┌────────────▼──────────────────────────▼───────┐
    │     PostgreSQL Database (pgvector)            │
    ├───────────────────────────────────────────────┤
    │  - student_faces (ảnh + embeddings 512D)     │
    │  - attendance_records (kết quả điểm danh)    │
    └───────────────────────────────────────────────┘
```

---

## 📦 Quản Lý Kho Lưu Trữ Ảnh FaceID

### Cấu Trúc Lưu Trữ

#### Database: `student_faces` Table

```sql
CREATE TABLE student_faces (
  id                BigInt PRIMARY KEY AUTO_INCREMENT
  student_id        BigInt NOT NULL (FK -> students.id)
  image_url         VARCHAR(500) (Cloudinary URL)
  embedding_vector  vector(512) (512-dimensional vector, used for matching)
  created_at        DateTime DEFAULT NOW()
)
```

#### Cloudinary Cloud Storage

```
Folder Structure:
faces/
  ├── 20210001/          (student code)
  │   ├── image_1.jpg    (optimized, max 640x640)
  │   ├── image_2.jpg
  │   └── image_5.jpg
  ├── 20210002/
  │   └── image_1.jpg
  └── ...
```

**Tối đa 5 ảnh/sinh viên** được lưu trữ để cân bằng giữa độ chính xác và dung lượng lưu trữ.

---

### 🔄 Quy Trình Đăng Ký Khuôn Mặt (Admin/Lecturer)

#### Endpoint: `POST /face-recognition/register/:studentId`
**Roles Required**: ADMIN, LECTURER

#### Request:
```bash
curl -X POST "http://localhost:3000/face-recognition/register/123456" \
  -H "Authorization: Bearer {token}" \
  -F "file=@/path/to/photo.jpg"
```

#### Quy Trình Xử Lý:

```
1. VALIDATE SINH VIÊN
   ├─ Kiểm tra sinh viên tồn tại trong DB
   └─ Nếu không → HTTP 404 "Sinh viên không tồn tại"

2. KIỂM TRA GIỚI HẠN
   ├─ Đếm ảnh hiện tại của sinh viên (COUNT FROM student_faces)
   ├─ Nếu >= 5 → HTTP 400 "Đã đăng ký đủ 5 ảnh"
   └─ Cần xóa ảnh cũ trước

3. EXTRACT EMBEDDING (Python Service)
   ├─ Gửi ảnh sang Python Face Service
   ├─ Trích xuất embedding 512 chiều
   ├─ Nếu không detect được → HTTP 400 "Không thể trích xuất khuôn mặt"
   └─ Nhận: embedding[], confidence (0-1), bbox (tọa độ khuôn mặt)

4. UPLOAD ẢNH (Cloudinary)
   ├─ Tối ưu hóa: resize 640x640, compress
   ├─ Tổ chức folder: faces/{student_code}/{timestamp}.jpg
   └─ Nhận: secure_url (URL công khai)

5. LƯU VÀO DATABASE
   ├─ INSERT INTO student_faces (student_id, image_url, embedding_vector)
   ├─ embedding_vector lưu dạng vector(512)
   └─ Nhận: face_id, created_at

6. RESPONSE
   ├─ message: "Đăng ký khuôn mặt thành công"
   ├─ face: { id, student_id, image_url, created_at }
   ├─ confidence: 0.95
   └─ total_faces: 3/5
```

#### Response (Success):
```json
{
  "message": "Đăng ký khuôn mặt thành công",
  "face": {
    "id": 12345,
    "student_id": 123456,
    "image_url": "https://res.cloudinary.com/...",
    "created_at": "2024-01-15T10:30:00Z"
  },
  "confidence": 0.95,
  "total_faces": 3
}
```

---

### 📸 Xem Danh Sách Ảnh Khuôn Mặt

#### Endpoint 1: `GET /face-recognition/student/:studentId`
**Roles Required**: ADMIN, LECTURER

```bash
curl "http://localhost:3000/face-recognition/student/123456" \
  -H "Authorization: Bearer {token}"
```

**Response**:
```json
{
  "student": {
    "id": 123456,
    "student_code": "20210001",
    "full_name": "Nguyễn Văn A"
  },
  "faces": [
    {
      "id": 1,
      "student_id": 123456,
      "image_url": "https://res.cloudinary.com/...",
      "created_at": "2024-01-15T10:30:00Z"
    },
    {
      "id": 2,
      "student_id": 123456,
      "image_url": "https://res.cloudinary.com/...",
      "created_at": "2024-01-14T09:15:00Z"
    }
  ],
  "total": 2,
  "max_allowed": 5
}
```

#### Endpoint 2: `GET /face-recognition/me`
**Roles Required**: STUDENT

Sinh viên xem ảnh của chính mình (tương tự trên nhưng không cần studentId)

---

### 🗑️ Xóa Ảnh Khuôn Mặt

#### Endpoint: `DELETE /face-recognition/faces/:faceId`
**Roles Required**: ADMIN

```bash
curl -X DELETE "http://localhost:3000/face-recognition/faces/12345" \
  -H "Authorization: Bearer {token}"
```

#### Quy Trình:
```
1. Tìm ảnh trong DB (student_faces)
2. Xóa ảnh trên Cloudinary (dựa trên public_id từ URL)
3. Xóa record trong DB
4. Return: { message: "Đã xóa ảnh khuôn mặt thành công" }
```

---

## 🔍 Quy Trình So Sánh Khuôn Mặt Khi Check-In (Attendance)

### Endpoint: `POST /face-recognition/attendance/:sessionId`
**Roles Required**: STUDENT

#### Request:
```bash
curl -X POST "http://localhost:3000/face-recognition/attendance/789" \
  -H "Authorization: Bearer {token}" \
  -F "file=@/path/to/selfie.jpg" \
  -F "latitude=10.7769" \
  -F "longitude=106.6966"
```

---

### 🔬 Quy Trình Nhận Diện Chi Tiết

#### Bước 1️⃣: Validate Buổi Học
```
├─ Kiểm tra AttendanceSession tồn tại
├─ Kiểm tra có set check_in_time và date
└─ Nếu không → HTTP 400 "Buổi điểm danh chưa được thiết lập"
```

#### Bước 2️⃣: Xác Minh Vị Trí (GPS Check)
```
├─ Lấy vị trí lớp học từ course_class: (classLat, classLon, allowed_radius)
├─ Nếu lớp yêu cầu xác minh vị trí:
│  ├─ Kiểm tra sinh viên gửi GPS (latitude, longitude)
│  ├─ Tính khoảng cách: haversine(lat1, lon1, lat2, lon2)
│  ├─ Nếu khoảng cách > allowed_radius (mặc định 50m)
│  │  └─ HTTP 400 "Bạn ở ngoài phạm vi cho phép (cách 120m)"
│  └─ OK, tiếp tục
└─ Nếu không yêu cầu GPS → bỏ qua
```

**Công Thức Haversine** (tính khoảng cách 2 điểm GPS):
```javascript
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Bán kính Trái Đất (mét)
  const dLat = (lat2 - lat1) * π / 180;
  const dLon = (lon2 - lon1) * π / 180;
  const a = sin²(dLat/2) + cos(lat1*π/180) * cos(lat2*π/180) * sin²(dLon/2);
  const c = 2 * atan2(√a, √(1-a));
  return R * c; // khoảng cách mét
}
```

#### Bước 3️⃣: Xác Định Trạng Thái Điểm Danh
```
├─ Lấy session.check_in_time (giờ bắt đầu điểm danh)
├─ Tính: diffMinutes = (now - check_in_time) / 60
│
├─ Nếu diffMinutes < -30 phút
│  └─ HTTP 400 "Chưa đến giờ điểm danh (chỉ được trước 30 phút)"
│
├─ Nếu -30 <= diffMinutes <= 15 phút
│  └─ status = 1 (✓ Đúng Giờ / On Time)
│
├─ Nếu 15 < diffMinutes <= 35 phút
│  └─ status = 2 (⚠️ Muộn / Late)
│
└─ Nếu diffMinutes > 35 phút
   └─ status = 0 (✗ Vắng / Absent)
```

#### Bước 4️⃣: Lấy Danh Sách Sinh Viên Đủ Điều Kiện
```
├─ Lấy tất cả enrolled_students trong lớp học phần này
├─ Nếu role = STUDENT (tự điểm danh)
│  ├─ Kiểm tra sinh viên đang login có trong danh sách lớp không
│  ├─ Nếu không → HTTP 400 "Bạn không có tên trong danh sách"
│  └─ Giới hạn chỉ đối chiếu với khuôn mặt của chính sinh viên đó
└─ Nếu role = ADMIN/LECTURER → đối chiếu tất cả
```

#### Bước 5️⃣: Trích Xuất Embedding Ảnh Upload
```
├─ Gửi ảnh sang Python Face Service (/extract-embedding)
├─ Nhận: embedding (512 chiều), confidence, bbox
├─ Nếu lỗi → HTTP 400 "Không thể kết nối Face Recognition Service"
└─ OK, có query_embedding
```

#### Bước 6️⃣: Lấy Embeddings Đã Đăng Ký
```
├─ Query: SELECT id, student_id, embedding_vector FROM student_faces
│         WHERE student_id IN (enrolled_students)
│         AND embedding_vector IS NOT NULL
├─ Convert embedding_vector (vector) → JSON array
├─ Tạo: known_faces = [
│   { id: 1, student_id: 123, embedding: [0.1, 0.2, ...] },
│   { id: 2, student_id: 456, embedding: [0.3, 0.4, ...] },
│   ...
│ ]
└─ Nếu known_faces rỗng → HTTP 400 "Chưa có sinh viên nào đăng ký khuôn mặt"
```

#### Bước 7️⃣: So Sánh Embeddings (Matching)
```
Algorithm: Cosine Similarity

├─ Với mỗi known_embedding:
│  └─ cosine_similarity = dot_product(query, known) / (norm(query) * norm(known))
│
├─ Tìm best_match = max(similarities) nếu >= threshold (0.6)
│
├─ Nếu found:
│  ├─ student_id = matched_student_id
│  ├─ confidence = similarity_score
│  └─ OK, confirmed
│
└─ Nếu không found:
   ├─ best_similarity < 0.6 (threshold)
   └─ HTTP 400 "Không nhận diện được khuôn mặt (similarity: 0.45)"
```

**Chi Tiết Công Thức Cosine Similarity** (512 chiều):
```
cosine_similarity(a, b) = (a · b) / (||a|| × ||b||)

Ví dụ:
  a = [0.1, 0.2, 0.3, ...]  (512 giá trị)
  b = [0.15, 0.22, 0.31, ...]

  • dot_product = 0.1*0.15 + 0.2*0.22 + 0.3*0.31 + ...
  • norm_a = √(0.1² + 0.2² + 0.3² + ...)
  • norm_b = √(0.15² + 0.22² + 0.31² + ...)
  • similarity = dot_product / (norm_a * norm_b)

Kết quả: 0-1 (gần 1 = giống nhau, gần 0 = khác nhau)
```

#### Bước 8️⃣: Tạo Attendance Record
```
├─ INSERT INTO attendance_records (
│   session_id,
│   student_id,
│   arrival_time = NOW(),
│   status = (1/2/0 từ bước 3),
│   confidence_score = similarity_score,
│   attendance_method = 'FACE_ID',
│   evidence_url = (nếu lưu ảnh làm bằng chứng)
│ )
├─ Emit event: "attendance.recorded" (cho realtime updates)
└─ Response thành công
```

#### 9️⃣ Response (Success):
```json
{
  "message": "Điểm danh thành công",
  "attendance": {
    "id": 999,
    "session_id": 789,
    "student_id": 123456,
    "student_code": "20210001",
    "full_name": "Nguyễn Văn A",
    "arrival_time": "2024-01-15T10:32:15Z",
    "status": 1,
    "status_text": "Đúng Giờ",
    "confidence_score": 0.89,
    "attendance_method": "FACE_ID"
  },
  "matched_face_id": 1,
  "similarity": 0.89
}
```

---

## ⚠️ Các Trường Hợp Lỗi (Error Handling)

### 1. **No Face Detected**
```json
{
  "statusCode": 400,
  "message": "Không thể kết nối Face Recognition Service",
  "error": "BadRequest"
}
```
**Nguyên nhân**: Python service không chạy hoặc ảnh không có khuôn mặt

### 2. **Multiple Faces in Image**
```json
{
  "statusCode": 400,
  "message": "Ảnh chứa nhiều hơn 1 khuôn mặt. Vui lòng tải lên ảnh selfie.",
  "error": "BadRequest"
}
```

### 3. **Low Similarity**
```json
{
  "statusCode": 400,
  "message": "Không nhận diện được khuôn mặt. Độ tương đồng: 0.45 (yêu cầu: >= 0.6)",
  "error": "BadRequest"
}
```

### 4. **Out of GPS Range**
```json
{
  "statusCode": 400,
  "message": "Bạn đang ở ngoài phạm vi cho phép (cách quá 150m). Khoảng cách hiện tại: 150m",
  "error": "BadRequest"
}
```

### 5. **Max Faces Exceeded**
```json
{
  "statusCode": 400,
  "message": "Sinh viên đã đăng ký đủ 5 ảnh khuôn mặt. Vui lòng xóa ảnh cũ trước.",
  "error": "BadRequest"
}
```

---

## 📊 Database Schema Chi Tiết

### Table: `student_faces`

| Column | Type | Description |
|--------|------|-------------|
| `id` | BigInt (PK) | ID duy nhất của ảnh |
| `student_id` | BigInt (FK) | ID sinh viên (liên kết Student) |
| `image_url` | VARCHAR(500) | URL ảnh trên Cloudinary |
| `embedding_vector` | vector(512) | 512 chiều embedding (pgvector) |
| `created_at` | DateTime | Thời gian tải lên |

**Indices**:
- `student_id` (để tìm nhanh ảnh của SV)

**Constraints**:
- Foreign Key: `student_id` → `students.id` (ON DELETE CASCADE)
- Max 5 ảnh/sinh viên (ràng buộc ở application layer)

### Table: `attendance_records`

| Column | Type | Description |
|--------|------|-------------|
| `id` | BigInt (PK) | ID attendance record |
| `session_id` | BigInt (FK) | ID buổi học |
| `student_id` | BigInt (FK) | ID sinh viên |
| `arrival_time` | DateTime | Thời gian điểm danh |
| `status` | SmallInt | 1=Đúng giờ, 2=Muộn, 0=Vắng |
| `confidence_score` | Float | Độ chính xác nhận diện (0-1) |
| `attendance_method` | Enum | FACE_ID, BIOMETRIC, MANUAL, etc. |
| `evidence_url` | VARCHAR(500) | URL ảnh làm bằng chứng |
| `is_manual_override` | Boolean | Đã được override bằng tay |
| `note` | Text | Ghi chú |
| `created_at` | DateTime | Thời gian tạo record |

**Indices**:
- `session_id` (để lấy tất cả attendance của buổi)
- `UNIQUE(session_id, student_id)` (mỗi SV chỉ 1 record/buổi)

---

## 🔧 Configuration & Thresholds

### Ngưỡng Nhận Diện (Thresholds)

```javascript
DEFAULT_THRESHOLD = 0.6  // Similarity score phải >= 0.6 để match

// Giải thích:
// 0.6-0.7 : Chấp nhận được (đúng người)
// 0.7-0.85: Rất chắc chắn
// 0.85+  : Xác định rõ ràng
// <0.6   : Từ chối (có thể khác người)
```

### Giới Hạn Ảnh

```javascript
MAX_FACES_PER_STUDENT = 5  // Max 5 ảnh/sinh viên
MAX_FILE_SIZE = 5MB        // Khi đăng ký ảnh khuôn mặt
MAX_FILE_SIZE = 10MB       // Khi điểm danh (ảnh chứng cứ)
```

### Thời Gian Điểm Danh

```
Gọi check_in_time = 10:00 AM

|-30min    |15min    |35min    |
08:30      10:00    10:15    10:35
  ↓         ↓        ↓        ↓
Quá sớm  | Đúng | Muộn |   Vắng
        Giờ
        
Trạng thái:
• -30 đến +15 phút = Status 1 (Đúng Giờ) ✓
• +15 đến +35 phút = Status 2 (Muộn) ⚠️
• Quá +35 phút     = Status 0 (Vắng) ✗
```

### Vị Trí GPS

```
allowed_radius = 50m (mặc định)

Quy tắc:
├─ Nếu distance <= 50m  → OK
├─ Nếu 50 < distance <= 100m  → Cảnh báo nhưng vẫn cho điểm danh
└─ Nếu distance > 100m  → Reject (HTTP 400)
```

---

## 🎨 UI Components Cần Thiết (Frontend Admin)

### 1. **Danh Sách Sinh Viên + Quản Lý Khuôn Mặt**

```
┌─────────────────────────────────────────────────────┐
│ 📋 Quản Lý Khuôn Mặt Sinh Viên                      │
├─────────────────────────────────────────────────────┤
│ [Search SV] [Filter] [Bulk Actions]                │
│                                                     │
│ ┌───┬──────────┬──────────┬────────┬─────────┬────┐│
│ │ # │ Mã SV    │ Tên SV   │ Ảnh    │ Ngày DK │ Hành│
│ ├───┼──────────┼──────────┼────────┼─────────┼────┤│
│ │ 1 │ 20210001 │ Nguyễn A │ 3/5   │ 15/1   │ ⋮  ││
│ │   │          │          │  ✓    │ 14/1   │    ││
│ │   │          │          │  ✓    │ 13/1   │    ││
│ │   │          │          │  ✓    │        │    ││
│ ├───┼──────────┼──────────┼────────┼─────────┼────┤│
│ │ 2 │ 20210002 │ Trần B   │ 2/5   │ 10/1   │ ⋮  ││
│ └───┴──────────┴──────────┴────────┴─────────┴────┘│
│                                                     │
│ [+ Thêm Khuôn Mặt] [🗑️ Xóa] [📊 Thống Kê]        │
└─────────────────────────────────────────────────────┘
```

**Actions**:
- Click vào SV → Xem chi tiết (ảnh, confidence, ngày)
- Hover ảnh → Preview, xóa
- "Thêm Khuôn Mặt" → Upload ảnh mới
- Bulk delete → Xóa nhiều ảnh cùng lúc

### 2. **Chi Tiết Sinh Viên**

```
┌──────────────────────────────────────────────────────┐
│ 📸 Khuôn Mặt Sinh Viên: Nguyễn Văn A (20210001)    │
├──────────────────────────────────────────────────────┤
│                                                      │
│  [Ảnh 1]      [Ảnh 2]      [Ảnh 3]      [+ Thêm]   │
│ 15/1 10:30  14/1 09:15   13/1 14:20                │
│ Conf: 0.95  Conf: 0.87   Conf: 0.92                │
│  [Xóa]       [Xóa]        [Xóa]                    │
│                                                      │
│  Status: ✓ Đã đăng ký 3/5 ảnh                      │
│  Lần điểm danh gần nhất: 15/1 10:35 (Status: Đúng)│
│  Tỉ lệ điểm danh thành công: 95% (19/20)           │
│                                                      │
│ [← Quay Lại] [📊 Xem Thống Kê]                    │
└──────────────────────────────────────────────────────┘
```

### 3. **Dashboard Thống Kê**

```
┌────────────────────────────────────────────────────┐
│ 📊 Thống Kê FaceID                                 │
├────────────────────────────────────────────────────┤
│                                                    │
│ 🎯 Tổng Thể:                                      │
│   • Tổng SV có dữ liệu khuôn mặt: 245/500        │
│   • Tổng ảnh đã lưu trữ: 896 ảnh                 │
│   • Dung lượng: 250 MB / 1 GB                    │
│                                                    │
│ 📈 Hiệu Suất Nhận Diện:                          │
│   • Success Rate: 96.5%                          │
│   • Avg. Confidence: 0.88                        │
│   • Failed Matches: 2.1%                         │
│   • GPS Failures: 1.4%                           │
│                                                    │
│ 📅 Điểm Danh Hôm Nay:                            │
│   • Tổng: 450 lần                                │
│   • Thành công: 435 (96.7%)                      │
│   • Thất bại: 15 (3.3%)                          │
│                                                    │
│ ⚠️ Cảnh Báo:                                      │
│   • 12 SV chưa đăng ký khuôn mặt                │
│   • 5 SV cần cập nhật ảnh (quá 30 ngày)         │
│                                                    │
│ [Export CSV] [Refresh] [Cài Đặt]                │
└────────────────────────────────────────────────────┘
```

---

## 🚀 Integrations & External Services

### 1. **Python Face Service** (http://localhost:8000)
- **Endpoints**:
  - `POST /extract-embedding` → Trích embedding từ 1 ảnh
  - `POST /extract-all-embeddings` → Trích embedding từ ảnh nhóm
  - `POST /compare-faces` → So sánh 2 embeddings
  - `POST /detect-faces` → Detect tất cả khuôn mặt trong ảnh
  - `GET /health` → Kiểm tra status

- **Technologies**: FastAPI, FaceNet/VGGFace2, TensorFlow

### 2. **Cloudinary CDN** (Image Storage)
- **Endpoints**: `https://api.cloudinary.com/v1_1/{cloud_name}/image/upload`
- **Transformation**: Auto-resize, auto-compress, auto-format
- **Folder Structure**: `faces/{student_code}/{timestamp}`
- **Retention**: Indefinite (hoặc theo policy)

---

## 📝 API Reference

### Health Check
```
GET /face-recognition/health
Response: { status: "ok", model: "FaceNet" }
```

### Register Face (Admin/Lecturer)
```
POST /face-recognition/register/:studentId
Body: multipart/form-data (file)
Response: { message, face, confidence, total_faces }
```

### Get Student Faces
```
GET /face-recognition/student/:studentId
Response: { student, faces[], total, max_allowed }
```

### Get My Faces (Student)
```
GET /face-recognition/me
Response: { student, faces[], total, max_allowed }
```

### Delete Face
```
DELETE /face-recognition/faces/:faceId
Response: { message }
```

### Attendance by Face
```
POST /face-recognition/attendance/:sessionId
Body: multipart/form-data (file, latitude?, longitude?)
Response: { message, attendance, matched_face_id, similarity }
```

---

## 🔐 Bảo Mật & Quyền Hạn

### Role-Based Access

| Endpoint | Admin | Lecturer | Student |
|----------|-------|----------|---------|
| Register Face | ✓ | ✓ | ✗ |
| View Student Faces | ✓ | ✓ | ✗ |
| View My Faces | ✓ | ✓ | ✓ |
| Delete Face | ✓ | ✗ | ✗ |
| Attendance by Face | ✓ | ✓ | ✓ |
| Health Check | ✓ | ✓ | ✓ |

### Data Privacy
- ✓ Embeddings không thể reverse-engineer sang ảnh gốc
- ✓ Ảnh lưu trữ trên Cloudinary (không trên server)
- ✓ Chỉ Admin có quyền xóa
- ✓ Attendance records có audit trail (created_at, updated_by)

---

## 🐛 Troubleshooting

### Python Service Not Available
```
Error: "Face Recognition Service không khả dụng"

Fix:
1. Kiểm tra Python service chạy: curl http://localhost:8000/health
2. Kiểm tra FACE_SERVICE_URL env var
3. Restart Python service
```

### Cloudinary Upload Fails
```
Error: "Lỗi upload ảnh"

Fix:
1. Kiểm tra CLOUDINARY_CLOUD_NAME, API_KEY, API_SECRET
2. Kiểm tra dung lượng Cloudinary storage
3. Kiểm tra network connectivity
```

### Low Similarity Scores
```
Vấn đề: Lúc nhận diện lúc không nhận diện cùng 1 người

Nguyên nhân:
1. Ảnh chụp góc khác / ánh sáng khác
2. Ảnh bị mặt che phủ (mặt nạ, kính)
3. Ảnh quá mờ hoặc không rõ

Giải Pháp:
1. Yêu cầu tải lêm 5 ảnh từ góc khác nhau
2. Cải thiện điều kiện ánh sáng
3. Giảm threshold (cẩn thận false positive)
```

---

## 📚 Tài Liệu Tham Khảo

- **FaceNet Paper**: https://arxiv.org/abs/1503.03832
- **pgvector Documentation**: https://github.com/pgvector/pgvector
- **Cosine Similarity**: https://en.wikipedia.org/wiki/Cosine_similarity
- **Haversine Formula**: https://en.wikipedia.org/wiki/Haversine_formula

---

## 🎯 Roadmap Tương Lai

- [ ] Liveness detection (phát hiện ảnh giả/video)
- [ ] Multi-face group attendance
- [ ] Masking detection (yêu cầu gỡ mặt nạ)
- [ ] Age verification
- [ ] Expression analysis
- [ ] Batch re-enrollment (tải lại embeddings)
- [ ] Analytics dashboard
- [ ] Mobile app integration

---

**Version**: 1.0  
**Last Updated**: 2024-01-15  
**Status**: ✓ Production Ready
