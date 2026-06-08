import React, { useState, useEffect } from "react";
import { Upload, Trash2, File, AlertCircle } from "lucide-react";
import AdminLayout from "../layouts/AdminLayout";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import { apiClient } from "../utils/apiClient";
import { StatusBadge } from "../components/common/Badge";

interface KnowledgeBaseItem {
  id: number | string;
  file_url: string;
  file_name: string;
  file_type: string;
  file_size?: number;
  created_at?: string;
  updated_at?: string;
  status?: boolean;
  total_chunks?: number;
}

const KnowledgeBasePage: React.FC = () => {
  const [documents, setDocuments] = useState<KnowledgeBaseItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadedFile, setUploadedFile] = useState<string>("");

  const fetchDocuments = async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await apiClient.getKnowledgeBase();
      setDocuments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khi tải dữ liệu");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "text/plain",
    ];

    if (!validTypes.includes(file.type)) {
      alert("Chỉ chấp nhận file PDF, Word hoặc TXT!");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await apiClient.uploadKnowledgeBase(file);
      setUploadedFile(file.name);
      await fetchDocuments();
      setTimeout(() => setUploadedFile(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khi upload file");
    } finally {
      setIsLoading(false);
      e.target.value = "";
    }
  };

  const handleDeleteDocument = async (id: number | string) => {
    if (!window.confirm("Bạn có chắc muốn xóa tài liệu này?")) return;

    try {
      await apiClient.deleteKnowledgeBase(
        typeof id === "string" ? parseInt(id) : id,
      );
      await fetchDocuments();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Lỗi khi xóa");
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case "pdf":
        return "📄";
      case "doc":
      case "docx":
        return "📝";
      case "txt":
        return "📋";
      default:
        return "📎";
    }
  };

  const getFileSize = (bytes?: number) => {
    if (!bytes) return "N/A";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <AdminLayout topbarTitle="Kho AI Content">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Kho Lưu Trữ Tài Liệu AI
          </h1>
          <p className="text-gray-600 mt-1">
            Quản lý các tài liệu PDF, Word, TXT cho hệ thống AI chat
          </p>
        </div>

        {/* Upload Section */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Tải Lên Tài Liệu</h2>

          <div
            onClick={() =>
              document.getElementById("knowledge-file-input")?.click()
            }
            className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition"
          >
            <input
              id="knowledge-file-input"
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileUpload}
              disabled={isLoading}
              className="hidden"
            />
            <Upload size={48} className="mx-auto text-gray-400 mb-3" />
            <p className="text-lg font-medium text-gray-900">
              Kéo thả hoặc nhấp để tải lên
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Hỗ trợ: PDF, Word (DOC/DOCX), TXT
            </p>
            {uploadedFile && (
              <p className="text-sm text-green-600 mt-3 font-medium">
                ✓ {uploadedFile} - Upload thành công!
              </p>
            )}
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0" />
              <p className="text-red-700">{error}</p>
            </div>
          )}
        </Card>

        {/* Documents List */}
        <Card>
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold">
              Tài Liệu Đã Upload ({documents.length})
            </h2>
          </div>

          {isLoading && documents.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <p>Đang tải dữ liệu...</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <File size={48} className="mx-auto mb-3 opacity-50" />
              <p>Chưa có tài liệu nào được upload</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 flex items-center justify-between hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-3xl">{getFileIcon(doc.file_type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {doc.file_name}
                      </p>
                      <div className="flex gap-3 mt-1 text-sm text-gray-600">
                        <span>
                          {doc.file_type.toUpperCase()} •{" "}
                          {doc.file_size
                            ? getFileSize(doc.file_size)
                            : doc.total_chunks
                              ? `${doc.total_chunks} chunks`
                              : "N/A"}
                        </span>
                        {doc.created_at && (
                          <span>
                            Upload:{" "}
                            {new Date(doc.created_at).toLocaleDateString(
                              "vi-VN",
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusBadge status={doc.status ? "success" : "warning"}>
                      {doc.status ? "Active" : "Inactive"}
                    </StatusBadge>
                    <button
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="text-red-600 hover:text-red-800 transition p-2 hover:bg-red-50 rounded-lg"
                      title="Xóa tài liệu"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Information Card */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <AlertCircle className="text-blue-600" size={20} />
            Thông Tin Hữu Ích
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>
              • Các tài liệu được upload sẽ được sử dụng để huấn luyện hệ thống
              AI chat
            </li>
            <li>• Hỗ trợ các định dạng: PDF, Word (DOC/DOCX), Text (TXT)</li>
            <li>• Dung lượng tối đa mỗi file: 50 MB</li>
            <li>• Các tài liệu được lưu trữ an toàn trên server</li>
            <li>• Bạn có thể xóa tài liệu bất kỳ lúc nào</li>
          </ul>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default KnowledgeBasePage;
