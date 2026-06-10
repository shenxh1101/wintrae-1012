import { useState, useMemo } from "react";
import {
  FileText,
  FileSignature,
  ShieldCheck,
  ClipboardCheck,
  Truck,
  Download,
  Eye,
  Archive,
  Upload,
  Grid3x3,
  List,
  Search,
  X,
  Tag,
  FolderOpen,
} from "lucide-react";
import { useAppStore } from "../store";
import type { DocumentCategory, Document } from "../types";
import {
  documentCategoryLabel,
  documentCategoryColor,
  formatFileSize,
  formatDate,
  cn,
} from "../utils";
import { StatusBadge } from "../components/shared/StatusBadge";

type CategoryFilter = "all" | DocumentCategory;
type ViewMode = "grid" | "list";

const categoryIcons: Record<DocumentCategory, typeof FileText> = {
  contract: FileSignature,
  insurance: ShieldCheck,
  inspection: ClipboardCheck,
  transport: Truck,
  other: FileText,
};

const categoryOptions: { key: CategoryFilter; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "contract", label: "合同" },
  { key: "insurance", label: "保险" },
  { key: "inspection", label: "验收报告" },
  { key: "transport", label: "运输单据" },
  { key: "other", label: "其他" },
];

export default function Documents() {
  const documents = useAppStore((state) => state.documents);
  const applications = useAppStore((state) => state.applications);
  const addDocument = useAppStore((state) => state.addDocument);
  const updateDocument = useAppStore((state) => state.updateDocument);

  const [keyword, setKeyword] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [applicationFilter, setApplicationFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "contract" as DocumentCategory,
    application_id: "",
    file_name: "",
    description: "",
    tags: "",
  });

  const handlePreview = (doc: Document) => {
    setPreviewDocument(doc);
  };

  const handleDownload = (doc: Document) => {
    const link = document.createElement("a");
    link.href = doc.file_url || "#";
    link.download = doc.name;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleArchive = (doc: Document) => {
    updateDocument(doc.id, { archived: !doc.archived });
  };

  const categoryCounts = useMemo(() => {
    const counts: Record<CategoryFilter, number> = {
      all: documents.length,
      contract: 0,
      insurance: 0,
      inspection: 0,
      transport: 0,
      other: 0,
    };
    documents.forEach((doc) => {
      counts[doc.category] = (counts[doc.category] || 0) + 1;
    });
    return counts;
  }, [documents]);

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesKeyword =
        !keyword ||
        doc.name.toLowerCase().includes(keyword.toLowerCase()) ||
        doc.tags.some((t) => t.toLowerCase().includes(keyword.toLowerCase()));
      const matchesCategory = categoryFilter === "all" || doc.category === categoryFilter;
      const matchesApplication =
        applicationFilter === "all" || doc.application_id === applicationFilter;
      return matchesKeyword && matchesCategory && matchesApplication;
    });
  }, [documents, keyword, categoryFilter, applicationFilter]);

  const getApplicationName = (appId?: string) => {
    if (!appId) return "—";
    const app = applications.find((a) => a.id === appId);
    return app ? app.exhibition_name : "—";
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, file_name: e.target.files[0].name });
      if (!formData.name) {
        setFormData({ ...formData, name: e.target.files[0].name, file_name: e.target.files[0].name });
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addDocument({
      name: formData.name,
      category: formData.category,
      application_id: formData.application_id || undefined,
      file_url: "#",
      file_size: Math.floor(Math.random() * 5000000) + 100000,
      description: formData.description,
      tags: formData.tags.split(/[,，]/).map((t) => t.trim()).filter(Boolean),
      version: "v1.0",
      archived: false,
    });
    setFormData({
      name: "",
      category: "contract",
      application_id: "",
      file_name: "",
      description: "",
      tags: "",
    });
    setShowUploadModal(false);
  };

  return (
    <div className="min-h-screen bg-cream-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="section-title">文档中心</h1>
            <p className="section-subtitle">管理借展流程中的合同、保险、验收报告等各类文档</p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn-gallery-primary flex items-center gap-2"
          >
            <Upload size={16} />
            上传文档
          </button>
        </div>

        <div className="card-gallery p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40"
              />
              <input
                type="text"
                placeholder="搜索文档名称、标签..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="input-gallery pl-10"
              />
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <FolderOpen
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40"
                />
                <select
                  value={applicationFilter}
                  onChange={(e) => setApplicationFilter(e.target.value)}
                  className="input-gallery pl-9 pr-8 appearance-none cursor-pointer min-w-[180px]"
                >
                  <option value="all">全部借展</option>
                  {applications.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.exhibition_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex rounded-gallery border border-ink/15 overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "px-3 py-2 transition-all duration-200 flex items-center gap-1.5",
                    viewMode === "grid"
                      ? "bg-gold-400 text-ink-900"
                      : "bg-white text-ink/60 hover:bg-ink/5"
                  )}
                >
                  <Grid3x3 size={16} />
                  <span className="text-sm hidden sm:inline">网格</span>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "px-3 py-2 transition-all duration-200 flex items-center gap-1.5 border-l border-ink/10",
                    viewMode === "list"
                      ? "bg-gold-400 text-ink-900"
                      : "bg-white text-ink/60 hover:bg-ink/5"
                  )}
                >
                  <List size={16} />
                  <span className="text-sm hidden sm:inline">列表</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {categoryOptions.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setCategoryFilter(cat.key)}
              className={cn(
                "tag-gallery px-4 py-1.5 border transition-all duration-200 cursor-pointer",
                categoryFilter === cat.key
                  ? "bg-ink text-cream border-ink"
                  : "bg-white text-ink/70 border-ink/15 hover:border-ink/30"
              )}
            >
              {cat.label}
              <span
                className={cn(
                  "ml-2 text-xs",
                  categoryFilter === cat.key ? "text-cream/70" : "text-ink/40"
                )}
              >
                {categoryCounts[cat.key] || 0}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-ink/50">
            共找到 <span className="font-medium text-ink">{filteredDocuments.length}</span> 个文档
          </p>
        </div>

        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredDocuments.map((doc) => {
              const IconComp = categoryIcons[doc.category];
              return (
                <div
                  key={doc.id}
                  className="card-gallery overflow-hidden group relative animate-slide-up"
                >
                  <div className="absolute top-0 right-0 left-0 z-10 bg-gradient-to-b from-ink/50 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={(e) => { e.stopPropagation(); handlePreview(doc); }}
                        className="p-2 rounded-gallery bg-white/90 text-ink hover:bg-white transition-colors"
                        title="预览"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDownload(doc); }}
                        className="p-2 rounded-gallery bg-white/90 text-ink hover:bg-white transition-colors"
                        title="下载"
                      >
                        <Download size={14} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleArchive(doc); }}
                        className={cn(
                          "p-2 rounded-gallery transition-colors",
                          doc.archived
                            ? "bg-gold-100 text-gold-600 hover:bg-gold-200"
                            : "bg-white/90 text-ink hover:bg-white"
                        )}
                        title={doc.archived ? "取消归档" : "归档"}
                      >
                        <Archive size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="aspect-[4/3] bg-gradient-to-br from-cream-50 to-ink-50 flex items-center justify-center relative">
                    <div
                      className={cn(
                        "w-16 h-16 rounded-2xl flex items-center justify-center",
                        doc.category === "contract" && "bg-moss-50 text-moss-500",
                        doc.category === "insurance" && "bg-gold-50 text-gold-500",
                        doc.category === "inspection" && "bg-slate-100 text-slate-500",
                        doc.category === "transport" && "bg-slate-50 text-slate-500",
                        doc.category === "other" && "bg-ink-50 text-ink-500"
                      )}
                    >
                      <IconComp size={28} />
                    </div>
                    <div className="absolute top-3 left-3">
                      <StatusBadge
                        label={documentCategoryLabel[doc.category]}
                        className={cn(documentCategoryColor[doc.category], "border")}
                      />
                    </div>
                    {doc.archived && (
                      <div className="absolute top-3 right-3">
                        <StatusBadge
                          label="已归档"
                          className="bg-ink-50 text-ink-500 border-ink-100 border"
                        />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-display text-base font-semibold text-ink mb-2 truncate">
                      {doc.name}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-ink/50 mb-3">
                      <span>{doc.version}</span>
                      <span>{formatFileSize(doc.file_size)}</span>
                      <span>{formatDate(doc.uploaded_at)}</span>
                    </div>
                    {doc.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {doc.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="tag-gallery bg-ink-50 text-ink-500 border border-ink-100"
                          >
                            <Tag size={10} className="mr-1" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="card-gallery overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-cream-50 border-b border-ink/10">
                    <th className="text-left text-xs font-medium text-ink/60 tracking-wide px-4 py-3">
                      文件名
                    </th>
                    <th className="text-left text-xs font-medium text-ink/60 tracking-wide px-4 py-3">
                      分类
                    </th>
                    <th className="text-left text-xs font-medium text-ink/60 tracking-wide px-4 py-3">
                      关联借展
                    </th>
                    <th className="text-left text-xs font-medium text-ink/60 tracking-wide px-4 py-3">
                      大小
                    </th>
                    <th className="text-left text-xs font-medium text-ink/60 tracking-wide px-4 py-3">
                      版本
                    </th>
                    <th className="text-left text-xs font-medium text-ink/60 tracking-wide px-4 py-3">
                      上传日期
                    </th>
                    <th className="text-left text-xs font-medium text-ink/60 tracking-wide px-4 py-3">
                      状态
                    </th>
                    <th className="text-right text-xs font-medium text-ink/60 tracking-wide px-4 py-3">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocuments.map((doc) => {
                    const IconComp = categoryIcons[doc.category];
                    return (
                      <tr
                        key={doc.id}
                        className="border-b border-ink/5 last:border-0 hover:bg-cream-50/50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                                doc.category === "contract" && "bg-moss-50 text-moss-500",
                                doc.category === "insurance" && "bg-gold-50 text-gold-500",
                                doc.category === "inspection" && "bg-slate-100 text-slate-500",
                                doc.category === "transport" && "bg-slate-50 text-slate-500",
                                doc.category === "other" && "bg-ink-50 text-ink-500"
                              )}
                            >
                              <IconComp size={16} />
                            </div>
                            <span className="text-sm font-medium text-ink truncate max-w-[200px]">
                              {doc.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge
                            label={documentCategoryLabel[doc.category]}
                            className={cn(documentCategoryColor[doc.category], "border")}
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-ink/70 truncate max-w-[180px]">
                          {getApplicationName(doc.application_id)}
                        </td>
                        <td className="px-4 py-3 text-sm text-ink/70">
                          {formatFileSize(doc.file_size)}
                        </td>
                        <td className="px-4 py-3 text-sm text-ink/70">{doc.version}</td>
                        <td className="px-4 py-3 text-sm text-ink/70">
                          {formatDate(doc.uploaded_at)}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge
                            label={doc.archived ? "已归档" : "未归档"}
                            className={cn(
                              "border",
                              doc.archived
                                ? "bg-ink-50 text-ink-500 border-ink-100"
                                : "bg-moss-50 text-moss-400 border-moss-200"
                            )}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handlePreview(doc)}
                              className="p-1.5 rounded-gallery text-ink/50 hover:text-ink hover:bg-ink/5 transition-colors"
                              title="预览"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              onClick={() => handleDownload(doc)}
                              className="p-1.5 rounded-gallery text-ink/50 hover:text-ink hover:bg-ink/5 transition-colors"
                              title="下载"
                            >
                              <Download size={15} />
                            </button>
                            <button
                              onClick={() => handleArchive(doc)}
                              className={cn(
                                "p-1.5 rounded-gallery transition-colors",
                                doc.archived
                                  ? "text-gold-600 bg-gold-50 hover:bg-gold-100"
                                  : "text-ink/50 hover:text-ink hover:bg-ink/5"
                              )}
                              title={doc.archived ? "取消归档" : "归档"}
                            >
                              <Archive size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {filteredDocuments.length === 0 && (
          <div className="card-gallery p-16 text-center">
            <FileText size={48} className="mx-auto text-ink/20 mb-4" />
            <p className="text-ink/50">未找到符合条件的文档</p>
          </div>
        )}
      </div>

      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm animate-fade-in"
            onClick={() => setShowUploadModal(false)}
          />
          <div className="relative w-full max-w-lg bg-cream-50 rounded-gallery shadow-gallery-lg animate-slide-in-right overflow-hidden">
            <div className="bg-cream-50/95 backdrop-blur-sm border-b border-ink/10 px-6 py-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold text-ink">上传文档</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="btn-gallery-ghost p-2"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="label-gallery">文件名称 *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input-gallery"
                  placeholder="请输入文件名称"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-gallery">文档分类 *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="input-gallery appearance-none cursor-pointer"
                    required
                  >
                    {(["contract", "insurance", "inspection", "transport", "other"] as DocumentCategory[]).map(
                      (cat) => (
                        <option key={cat} value={cat}>
                          {documentCategoryLabel[cat]}
                        </option>
                      )
                    )}
                  </select>
                </div>
                <div>
                  <label className="label-gallery">关联借展</label>
                  <select
                    name="application_id"
                    value={formData.application_id}
                    onChange={handleInputChange}
                    className="input-gallery appearance-none cursor-pointer"
                  >
                    <option value="">不关联</option>
                    {applications.map((app) => (
                      <option key={app.id} value={app.id}>
                        {app.exhibition_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="label-gallery">上传文件 *</label>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-ink/15 rounded-gallery cursor-pointer bg-white hover:bg-cream-50 transition-colors">
                  <Upload size={24} className="text-ink/40 mb-2" />
                  <p className="text-sm text-ink/60">
                    {formData.file_name || "点击或拖拽文件到此处上传"}
                  </p>
                  <p className="text-xs text-ink/30 mt-1">支持 PDF, DOC, XLS, JPG 等格式</p>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    required
                  />
                </label>
              </div>

              <div>
                <label className="label-gallery">描述</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="input-gallery resize-none"
                  placeholder="请输入文档描述"
                />
              </div>

              <div>
                <label className="label-gallery">标签</label>
                <div className="relative">
                  <Tag
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40"
                  />
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    className="input-gallery pl-9"
                    placeholder="多个标签用逗号分隔"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-ink/10">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="btn-gallery flex-1"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="btn-gallery-primary flex-1 flex items-center justify-center gap-2"
                >
                  <Upload size={16} />
                  上传文档
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {previewDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm animate-fade-in"
            onClick={() => setPreviewDocument(null)}
          />
          <div className="relative w-full max-w-2xl bg-cream-50 rounded-gallery shadow-gallery-lg animate-slide-up max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-ink/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    previewDocument.category === "contract" && "bg-moss-50 text-moss-500",
                    previewDocument.category === "insurance" && "bg-gold-50 text-gold-500",
                    previewDocument.category === "inspection" && "bg-slate-100 text-slate-500",
                    previewDocument.category === "transport" && "bg-slate-50 text-slate-500",
                    previewDocument.category === "other" && "bg-ink-50 text-ink-500"
                  )}
                >
                  {(() => {
                    const IconComp = categoryIcons[previewDocument.category];
                    return <IconComp size={20} />;
                  })()}
                </div>
                <div>
                  <h2 className="font-display text-lg font-semibold text-ink">
                    {previewDocument.name}
                  </h2>
                  <p className="text-xs text-ink/40 mt-0.5">
                    {previewDocument.version} · {formatFileSize(previewDocument.file_size)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPreviewDocument(null)}
                className="btn-gallery-ghost p-2"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="card-gallery p-5">
                <h3 className="text-sm font-semibold text-ink/70 tracking-wide mb-4">文档信息</h3>
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <span className="text-xs text-ink/40">文档分类</span>
                    <StatusBadge
                      label={documentCategoryLabel[previewDocument.category]}
                      className={cn(documentCategoryColor[previewDocument.category], "border")}
                    />
                  </div>
                  <div className="flex items-start justify-between">
                    <span className="text-xs text-ink/40">关联借展</span>
                    <span className="text-sm text-ink">
                      {getApplicationName(previewDocument.application_id)}
                    </span>
                  </div>
                  <div className="flex items-start justify-between">
                    <span className="text-xs text-ink/40">上传日期</span>
                    <span className="text-sm text-ink">
                      {formatDate(previewDocument.uploaded_at)}
                    </span>
                  </div>
                  <div className="flex items-start justify-between">
                    <span className="text-xs text-ink/40">状态</span>
                    <StatusBadge
                      label={previewDocument.archived ? "已归档" : "未归档"}
                      className={cn(
                        "border",
                        previewDocument.archived
                          ? "bg-ink-50 text-ink-500 border-ink-100"
                          : "bg-moss-50 text-moss-400 border-moss-200"
                      )}
                    />
                  </div>
                </div>
              </div>

              {previewDocument.description && (
                <div className="card-gallery p-5">
                  <h3 className="text-sm font-semibold text-ink/70 tracking-wide mb-3">文档描述</h3>
                  <p className="text-sm text-ink/80 leading-relaxed">
                    {previewDocument.description}
                  </p>
                </div>
              )}

              {previewDocument.tags.length > 0 && (
                <div className="card-gallery p-5">
                  <h3 className="text-sm font-semibold text-ink/70 tracking-wide mb-3">标签</h3>
                  <div className="flex flex-wrap gap-2">
                    {previewDocument.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="tag-gallery bg-ink-50 text-ink-500 border border-ink-100"
                      >
                        <Tag size={10} className="mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="card-gallery p-5 bg-ink-50/30 border-dashed border-ink/10">
                <div className="flex flex-col items-center justify-center py-8">
                  <FileText size={48} className="text-ink/20 mb-3" />
                  <p className="text-sm text-ink/50 mb-4">文件预览区域</p>
                  <p className="text-xs text-ink/30">
                    文件名：{previewDocument.name}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-ink/10 flex items-center justify-end gap-3 bg-white">
              <button
                onClick={() => handleArchive(previewDocument)}
                className={cn(
                  "btn-gallery flex items-center gap-2",
                  previewDocument.archived && "border-gold-300 text-gold-500 hover:bg-gold-50"
                )}
              >
                <Archive size={16} />
                {previewDocument.archived ? "取消归档" : "归档"}
              </button>
              <button
                onClick={() => handleDownload(previewDocument)}
                className="btn-gallery-primary flex items-center gap-2"
              >
                <Download size={16} />
                下载
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
