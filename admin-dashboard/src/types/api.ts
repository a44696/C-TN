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

// ==================== POSTS MANAGEMENT ====================

export type PostRecipientType =
  | "SPECIFIC_CLASSES"
  | "ALL_STUDENTS"
  | "BY_DEPARTMENT";

export interface PostAuthor {
  id: number;
  username: string;
  avatar_url?: string;
}

export interface PostMedia {
  id: number;
  file_url: string;
  file_type: string;
}

export type PostStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface Post {
  id: number;
  title: string;
  content: string;
  author_id: number;
  course_class_id?: number;
  recipient_type: PostRecipientType;
  status: PostStatus;
  published_at: string;
  created_at: string;
  updated_at: string;
  author: PostAuthor;
  media?: PostMedia[];
  recipientCount?: number;
}

export interface CreatePostPayload {
  title: string;
  content: string;
  recipient_type: PostRecipientType;
  course_class_id?: number;
  department_names?: string[];
  media_urls?: string[];
}

export interface UpdatePostPayload {
  title?: string;
  content?: string;
  media_urls?: string[];
}

export interface PostResponse {
  message: string;
  recipientCount: number;
  data: Post;
}

export interface PostListResponse {
  data: Post[];
  total: number;
  page?: number;
  limit?: number;
  skip?: number;
  take?: number;
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
  current_students?: number;
  day_of_week: number;
  lesson_slot: string;
  start_date: string;
  end_date: string;
  latitude?: number;
  longitude?: number;
  allowed_radius?: number;
  subject?: Subject;
  lecturer?: Lecturer;
  semester?: Semester;
  created_at?: string;
  updated_at?: string;
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

export interface Student {
  id: string;
  user_id: string;
  student_code: string;
  full_name: string;
  dob: string;
  gender: string;
  phone_number: string;
  class_name: string;
  address: string;
  gpa: string;
  email: string;
  major_name: string;
  department_name: string;
  created_at: string;
  updated_at: string;
}

export interface Grade {
  id: string;
  enrollment_id: string;
  score_attendance: number;
  score_process: number;
  score_final: number;
  score_total_10?: number;
  updated_at?: string;
  student?: Student;
  course_class?: CourseClass;
  enrollment?: {
    id: string;
    student_id: string;
    course_class_id: string;
    student: Student;
    course_class: CourseClass;
  };
}

export interface CreateGradeDto {
  enrollment_id: string;
  score_attendance: number;
  score_process: number;
  score_final: number;
}

// ==================== CLASS ENROLLMENTS ====================

export interface ClassEnrollment {
  id: string;
  student_id: string;
  course_class_id: number;
  student: Student;
  course_class: CourseClass;
  created_at?: string;
  updated_at?: string;
}

// ==================== ATTENDANCE ====================

export interface AttendanceSession {
  id: string;
  course_class_id: string;
  check_in_time: string;
  date: string;
  course_class?: CourseClass;
  _count?: {
    records: number;
  };
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
  id?: number;
  userId?: string;
  username: string;
  role: "ADMIN" | "STUDENT" | "LECTURER";
  fullName?: string;
  full_name?: string;
  studentCode?: string;
  student_code?: string;
  studentId?: number;
  email?: string;
  className?: string;
  avatarUrl?: string | null;
  code?: string;
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

// ==================== ADMIN CHAT ====================

export type MessageType = "TEXT" | "IMAGE" | "FILE";
export type UserRole = "ADMIN" | "STUDENT" | "LECTURER";

export interface ChatUser {
  id: string;
  username: string;
  fullName: string;
  code: string;
  avatarUrl: string | null;
  role: UserRole;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string | null;
  senderRole: UserRole;
  content: string;
  messageType: MessageType;
  mediaUrl: string | null;
  isRead: boolean;
  isMe: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  partner: ChatUser;
  lastMessage: ChatMessage | null;
  unreadCount: number;
  lastMessageAt: string | null;
}

export interface MessagesResponse {
  messages: ChatMessage[];
  hasMore: boolean;
  nextCursor: string | null;
}

export interface SendMessageDto {
  content: string;
  messageType?: MessageType;
  mediaUrl?: string | null;
}
