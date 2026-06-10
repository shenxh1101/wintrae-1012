export type ArtworkStatus = "available" | "on_loan" | "restoring" | "archived";

export interface Artwork {
  id: string;
  name: string;
  author: string;
  year: string;
  material: string;
  category: string;
  height_cm: number;
  width_cm: number;
  depth_cm?: number;
  weight_kg: number;
  insurance_value: number;
  storage_condition: {
    temperature: string;
    humidity: string;
    light: string;
    notes?: string;
  };
  images: string[];
  status: ArtworkStatus;
  description?: string;
  accession_no: string;
  borrow_history: string[];
}

export type ApplicationStatus = "pending" | "approved" | "rejected";

export interface ContractMilestone {
  id: string;
  name: string;
  due_date: string;
  completed: boolean;
  completed_date?: string;
}

export interface BorrowApplication {
  id: string;
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
  status: ApplicationStatus;
  applied_at: string;
  approval_remark?: string;
  approved_at?: string;
  rejected_at?: string;
  contract_milestones: ContractMilestone[];
}

export type TransportStatus = "pending" | "packing" | "ready" | "in_transit" | "delivered";

export interface TransportTask {
  id: string;
  application_id: string;
  packaging_material: string;
  packaging_method: string;
  packing_list: string;
  packing_photos: string[];
  carrier: string;
  tracking_no: string;
  route: string;
  transport_staff: string;
  ship_date: string;
  arrive_date: string;
  status: TransportStatus;
  direction: "outbound" | "return";
}

export type BorrowStage =
  | "pending_approval"
  | "pending_outbound"
  | "in_transit_out"
  | "installed"
  | "pending_return"
  | "in_transit_back"
  | "returned"
  | "archived";

export interface StatusRecord {
  id: string;
  application_id: string;
  stage: BorrowStage;
  timestamp: string;
  operator: string;
  remark: string;
  inspection_photos: string[];
  damage_note: string;
  signed_by?: string;
}

export interface Expense {
  id: string;
  application_id: string;
  category: string;
  amount: number;
  remark: string;
  paid: boolean;
  paid_date?: string;
}

export type DocumentCategory = "contract" | "insurance" | "inspection" | "transport" | "other";

export interface Document {
  id: string;
  application_id?: string;
  artwork_id?: string;
  name: string;
  category: DocumentCategory;
  file_url: string;
  file_size: number;
  description: string;
  tags: string[];
  uploaded_at: string;
  version: string;
  archived: boolean;
}

export const BORROW_STAGES: { key: BorrowStage; label: string; order: number }[] = [
  { key: "pending_approval", label: "待审批", order: 0 },
  { key: "pending_outbound", label: "待出库", order: 1 },
  { key: "in_transit_out", label: "外运中", order: 2 },
  { key: "installed", label: "已布展", order: 3 },
  { key: "pending_return", label: "待归还", order: 4 },
  { key: "in_transit_back", label: "归还中", order: 5 },
  { key: "returned", label: "已归还", order: 6 },
  { key: "archived", label: "已归档", order: 7 },
];

export const ARTWORK_CATEGORIES = [
  "国画",
  "油画",
  "版画",
  "雕塑",
  "水彩",
  "书法",
  "摄影",
  "装置",
  "陶瓷",
  "其他",
];
