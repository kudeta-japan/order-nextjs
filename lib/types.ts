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
  gasUrl?: string;
  staff: string;
  storeId: string;
}

export interface Master {
  vendors: Vendor[];
}

export type SyncStatus = 'ready' | 'syncing' | 'saved' | 'offline' | 'conflict';
