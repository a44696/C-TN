// ==================== API RESPONSE TYPES ====================

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  page: number;
  limit: number;
  total: number;
}

// ==================== DOCUMENT TYPES ====================

export interface DocumentType {
  id: number;
  document_name: string;
  processing_days: number;
}

export interface CreateDocumentTypeDto {
  document_name: string;
  processing_days: number;
}

// ==================== SERVICE REQUESTS ====================

export interface ServiceRequest {
  id: string;
  reason: string;
  status: 1 | 2 | 3 | 4; // 1: PENDING, 2: PROCESSING, 3: COMPLETED, 4: REJECTED
  created_at: string;
  attachment_url: string;
  student: {
    id: string;
    student_code: string;
    full_name: string;
  };
  documentType: {
    id: string;
    document_name: string;
    processing_days: number;
  };
}

export interface ServiceRequestDetail extends ServiceRequest {
  note?: string;
}

export interface UpdateServiceRequestStatusDto {
  status: 1 | 2 | 3 | 4;
  note: string;
}

// ==================== NOTIFICATIONS ====================

export interface Notification {
  id: number;
  title: string;
  message?: string;
  notification_type: "broadcast" | "class" | "student_only" | "system";
  course_class_id?: number;
  created_at: string;
  updated_at?: string;
}

export interface CreateNotificationDto {
  title: string;
  message: string;
  notification_type: "broadcast" | "class" | "student_only" | "system";
  course_class_id?: number;
}

export interface UpdateNotificationDto {
  title: string;
  message: string;
}

// ==================== COURSE CLASSES ====================

export interface CourseClass {
  id: number;
  subject_id: number;
  lecturer_id: number;
  semester_id: number;
  academic_year: string;
  room: string;
  max_students: number;
  day_of_week: number;
  lesson_slot: string;
  start_date: string;
  end_date: string;
}

export interface CreateCourseClassDto {
  subject_id: number;
  lecturer_id: number;
  semester_id: number;
  academic_year: string;
  room: string;
  max_students: number;
  day_of_week: number;
  lesson_slot: string;
  start_date: string;
  end_date: string;
}

// ==================== SUBJECTS ====================

export interface Subject {
  id: number;
  subject_code: string;
  subject_name: string;
  credits: number;
  description: string;
}

export interface CreateSubjectDto {
  subject_code: string;
  subject_name: string;
  credits: number;
  description: string;
}

// ==================== SEMESTERS ====================

export interface Semester {
  id: number;
  semester_name: string;
  academic_year: string;
}

export interface CreateSemesterDto {
  semester_name: string;
  academic_year: string;
}

// ==================== LECTURERS ====================

export interface Lecturer {
  id: number;
  user_id: number;
  lecturer_code: string;
  full_name: string;
  department: string;
  phone_number: string;
  email: string;
  major_name: string;
  degree: string;
}

export interface CreateLecturerDto {
  user_id: number;
  lecturer_code: string;
  full_name: string;
  department: string;
  phone_number: string;
  email: string;
  major_name: string;
  degree: string;
}

// ==================== GRADES ====================

export interface Grade {
  id: number;
  enrollment_id: string;
  score_attendance: number;
  score_process: number;
  score_final: number;
  score_total_10?: number;
}

export interface CreateGradeDto {
  enrollment_id: string;
  score_attendance: number;
  score_process: number;
  score_final: number;
}

// ==================== ATTENDANCE ====================

export interface AttendanceSession {
  id: number;
  course_class_id: number;
  check_in_time: string;
  date: string;
}

export interface CreateAttendanceSessionDto {
  course_class_id: number;
  check_in_time: string;
  date: string;
}

export interface AttendanceRecord {
  id: number;
  session_id: number;
  student_id: number;
  status: string;
}

export interface AttendanceStats {
  present: number;
  absent: number;
  total: number;
}

// ==================== ATTENDANCE WARNINGS ====================

export interface AttendanceWarning {
  id: number;
  user_id: number;
  student_code: string;
  student_name: string;
  category: string;
  severity: "Low" | "Medium" | "High";
  content: string;
  is_resolved: boolean;
  created_at: string;
}

export interface ResolveAttendanceWarningDto {
  resolution_note: string;
  resolved_by: number;
}

// ==================== USERS ====================

export interface User {
  id: number;
  username: string;
  role: "ADMIN" | "STUDENT" | "LECTURER";
}

export interface CreateUserDto {
  username: string;
  password: string;
  role: "ADMIN" | "STUDENT" | "LECTURER";
}

// ==================== AUTHENTICATION ====================

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

// ==================== QUERY PARAMS ====================

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface ServiceRequestQueryParams extends PaginationParams {
  status?: 1 | 2 | 3 | 4;
  document_type_id?: number;
  student_code?: string;
  full_name?: string;
}

export interface AttendanceWarningQueryParams extends PaginationParams {
  severity?: "Low" | "Medium" | "High";
  student_code?: string;
  is_resolved?: boolean;
}
