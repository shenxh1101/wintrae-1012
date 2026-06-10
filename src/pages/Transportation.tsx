import { useState } from "react";
import {
  Calendar,
  Truck,
  Package,
  User,
  MapPin,
  ClipboardList,
  X,
  Box,
  FileText,
  Image as ImageIcon,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Edit3,
  Save,
  Play,
  CheckCircle2,
  Send,
} from "lucide-react";
import { useAppStore } from "@/store";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { transportStatusLabel, transportStatusColor, formatDate } from "@/utils";
import type { TransportStatus, TransportTask } from "@/types";
import { cn } from "@/utils";

const COLUMNS: { key: TransportStatus; label: string; icon: typeof Package }[] = [
  { key: "pending", label: "待安排", icon: ClipboardList },
  { key: "packing", label: "包装中", icon: Package },
  { key: "ready", label: "待发运", icon: Box },
  { key: "in_transit", label: "运输中", icon: Truck },
  { key: "delivered", label: "已送达", icon: MapPin },
];

const STATUS_FLOW: TransportStatus[] = ["pending", "packing", "ready", "in_transit", "delivered"];

const STATUS_ACTION_LABELS: Record<TransportStatus, string> = {
  pending: "开始包装",
  packing: "完成包装，待发运",
  ready: "开始运输",
  in_transit: "确认送达",
  delivered: "已完成",
};

