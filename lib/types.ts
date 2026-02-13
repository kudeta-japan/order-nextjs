export interface Order {
  id?: string;
  date: string;
  vendor: string;
  item: string;
  qty: number;
  stock: number;
  updated_at: number;
  updated_by?: string;
  store_id?: string;
}

export interface Vendor {
  name: string;
  items: Item[];
}

export interface Item {
  name: string;
  unit: string;
  price: number;
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
}

export type SyncStatus = 'ready' | 'syncing' | 'saved' | 'offline' | 'conflict';
