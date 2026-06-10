import { useState } from "react";
import { useAppStore } from "../store";
import { applicationStatusLabel, formatDate, cn, applicationStatusColor } from "../utils";
import { StatusBadge } from "../components/shared/StatusBadge";
import type { ApplicationStatus, ContractMilestone, BorrowApplication } from "../types";
import {
  Plus,
  Eye,
  Check,
  X,
  ChevronRight,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  Package,
  Trash2,
  CheckCircle2,
  Circle,
  X as XIcon,
} from "lucide-react";

const TABS: { key: ApplicationStatus | "all"; label: string }[] = [
  { key: "pending", label: "待审批" },
  { key: "approved", label: "已批准" },
  { key: "rejected", label: "已拒绝" },
];

interface NewApplicationForm {
  borrower_name: string;
  contact_person: string;
  contact_phone: string;
  contact_email: string;
  start_date: string;
  end_date: string;
  venue_address: string;
  exhibition_name: string;
  purpose: string;
  artwork_ids: string[];
}

const emptyForm: NewApplicationForm = {
  borrower_name: "",
  contact_person: "",
  contact_phone: "",
  contact_email: "",
  start_date: "",
  end_date: "",
  venue_address: "",
  exhibition_name: "",
  purpose: "",
  artwork_ids: [],
};

