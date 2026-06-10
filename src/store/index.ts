import { create } from "zustand";
import type {
  Artwork,
  BorrowApplication,
  TransportTask,
  StatusRecord,
  Expense,
  Document,
  ApplicationStatus,
  BorrowStage,
  TransportStatus,
} from "../types";
import {
  mockArtworks,
  mockApplications,
  mockTransportTasks,
  mockStatusRecords,
  mockExpenses,
  mockDocuments,
} from "../data/mockData";

interface AppState {
  artworks: Artwork[];
  applications: BorrowApplication[];
  transportTasks: TransportTask[];
  statusRecords: StatusRecord[];
  expenses: Expense[];
  documents: Document[];
  selectedArtworkId: string | null;
  selectedApplicationId: string | null;
  setSelectedArtworkId: (id: string | null) => void;
  setSelectedApplicationId: (id: string | null) => void;
  addArtwork: (artwork: Omit<Artwork, "id" | "borrow_history">) => void;
  updateArtwork: (id: string, updates: Partial<Artwork>) => void;
  addApplication: (app: Omit<BorrowApplication, "id" | "applied_at" | "contract_milestones" | "status">) => void;
  updateApplicationStatus: (id: string, status: ApplicationStatus, remark?: string) => void;
  updateApplicationStage: (applicationId: string, stage: BorrowStage, remark: string, operator: string) => void;
  updateTransportStatus: (id: string, status: TransportStatus) => void;
  addExpense: (expense: Omit<Expense, "id">) => void;
  addDocument: (doc: Omit<Document, "id" | "uploaded_at">) => void;
  addStatusRecord: (record: Omit<StatusRecord, "id" | "timestamp">) => void;
  getApplicationExpenses: (applicationId: string) => Expense[];
  getApplicationDocuments: (applicationId: string) => Document[];
  getApplicationStatusRecords: (applicationId: string) => StatusRecord[];
  getApplicationTransportTasks: (applicationId: string) => TransportTask[];
  getArtworkById: (id: string) => Artwork | undefined;
  getApplicationById: (id: string) => BorrowApplication | undefined;
}

const generateId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export const useAppStore = create<AppState>((set, get) => ({
  artworks: mockArtworks,
  applications: mockApplications,
  transportTasks: mockTransportTasks,
  statusRecords: mockStatusRecords,
  expenses: mockExpenses,
  documents: mockDocuments,
  selectedArtworkId: null,
  selectedApplicationId: null,

  setSelectedArtworkId: (id) => set({ selectedArtworkId: id }),
  setSelectedApplicationId: (id) => set({ selectedApplicationId: id }),

  addArtwork: (artwork) =>
    set((state) => ({
      artworks: [
        ...state.artworks,
        {
          ...artwork,
          id: generateId("aw"),
          borrow_history: [],
        },
      ],
    })),

  updateArtwork: (id, updates) =>
    set((state) => ({
      artworks: state.artworks.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    })),

  addApplication: (app) =>
    set((state) => ({
      applications: [
        ...state.applications,
        {
          ...app,
          id: generateId("app"),
          status: "pending",
          applied_at: new Date().toISOString().slice(0, 10),
          contract_milestones: [],
        },
      ],
    })),

  updateApplicationStatus: (id, status, remark) =>
    set((state) => ({
      applications: state.applications.map((a) => {
        if (a.id !== id) return a;
        const updates: Partial<BorrowApplication> = { status };
        if (remark) updates.approval_remark = remark;
        if (status === "approved") updates.approved_at = new Date().toISOString().slice(0, 10);
        if (status === "rejected") updates.rejected_at = new Date().toISOString().slice(0, 10);
        return { ...a, ...updates };
      }),
    })),

  updateApplicationStage: (applicationId, stage, remark, operator) => {
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    set((state) => ({
      statusRecords: [
        ...state.statusRecords,
        {
          id: generateId("sr"),
          application_id: applicationId,
          stage,
          timestamp,
          operator,
          remark,
          inspection_photos: [],
          damage_note: "",
        },
      ],
    }));
  },

  updateTransportStatus: (id, status) =>
    set((state) => ({
      transportTasks: state.transportTasks.map((t) =>
        t.id === id ? { ...t, status } : t
      ),
    })),

  addExpense: (expense) =>
    set((state) => ({
      expenses: [...state.expenses, { ...expense, id: generateId("exp") }],
    })),

  addDocument: (doc) =>
    set((state) => ({
      documents: [
        ...state.documents,
        {
          ...doc,
          id: generateId("doc"),
          uploaded_at: new Date().toISOString().slice(0, 10),
        },
      ],
    })),

  addStatusRecord: (record) =>
    set((state) => ({
      statusRecords: [
        ...state.statusRecords,
        {
          ...record,
          id: generateId("sr"),
          timestamp: new Date().toISOString().slice(0, 16).replace("T", " "),
        },
      ],
    })),

  getApplicationExpenses: (applicationId) =>
    get().expenses.filter((e) => e.application_id === applicationId),

  getApplicationDocuments: (applicationId) =>
    get().documents.filter((d) => d.application_id === applicationId),

  getApplicationStatusRecords: (applicationId) =>
    get()
      .statusRecords.filter((s) => s.application_id === applicationId)
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp)),

  getApplicationTransportTasks: (applicationId) =>
    get().transportTasks.filter((t) => t.application_id === applicationId),

  getArtworkById: (id) => get().artworks.find((a) => a.id === id),
  getApplicationById: (id) => get().applications.find((a) => a.id === id),
}));
