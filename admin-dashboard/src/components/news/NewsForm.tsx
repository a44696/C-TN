import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Loader2,
  AlertCircle,
  Upload,
  X,
  FileText,
  Image as ImageIcon,
  Archive,
} from "lucide-react";
import Card from "../common/Card";
import Button from "../common/Button";
import Input from "../common/Input";
import { apiClient } from "../../utils/apiClient";
import {
  type PostRecipientType,
  type CreatePostPayload,
} from "../../types/api";

const RECIPIENT_TYPES: { value: PostRecipientType; label: string }[] = [
  { value: "ALL_STUDENTS", label: "Tất cả sinh viên" },
  { value: "BY_DEPARTMENT", label: "Theo khoa" },
  { value: "SPECIFIC_CLASSES", label: "Theo lớp học phần" },
];

// File validation constants
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/zip",
  "application/x-rar-compressed",
];

interface UploadedFile {
  file: File;
  progress: number;
  error?: string;
  success?: boolean;
  fileUrl?: string;
}

interface NewsFormProps {
  onSuccess?: (message: string, recipientCount: number) => void;
  onPostsUpdated?: () => Promise<void>;
}

export default function NewsForm({ onSuccess, onPostsUpdated }: NewsFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [recipientType, setRecipientType] =
    useState<PostRecipientType>("ALL_STUDENTS");
  const [courseClassId, setCourseClassId] = useState<number | undefined>();
  const [allDepartments, setAllDepartments] = useState<string[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [courseClasses, setCourseClasses] = useState<
    Array<{ id: number; name: string }>
  >([]);
  const [selectedFiles, setSelectedFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [postId, setPostId] = useState<number | null>(null);

  // Fetch course classes if user is lecturer
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.role === "LECTURER" || user.role === "ADMIN") {
      apiClient
        .getCourseClasses({ page: 1, limit: 100 })
        .then((response) => {
          const classes = response.data.map((c: any) => ({
            id: c.id,
            name: `${c.subject_id} - ${c.room}`,
          }));
          setCourseClasses(classes);
        })
        .catch(() => {
          // Handle error silently
        });
    }
  }, []);

  // Fetch departments from API
  useEffect(() => {
    apiClient
      .getStudentDepartments()
      .then((departments) => {
        setAllDepartments(departments);
      })
      .catch(() => {
        // Handle error silently
      });
  }, []);

  // Validation function
  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `File "${file.name}" vượt quá 50MB`;
    }
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return `Loại file "${file.name}" không được hỗ trợ`;
    }
    return null;
  };

  // Get file icon based on mime type
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) {
      return <ImageIcon className="w-5 h-5 text-blue-500" />;
    }
    if (mimeType === "application/pdf") {
      return <FileText className="w-5 h-5 text-red-500" />;
    }
    if (
      mimeType.includes("word") ||
      mimeType.includes("document") ||
      mimeType.includes("excel") ||
      mimeType.includes("spreadsheet") ||
      mimeType.includes("powerpoint") ||
      mimeType.includes("presentation")
    ) {
      return <FileText className="w-5 h-5 text-orange-500" />;
    }
    if (mimeType.includes("zip") || mimeType.includes("rar")) {
      return <Archive className="w-5 h-5 text-purple-500" />;
    }
    return <FileText className="w-5 h-5 text-gray-500" />;
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (!files) return;

    const newFiles: UploadedFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validationError = validateFile(file);

      newFiles.push({
        file,
        progress: 0,
        error: validationError || undefined,
        success: false,
      });
    }

    setSelectedFiles((prev) => [...prev, ...newFiles]);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Upload file with specific postId
  const uploadFile = async (fileIndex: number, postIdToUse: number) => {
    const uploadedFile = selectedFiles[fileIndex];
    if (!uploadedFile || uploadedFile.error || uploadedFile.success) return;

    try {
      const fileData = await apiClient.uploadPostMedia(
        postIdToUse,
        uploadedFile.file,
        (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded / (progressEvent.total || 1)) * 100,
          );
          setSelectedFiles((prev) => {
            const updated = [...prev];
            updated[fileIndex] = { ...updated[fileIndex], progress };
            return updated;
          });
        },
      );

      setSelectedFiles((prev) => {
        const updated = [...prev];
        updated[fileIndex] = {
          ...updated[fileIndex],
          success: true,
          fileUrl: fileData.file_url,
          progress: 100,
        };
        return updated;
      });
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || err.message || "Lỗi khi upload file";
      setSelectedFiles((prev) => {
        const updated = [...prev];
        updated[fileIndex] = {
          ...updated[fileIndex],
          error: errorMsg,
          success: false,
        };
        return updated;
      });
    }
  };

  // Handle explicit file upload
  const handleUploadFiles = async () => {
    if (!postId || !selectedFiles.some((f) => !f.error && !f.success)) {
      return;
    }

    setUploading(true);
    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        if (!selectedFiles[i].error && !selectedFiles[i].success) {
          await uploadFile(i, postId);
        }
      }

      // Refetch posts to show uploaded files
      if (onPostsUpdated) {
        await onPostsUpdated();
      }
    } finally {
      setUploading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setTitle("");
    setContent("");
    setRecipientType("ALL_STUDENTS");
    setCourseClassId(undefined);
    setSelectedDepartments([]);
    setSelectedFiles([]);
    setPostId(null);
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!title.trim() || !content.trim()) {
      setError("Vui lòng điền tiêu đề và nội dung");
      return;
    }

    if (title.length < 5 || title.length > 255) {
      setError("Tiêu đề phải từ 5-255 ký tự");
      return;
    }

    if (content.length < 10 || content.length > 5000) {
      setError("Nội dung phải từ 10-5000 ký tự");
      return;
    }

    if (recipientType === "SPECIFIC_CLASSES" && !courseClassId) {
      setError("Vui lòng chọn lớp học phần");
      return;
    }

    if (recipientType === "BY_DEPARTMENT" && selectedDepartments.length === 0) {
      setError("Vui lòng chọn ít nhất một khoa");
      return;
    }

    try {
      setLoading(true);
      const payload: CreatePostPayload = {
        title: title.trim(),
        content: content.trim(),
        recipient_type: recipientType,
      };

      if (recipientType === "SPECIFIC_CLASSES" && courseClassId) {
        payload.course_class_id = courseClassId;
      }

      if (recipientType === "BY_DEPARTMENT" && selectedDepartments.length > 0) {
        payload.department_names = selectedDepartments;
      }

      const response = await apiClient.createPost(payload);

      const newPostId = response.data.id;
      // Store post ID for file upload
      setPostId(newPostId);

      setSuccess(`${response.message} (${response.recipientCount} người nhận)`);

      if (onSuccess) {
        onSuccess(response.message, response.recipientCount);
      }

      // Reset post-related fields but keep files for upload
      setTitle("");
      setContent("");
      setRecipientType("ALL_STUDENTS");
      setCourseClassId(undefined);
      setSelectedDepartments([]);
      // Don't auto-upload - let user click Upload button explicitly
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Lỗi khi gửi bài viết";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isLecturer = user.role === "LECTURER";

  return (
    <Card className="p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-6">Gửi Thông Báo</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error Message */}
        {error && (
          <div className="flex gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="flex gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5">✓</div>
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        {/* Only show form inputs if no post created yet */}
        {!postId ? (
          <>
            {/* Title Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiêu đề
              </label>
              <Input
                type="text"
                placeholder="Nhập tiêu đề (5-255 ký tự)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading}
                maxLength={255}
              />
              <p className="text-xs text-gray-500 mt-1">{title.length}/255</p>
            </div>

            {/* Content Textarea */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nội dung
              </label>
              <textarea
                placeholder="Nhập nội dung (10-5000 ký tự)"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={loading}
                maxLength={5000}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1">
                {content.length}/5000
              </p>
            </div>

            {/* Recipient Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gửi cho
              </label>
              <select
                value={recipientType}
                onChange={(e) =>
                  setRecipientType(e.target.value as PostRecipientType)
                }
                disabled={loading || isLecturer}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                {RECIPIENT_TYPES.map((type) => (
                  <option
                    key={type.value}
                    value={type.value}
                    disabled={isLecturer && type.value !== "SPECIFIC_CLASSES"}
                  >
                    {type.label}
                  </option>
                ))}
              </select>
              {isLecturer && (
                <p className="text-xs text-gray-500 mt-1">
                  Giảng viên chỉ có thể gửi cho lớp học phần
                </p>
              )}
            </div>

            {/* Course Class Selection */}
            {recipientType === "SPECIFIC_CLASSES" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lớp học phần
                </label>
                <select
                  value={courseClassId || ""}
                  onChange={(e) =>
                    setCourseClassId(
                      e.target.value ? parseInt(e.target.value) : undefined,
                    )
                  }
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="">Chọn lớp học phần...</option>
                  {courseClasses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Department Selection */}
            {recipientType === "BY_DEPARTMENT" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Chọn Khoa/Phòng Ban
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3 bg-gray-50">
                  {allDepartments.map((dept) => (
                    <label
                      key={dept}
                      className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-2 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={selectedDepartments.includes(dept)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedDepartments([
                              ...selectedDepartments,
                              dept,
                            ]);
                          } else {
                            setSelectedDepartments(
                              selectedDepartments.filter((d) => d !== dept),
                            );
                          }
                        }}
                        disabled={loading}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{dept}</span>
                    </label>
                  ))}
                </div>
                {selectedDepartments.length > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    Đã chọn: {selectedDepartments.length} khoa
                  </p>
                )}
              </div>
            )}
          </>
        ) : (
          // Show post created message
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm font-medium text-green-800">
              ✓ Thông báo đã được tạo thành công!
            </p>
            <p className="text-sm text-green-700 mt-1">
              Bây giờ bạn có thể tải lên tệp đính kèm (tùy chọn).
            </p>
          </div>
        )}

        {/* File Upload Section - Always visible */}
        <div className="border-t pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            📎 Tệp đính kèm (Tùy chọn)
          </label>

          <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              💡 Chọn file ngay bây giờ, file sẽ được tải lên sau khi bạn gửi
              thông báo.
            </p>
          </div>

          {/* File Input */}
          <div className="mb-3">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              disabled={uploading || loading}
              accept={ALLOWED_MIME_TYPES.join(",")}
              className="hidden"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || loading}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Chọn File
            </Button>
            <p className="text-xs text-gray-500 mt-1">
              Max 50MB. Hỗ trợ: Ảnh, PDF, Word, Excel, PowerPoint, Archive
            </p>
          </div>

          {/* Selected Files List */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2 bg-gray-50 p-3 rounded-lg border border-gray-200 max-h-48 overflow-y-auto">
              {selectedFiles.map((uploadedFile, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 bg-white rounded border border-gray-200"
                >
                  {/* File Icon */}
                  <div className="flex-shrink-0">
                    {getFileIcon(uploadedFile.file.type)}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">
                      {uploadedFile.file.name}
                    </p>
                    {uploadedFile.error && (
                      <p className="text-xs text-red-600">
                        {uploadedFile.error}
                      </p>
                    )}
                    {uploadedFile.success && (
                      <p className="text-xs text-green-600">
                        ✓ Tải lên thành công
                      </p>
                    )}
                    {!uploadedFile.error &&
                      !uploadedFile.success &&
                      uploading && (
                        <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                          <div
                            className="bg-blue-500 h-1 rounded-full transition-all"
                            style={{ width: `${uploadedFile.progress}%` }}
                          />
                        </div>
                      )}
                    {!uploadedFile.error &&
                      !uploadedFile.success &&
                      !uploading && (
                        <p className="text-xs text-gray-500">Chờ upload...</p>
                      )}
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFiles((prev) =>
                        prev.filter((_, i) => i !== index),
                      );
                    }}
                    disabled={uploading || uploadedFile.success}
                    className="flex-shrink-0 p-1 hover:bg-red-50 rounded text-red-500 disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          {!postId ? (
            <>
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={loading || uploading}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Gửi Thông Báo
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="md"
                disabled={loading}
                onClick={resetForm}
              >
                Xóa
              </Button>
            </>
          ) : (
            <>
              {/* Show upload button if there are files waiting to upload */}
              {selectedFiles.some((f) => !f.error && !f.success) && (
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  disabled={uploading}
                  onClick={handleUploadFiles}
                  className="flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Đang tải lên...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Tải Lên File
                    </>
                  )}
                </Button>
              )}
              <Button
                type="button"
                variant="secondary"
                size="md"
                disabled={uploading || selectedFiles.some((f) => !f.error && !f.success)}
                onClick={resetForm}
              >
                Xong & Tạo Thông Báo Mới
              </Button>
            </>
          )}
        </div>
      </form>
    </Card>
  );
}
