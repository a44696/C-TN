import axios, { type AxiosInstance } from "axios";
import type {
  ApiResponse,
  PaginatedResponse,
  DocumentType,
  ServiceRequest,
  ServiceRequestDetail,
  UpdateServiceRequestStatusDto,
  CreateDocumentTypeDto,
  Notification,
  CreateNotificationDto,
  UpdateNotificationDto,
  CourseClass,
  CreateCourseClassDto,
  Subject,
  CreateSubjectDto,
  Semester,
  CreateSemesterDto,
  Lecturer,
  CreateLecturerDto,
  Grade,
  CreateGradeDto,
  ClassEnrollment,
  AttendanceSession,
  CreateAttendanceSessionDto,
  AttendanceWarning,
  ResolveAttendanceWarningDto,
  User,
  CreateUserDto,
  LoginRequest,
  AuthResponse,
  ServiceRequestQueryParams,
  AttendanceWarningQueryParams,
  PaginationParams,
  Post,
  CreatePostPayload,
  UpdatePostPayload,
  PostResponse,
  PostListResponse,
} from "../types/api";

const API_BASE_URL = "http://localhost:3000";

export class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add interceptor to include token
    this.axiosInstance.interceptors.request.use((config) => {
      const token = localStorage.getItem("access_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Add interceptor to handle token refresh
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const refreshToken = localStorage.getItem("refresh_token");
            if (refreshToken) {
              // Request new token with refresh token
              // This depends on your backend implementation
              const response = await axios.post(
                `${API_BASE_URL}/auth/refresh`,
                {
                  refresh_token: refreshToken,
                },
              );
              const { access_token } = response.data.data;
              localStorage.setItem("access_token", access_token);
              return this.axiosInstance(originalRequest);
            }
          } catch {
            // Redirect to login
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            window.location.href = "/login";
          }
        }
        return Promise.reject(error);
      },
    );
  }

  // ==================== AUTHENTICATION ====================

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await this.axiosInstance.post<ApiResponse<AuthResponse>>(
      "/auth/login",
      credentials,
    );
    const { access_token, refresh_token, user } = response.data.data;
    localStorage.setItem("access_token", access_token);
    localStorage.setItem("refresh_token", refresh_token);
    localStorage.setItem("user", JSON.stringify(user));
    return response.data.data;
  }

  logout(): void {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }

  // ==================== DOCUMENT TYPES ====================

  async getDocumentTypes(
    params?: PaginationParams,
  ): Promise<PaginatedResponse<DocumentType>> {
    const response = await this.axiosInstance.get<any>(
      "/admin/document-types",
      { params },
    );
    const inner = response.data.data;

    // Handle both paginated and non-paginated responses
    if (Array.isArray(inner)) {
      const page = params?.page || 1;
      const limit = params?.limit || 10;
      return {
        statusCode: 200,
        message: "Success",
        data: inner,
        page,
        limit,
        total: inner.length,
      };
    }

    return {
      statusCode: inner.statusCode,
      message: inner.message,
      data: inner.data,
      page: inner.page,
      limit: inner.limit,
      total: inner.total,
    };
  }

  async getDocumentTypeById(id: number): Promise<DocumentType> {
    const response = await this.axiosInstance.get<ApiResponse<DocumentType>>(
      `/admin/document-types/${id}`,
    );
    return response.data.data.data;
  }

  async createDocumentType(data: CreateDocumentTypeDto): Promise<DocumentType> {
    const response = await this.axiosInstance.post<ApiResponse<DocumentType>>(
      "/admin/document-types",
      data,
    );
    return response.data.data.data;
  }

  async updateDocumentType(
    id: number,
    data: CreateDocumentTypeDto,
  ): Promise<DocumentType> {
    const response = await this.axiosInstance.patch<ApiResponse<DocumentType>>(
      `/admin/document-types/${id}`,
      data,
    );
    return response.data.data.data;
  }

  async deleteDocumentType(id: number): Promise<void> {
    await this.axiosInstance.delete(`/admin/document-types/${id}`);
  }

  // ==================== SERVICE REQUESTS ====================

  async getServiceRequests(
    params?: ServiceRequestQueryParams,
  ): Promise<PaginatedResponse<ServiceRequest>> {
    const response = await this.axiosInstance.get<any>(
      "/admin/service-requests",
      { params },
    );

    // Handle nested response format: response.data.data.data
    let inner = response.data.data;

    // If inner is wrapped in another data object, unwrap it
    if (
      inner &&
      typeof inner === "object" &&
      "data" in inner &&
      !Array.isArray(inner)
    ) {
      inner = inner.data;
    }

    if (Array.isArray(inner)) {
      const page = params?.page || 1;
      const limit = params?.limit || 10;
      return {
        statusCode: 200,
        message: "Success",
        data: inner,
        page,
        limit,
        total: inner.length,
      };
    }

    return {
      statusCode: inner.statusCode,
      message: inner.message,
      data: inner.data,
      page: inner.page,
      limit: inner.limit,
      total: inner.total,
    };
  }

  async getServiceRequestById(id: number): Promise<ServiceRequestDetail> {
    const response = await this.axiosInstance.get<
      ApiResponse<ServiceRequestDetail>
    >(`/admin/service-requests/${id}`);
    return response.data.data.data;
  }

  async updateServiceRequestStatus(
    id: number,
    data: UpdateServiceRequestStatusDto,
  ): Promise<ServiceRequest> {
    const response = await this.axiosInstance.patch<
      ApiResponse<ServiceRequest>
    >(`/admin/service-requests/${id}/status`, data);
    return response.data.data.data;
  }

  // ==================== NOTIFICATIONS ====================

  async getNotifications(): Promise<Notification[]> {
    const response = await this.axiosInstance.get<ApiResponse<Notification[]>>(
      "/notifications/history",
    );
    const data = response.data.data;
    return Array.isArray(data) ? data : data.data;
  }

  async createNotification(data: CreateNotificationDto): Promise<Notification> {
    const response = await this.axiosInstance.post<ApiResponse<Notification>>(
      "/notifications",
      data,
    );
    return response.data.data.data;
  }

  async updateNotification(
    id: number,
    data: UpdateNotificationDto,
  ): Promise<Notification> {
    const response = await this.axiosInstance.put<ApiResponse<Notification>>(
      `/notifications/${id}`,
      data,
    );
    return response.data.data.data;
  }

  async deleteNotification(id: number): Promise<void> {
    await this.axiosInstance.delete(`/notifications/${id}`);
  }

  // Get posts from notifications (posts are stored as notifications in DB)
  async getPostsFromNotifications(
    page: number = 1,
    limit: number = 10,
  ): Promise<PostListResponse> {
    const response = await this.axiosInstance.get<ApiResponse<Notification[]>>(
      "/notifications/history",
    );
    const allNotifications = response.data.data;
    const notifications = Array.isArray(allNotifications)
      ? allNotifications
      : allNotifications?.data || [];

    // Filter to get only posts (notification_type = "POST")
    const posts = notifications.filter(
      (n: any) => n.notification_type === "POST",
    );

    // Simple pagination
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedPosts = posts.slice(start, end);

    return {
      data: paginatedPosts as any,
      total: posts.length,
      page,
      limit,
    };
  }

  // ==================== COURSE CLASSES ====================

  async getCourseClasses(
    params?: PaginationParams,
  ): Promise<PaginatedResponse<CourseClass>> {
    const response = await this.axiosInstance.get<any>("/course-classes", {
      params,
    });
    const inner = response.data.data;

    if (Array.isArray(inner)) {
      const page = params?.page || 1;
      const limit = params?.limit || 10;
      return {
        statusCode: 200,
        message: "Success",
        data: inner,
        page,
        limit,
        total: inner.length,
      };
    }

    return {
      statusCode: inner.statusCode,
      message: inner.message,
      data: inner.data,
      page: inner.page,
      limit: inner.limit,
      total: inner.total,
    };
  }

  async createCourseClass(data: CreateCourseClassDto): Promise<CourseClass> {
    const response = await this.axiosInstance.post<ApiResponse<CourseClass>>(
      "/course-classes",
      data,
    );
    return response.data.data.data;
  }

  async updateCourseClass(
    id: number,
    data: Partial<CreateCourseClassDto>,
  ): Promise<CourseClass> {
    const response = await this.axiosInstance.patch<ApiResponse<CourseClass>>(
      `/course-classes/${id}`,
      data,
    );
    return response.data.data.data;
  }

  async deleteCourseClass(id: number): Promise<void> {
    await this.axiosInstance.delete(`/course-classes/${id}`);
  }

  // ==================== SUBJECTS ====================

  async getSubjects(params?: PaginationParams): Promise<Subject[]> {
    const response = await this.axiosInstance.get<ApiResponse<Subject[]>>(
      "/subjects",
      { params },
    );
    const data = response.data.data;
    return Array.isArray(data) ? data : data.data;
  }

  async createSubject(data: CreateSubjectDto): Promise<Subject> {
    const response = await this.axiosInstance.post<ApiResponse<Subject>>(
      "/subjects",
      data,
    );
    return response.data.data.data;
  }

  async createSubjectsBulk(data: CreateSubjectDto[]): Promise<Subject[]> {
    const response = await this.axiosInstance.post<ApiResponse<Subject[]>>(
      "/subjects/bulk",
      data,
    );
    const responseData = response.data.data;
    return Array.isArray(responseData) ? responseData : responseData.data;
  }

  async updateSubject(
    id: number,
    data: Partial<CreateSubjectDto>,
  ): Promise<Subject> {
    const response = await this.axiosInstance.patch<ApiResponse<Subject>>(
      `/subjects/${id}`,
      data,
    );
    return response.data.data.data;
  }

  async deleteSubject(id: number): Promise<void> {
    await this.axiosInstance.delete(`/subjects/${id}`);
  }

  // ==================== SEMESTERS ====================

  async getSemesters(): Promise<Semester[]> {
    const response =
      await this.axiosInstance.get<ApiResponse<Semester[]>>("/semesters");
    const data = response.data.data;
    return Array.isArray(data) ? data : data.data;
  }

  async createSemester(data: CreateSemesterDto): Promise<Semester> {
    const response = await this.axiosInstance.post<ApiResponse<Semester>>(
      "/semesters",
      data,
    );
    return response.data.data.data;
  }

  async createSemestersBulk(data: CreateSemesterDto[]): Promise<Semester[]> {
    const response = await this.axiosInstance.post<ApiResponse<Semester[]>>(
      "/semesters/bulk",
      data,
    );
    const responseData = response.data.data;
    return Array.isArray(responseData) ? responseData : responseData.data;
  }

  async updateSemester(
    id: number,
    data: Partial<CreateSemesterDto>,
  ): Promise<Semester> {
    const response = await this.axiosInstance.patch<ApiResponse<Semester>>(
      `/semesters/${id}`,
      data,
    );
    return response.data.data.data;
  }

  // ==================== LECTURERS ====================

  async getLecturers(params?: PaginationParams): Promise<Lecturer[]> {
    const response = await this.axiosInstance.get<ApiResponse<Lecturer[]>>(
      "/lecturers",
      { params },
    );
    const data = response.data.data;
    return Array.isArray(data) ? data : data.data;
  }

  async createLecturer(data: CreateLecturerDto): Promise<Lecturer> {
    const response = await this.axiosInstance.post<ApiResponse<Lecturer>>(
      "/lecturers",
      data,
    );
    return response.data.data;
  }

  async uploadLecturersExcel(file: File): Promise<any> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await this.axiosInstance.post<ApiResponse<any>>(
      "/lecturers/import/excel",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data.data;
  }

  async updateLecturer(
    lecturerCode: string,
    data: Partial<CreateLecturerDto>,
  ): Promise<Lecturer> {
    const response = await this.axiosInstance.patch<ApiResponse<Lecturer>>(
      `/lecturers/${lecturerCode}`,
      data,
    );
    return response.data.data;
  }

  async deleteLecturer(lecturerCode: string): Promise<void> {
    await this.axiosInstance.delete(`/lecturers/${lecturerCode}`);
  }

  // ==================== GRADES ====================

  async getAllGrades(
    params?: PaginationParams,
  ): Promise<PaginatedResponse<Grade>> {
    const response = await this.axiosInstance.get<any>("/grades", { params });
    const inner = response.data.data;

    // Handle both paginated and non-paginated responses
    if (Array.isArray(inner)) {
      // Simple array response - create pagination metadata
      const page = params?.page || 1;
      const limit = params?.limit || 10;
      return {
        statusCode: 200,
        message: "Success",
        data: inner,
        page,
        limit,
        total: inner.length,
      };
    }

    // Paginated response with pagination object
    return {
      statusCode: inner.statusCode,
      message: inner.message,
      data: inner.data,
      page: inner.page,
      limit: inner.limit,
      total: inner.total,
    };
  }

  async getStudentGrades(studentId: string): Promise<Grade[]> {
    const response = await this.axiosInstance.get<ApiResponse<Grade[]>>(
      `/grades/student/${studentId}`,
    );
    const data = response.data.data;
    return Array.isArray(data) ? data : data.data;
  }

  async getCourseClassGrades(courseClassId: string): Promise<Grade[]> {
    const response = await this.axiosInstance.get<ApiResponse<Grade[]>>(
      `/grades/course-class/${courseClassId}`,
    );
    const data = response.data.data;
    return Array.isArray(data) ? data : data.data;
  }

  async getClassEnrollments(
    params?: PaginationParams,
  ): Promise<PaginatedResponse<ClassEnrollment>> {
    const response = await this.axiosInstance.get<any>("/class-enrollments", {
      params,
    });
    const inner = response.data.data;

    if (Array.isArray(inner)) {
      const page = params?.page || 1;
      const limit = params?.limit || 100;
      return {
        statusCode: 200,
        message: "Success",
        data: inner,
        page,
        limit,
        total: inner.length,
      };
    }

    return {
      statusCode: inner.statusCode,
      message: inner.message,
      data: inner.data,
      page: inner.page,
      limit: inner.limit,
      total: inner.total,
    };
  }

  async createGrade(data: CreateGradeDto): Promise<Grade> {
    const response = await this.axiosInstance.post<ApiResponse<Grade>>(
      "/grades",
      data,
    );
    return response.data.data.data;
  }

  // ==================== ATTENDANCE ====================

  async getAttendanceSessions(
    params?: PaginationParams,
  ): Promise<PaginatedResponse<AttendanceSession>> {
    const response = await this.axiosInstance.get<any>("/attendance/sessions", {
      params,
    });
    const inner = response.data.data;

    if (Array.isArray(inner)) {
      const page = params?.page || 1;
      const limit = params?.limit || 10;
      return {
        statusCode: 200,
        message: "Success",
        data: inner,
        page,
        limit,
        total: inner.length,
      };
    }

    return {
      statusCode: inner.statusCode,
      message: inner.message,
      data: inner.data,
      page: inner.page,
      limit: inner.limit,
      total: inner.total,
    };
  }

  async getAttendanceSessionsByCourseClass(
    courseClassId: number,
  ): Promise<AttendanceSession[]> {
    const response = await this.axiosInstance.get<
      ApiResponse<AttendanceSession[]>
    >(`/attendance/sessions/course-class/${courseClassId}`);
    const data = response.data.data;
    return Array.isArray(data) ? data : data.data;
  }

  async createAttendanceSession(
    data: CreateAttendanceSessionDto,
  ): Promise<AttendanceSession> {
    const response = await this.axiosInstance.post<
      ApiResponse<AttendanceSession>
    >("/attendance/sessions", data);
    return response.data.data.data;
  }

  async deleteAttendanceSession(id: string | number): Promise<void> {
    await this.axiosInstance.delete(`/attendance/sessions/${id}`);
  }

  async deleteAttendanceRecord(id: number): Promise<void> {
    await this.axiosInstance.delete(`/attendance/records/${id}`);
  }

  async getAttendanceStats(sessionId: number): Promise<Record<string, number>> {
    const response = await this.axiosInstance.get<
      ApiResponse<Record<string, number>>
    >(`/attendance/stats/session/${sessionId}`);
    return response.data.data.data;
  }

  // ==================== ATTENDANCE WARNINGS ====================

  async getAttendanceWarnings(
    params?: AttendanceWarningQueryParams,
  ): Promise<PaginatedResponse<AttendanceWarning>> {
    const response = await this.axiosInstance.get<any>("/attendance-warnings", {
      params,
    });
    const inner = response.data.data;

    if (Array.isArray(inner)) {
      const page = params?.page || 1;
      const limit = params?.limit || 10;
      return {
        statusCode: 200,
        message: "Success",
        data: inner,
        page,
        limit,
        total: inner.length,
      };
    }

    return {
      statusCode: inner.statusCode,
      message: inner.message,
      data: inner.data,
      page: inner.page,
      limit: inner.limit,
      total: inner.total,
    };
  }

  async getAttendanceWarningById(id: number): Promise<AttendanceWarning> {
    const response = await this.axiosInstance.get<
      ApiResponse<AttendanceWarning>
    >(`/attendance-warnings/${id}`);
    return response.data.data.data;
  }

  async resolveAttendanceWarning(
    id: number,
    data: ResolveAttendanceWarningDto,
  ): Promise<AttendanceWarning> {
    const response = await this.axiosInstance.patch<
      ApiResponse<AttendanceWarning>
    >(`/attendance-warnings/${id}/resolve`, data);
    return response.data.data.data;
  }

  // ==================== POSTS ====================

  async createPost(payload: CreatePostPayload): Promise<PostResponse> {
    const response = await this.axiosInstance.post<any>("/posts", payload);
    // Handle nested response: response.data.data contains the ApiResponse
    const apiResponse = response.data.data;
    return {
      message: apiResponse.message,
      recipientCount: apiResponse.data?.recipientCount || 0,
      data: apiResponse.data,
    };
  }

  async getGlobalPosts(
    page: number = 1,
    limit: number = 20,
  ): Promise<PostListResponse> {
    const response = await this.axiosInstance.get<any>("/posts/global", {
      params: { page, limit },
    });
    // Handle nested response: response.data.data.data has the actual data
    const apiResponse = response.data.data;
    const paginatedData = apiResponse.data || {};
    return {
      data: paginatedData.data || [],
      total: paginatedData.total || 0,
      page: paginatedData.page || page,
      limit: paginatedData.limit || limit,
    };
  }

  async getStudentFeed(
    page: number = 1,
    limit: number = 20,
  ): Promise<PostListResponse> {
    const response = await this.axiosInstance.get<any>("/posts/feed", {
      params: { page, limit },
    });
    const apiResponse = response.data.data;
    return {
      data: apiResponse.data || [],
      total: apiResponse.total || 0,
      page: apiResponse.page || page,
      limit: apiResponse.limit || limit,
    };
  }

  async getClassPosts(
    classId: number,
    skip: number = 0,
    take: number = 20,
  ): Promise<PostListResponse> {
    const response = await this.axiosInstance.get<any>(
      `/posts/class/${classId}`,
      {
        params: { skip, take },
      },
    );
    const apiResponse = response.data.data;
    return {
      data: apiResponse.data || [],
      total: apiResponse.total || 0,
      skip: apiResponse.skip || skip,
      take: apiResponse.take || take,
    };
  }

  async getMyPosts(
    skip: number = 0,
    take: number = 20,
  ): Promise<PostListResponse> {
    const response = await this.axiosInstance.get<any>("/posts/me/all", {
      params: { skip, take },
    });
    const apiResponse = response.data.data;
    return {
      data: apiResponse.data || [],
      total: apiResponse.total || 0,
      skip: apiResponse.skip || skip,
      take: apiResponse.take || take,
    };
  }

  async getPostById(id: number): Promise<Post> {
    const response = await this.axiosInstance.get<any>(`/posts/${id}`);
    return response.data.data.data || response.data.data;
  }

  async updatePost(postId: number, payload: UpdatePostPayload): Promise<Post> {
    const response = await this.axiosInstance.patch<any>(
      `/posts/${postId}`,
      payload,
    );
    return response.data.data.data || response.data.data;
  }

  async deletePost(postId: number): Promise<void> {
    await this.axiosInstance.delete(`/posts/${postId}`);
  }

  async uploadPostMedia(
    postId: number,
    file: File,
    onUploadProgress?: (progressEvent: any) => void,
  ): Promise<{
    id: string;
    file_url: string;
    file_type: string;
    original_filename: string;
    file_size: number;
    uploaded_at: string;
  }> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await this.axiosInstance.post<any>(
      `/posts/${postId}/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress,
      },
    );
    return response.data.data;
  }

  // ==================== USERS ====================

  async getAllUsers(params?: PaginationParams): Promise<User[]> {
    const response = await this.axiosInstance.get<ApiResponse<User[]>>(
      "/users",
      { params },
    );
    const data = response.data.data;
    return Array.isArray(data) ? data : data.data;
  }

  async createUser(data: CreateUserDto): Promise<User> {
    const response = await this.axiosInstance.post<ApiResponse<User>>(
      "/users",
      data,
    );
    return response.data.data;
  }

  async getCurrentUser(): Promise<User> {
    const response =
      await this.axiosInstance.get<ApiResponse<User>>("/users/me");
    return response.data.data;
  }

  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ message: string }> {
    const response = await this.axiosInstance.post<
      ApiResponse<{ message: string }>
    >("/auth/change-password", data);
    return response.data.data;
  }

  async updateUser(
    userId: number,
    data: Partial<CreateUserDto>,
  ): Promise<User> {
    const response = await this.axiosInstance.patch<ApiResponse<User>>(
      `/users/${userId}`,
      data,
    );
    return response.data.data;
  }

  async deleteUser(userId: number): Promise<void> {
    await this.axiosInstance.delete(`/users/${userId}`);
  }

  // ==================== STUDENTS ====================

  async getStudents(params?: PaginationParams): Promise<any[]> {
    const response = await this.axiosInstance.get<ApiResponse<any[]>>(
      "/students",
      { params },
    );
    const data = response.data.data;
    return Array.isArray(data) ? data : data.data || [];
  }

  async createStudent(data: Partial<any>): Promise<any> {
    const response = await this.axiosInstance.post<ApiResponse<any>>(
      "/students",
      data,
    );
    return response.data.data;
  }

  async uploadStudentsExcel(file: File): Promise<any> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await this.axiosInstance.post<ApiResponse<any>>(
      "/students/import/excel",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data.data;
  }

  async updateStudent(studentCode: string, data: Partial<any>): Promise<any> {
    const response = await this.axiosInstance.patch<ApiResponse<any>>(
      `/students/${studentCode}`,
      data,
    );
    return response.data.data;
  }

  async deleteStudent(studentCode: string): Promise<void> {
    await this.axiosInstance.delete(`/students/${studentCode}`);
  }

  async getStudentDepartments(): Promise<string[]> {
    const response = await this.axiosInstance.get<ApiResponse<string[]>>(
      "/students/departments",
    );
    const data = response.data.data;
    return Array.isArray(data) ? data : [];
  }

  // ==================== ADMIN CHAT ====================

  async searchStudents(query: string, limit: number = 20): Promise<any[]> {
    const response = await this.axiosInstance.get<ApiResponse<any[]>>(
      "/admin-chat/students/search",
      { params: { query, limit } },
    );
    const data = response.data.data;
    return Array.isArray(data) ? data : data.data || [];
  }

  async openAdminChat(targetUserId: string): Promise<any> {
    const response = await this.axiosInstance.post<ApiResponse<any>>(
      "/admin-chat/conversations",
      { targetUserId },
    );
    return response.data.data;
  }

  async getAdminChatMessages(
    conversationId: string,
    limit: number = 30,
    cursor?: string,
  ): Promise<any> {
    const response = await this.axiosInstance.get<ApiResponse<any>>(
      `/admin-chat/conversations/${conversationId}/messages`,
      { params: { limit, cursor } },
    );
    return response.data.data;
  }

  async markAdminChatAsRead(
    conversationId: string,
  ): Promise<{ updatedCount: number }> {
    const response = await this.axiosInstance.patch<
      ApiResponse<{ updatedCount: number }>
    >(`/admin-chat/conversations/${conversationId}/messages/read`);
    return response.data.data;
  }

  async getAdminChatUnreadCount(): Promise<{ totalUnread: number }> {
    const response = await this.axiosInstance.get<
      ApiResponse<{ totalUnread: number }>
    >("/admin-chat/unread-count");
    return response.data.data;
  }

  // ==================== DASHBOARD ====================

  async getDashboardStats(): Promise<{
    totalStudents: number;
    activeClasses: number;
    attendanceRate: number;
    pendingRequests: number;
  }> {
    try {
      // Fetch all required data in parallel
      const [studentsRes, classesRes, serviceReqRes] = await Promise.all([
        this.axiosInstance.get<any>("/students?limit=1"),
        this.axiosInstance.get<any>("/course-classes?limit=1"),
        this.axiosInstance.get<any>("/admin/service-requests?status=1&limit=1"),
      ]);

      // Extract totals from responses
      const totalStudents =
        studentsRes.data.data?.total || studentsRes.data.data?.length || 0;
      const activeClasses =
        classesRes.data.data?.total || classesRes.data.data?.length || 0;
      const pendingRequests = serviceReqRes.data.data?.total || 0;

      // Calculate attendance rate (default fallback)
      let attendanceRate = 92;
      try {
        const statsRes = await this.axiosInstance.get<any>("/attendance/stats");
        attendanceRate = statsRes.data.data?.attendanceRate || 92;
      } catch {
        // Use fallback value
      }

      return {
        totalStudents,
        activeClasses,
        attendanceRate: Math.round(attendanceRate * 10) / 10,
        pendingRequests,
      };
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      return {
        totalStudents: 0,
        activeClasses: 0,
        attendanceRate: 0,
        pendingRequests: 0,
      };
    }
  }

  async getAttendanceTrends(period: "weekly" | "monthly" = "weekly"): Promise<
    Array<{
      name: string;
      value: number;
    }>
  > {
    try {
      const response = await this.axiosInstance.get<ApiResponse<any>>(
        "/attendance/trends",
        { params: { period } },
      );
      const data = response.data.data;
      return Array.isArray(data)
        ? data
        : data.data || this.getDefaultTrendData(period);
    } catch (error) {
      console.error("Error fetching attendance trends:", error);
      return this.getDefaultTrendData(period);
    }
  }

  // ==================== ATTENDANCE STATISTICS ====================

  async getAttendanceOverview(params?: any): Promise<any> {
    try {
      const response = await this.axiosInstance.get<ApiResponse<any>>(
        "/api/statistics/attendance-overview",
        { params },
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching attendance overview:", error);
      return { totalStudents: 0, attendanceRate: 0, overview: [] };
    }
  }

  async getAttendanceChart(params?: any): Promise<any> {
    try {
      const response = await this.axiosInstance.get<ApiResponse<any>>(
        "/api/statistics/attendance-chart",
        { params },
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching attendance chart:", error);
      return { labels: [], data: [] };
    }
  }

  async getStudentsAtRisk(params?: any): Promise<any> {
    try {
      const response = await this.axiosInstance.get<ApiResponse<any>>(
        "/api/statistics/students-at-risk",
        { params },
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching students at risk:", error);
      return { data: [], total: 0 };
    }
  }

  // Step 1: Call generate-comprehensive → returns JSON metadata with downloadUrl
  async generateAttendanceReport(
    params?: any,
  ): Promise<{ fileName: string; downloadUrl: string; recordCount: number }> {
    try {
      const response = await this.axiosInstance.post<ApiResponse<any>>(
        "/api/reports/generate-comprehensive",
        params,
      );
      const data = response.data?.data ?? response.data;
      if (!data?.downloadUrl && !data?.fileName) {
        throw new Error("Không nhận được đường dẫn tải xuống từ server");
      }
      return data;
    } catch (error: any) {
      console.error("Error generating report:", error);
      throw new Error(
        error?.response?.data?.message ||
          error?.message ||
          "Lỗi khi tạo báo cáo",
      );
    }
  }

  // Step 2: Download the generated file by fileName
  async downloadReport(fileName: string): Promise<Blob> {
    try {
      const response = await this.axiosInstance.get(
        `/api/reports/download/${encodeURIComponent(fileName)}`,
        { responseType: "blob" },
      );
      const blob: Blob = response.data;

      // Detect JSON error response wrapped as blob
      if (
        blob.type.includes("application/json") ||
        blob.type.includes("text/")
      ) {
        const text = await blob.text();
        try {
          const parsed = JSON.parse(text);
          throw new Error(parsed?.message || "Lỗi khi tải báo cáo");
        } catch {
          throw new Error(text || "Lỗi khi tải báo cáo");
        }
      }

      return blob;
    } catch (error: any) {
      if (error?.response?.data instanceof Blob) {
        const text = await error.response.data.text();
        try {
          const parsed = JSON.parse(text);
          throw new Error(parsed?.message || "Lỗi khi tải báo cáo");
        } catch {
          throw new Error("Lỗi khi tải báo cáo");
        }
      }
      console.error("Error downloading report:", error);
      throw error;
    }
  }

  // ==================== KNOWLEDGE BASE ====================

  async uploadKnowledgeBase(file: File): Promise<any> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await this.axiosInstance.post<ApiResponse<any>>(
      "/knowledge-base/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data.data;
  }

  async getKnowledgeBase(): Promise<any[]> {
    const response =
      await this.axiosInstance.get<ApiResponse<any[]>>("/knowledge-base");
    const data = response.data.data;
    const items = Array.isArray(data) ? data : data.data || [];

    // Map API response to frontend format
    return items.map((item: any) => {
      // Extract file type from document_name or file_path
      let fileType = "txt";
      const fileName = item.document_name || item.file_name || "";
      const ext = fileName.split(".").pop()?.toLowerCase();
      if (ext) {
        fileType = ext;
      }

      return {
        id: parseInt(item.id) || item.id,
        file_name: fileName,
        file_type: fileType,
        file_url: item.file_path || item.file_url || "",
        created_at: item.created_at,
        updated_at: item.updated_at || item.created_at,
        status: item.status,
        total_chunks: item.total_chunks,
      };
    });
  }

  async deleteKnowledgeBase(id: number): Promise<void> {
    await this.axiosInstance.delete(`/knowledge-base/${id}`);
  }

  // ==================== FACE RECOGNITION ====================

  async registerFace(studentId: number, file: File): Promise<any> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await this.axiosInstance.post<ApiResponse<any>>(
      `/face-recognition/register/${studentId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data.data;
  }

  async getStudentFaces(studentId: number): Promise<any> {
    const response = await this.axiosInstance.get<ApiResponse<any>>(
      `/face-recognition/student/${studentId}`,
    );
    return response.data.data;
  }

  async getMyFaces(): Promise<any> {
    const response = await this.axiosInstance.get<ApiResponse<any>>(
      "/face-recognition/me",
    );
    return response.data.data;
  }

  async deleteFace(faceId: number): Promise<any> {
    const response = await this.axiosInstance.delete<ApiResponse<any>>(
      `/face-recognition/faces/${faceId}`,
    );
    return response.data.data;
  }

  async attendanceByFace(
    sessionId: number,
    file: File,
    latitude?: number,
    longitude?: number,
  ): Promise<any> {
    const formData = new FormData();
    formData.append("file", file);
    if (latitude !== undefined)
      formData.append("latitude", latitude.toString());
    if (longitude !== undefined)
      formData.append("longitude", longitude.toString());

    const response = await this.axiosInstance.post<ApiResponse<any>>(
      `/face-recognition/attendance/${sessionId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data.data;
  }

  private getDefaultTrendData(
    period: "weekly" | "monthly",
  ): Array<{ name: string; value: number }> {
    if (period === "weekly") {
      return [
        { name: "T2", value: 88 },
        { name: "T3", value: 92 },
        { name: "T4", value: 89 },
        { name: "T5", value: 95 },
        { name: "T6", value: 91 },
        { name: "T7", value: 87 },
        { name: "CN", value: 84 },
      ];
    } else {
      const months = [];
      for (let i = 1; i <= 12; i++) {
        months.push({
          name: `T${i}`,
          value: Math.floor(Math.random() * 20) + 80,
        });
      }
      return months;
    }
  }

  async getRecentActivities(): Promise<
    Array<{
      id: string;
      type: string;
      message: string;
      timestamp: string;
      avatar: string;
    }>
  > {
    try {
      // Fetch recent notifications
      const notificationsRes = await this.axiosInstance.get<
        ApiResponse<Notification[]>
      >("/notifications/history");
      let notifications: Notification[] = [];

      if (Array.isArray(notificationsRes.data.data)) {
        notifications = notificationsRes.data.data as Notification[];
      } else if (
        notificationsRes.data.data &&
        typeof notificationsRes.data.data === "object"
      ) {
        const data = notificationsRes.data.data as any;
        notifications = Array.isArray(data.data) ? data.data : [];
      }

      // Map notifications to activity items
      return notifications.slice(0, 5).map((notif: any, idx: number) => ({
        id: notif.id?.toString() || `${idx}`,
        type: notif.notification_type || "notification",
        message: notif.message || notif.title || "Thông báo",
        timestamp: this.formatTimeAgo(notif.created_at),
        avatar: this.getActivityAvatar(notif.notification_type),
      }));
    } catch (error) {
      console.error("Error fetching recent activities:", error);
      return this.getDefaultActivities();
    }
  }

  private getDefaultActivities(): Array<{
    id: string;
    type: string;
    message: string;
    timestamp: string;
    avatar: string;
  }> {
    return [
      {
        id: "1",
        type: "attendance",
        message: "Quét điểm danh hệ thống hoàn tất",
        timestamp: "5 phút trước",
        avatar: "QD",
      },
      {
        id: "2",
        type: "alert",
        message: "Cảnh báo: 3 sinh viên được đánh dấu vắng mặt",
        timestamp: "15 phút trước",
        avatar: "CB",
      },
      {
        id: "3",
        type: "news",
        message: "Thông báo mới được công bố",
        timestamp: "2 giờ trước",
        avatar: "TB",
      },
      {
        id: "4",
        type: "system",
        message: "Sao lưu cơ sở dữ liệu hoàn tất",
        timestamp: "4 giờ trước",
        avatar: "SL",
      },
      {
        id: "5",
        type: "config",
        message: "Cấu hình điểm danh được cập nhật",
        timestamp: "1 ngày trước",
        avatar: "CF",
      },
    ];
  }

  private getActivityAvatar(type: string): string {
    const avatarMap: Record<string, string> = {
      attendance: "QD",
      warning: "CB",
      post: "TB",
      notification: "TB",
      system: "SL",
    };
    return avatarMap[type] || "TB";
  }

  private formatTimeAgo(dateString: string): string {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (seconds < 60) return "Vừa xong";
      if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
      if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
      return `${Math.floor(seconds / 86400)} ngày trước`;
    } catch {
      return "Vừa xong";
    }
  }
}

// Export a singleton instance
export const apiClient = new ApiClient();
