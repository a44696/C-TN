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
    return response.data.data.data;
  }

  async uploadLecturersExcel(file: File): Promise<Lecturer[]> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await this.axiosInstance.post<ApiResponse<Lecturer[]>>(
      "/lecturers/import/excel",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    const responseData = response.data.data;
    return Array.isArray(responseData) ? responseData : responseData.data;
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
}

// Export a singleton instance
export const apiClient = new ApiClient();
