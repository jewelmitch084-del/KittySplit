export type CharacterId =
  | "kitty"
  | "melody"
  | "cinnamon"
  | "kuromi"
  | "purin"
  | "pochacco";

export interface CharacterTheme {
  id: CharacterId;
  defaultName: string;
  title: string;
  bgTint: string;
  ringColor: string;
  accentHex: string;
  textHex: string;
}

export interface Participant {
  id: string;
  name: string;
  characterId: CharacterId;
}

export interface ReceiptItem {
  id: string;
  name: string;
  quantity: number;
  totalPrice: number;
  assignedTo: string[]; // participant IDs
}

export type TaxTipAllocationMode = "proportional" | "equal";

export interface ReceiptData {
  id: string;
  merchantName: string;
  date: string;
  currency: string;
  items: ReceiptItem[];
  tax: number;
  tip: number;
  discount: number;
  allocationMode: TaxTipAllocationMode;
  payerId: string;
}

export interface PersonItemLine {
  itemId: string;
  itemName: string;
  shareRatio: string;
  amount: number;
}

export interface PersonBreakdown {
  participant: Participant;
  itemsSubtotal: number;
  taxShare: number;
  tipShare: number;
  discountShare: number;
  totalOwed: number;
  lines: PersonItemLine[];
  isPayer: boolean;
}

export interface SettlementTransfer {
  from: Participant;
  to: Participant;
  amount: number;
}

export interface SplitSummary {
  subtotal: number;
  grandTotal: number;
  assignedSubtotal: number;
  unassignedSubtotal: number;
  unassignedCount: number;
  breakdowns: PersonBreakdown[];
  transfers: SettlementTransfer[];
}

export interface SavedSplit {
  id: string;
  savedAt: string;
  receipt: ReceiptData;
  participants: Participant[];
  grandTotal: number;
}