export default function Applications() {
  const {
    applications,
    artworks,
    addApplication,
    updateApplicationStatus,
    getArtworkById,
    addContractMilestone,
    updateContractMilestone,
    deleteContractMilestone,
    getApplicationById,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<ApplicationStatus | "all">("pending");
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newForm, setNewForm] = useState<NewApplicationForm>(emptyForm);
  const [approvalRemark, setApprovalRemark] = useState("");
  const [newMilestone, setNewMilestone] = useState({ name: "", due_date: "" });

  const selectedApplication = selectedApplicationId
    ? getApplicationById(selectedApplicationId)
    : null;

  const filteredApplications = activeTab === "all"
    ? applications
    : applications.filter((a) => a.status === activeTab);

  const openDetail = (app: BorrowApplication) => {
    setSelectedApplicationId(app.id);
    setApprovalRemark(app.approval_remark || "");
  };

  const closeDetail = () => {
    setSelectedApplicationId(null);
    setApprovalRemark("");
    setNewMilestone({ name: "", due_date: "" });
  };

  const handleApprove = () => {
    if (!selectedApplicationId) return;
    updateApplicationStatus(selectedApplicationId, "approved", approvalRemark);
    closeDetail();
  };

  const handleReject = () => {
    if (!selectedApplicationId) return;
    updateApplicationStatus(selectedApplicationId, "rejected", approvalRemark);
    closeDetail();
  };

  const toggleMilestone = (id: string) => {
    if (!selectedApplicationId) return;
    const milestone = selectedApplication?.contract_milestones.find((m) => m.id === id);
    if (!milestone) return;
    updateContractMilestone(selectedApplicationId, id, {
      completed: !milestone.completed,
      completed_date: !milestone.completed ? new Date().toISOString().slice(0, 10) : undefined,
    });
  };

  const addMilestone = () => {
    if (!selectedApplicationId || !newMilestone.name || !newMilestone.due_date) return;
    addContractMilestone(selectedApplicationId, {
      name: newMilestone.name,
      due_date: newMilestone.due_date,
      completed: false,
    });
    setNewMilestone({ name: "", due_date: "" });
  };

  const removeMilestone = (id: string) => {
    if (!selectedApplicationId) return;
    deleteContractMilestone(selectedApplicationId, id);
  };

  const handleCreate = () => {
    if (!newForm.borrower_name || !newForm.exhibition_name || !newForm.start_date || !newForm.end_date) {
      return;
    }
    addApplication(newForm);
    setNewForm(emptyForm);
    setShowCreateModal(false);
  };

  const toggleArtwork = (id: string) => {
    setNewForm((prev) => ({
      ...prev,
      artwork_ids: prev.artwork_ids.includes(id)
        ? prev.artwork_ids.filter((aid) => aid !== id)
        : [...prev.artwork_ids, id],
    }));
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="section-title">借展申请</h1>
          <p className="section-subtitle">管理所有借展申请的审批与进度跟踪</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-gallery-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          新建申请
        </button>
      </div>

      <div className="flex gap-1 mb-6 border-b border-ink/10">
        {TABS.map((tab) => {
          const count = applications.filter((a) => a.status === tab.key).length;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "px-5 py-3 text-sm font-medium transition-all relative",
                activeTab === tab.key
                  ? "text-ink"
                  : "text-ink/40 hover:text-ink/70"
              )}
            >
              {tab.label}
              <span
                className={cn(
                  "ml-2 px-2 py-0.5 text-xs rounded-full",
                  activeTab === tab.key
                    ? "bg-gold-400 text-ink-900"
                    : "bg-ink/5 text-ink/50"
                )}
              >
                {count}
              </span>
              {activeTab === tab.key && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-400" />
              )}
            </button>
          );
        })}
      </div>

      <div className="card-gallery overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-ink/10 bg-cream-50">
              <th className="text-left px-6 py-3 text-xs font-medium text-ink/50 tracking-wider uppercase">
                申请编号
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-ink/50 tracking-wider uppercase">
                借展方
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-ink/50 tracking-wider uppercase">
                展览名称
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-ink/50 tracking-wider uppercase">
                展期
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-ink/50 tracking-wider uppercase">
                申请时间
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-ink/50 tracking-wider uppercase">
                状态
              </th>
              <th className="text-right px-6 py-3 text-xs font-medium text-ink/50 tracking-wider uppercase">
                操作
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredApplications.map((app) => (
              <tr
                key={app.id}
                className="border-b border-ink/5 hover:bg-cream-50/50 transition-colors"
              >
                <td className="px-6 py-4">
                  <span className="text-sm font-mono text-ink/70">{app.id}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-ink">{app.borrower_name}</div>
                  <div className="text-xs text-ink/40 mt-0.5">{app.contact_person}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-ink">{app.exhibition_name}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-ink/70">
                    {formatDate(app.start_date)}
                  </div>
                  <div className="text-xs text-ink/40 mt-0.5 flex items-center gap-1">
                    <ChevronRight className="w-3 h-3" />
                    {formatDate(app.end_date)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-ink/70">{formatDate(app.applied_at)}</span>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge
                    label={applicationStatusLabel[app.status]}
                    className={applicationStatusColor[app.status]}
                  />
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => openDetail(app)}
                    className="btn-gallery-ghost inline-flex items-center gap-1.5"
                  >
                    <Eye className="w-4 h-4" />
                    查看
                  </button>
                </td>
              </tr>
            ))}
            {filteredApplications.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center">
                  <div className="text-ink/30 text-sm">暂无申请记录</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedApplication && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm animate-fade-in"
            onClick={closeDetail}
          />
          <div className="relative ml-auto w-full max-w-5xl h-full bg-cream-50 animate-slide-in-right overflow-y-auto">
            <div className="sticky top-0 z-10 bg-cream-50 border-b border-ink/10 px-8 py-5 flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl font-semibold text-ink">
                  申请详情
                </h2>
                <p className="text-sm text-ink/40 mt-0.5 font-mono">
                  {selectedApplication.id}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge
                  label={applicationStatusLabel[selectedApplication.status]}
                  className={applicationStatusColor[selectedApplication.status]}
                />
                <button
                  onClick={closeDetail}
                  className="p-2 rounded-gallery hover:bg-ink/5 transition-colors"
                >
                  <XIcon className="w-5 h-5 text-ink/60" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-0 h-[calc(100%-73px)]">
              <div className="col-span-3 p-8 border-r border-ink/10 overflow-y-auto">
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-ink/70 tracking-wide mb-4 flex items-center gap-2">
                    <User className="w-4 h-4 text-gold-400" />
                    借展方信息
                  </h3>
                  <div className="card-gallery p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <span className="text-xs text-ink/40">借展机构</span>
                      <span className="text-sm text-ink font-medium">
                        {selectedApplication.borrower_name}
                      </span>
                    </div>
                    <div className="flex items-start justify-between">
                      <span className="text-xs text-ink/40 flex items-center gap-1">
                        <User className="w-3 h-3" />
                        联系人
                      </span>
                      <span className="text-sm text-ink">{selectedApplication.contact_person}</span>
                    </div>
                    <div className="flex items-start justify-between">
                      <span className="text-xs text-ink/40 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        联系电话
                      </span>
                      <span className="text-sm text-ink">{selectedApplication.contact_phone}</span>
                    </div>
                    <div className="flex items-start justify-between">
                      <span className="text-xs text-ink/40 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        电子邮箱
                      </span>
                      <span className="text-sm text-ink">{selectedApplication.contact_email}</span>
                    </div>
                    <div className="flex items-start justify-between">
                      <span className="text-xs text-ink/40 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        展览地点
                      </span>
                      <span className="text-sm text-ink text-right max-w-xs">
                        {selectedApplication.venue_address}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-ink/70 tracking-wide mb-4 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gold-400" />
                    展览信息
                  </h3>
                  <div className="card-gallery p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <span className="text-xs text-ink/40">展览名称</span>
                      <span className="text-sm text-ink font-medium">
                        {selectedApplication.exhibition_name}
                      </span>
                    </div>
                    <div className="flex items-start justify-between">
                      <span className="text-xs text-ink/40 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        展期
                      </span>
                      <span className="text-sm text-ink">
                        {formatDate(selectedApplication.start_date)} — {formatDate(selectedApplication.end_date)}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-ink/40 block mb-1.5">借展用途</span>
                      <p className="text-sm text-ink/80 leading-relaxed">
                        {selectedApplication.purpose}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-ink/70 tracking-wide mb-4 flex items-center gap-2">
                    <Package className="w-4 h-4 text-gold-400" />
                    展品列表
                    <span className="ml-auto text-xs font-normal text-ink/40">
                      共 {selectedApplication.artwork_ids.length} 件
                    </span>
                  </h3>
                  <div className="space-y-3">
                    {selectedApplication.artwork_ids.map((aid) => {
                      const artwork = getArtworkById(aid);
                      if (!artwork) return null;
                      return (
                        <div
                          key={aid}
                          className="card-gallery p-4 flex items-center gap-4"
                        >
                          <div className="w-14 h-14 rounded-gallery bg-ink/5 flex items-center justify-center text-ink/30 flex-shrink-0 overflow-hidden">
                            {artwork.images[0] ? (
                              <img
                                src={artwork.images[0]}
                                alt={artwork.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-5 h-5" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-ink truncate">
                              {artwork.name}
                            </div>
                            <div className="text-xs text-ink/40 mt-0.5">
                              {artwork.author} · {artwork.year} · {artwork.category}
                            </div>
                            <div className="text-xs text-ink/30 mt-0.5 font-mono">
                              {artwork.accession_no}
                            </div>
                          </div>
                          <StatusBadge
                            label={artwork.status === "available" ? "在库可借" : artwork.status === "on_loan" ? "借出中" : artwork.status === "restoring" ? "修复中" : "已归档"}
                            className={
                              artwork.status === "available"
                                ? "bg-moss-50 text-moss-400 border-moss-200"
                                : artwork.status === "on_loan"
                                ? "bg-slate-50 text-slate-400 border-slate-200"
                                : artwork.status === "restoring"
                                ? "bg-gold-50 text-gold-400 border-gold-200"
                                : "bg-ink-50 text-ink-400 border-ink-100"
                            }
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="col-span-2 p-8 overflow-y-auto bg-white/50">
                {selectedApplication.status === "pending" && (
                  <div className="mb-8">
                    <h3 className="text-sm font-semibold text-ink/70 tracking-wide mb-4">
                      审批操作
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="label-gallery">审批意见</label>
                        <textarea
                          value={approvalRemark}
                          onChange={(e) => setApprovalRemark(e.target.value)}
                          rows={4}
                          placeholder="请输入审批意见..."
                          className="input-gallery resize-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={handleApprove}
                          className="btn-gallery-primary flex items-center justify-center gap-2 bg-moss-400 border-moss-400 hover:bg-moss-500 hover:border-moss-500"
                        >
                          <Check className="w-4 h-4" />
                          通过
                        </button>
                        <button
                          onClick={handleReject}
                          className="btn-gallery flex items-center justify-center gap-2 border-terracotta-300 text-terracotta-400 hover:bg-terracotta-400 hover:text-cream hover:border-terracotta-400"
                        >
                          <X className="w-4 h-4" />
                          拒绝
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {selectedApplication.status !== "pending" && selectedApplication.approval_remark && (
                  <div className="mb-8">
                    <h3 className="text-sm font-semibold text-ink/70 tracking-wide mb-4">
                      审批意见
                    </h3>
                    <div className="card-gallery p-4">
                      <p className="text-sm text-ink/80 leading-relaxed">
                        {selectedApplication.approval_remark}
                      </p>
                      <div className="mt-3 pt-3 border-t border-ink/5 text-xs text-ink/40">
                        {selectedApplication.status === "approved" && (
                          <span>于 {formatDate(selectedApplication.approved_at || "")} 批准</span>
                        )}
                        {selectedApplication.status === "rejected" && (
                          <span>于 {formatDate(selectedApplication.rejected_at || "")} 拒绝</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-semibold text-ink/70 tracking-wide mb-4 flex items-center justify-between">
                    <span>合同里程碑</span>
                    <span className="text-xs font-normal text-ink/40">
                      {selectedApplication?.contract_milestones.filter((m) => m.completed).length || 0}/{selectedApplication?.contract_milestones.length || 0} 已完成
                    </span>
                  </h3>

                  {selectedApplication?.status === "approved" && (
                    <div className="mb-4 grid grid-cols-[1fr_auto_auto] gap-2">
                      <input
                        type="text"
                        placeholder="里程碑名称"
                        value={newMilestone.name}
                        onChange={(e) => setNewMilestone((p) => ({ ...p, name: e.target.value }))}
                        className="input-gallery text-xs"
                      />
                      <input
                        type="date"
                        value={newMilestone.due_date}
                        onChange={(e) => setNewMilestone((p) => ({ ...p, due_date: e.target.value }))}
                        className="input-gallery text-xs w-36"
                      />
                      <button
                        onClick={addMilestone}
                        disabled={!newMilestone.name || !newMilestone.due_date}
                        className="btn-gallery-ghost px-3 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <div className="space-y-2">
                    {selectedApplication?.contract_milestones.map((m) => (
                      <div
                        key={m.id}
                        className={cn(
                          "card-gallery p-3 flex items-center gap-3",
                          m.completed && "opacity-60"
                        )}
                      >
                        <button
                          onClick={() => selectedApplication.status === "approved" && toggleMilestone(m.id)}
                          className={cn(
                            "flex-shrink-0",
                            selectedApplication.status === "approved" && "cursor-pointer"
                          )}
                          disabled={selectedApplication.status !== "approved"}
                        >
                          {m.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-moss-400" />
                          ) : (
                            <Circle className="w-5 h-5 text-ink/30" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div
                            className={cn(
                              "text-sm text-ink",
                              m.completed && "line-through text-ink/50"
                            )}
                          >
                            {m.name}
                          </div>
                          <div className="text-xs text-ink/40 mt-0.5 flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            截止: {formatDate(m.due_date)}
                            {m.completed_date && (
                              <span className="text-moss-400">
                                · 完成: {formatDate(m.completed_date)}
                              </span>
                            )}
                          </div>
                        </div>
                        {selectedApplication?.status === "approved" && (
                          <button
                            onClick={() => removeMilestone(m.id)}
                            className="p-1.5 rounded-gallery hover:bg-terracotta-50 text-ink/30 hover:text-terracotta-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    {selectedApplication?.contract_milestones.length === 0 && (
                      <div className="text-center py-8 text-ink/30 text-sm">
                        暂无里程碑
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8">
          <div
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm animate-fade-in"
            onClick={() => setShowCreateModal(false)}
          />
          <div className="relative w-full max-w-3xl bg-cream-50 rounded-gallery shadow-gallery-lg animate-slide-up max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-8 py-5 border-b border-ink/10 flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold text-ink">新建借展申请</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-gallery hover:bg-ink/5 transition-colors"
              >
                <XIcon className="w-5 h-5 text-ink/60" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-ink/70 tracking-wide mb-4 flex items-center gap-2">
                  <User className="w-4 h-4 text-gold-400" />
                  借展方信息
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label-gallery">借展机构 *</label>
                    <input
                      type="text"
                      value={newForm.borrower_name}
                      onChange={(e) => setNewForm((p) => ({ ...p, borrower_name: e.target.value }))}
                      placeholder="请输入借展机构名称"
                      className="input-gallery"
                    />
                  </div>
                  <div>
                    <label className="label-gallery">联系人</label>
                    <input
                      type="text"
                      value={newForm.contact_person}
                      onChange={(e) => setNewForm((p) => ({ ...p, contact_person: e.target.value }))}
                      placeholder="请输入联系人姓名"
                      className="input-gallery"
                    />
                  </div>
                  <div>
                    <label className="label-gallery">联系电话</label>
                    <input
                      type="text"
                      value={newForm.contact_phone}
                      onChange={(e) => setNewForm((p) => ({ ...p, contact_phone: e.target.value }))}
                      placeholder="请输入联系电话"
                      className="input-gallery"
                    />
                  </div>
                  <div>
                    <label className="label-gallery">电子邮箱</label>
                    <input
                      type="email"
                      value={newForm.contact_email}
                      onChange={(e) => setNewForm((p) => ({ ...p, contact_email: e.target.value }))}
                      placeholder="请输入电子邮箱"
                      className="input-gallery"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-ink/70 tracking-wide mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gold-400" />
                  展览信息
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="label-gallery">展览名称 *</label>
                    <input
                      type="text"
                      value={newForm.exhibition_name}
                      onChange={(e) => setNewForm((p) => ({ ...p, exhibition_name: e.target.value }))}
                      placeholder="请输入展览名称"
                      className="input-gallery"
                    />
                  </div>
                  <div>
                    <label className="label-gallery">开始日期 *</label>
                    <input
                      type="date"
                      value={newForm.start_date}
                      onChange={(e) => setNewForm((p) => ({ ...p, start_date: e.target.value }))}
                      className="input-gallery"
                    />
                  </div>
                  <div>
                    <label className="label-gallery">结束日期 *</label>
                    <input
                      type="date"
                      value={newForm.end_date}
                      onChange={(e) => setNewForm((p) => ({ ...p, end_date: e.target.value }))}
                      className="input-gallery"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="label-gallery">展览地点</label>
                    <input
                      type="text"
                      value={newForm.venue_address}
                      onChange={(e) => setNewForm((p) => ({ ...p, venue_address: e.target.value }))}
                      placeholder="请输入详细地址"
                      className="input-gallery"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="label-gallery">借展用途</label>
                    <textarea
                      value={newForm.purpose}
                      onChange={(e) => setNewForm((p) => ({ ...p, purpose: e.target.value }))}
                      rows={3}
                      placeholder="请说明借展用途"
                      className="input-gallery resize-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-ink/70 tracking-wide mb-4 flex items-center gap-2">
                  <Package className="w-4 h-4 text-gold-400" />
                  选择展品
                  <span className="ml-auto text-xs font-normal text-ink/40">
                    已选 {newForm.artwork_ids.length} 件
                  </span>
                </h3>
                <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-2 scrollbar-thin">
                  {artworks.map((art) => (
                    <label
                      key={art.id}
                      className={cn(
                        "card-gallery p-3 flex items-center gap-3 cursor-pointer transition-all",
                        newForm.artwork_ids.includes(art.id) &&
                          "border-gold-400 ring-1 ring-gold-400 bg-gold-50/30"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={newForm.artwork_ids.includes(art.id)}
                        onChange={() => toggleArtwork(art.id)}
                        className="hidden"
                      />
                      <div className="w-10 h-10 rounded-gallery bg-ink/5 flex items-center justify-center text-ink/30 flex-shrink-0 overflow-hidden">
                        {art.images[0] ? (
                          <img
                            src={art.images[0]}
                            alt={art.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-ink truncate">{art.name}</div>
                        <div className="text-xs text-ink/40 truncate">
                          {art.author} · {art.category}
                        </div>
                      </div>
                      <div
                        className={cn(
                          "w-4 h-4 rounded border flex items-center justify-center flex-shrink-0",
                          newForm.artwork_ids.includes(art.id)
                            ? "bg-gold-400 border-gold-400"
                            : "border-ink/20"
                        )}
                      >
                        {newForm.artwork_ids.includes(art.id) && (
                          <Check className="w-3 h-3 text-ink-900" />
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-8 py-4 border-t border-ink/10 flex items-center justify-end gap-3 bg-white">
              <button
                onClick={() => setShowCreateModal(false)}
                className="btn-gallery"
              >
                取消
              </button>
              <button
                onClick={handleCreate}
                disabled={
                  !newForm.borrower_name ||
                  !newForm.exhibition_name ||
                  !newForm.start_date ||
                  !newForm.end_date
                }
                className="btn-gallery-primary disabled:opacity-40 disabled:cursor-not-allowed"
              >
                提交申请
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
