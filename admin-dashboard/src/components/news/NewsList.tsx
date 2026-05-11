import { useEffect, useState, useRef } from "react";
import {
  Trash2,
  Loader2,
  AlertCircle,
  Eye,
  Edit2,
  Upload,
  X,
  FileText,
  Image as ImageIcon,
  Archive,
} from "lucide-react";
import Card from "../common/Card";
import Button from "../common/Button";
import Badge from "../common/Badge";
import { apiClient } from "../../utils/apiClient";
import type { Post } from "../../types/api";

interface NewsListProps {
  refreshTrigger?: number;
}

export default function NewsList({ refreshTrigger = 0 }: NewsListProps) {
  const [news, setNews] = useState<Post[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [viewingPost, setViewingPost] = useState<Post | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [editedFiles, setEditedFiles] = useState<File[]>([]);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const fetchNews = async (pageNum: number = 1) => {
    try {
      setLoading(true);
      setError("");
      // Use getGlobalPosts to get actual POST data (not filtered from notifications)
      const response = await apiClient.getGlobalPosts(pageNum, limit);
      console.log("Fetched posts:", response);
      setNews(response.data || []);
      setTotal(response.total || 0);
      setPage(pageNum);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Lỗi khi tải danh sách bài viết";
      setError(errorMessage);
      console.error("Fetch posts error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch posts on component mount
  useEffect(() => {
    fetchNews(1);
  }, []);

  // Refetch when page or limit changes
  useEffect(() => {
    if (page > 0) {
      fetchNews(page);
    }
  }, [page, limit]);

  // Refetch when new post is created (refreshTrigger changes)
  useEffect(() => {
    if (refreshTrigger > 0) {
      console.log("Refreshing posts due to new post created");
      fetchNews(1);
    }
  }, [refreshTrigger]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa bài viết này?")) {
      return;
    }

    try {
      setDeletingId(id);
      // Delete using POST ID (not notification ID)
      await apiClient.deletePost(id);
      setNews(news.filter((item) => item.id !== id));
      setTotal(total - 1);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Lỗi khi xóa bài viết";
      setError(errorMessage);
    } finally {
      setDeletingId(null);
    }
  };

  const handleView = (post: Post) => {
    setViewingPost(post);
  };

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setEditTitle(post.title);
    setEditContent(post.content);
    setEditedFiles([]);
  };

  const handleEditFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (!files) return;
    const newFiles = Array.from(files);
    console.log("Files selected:", newFiles);
    setEditedFiles((prev) => [...prev, ...newFiles]);
    if (editFileInputRef.current) {
      editFileInputRef.current.value = "";
    }
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase() || "";
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) {
      return <ImageIcon className="w-4 h-4 text-blue-500" />;
    }
    if (ext === "pdf") {
      return <FileText className="w-4 h-4 text-red-500" />;
    }
    if (["doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(ext)) {
      return <FileText className="w-4 h-4 text-orange-500" />;
    }
    if (["zip", "rar"].includes(ext)) {
      return <Archive className="w-4 h-4 text-purple-500" />;
    }
    return <FileText className="w-4 h-4 text-gray-500" />;
  };

  const handleSaveEdit = async () => {
    if (!editingPost) return;

    try {
      setIsUpdating(true);
      console.log("Updating post:", editingPost.id, {
        title: editTitle,
        content: editContent,
      });

      await apiClient.updatePost(editingPost.id as any, {
        title: editTitle,
        content: editContent,
      });

      // Upload new files if any
      if (editedFiles.length > 0) {
        console.log("Uploading", editedFiles.length, "files...");
        for (const file of editedFiles) {
          try {
            console.log("Uploading file:", file.name);
            await apiClient.uploadPostMedia(editingPost.id, file, () => {});
          } catch (uploadErr) {
            console.error("File upload error:", uploadErr);
          }
        }
        console.log("All files uploaded");
      } else {
        console.log("No files to upload");
      }

      // Refetch all posts to get updated post with new files
      const updatedResponse = await apiClient.getGlobalPosts(page, limit);
      setNews(updatedResponse.data || []);

      setEditingPost(null);
      setEditedFiles([]);
      setError("");
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Lỗi khi cập nhật bài viết";
      setError(errorMessage);
      console.error("Save edit error:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  if (loading && news.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex justify-center items-center h-48">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900">
            Danh Sách Bài Viết
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Tổng cộng: <span className="font-bold">{total}</span> bài viết
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex gap-3 p-3 mb-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {news.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">Không có bài viết nào</p>
          </div>
        )}

        {/* News Table */}
        {news.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Tiêu đề
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Nội dung
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Loại
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Ngày tạo
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody>
                {news.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-gray-900">
                      <Badge variant="info">{item.id}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 truncate max-w-xs">
                        {item.title}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-600 truncate max-w-md">
                        {item.content}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="info">{item.recipient_type}</Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(item.published_at).toLocaleDateString("vi-VN", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex gap-2 justify-center">
                        <Button
                          onClick={() => handleView(item)}
                          variant="secondary"
                          size="sm"
                          className="inline-flex items-center gap-1"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleEdit(item)}
                          variant="secondary"
                          size="sm"
                          className="inline-flex items-center gap-1"
                          title="Sửa"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(item.id)}
                          variant="secondary"
                          size="sm"
                          disabled={deletingId === item.id}
                          className="inline-flex items-center gap-1"
                          title="Xóa"
                        >
                          {deletingId === item.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <label className="text-sm text-gray-700">
                Hiển thị:
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(parseInt(e.target.value, 10));
                    setPage(1);
                  }}
                  className="ml-2 px-2 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </label>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1 || loading}
                variant="secondary"
                size="sm"
              >
                Trước
              </Button>
              <div className="px-3 py-1 flex items-center text-sm text-gray-700">
                Trang {page}/{totalPages}
              </div>
              <Button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages || loading}
                variant="secondary"
                size="sm"
              >
                Sau
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* View Modal */}
      {viewingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <Card className="w-full max-w-2xl max-h-96 overflow-y-auto p-6 m-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Chi tiết bài viết</h2>
              <button
                onClick={() => setViewingPost(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Tiêu đề:
                </label>
                <p className="text-gray-900">{viewingPost?.title}</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Nội dung:
                </label>
                <p className="text-gray-900 whitespace-pre-wrap">
                  {viewingPost?.content}
                </p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Loại đối tượng:
                </label>
                <p className="text-gray-900">{viewingPost?.recipient_type}</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Tác giả:
                </label>
                <p className="text-gray-900">
                  {viewingPost?.author?.username || "N/A"}
                </p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Ngày công bố:
                </label>
                <p className="text-gray-900">
                  {viewingPost?.published_at &&
                    new Date(viewingPost.published_at).toLocaleDateString(
                      "vi-VN",
                    )}
                </p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Tệp đính kèm:
                </label>
                {viewingPost?.media && viewingPost.media.length > 0 ? (
                  <ul className="text-gray-900 space-y-1 mt-2">
                    {viewingPost.media.map((file: any, idx: number) => (
                      <li key={idx}>
                        <a
                          href={file.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm break-all"
                        >
                          📄 {file.original_filename || `File ${idx + 1}`}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm">Không có tệp đính kèm</p>
                )}
              </div>
            </div>

            <div className="mt-6 flex gap-2 justify-end">
              <Button
                onClick={() => setViewingPost(null)}
                variant="secondary"
                size="sm"
              >
                Đóng
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Edit Modal */}
      {editingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <Card className="w-full max-w-2xl max-h-96 overflow-y-auto p-6 m-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Sửa bài viết</h2>
              <button
                onClick={() => setEditingPost(null)}
                className="text-gray-500 hover:text-gray-700"
                disabled={isUpdating}
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tiêu đề
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  disabled={isUpdating}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nội dung
                </label>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  disabled={isUpdating}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tệp đính kèm hiện tại:
                </label>
                {editingPost?.media && editingPost.media.length > 0 ? (
                  <ul className="text-gray-900 space-y-1 bg-gray-50 p-3 rounded border border-gray-200 max-h-32 overflow-y-auto">
                    {editingPost.media.map((file: any, idx: number) => (
                      <li key={idx} className="text-sm flex items-center gap-2">
                        {getFileIcon(file.original_filename || "")}
                        <a
                          href={file.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline break-all flex-1"
                        >
                          {file.original_filename || `File ${idx + 1}`}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm">Không có tệp đính kèm</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thêm tệp mới:
                </label>
                <input
                  ref={editFileInputRef}
                  type="file"
                  multiple
                  onChange={handleEditFileSelect}
                  disabled={isUpdating}
                  accept="image/jpeg,image/png,image/gif,image/webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/zip,application/x-rar-compressed"
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    console.log("Clicking file input button");
                    editFileInputRef.current?.click();
                  }}
                  disabled={isUpdating}
                  className="flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Chọn File
                </Button>
                <p className="text-xs text-gray-500 mt-1">
                  Max 50MB. Hỗ trợ: Ảnh, PDF, Word, Excel, PowerPoint, Archive
                </p>
                {editedFiles.length > 0 && (
                  <div className="mt-2 space-y-1 bg-blue-50 p-3 rounded border border-blue-200">
                    <p className="text-xs font-semibold text-blue-700 mb-2">
                      📁 {editedFiles.length} file(s) được chọn:
                    </p>
                    {editedFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2 bg-white rounded border border-blue-200"
                      >
                        {getFileIcon(file.name)}
                        <span className="text-sm text-gray-700 flex-1 truncate">
                          {file.name}
                        </span>
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setEditedFiles((prev) =>
                              prev.filter((_, i) => i !== idx),
                            );
                          }}
                          disabled={isUpdating}
                          className="flex-shrink-0 p-1 hover:bg-red-50 rounded text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex gap-2 justify-end">
              <Button
                onClick={() => setEditingPost(null)}
                variant="secondary"
                size="sm"
                disabled={isUpdating}
              >
                Hủy
              </Button>
              <Button
                onClick={handleSaveEdit}
                variant="primary"
                size="sm"
                disabled={isUpdating}
                className="flex items-center gap-2"
              >
                {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
                Lưu
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
