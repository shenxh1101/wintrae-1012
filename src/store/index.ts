import { create } from "zustand";
import { persist } from "zustand/middleware";
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
  ContractMilestone,
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
  updateApplicationStage: (
    applicationId: string,
    stage: BorrowStage,
    remark: string,
    operator: string,
    inspection_photos?: string[],
    damage_note?: string
  ) => void;
  updateTransportStatus: (id: string, status: TransportStatus) => void;
  updateTransportTask: (id: string, updates: Partial<TransportTask>) => void;
  addExpense: (expense: Omit<Expense, "id">) => void;
  addDocument: (doc: Omit<Document, "id" | "uploaded_at">) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  addStatusRecord: (record: Omit<StatusRecord, "id" | "timestamp">) => void;
  addContractMilestone: (applicationId: string, milestone: Omit<ContractMilestone, "id">) => void;
  updateContractMilestone: (applicationId: string, milestoneId: string, updates: Partial<ContractMilestone>) => void;
  deleteContractMilestone: (applicationId: string, milestoneId: string) => void;
  getApplicationExpenses: (applicationId: string) => Expense[];
  getApplicationDocuments: (applicationId: string) => Document[];
  getApplicationStatusRecords: (applicationId: string) => StatusRecord[];
  getApplicationTransportTasks: (applicationId: string) => TransportTask[];
  getArtworkById: (id: string) => Artwork | undefined;
  getApplicationById: (id: string) => BorrowApplication | undefined;
  resetAllData: () => void;
}

const generateId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
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

      updateApplicationStage: (applicationId, stage, remark, operator, inspection_photos = [], damage_note = "") => {
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
              inspection_photos,
              damage_note,
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

      updateTransportTask: (id, updates) =>
        set((state) => ({
          transportTasks: state.transportTasks.map((t) =>
            t.id === id ? { ...t, ...updates } : t
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

      updateDocument: (id, updates) =>
        set((state) => ({
          documents: state.documents.map((d) =>
            d.id === id ? { ...d, ...updates } : d
          ),
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

      addContractMilestone: (applicationId, milestone) =>
        set((state) => ({
          applications: state.applications.map((a) => {
            if (a.id !== applicationId) return a;
            return {
              ...a,
              contract_milestones: [
                ...a.contract_milestones,
                { ...milestone, id: generateId("cm") },
              ],
            };
          }),
        })),

      updateContractMilestone: (applicationId, milestoneId, updates) =>
        set((state) => ({
          applications: state.applications.map((a) => {
            if (a.id !== applicationId) return a;
            return {
              ...a,
              contract_milestones: a.contract_milestones.map((m) =>
                m.id === milestoneId ? { ...m, ...updates } : m
              ),
            };
          }),
        })),

      deleteContractMilestone: (applicationId, milestoneId) =>
        set((state) => ({
          applications: state.applications.map((a) => {
            if (a.id !== applicationId) return a;
            return {
              ...a,
              contract_milestones: a.contract_milestones.filter((m) => m.id !== milestoneId),
            };
          }),
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

      resetAllData: () =>
        set({
          artworks: mockArtworks,
          applications: mockApplications,
          transportTasks: mockTransportTasks,
          statusRecords: mockStatusRecords,
          expenses: mockExpenses,
          documents: mockDocuments,
        }),
    }),
    {
      name: "gallery-borrow-storage",
      version: 1,
    }
  )
);
