export interface Order {
  id?: string;
  date: string;
  vendor: string;
  item: string;
  qty: number;
  stock: number;
  prep?: number;
  prep_checked?: boolean;
  updated_at: number;
  updated_by?: string;
  store_id?: string;
}

/** レシピ（品目に紐づく） */
export interface Recipe {
  ingredients: string[];
  steps: string[];
  points: string;
  estimatedMinutes?: number;
}

export interface Vendor {
  name: string;
  items: Item[];
}

export interface Item {
  name: string;
  unit: string;
  price: number;
  /** カテゴリー（野菜・乳製品など）。発注でグループ表示・フィルターに利用 */
  category?: string;
  recipe?: Recipe;
}

export interface Config {
  staff: string;
  storeId: string;
}

/** 業者ごとの発注履歴1件 */
export interface OrderHistoryEntry {
  date: string;
  vendor: string;
  timestamp: number;
}

export interface Master {
  vendors: Vendor[];
  /** カテゴリー一覧（発注のグループ・フィルターと品目で選択する候補） */
  categories?: string[];
}

export type SyncStatus = 'ready' | 'syncing' | 'saved' | 'offline' | 'conflict';
