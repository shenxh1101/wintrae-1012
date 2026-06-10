import { useState, useMemo } from "react";
import { useAppStore } from "../store";
import {
  stageLabel,
  formatCurrency,
  formatDateTime,
  cn,
  formatDate,
} from "../utils";
import { StatusBadge } from "../components/shared/StatusBadge";
import type { BorrowStage, StatusRecord, Expense } from "../types";
import { BORROW_STAGES } from "../types";
import {
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  Calendar,
  User,
  FileText,
  Image as ImageIcon,
  AlertTriangle,
  PenLine,
  ArrowRight,
  Plus,
  X,
  Building2,
  Receipt,
  DollarSign,
} from "lucide-react";

const EXPENSE_CATEGORIES = ["包装费", "运输费", "保险费", "差旅费", "布展费", "维修费", "其他"];

interface NewStatusForm {
  remark: string;
  inspection_photos: string[];
  damage_note: string;
  operator: string;
}

interface NewExpenseForm {
  category: string;
  amount: string;
  remark: string;
  paid: boolean;
}

const emptyStatusForm: NewStatusForm = {
  remark: "",
  inspection_photos: [],
  damage_note: "",
  operator: "",
};

const emptyExpenseForm: NewExpenseForm = {
  category: "包装费",
  amount: "",
  remark: "",
  paid: false,
};

