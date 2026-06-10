import type { ArtworkStatus, ApplicationStatus, TransportStatus, BorrowStage, DocumentCategory } from "../types";

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr.replace(/-/g, "/"));
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  } catch {
    return dateStr;
  }
};

export const formatDateTime = (dtStr: string): string => {
  if (!dtStr) return "—";
  return dtStr.replace("T", " ");
};

export const artworkStatusLabel: Record<ArtworkStatus, string> = {
  available: "在库可借",
  on_loan: "借出中",
  restoring: "修复中",
  archived: "已归档",
};

export const artworkStatusColor: Record<ArtworkStatus, string> = {
  available: "bg-moss-50 text-moss-400 border-moss-200",
  on_loan: "bg-slate-50 text-slate-400 border-slate-200",
  restoring: "bg-gold-50 text-gold-400 border-gold-200",
  archived: "bg-ink-50 text-ink-400 border-ink-100",
};

export const applicationStatusLabel: Record<ApplicationStatus, string> = {
  pending: "待审批",
  approved: "已批准",
  rejected: "已拒绝",
};

export const applicationStatusColor: Record<ApplicationStatus, string> = {
  pending: "bg-gold-50 text-gold-400 border-gold-200",
  approved: "bg-moss-50 text-moss-400 border-moss-200",
  rejected: "bg-terracotta-50 text-terracotta-400 border-terracotta-200",
};

export const transportStatusLabel: Record<TransportStatus, string> = {
  pending: "待安排",
  packing: "包装中",
  ready: "待发运",
  in_transit: "运输中",
  delivered: "已送达",
};

export const transportStatusColor: Record<TransportStatus, string> = {
  pending: "bg-ink-50 text-ink-400 border-ink-100",
  packing: "bg-gold-50 text-gold-400 border-gold-200",
  ready: "bg-slate-50 text-slate-400 border-slate-200",
  in_transit: "bg-slate-100 text-slate-400 border-slate-200",
  delivered: "bg-moss-50 text-moss-400 border-moss-200",
};

export const stageLabel: Record<BorrowStage, string> = {
  pending_approval: "待审批",
  pending_outbound: "待出库",
  in_transit_out: "外运中",
  installed: "已布展",
  pending_return: "待归还",
  in_transit_back: "归还中",
  returned: "已归还",
  archived: "已归档",
};

export const documentCategoryLabel: Record<DocumentCategory, string> = {
  contract: "合同",
  insurance: "保险",
  inspection: "验收报告",
  transport: "运输单据",
  other: "其他",
};

export const documentCategoryColor: Record<DocumentCategory, string> = {
  contract: "bg-moss-50 text-moss-400 border-moss-200",
  insurance: "bg-gold-50 text-gold-400 border-gold-200",
  inspection: "bg-slate-50 text-slate-400 border-slate-200",
  transport: "bg-slate-100 text-slate-400 border-slate-200",
  other: "bg-ink-50 text-ink-400 border-ink-100",
};

export const cn = (...args: (string | false | null | undefined)[]): string => {
  return args.filter(Boolean).join(" ");
};