export default function Transportation() {
  const { transportTasks, applications, artworks } = useAppStore();
  const [selectedTask, setSelectedTask] = useState<TransportTask | null>(null);

  const getApplication = (appId: string) =>
    applications.find((a) => a.id === appId);

  const getTasksByStatus = (status: TransportStatus) =>
    transportTasks.filter((t) => t.status === status);

  const getArtworkNames = (appId: string) => {
    const app = getApplication(appId);
    if (!app) return [];
    return app.artwork_ids
      .map((id) => artworks.find((a) => a.id === id)?.name)
      .filter(Boolean) as string[];
  };

  return (
    <div className="h-full flex flex-col bg-cream-50">
      <div className="px-6 py-5 border-b border-ink/8 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="section-title">运输安排</h1>
            <p className="section-subtitle">看板管理艺术品运输全流程</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-ink/50">
            <Truck className="w-4 h-4" />
            <span>共 {transportTasks.length} 条运输任务</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="flex gap-4 min-w-max h-full">
          {COLUMNS.map((col) => {
            const Icon = col.icon;
            const tasks = getTasksByStatus(col.key);
            return (
              <div
                key={col.key}
                className="w-72 flex-shrink-0 flex flex-col"
              >
                <div className="flex items-center justify-between px-1 pb-3 mb-3 border-b border-ink/8">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-ink/50" />
                    <h2 className="font-medium text-ink text-sm tracking-wide">
                      {col.label}
                    </h2>
                    <span className="tag-gallery bg-ink/5 text-ink/50 border-ink/8">
                      {tasks.length}
                    </span>
                  </div>
                </div>

                <div className="flex-1 flex flex-col gap-3 overflow-y-auto scrollbar-thin pr-1">
                  {tasks.length === 0 ? (
                    <div className="card-gallery p-6 text-center">
                      <div className="text-ink/30 text-sm">暂无任务</div>
                    </div>
                  ) : (
                    tasks.map((task) => {
                      const app = getApplication(task.application_id);
                      const artworkNames = getArtworkNames(task.application_id);
                      return (
                        <div
                          key={task.id}
                          onClick={() => setSelectedTask(task)}
                          className="card-gallery p-4 cursor-pointer group"
                        >
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <h3 className="font-display text-base font-semibold text-ink leading-snug">
                              {app?.exhibition_name || "—"}
                            </h3>
                            <ChevronRight className="w-4 h-4 text-ink/30 group-hover:text-gold-400 group-hover:translate-x-0.5 transition-all mt-0.5 flex-shrink-0" />
                          </div>

                          <StatusBadge
                            label={transportStatusLabel[task.status]}
                            className={cn(transportStatusColor[task.status], "mb-3")}
                          />

                          <div className="space-y-2 text-sm">
                            <div className="flex items-start gap-2 text-ink/60">
                              <User className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-ink/40" />
                              <span className="line-clamp-1">{app?.borrower_name}</span>
                            </div>

                            <div className="flex items-start gap-2 text-ink/60">
                              <Truck className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-ink/40" />
                              <span className="line-clamp-1">{task.carrier || "待指定"}</span>
                            </div>

                            <div className="flex items-center justify-between text-ink/60">
                              <div className="flex items-center gap-2">
                                {task.direction === "outbound" ? (
                                  <ArrowRight className="w-3.5 h-3.5 text-moss-400" />
                                ) : (
                                  <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
                                )}
                                <span className="text-xs">
                                  {task.direction === "outbound" ? "外送" : "归还"}
                                </span>
                              </div>
                              {task.ship_date && (
                                <div className="flex items-center gap-1.5">
                                  <Calendar className="w-3.5 h-3.5 text-ink/40" />
                                  <span className="text-xs">
                                    {formatDate(task.ship_date)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {artworkNames.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-ink/6">
                              <div className="flex flex-wrap gap-1.5">
                                {artworkNames.slice(0, 2).map((name, i) => (
                                  <span
                                    key={i}
                                    className="tag-gallery bg-cream-100 text-ink/60 border-ink/8 text-[11px]"
                                  >
                                    {name}
                                  </span>
                                ))}
                                {artworkNames.length > 2 && (
                                  <span className="tag-gallery bg-cream-100 text-ink/40 border-ink/8 text-[11px]">
                                    +{artworkNames.length - 2}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedTask && (
        <DetailPanel
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={(updatedTask) => setSelectedTask(updatedTask)}
        />
      )}
    </div>
  );
}

function DetailPanel({
  task,
  onClose,
  onUpdate,
}: {
  task: TransportTask;
  onClose: () => void;
  onUpdate: (task: TransportTask) => void;
}) {
  const { applications, artworks, updateTransportTask, updateTransportStatus } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    packaging_material: task.packaging_material,
    carrier: task.carrier,
    tracking_no: task.tracking_no,
    route: task.route,
    transport_staff: task.transport_staff,
    ship_date: task.ship_date,
    arrive_date: task.arrive_date,
  });

  const app = applications.find((a) => a.id === task.application_id);
  const artworkList = app
    ? app.artwork_ids
        .map((id) => artworks.find((a) => a.id === id))
        .filter(Boolean)
    : [];

  const currentStatusIndex = STATUS_FLOW.indexOf(task.status);
  const canAdvance = currentStatusIndex < STATUS_FLOW.length - 1;

  const handleEditChange = (field: keyof typeof editForm, value: string) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    updateTransportTask(task.id, editForm);
    onUpdate({ ...task, ...editForm });
    setIsEditing(false);
  };

  const handleAdvanceStatus = () => {
    if (!canAdvance) return;
    const nextStatus = STATUS_FLOW[currentStatusIndex + 1];
    updateTransportStatus(task.id, nextStatus);
    onUpdate({ ...task, status: nextStatus });
  };

  const getStatusActionIcon = (status: TransportStatus) => {
    switch (status) {
      case "pending":
        return <Play className="w-4 h-4" />;
      case "packing":
        return <Package className="w-4 h-4" />;
      case "ready":
        return <Send className="w-4 h-4" />;
      case "in_transit":
        return <CheckCircle2 className="w-4 h-4" />;
      default:
        return <CheckCircle2 className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-ink/40 animate-fade-in"
        onClick={onClose}
      />
      <div className="relative w-full max-w-xl bg-white h-full shadow-gallery-lg overflow-y-auto animate-slide-in-right">
        <div className="sticky top-0 z-10 bg-white border-b border-ink/8 px-6 py-4 flex items-start justify-between">
          <div className="pr-4">
            <div className="flex items-center gap-2 mb-1.5">
              <StatusBadge
                label={transportStatusLabel[task.status]}
                className={cn(transportStatusColor[task.status])}
              />
              {task.direction === "outbound" ? (
                <span className="tag-gallery bg-moss-50 text-moss-400 border-moss-200 flex items-center gap-1">
                  <ArrowRight className="w-3 h-3" />
                  外送
                </span>
              ) : (
                <span className="tag-gallery bg-slate-50 text-slate-400 border-slate-200 flex items-center gap-1">
                  <ArrowLeft className="w-3 h-3" />
                  归还
                </span>
              )}
            </div>
            <h2 className="font-display text-xl font-semibold text-ink">
              {app?.exhibition_name || "运输详情"}
            </h2>
            <p className="text-sm text-ink/50 mt-1">
              {app?.borrower_name}
            </p>
          </div>
          <div className="flex items-center gap-1">
            {canAdvance && (
              <button
                onClick={handleAdvanceStatus}
                className="btn-gallery-primary px-3 py-2 text-sm flex items-center gap-1.5"
              >
                {getStatusActionIcon(task.status)}
                {STATUS_ACTION_LABELS[task.status]}
              </button>
            )}
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={cn(
                "p-2 rounded-gallery transition-colors",
                isEditing
                  ? "bg-gold-100 text-gold-600"
                  : "hover:bg-ink/5 transition-colors text-ink/50 hover:text-ink"
              )}
            >
              <Edit3 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-gallery hover:bg-ink/5 transition-colors text-ink/50 hover:text-ink"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {isEditing && (
            <div className="card-gallery p-4 bg-gold-50/50 border-gold-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gold-700">编辑模式</span>
                <button
                  onClick={handleSave}
                  className="btn-gallery-primary px-3 py-1.5 text-sm flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  保存修改
                </button>
              </div>
            </div>
          )}

          <div className="card-gallery p-4">
            <h3 className="font-display text-sm font-semibold text-ink mb-3 flex items-center gap-2">
              <Package className="w-4 h-4 text-gold-400" />
              包装方案
            </h3>
            <div className="space-y-4">
              <div>
                <label className="label-gallery">包装材料</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.packaging_material}
                    onChange={(e) => handleEditChange("packaging_material", e.target.value)}
                    placeholder="如：定制木箱 + 缓冲材料"
                    className="input-gallery text-sm"
                  />
                ) : (
                  <p className="text-sm text-ink leading-relaxed">
                    {task.packaging_material || "—"}
                  </p>
                )}
              </div>
              <div>
                <label className="label-gallery">包装方式</label>
                <p className="text-sm text-ink leading-relaxed">
                  {task.packaging_method || "—"}
                </p>
              </div>
              <div>
                <label className="label-gallery">装箱清单</label>
                <p className="text-sm text-ink leading-relaxed">
                  {task.packing_list || "—"}
                </p>
              </div>
              {artworkList.length > 0 && (
                <div>
                  <label className="label-gallery">作品清单</label>
                  <div className="space-y-2">
                    {artworkList.map((aw) => (
                      <div
                        key={aw!.id}
                        className="flex items-center justify-between py-2 px-3 bg-cream-50 rounded-gallery border border-ink/6"
                      >
                        <div>
                          <div className="text-sm font-medium text-ink">
                            {aw!.name}
                          </div>
                          <div className="text-xs text-ink/50 mt-0.5">
                            {aw!.author} · {aw!.year} · {aw!.accession_no}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label className="label-gallery">包装照片</label>
                {task.packing_photos.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {task.packing_photos.map((photo, i) => (
                      <div
                        key={i}
                        className="aspect-square rounded-gallery overflow-hidden border border-ink/8 relative group"
                      >
                        <img
                          src={photo}
                          alt={`包装照片 ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 bg-cream-50 rounded-gallery border border-dashed border-ink/10">
                    <ImageIcon className="w-8 h-8 text-ink/20 mb-2" />
                    <span className="text-xs text-ink/40">暂无包装照片</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="card-gallery p-4">
            <h3 className="font-display text-sm font-semibold text-ink mb-3 flex items-center gap-2">
              <Truck className="w-4 h-4 text-slate-400" />
              运输调度
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-gallery">承运商</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.carrier}
                      onChange={(e) => handleEditChange("carrier", e.target.value)}
                      placeholder="如：顺丰速运"
                      className="input-gallery text-sm"
                    />
                  ) : (
                    <p className="text-sm text-ink">{task.carrier || "—"}</p>
                  )}
                </div>
                <div>
                  <label className="label-gallery">运单号</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.tracking_no}
                      onChange={(e) => handleEditChange("tracking_no", e.target.value)}
                      placeholder="如：SF1234567890"
                      className="input-gallery text-sm font-mono"
                    />
                  ) : (
                    <p className="text-sm text-ink font-mono">
                      {task.tracking_no || "—"}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label className="label-gallery">运输路线</label>
                {isEditing ? (
                  <textarea
                    value={editForm.route}
                    onChange={(e) => handleEditChange("route", e.target.value)}
                    placeholder="如：北京美术馆 → 上海展览馆"
                    rows={2}
                    className="input-gallery text-sm resize-none"
                  />
                ) : (
                  <p className="text-sm text-ink leading-relaxed">
                    {task.route || "—"}
                  </p>
                )}
              </div>
              <div>
                <label className="label-gallery">运输人员</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.transport_staff}
                    onChange={(e) => handleEditChange("transport_staff", e.target.value)}
                    placeholder="如：张三、李四"
                    className="input-gallery text-sm"
                  />
                ) : (
                  <p className="text-sm text-ink">
                    {task.transport_staff || "—"}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-gallery">发运日期</label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={editForm.ship_date}
                      onChange={(e) => handleEditChange("ship_date", e.target.value)}
                      className="input-gallery text-sm"
                    />
                  ) : (
                    <div className="flex items-center gap-1.5 text-sm text-ink">
                      <Calendar className="w-3.5 h-3.5 text-ink/40" />
                      {formatDate(task.ship_date)}
                    </div>
                  )}
                </div>
                <div>
                  <label className="label-gallery">到达日期</label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={editForm.arrive_date}
                      onChange={(e) => handleEditChange("arrive_date", e.target.value)}
                      className="input-gallery text-sm"
                    />
                  ) : (
                    <div className="flex items-center gap-1.5 text-sm text-ink">
                      <Calendar className="w-3.5 h-3.5 text-ink/40" />
                      {formatDate(task.arrive_date)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {app && (
            <div className="card-gallery p-4">
              <h3 className="font-display text-sm font-semibold text-ink mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-moss-400" />
                借展信息
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 text-ink/40 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-ink/50 text-xs">借展方</div>
                    <div className="text-ink">{app.borrower_name}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-ink/40 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-ink/50 text-xs">展览地点</div>
                    <div className="text-ink">{app.venue_address}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-ink/40 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-ink/50 text-xs">展览周期</div>
                    <div className="text-ink">
                      {formatDate(app.start_date)} — {formatDate(app.end_date)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