export default function Tracking() {
  const {
    applications,
    selectedApplicationId,
    setSelectedApplicationId,
    getApplicationStatusRecords,
    getApplicationExpenses,
    getApplicationById,
    updateApplicationStage,
    addStatusRecord,
    addExpense,
  } = useAppStore();

  const [expandedStage, setExpandedStage] = useState<BorrowStage | null>(null);
  const [showStatusForm, setShowStatusForm] = useState(false);
  const [statusFormMode, setStatusFormMode] = useState<"add_record" | "advance_stage">("add_record");
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [statusForm, setStatusForm] = useState<NewStatusForm>(emptyStatusForm);
  const [expenseForm, setExpenseForm] = useState<NewExpenseForm>(emptyExpenseForm);

  const selectedApp = selectedApplicationId
    ? getApplicationById(selectedApplicationId)
    : null;

  const statusRecords = useMemo(
    () => (selectedApplicationId ? getApplicationStatusRecords(selectedApplicationId) : []),
    [selectedApplicationId, getApplicationStatusRecords]
  );

  const expenses = useMemo(
    () => (selectedApplicationId ? getApplicationExpenses(selectedApplicationId) : []),
    [selectedApplicationId, getApplicationExpenses]
  );

  const totalAmount = useMemo(
    () => expenses.reduce((sum, e) => sum + e.amount, 0),
    [expenses]
  );

  const currentStageIndex = useMemo(() => {
    if (statusRecords.length === 0) return 0;
    const latestStage = statusRecords[statusRecords.length - 1].stage;
    const idx = BORROW_STAGES.findIndex((s) => s.key === latestStage);
    return idx >= 0 ? idx : 0;
  }, [statusRecords]);

  const getStageRecords = (stage: BorrowStage) =>
    statusRecords.filter((r) => r.stage === stage);

  const isStageCompleted = (index: number) => index < currentStageIndex;
  const isStageCurrent = (index: number) => index === currentStageIndex;
  const isStagePending = (index: number) => index > currentStageIndex;

  const toggleStage = (stage: BorrowStage) => {
    setExpandedStage((prev) => (prev === stage ? null : stage));
  };

  const handleAdvanceStage = () => {
    if (!selectedApplicationId) return;
    if (currentStageIndex >= BORROW_STAGES.length - 1) return;

    const nextStage = BORROW_STAGES[currentStageIndex + 1].key;
    const operator = statusForm.operator || "当前用户";
    const remark = statusForm.remark.trim() || `进入${stageLabel[nextStage]}阶段`;

    updateApplicationStage(
      selectedApplicationId,
      nextStage,
      remark,
      operator,
      statusForm.inspection_photos,
      statusForm.damage_note
    );

    setStatusForm(emptyStatusForm);
    setShowStatusForm(false);
  };

  const handleAddStatusRecord = () => {
    if (!selectedApplicationId) return;
    if (!statusForm.remark.trim()) return;

    addStatusRecord({
      application_id: selectedApplicationId,
      stage: BORROW_STAGES[currentStageIndex].key,
      operator: statusForm.operator || "当前用户",
      remark: statusForm.remark,
      inspection_photos: statusForm.inspection_photos,
      damage_note: statusForm.damage_note,
    });

    setStatusForm(emptyStatusForm);
    setShowStatusForm(false);
  };

  const handleAddExpense = () => {
    if (!selectedApplicationId) return;
    const amount = parseFloat(expenseForm.amount);
    if (!amount || amount <= 0) return;

    addExpense({
      application_id: selectedApplicationId,
      category: expenseForm.category,
      amount,
      remark: expenseForm.remark,
      paid: expenseForm.paid,
      paid_date: expenseForm.paid ? new Date().toISOString().slice(0, 10) : undefined,
    });

    setExpenseForm(emptyExpenseForm);
    setShowExpenseForm(false);
  };

  const addPhotoUrl = () => {
    const url = prompt("请输入验收照片URL:");
    if (url && url.trim()) {
      setStatusForm((prev) => ({
        ...prev,
        inspection_photos: [...prev.inspection_photos, url.trim()],
      }));
    }
  };

  const removePhotoUrl = (index: number) => {
    setStatusForm((prev) => ({
      ...prev,
      inspection_photos: prev.inspection_photos.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="p-8 min-h-screen bg-cream-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="section-title">状态追踪</h1>
          <p className="section-subtitle">全程跟踪借展项目的各阶段状态与费用</p>
        </div>

        <div className="card-gallery p-5 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-md">
              <label className="label-gallery">借展项目</label>
              <select
                value={selectedApplicationId || ""}
                onChange={(e) => {
                  setSelectedApplicationId(e.target.value || null);
                  setExpandedStage(null);
                }}
                className="input-gallery"
              >
                <option value="">请选择借展项目...</option>
                {applications.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.exhibition_name} - {app.borrower_name}
                  </option>
                ))}
              </select>
            </div>
            {selectedApp && (
              <div className="flex-1 pt-6">
                <div className="flex items-center gap-3">
                  <StatusBadge
                    label={
                      selectedApp.status === "approved"
                        ? "已批准"
                        : selectedApp.status === "rejected"
                        ? "已拒绝"
                        : "待审批"
                    }
                    className={
                      selectedApp.status === "approved"
                        ? "bg-moss-50 text-moss-400 border-moss-200"
                        : selectedApp.status === "rejected"
                        ? "bg-terracotta-50 text-terracotta-400 border-terracotta-200"
                        : "bg-gold-50 text-gold-400 border-gold-200"
                    }
                  />
                  <div className="flex items-center gap-1.5 text-sm text-ink/50">
                    <Building2 className="w-4 h-4" />
                    {selectedApp.borrower_name}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-ink/50">
                    <Calendar className="w-4 h-4" />
                    {formatDate(selectedApp.start_date)} — {formatDate(selectedApp.end_date)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {selectedApplicationId ? (
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-6">
              <div className="card-gallery p-6">
                <h2 className="font-display text-lg font-semibold text-ink mb-6 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gold-400" />
                  全流程时间线
                </h2>

                <div className="relative">
                  {BORROW_STAGES.map((stage, index) => {
                    const isCompleted = isStageCompleted(index);
                    const isCurrent = isStageCurrent(index);
                    const isPending = isStagePending(index);
                    const records = getStageRecords(stage.key);
                    const isExpanded = expandedStage === stage.key;

                    return (
                      <div key={stage.key} className="relative">
                        {index < BORROW_STAGES.length - 1 && (
                          <div
                            className={cn(
                              "absolute left-[18px] top-[36px] w-0.5 h-[calc(100%+24px)]",
                              isCompleted ? "bg-moss-400" : "bg-ink/10"
                            )}
                          />
                        )}

                        <div className="flex items-start gap-4 pb-6">
                          <div className="relative flex-shrink-0 z-10">
                            {isCompleted ? (
                              <div className="w-9 h-9 rounded-full bg-moss-400 flex items-center justify-center shadow-gallery">
                                <CheckCircle2 className="w-5 h-5 text-white" />
                              </div>
                            ) : isCurrent ? (
                              <div className="w-9 h-9 rounded-full bg-gold-400 flex items-center justify-center animate-pulse-gold shadow-gallery">
                                <Circle className="w-5 h-5 text-ink-900 fill-gold-200" />
                              </div>
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-white border-2 border-ink/20 flex items-center justify-center">
                                <Circle className="w-5 h-5 text-ink/30" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0 pt-1">
                            <button
                              onClick={() => !isPending && toggleStage(stage.key)}
                              disabled={isPending}
                              className={cn(
                                "w-full text-left flex items-center justify-between gap-2 group",
                                !isPending && "cursor-pointer",
                                isPending && "cursor-not-allowed"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <span
                                  className={cn(
                                    "font-display text-base font-semibold",
                                    isCompleted && "text-moss-500",
                                    isCurrent && "text-gold-500",
                                    isPending && "text-ink/30"
                                  )}
                                >
                                  {stageLabel[stage.key]}
                                </span>
                                {records.length > 0 && (
                                  <span className="tag-gallery bg-ink/5 text-ink/50 border-ink/8">
                                    {records.length} 条记录
                                  </span>
                                )}
                                {isCurrent && (
                                  <span className="tag-gallery bg-gold-50 text-gold-500 border-gold-200">
                                    当前阶段
                                  </span>
                                )}
                              </div>
                              {!isPending && (
                                <div className="text-ink/30 group-hover:text-ink/60 transition-colors">
                                  {isExpanded ? (
                                    <ChevronUp className="w-4 h-4" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4" />
                                  )}
                                </div>
                              )}
                            </button>

                            {isExpanded && records.length > 0 && (
                              <div className="mt-4 space-y-3">
                                {records.map((record) => (
                                  <StatusRecordCard key={record.id} record={record} />
                                ))}
                              </div>
                            )}

                            {isExpanded && records.length === 0 && (
                              <div className="mt-4 text-sm text-ink/40 py-4 text-center">
                                暂无状态记录
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="card-gallery p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-display text-lg font-semibold text-ink flex items-center gap-2">
                    <PenLine className="w-5 h-5 text-gold-400" />
                    操作区
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-3 mb-5">
                  {currentStageIndex < BORROW_STAGES.length - 1 ? (
                    <button
                      onClick={() => {
                        setStatusForm(emptyStatusForm);
                        setStatusFormMode("advance_stage");
                        setShowStatusForm(true);
                      }}
                      className="btn-gallery-primary flex items-center gap-2"
                    >
                      <ArrowRight className="w-4 h-4" />
                      推进到下一阶段：{stageLabel[BORROW_STAGES[currentStageIndex + 1].key]}
                    </button>
                  ) : (
                    <StatusBadge
                      label="项目已完成全部阶段"
                      className="bg-moss-50 text-moss-400 border-moss-200"
                    />
                  )}
                  <button
                    onClick={() => {
                      setStatusForm(emptyStatusForm);
                      setStatusFormMode("add_record");
                      setShowStatusForm(true);
                    }}
                    className="btn-gallery flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    添加当前阶段记录
                  </button>
                </div>

                {showStatusForm && (
                  <div className="bg-cream-50 border border-ink/8 rounded-gallery p-5 space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-display text-base font-semibold text-ink flex items-center gap-2">
                        {statusFormMode === "add_record" ? (
                          <>
                            <Plus className="w-4 h-4 text-gold-400" />
                            添加当前阶段记录
                          </>
                        ) : (
                          <>
                            <ArrowRight className="w-4 h-4 text-moss-400" />
                            推进到下一阶段：{stageLabel[BORROW_STAGES[currentStageIndex + 1].key]}
                          </>
                        )}
                      </h3>
                      {statusFormMode === "advance_stage" && (
                        <span className="text-xs text-ink/40">
                          当前阶段：{stageLabel[BORROW_STAGES[currentStageIndex].key]}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label-gallery">操作人</label>
                        <input
                          type="text"
                          value={statusForm.operator}
                          onChange={(e) =>
                            setStatusForm((p) => ({ ...p, operator: e.target.value }))
                          }
                          placeholder="请输入操作人姓名"
                          className="input-gallery"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="label-gallery">
                        备注
                        {statusFormMode === "add_record" && <span className="text-terracotta-400 ml-1">*</span>}
                      </label>
                      <textarea
                        value={statusForm.remark}
                        onChange={(e) =>
                          setStatusForm((p) => ({ ...p, remark: e.target.value }))
                        }
                        rows={3}
                        placeholder={
                          statusFormMode === "add_record"
                            ? "请输入状态变更备注..."
                            : "请输入阶段变更备注（可选，将自动记录验收照片和损伤备注）"
                        }
                        className="input-gallery resize-none"
                      />
                    </div>
                    <div>
                      <label className="label-gallery">验收照片</label>
                      <div className="space-y-3">
                        {statusForm.inspection_photos.length > 0 && (
                          <div className="grid grid-cols-4 gap-2">
                            {statusForm.inspection_photos.map((url, i) => (
                              <div
                                key={i}
                                className="relative aspect-square rounded-gallery overflow-hidden border border-ink/8 group"
                              >
                                <img
                                  src={url}
                                  alt={`照片 ${i + 1}`}
                                  className="w-full h-full object-cover"
                                />
                                <button
                                  onClick={() => removePhotoUrl(i)}
                                  className="absolute top-1 right-1 p-1 bg-terracotta-400 text-white rounded-gallery opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        <button
                          onClick={addPhotoUrl}
                          type="button"
                          className="btn-gallery-ghost inline-flex items-center gap-2 border border-dashed border-ink/20"
                        >
                          <ImageIcon className="w-4 h-4" />
                          添加照片链接
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="label-gallery">损伤备注</label>
                      <textarea
                        value={statusForm.damage_note}
                        onChange={(e) =>
                          setStatusForm((p) => ({ ...p, damage_note: e.target.value }))
                        }
                        rows={2}
                        placeholder="如有损伤请详细描述，无损伤可留空"
                        className="input-gallery resize-none"
                      />
                    </div>
                    <div className="flex items-center gap-3 pt-2">
                      {statusFormMode === "add_record" ? (
                        <button
                          onClick={handleAddStatusRecord}
                          disabled={!statusForm.remark.trim()}
                          className="btn-gallery-primary disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Plus className="w-4 h-4" />
                          添加记录
                        </button>
                      ) : (
                        <button
                          onClick={handleAdvanceStage}
                          className="btn-gallery-primary bg-moss-400 border-moss-400 hover:bg-moss-500 hover:border-moss-500"
                        >
                          <ArrowRight className="w-4 h-4" />
                          确认推进到下一阶段
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setShowStatusForm(false);
                          setStatusForm(emptyStatusForm);
                        }}
                        className="btn-gallery"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="col-span-1">
              <div className="card-gallery p-6 sticky top-8">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-display text-lg font-semibold text-ink flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-gold-400" />
                    费用明细
                  </h2>
                  <button
                    onClick={() => setShowExpenseForm(!showExpenseForm)}
                    className="btn-gallery-ghost p-2"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {showExpenseForm && (
                  <div className="bg-cream-50 border border-ink/8 rounded-gallery p-4 mb-5 space-y-3">
                    <div>
                      <label className="label-gallery">费用分类</label>
                      <select
                        value={expenseForm.category}
                        onChange={(e) =>
                          setExpenseForm((p) => ({ ...p, category: e.target.value }))
                        }
                        className="input-gallery text-sm"
                      >
                        {EXPENSE_CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="label-gallery">金额（元）*</label>
                      <input
                        type="number"
                        value={expenseForm.amount}
                        onChange={(e) =>
                          setExpenseForm((p) => ({ ...p, amount: e.target.value }))
                        }
                        placeholder="请输入金额"
                        className="input-gallery text-sm"
                      />
                    </div>
                    <div>
                      <label className="label-gallery">备注</label>
                      <input
                        type="text"
                        value={expenseForm.remark}
                        onChange={(e) =>
                          setExpenseForm((p) => ({ ...p, remark: e.target.value }))
                        }
                        placeholder="费用说明"
                        className="input-gallery text-sm"
                      />
                    </div>
                    <label className="flex items-center gap-2 text-sm text-ink/70 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={expenseForm.paid}
                        onChange={(e) =>
                          setExpenseForm((p) => ({ ...p, paid: e.target.checked }))
                        }
                        className="w-4 h-4 rounded-gallery border-ink/20"
                      />
                      已支付
                    </label>
                    <div className="flex items-center gap-2 pt-1">
                      <button onClick={handleAddExpense} className="btn-gallery-primary text-sm">
                        添加
                      </button>
                      <button
                        onClick={() => {
                          setShowExpenseForm(false);
                          setExpenseForm(emptyExpenseForm);
                        }}
                        className="btn-gallery text-sm"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  {expenses.length > 0 ? (
                    <>
                      {expenses.map((exp) => (
                        <ExpenseItem key={exp.id} expense={exp} />
                      ))}
                      <div className="border-t border-ink/10 mt-3 pt-3 flex items-center justify-between">
                        <span className="font-display text-base font-semibold text-ink flex items-center gap-1.5">
                          <DollarSign className="w-4 h-4 text-gold-400" />
                          合计
                        </span>
                        <span className="font-display text-lg font-bold text-ink">
                          {formatCurrency(totalAmount)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-10 text-ink/30 text-sm">
                      暂无费用记录
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="card-gallery p-20 text-center">
            <FileText className="w-12 h-12 text-ink/20 mx-auto mb-4" />
            <p className="text-ink/40">请先选择一个借展项目以查看状态追踪</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusRecordCard({ record }: { record: StatusRecord }) {
  return (
    <div className="bg-cream-50 border border-ink/8 rounded-gallery p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 text-sm text-ink/60">
          <Calendar className="w-3.5 h-3.5" />
          {formatDateTime(record.timestamp)}
        </div>
        <div className="flex items-center gap-1.5 text-sm text-ink/60">
          <User className="w-3.5 h-3.5" />
          {record.operator}
        </div>
      </div>

      {record.remark && (
        <div className="mb-3">
          <p className="text-sm text-ink/80 leading-relaxed">{record.remark}</p>
        </div>
      )}

      {record.inspection_photos.length > 0 && (
        <div className="mb-3">
          <div className="text-xs text-ink/50 mb-2 flex items-center gap-1.5">
            <ImageIcon className="w-3 h-3" />
            验收照片（{record.inspection_photos.length}）
          </div>
          <div className="grid grid-cols-4 gap-2">
            {record.inspection_photos.map((url, i) => (
              <div
                key={i}
                className="aspect-square rounded-gallery overflow-hidden border border-ink/8"
              >
                <img
                  src={url}
                  alt={`验收照片 ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {record.damage_note && (
        <div className="mb-3 bg-terracotta-50 border border-terracotta-200 rounded-gallery p-3">
          <div className="text-xs text-terracotta-500 mb-1 flex items-center gap-1.5 font-medium">
            <AlertTriangle className="w-3 h-3" />
            损伤备注
          </div>
          <p className="text-sm text-terracotta-400 leading-relaxed">{record.damage_note}</p>
        </div>
      )}

      {record.signed_by && (
        <div className="pt-3 border-t border-ink/6 flex items-center gap-1.5 text-xs text-ink/50">
          <PenLine className="w-3 h-3" />
          签字：{record.signed_by}
        </div>
      )}
    </div>
  );
}

function ExpenseItem({ expense }: { expense: Expense }) {
  return (
    <div className="py-3 px-2 rounded-gallery hover:bg-cream-50 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-ink">{expense.category}</span>
            {expense.paid ? (
              <StatusBadge
                label="已支付"
                className="bg-moss-50 text-moss-400 border-moss-200 text-[10px]"
              />
            ) : (
              <StatusBadge
                label="待支付"
                className="bg-gold-50 text-gold-400 border-gold-200 text-[10px]"
              />
            )}
          </div>
          {expense.remark && (
            <p className="text-xs text-ink/40 mt-1 line-clamp-1">{expense.remark}</p>
          )}
          {expense.paid_date && (
            <p className="text-xs text-ink/30 mt-0.5">
              支付于 {formatDate(expense.paid_date)}
            </p>
          )}
        </div>
        <span className="font-display text-sm font-semibold text-ink flex-shrink-0">
          {formatCurrency(expense.amount)}
        </span>
      </div>
    </div>
  );
}
