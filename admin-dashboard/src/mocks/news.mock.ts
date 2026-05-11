import type { Post } from "../types/api";

export const publishedPosts: Post[] = [
  {
    id: 1,
    title: "Thông báo lịch học lại",
    content: "Từ ngày 1/5/2026, các lớp sẽ bắt đầu học lại tại phòng máy.",
    author_id: 1,
    recipient_type: "ALL_STUDENTS",
    status: "PUBLISHED",
    published_at: "2026-04-25T10:00:00Z",
    created_at: "2026-04-25T10:00:00Z",
    updated_at: "2026-04-25T10:00:00Z",
    author: {
      id: 1,
      username: "admin",
    },
  },
  {
    id: 2,
    title: "Cập nhật thư viện mới",
    content: "Thư viện mới đã mở cửa phục vụ sinh viên hàng ngày.",
    author_id: 2,
    recipient_type: "ALL_STUDENTS",
    status: "PUBLISHED",
    published_at: "2026-04-20T14:30:00Z",
    created_at: "2026-04-20T14:30:00Z",
    updated_at: "2026-04-20T14:30:00Z",
    author: {
      id: 2,
      username: "lecturer",
    },
  },
  {
    id: 3,
    title: "Chương trình thực tập công nghiệp",
    content: "Khóa thực tập công nghiệp năm 2026 đã bắt đầu đăng ký.",
    author_id: 1,
    recipient_type: "ALL_STUDENTS",
    status: "PUBLISHED",
    published_at: "2026-04-15T09:00:00Z",
    created_at: "2026-04-15T09:00:00Z",
    updated_at: "2026-04-15T09:00:00Z",
    author: {
      id: 1,
      username: "admin",
    },
  },
];

export const postFormInitialState = {
  title: "",
  content: "",
  recipient_type: "ALL_STUDENTS" as const,
  course_class_id: undefined as number | undefined,
  media_urls: undefined as string[] | undefined,
};
