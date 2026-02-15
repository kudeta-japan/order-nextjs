import { createClient } from '@supabase/supabase-js'
import type { Order, Master, Config } from './types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export interface StoreDataRow {
  store_id: string
  master: Master
  config: Config
  updated_at: number
}

type Database = {
  public: {
    Tables: {
      orders: {
        Row: Order
        Insert: Omit<Order, 'id'>
        Update: Partial<Omit<Order, 'id'>>
      }
      store_data: {
        Row: StoreDataRow
        Insert: StoreDataRow
        Update: Partial<Omit<StoreDataRow, 'store_id'>>
      }
    }
  }
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
