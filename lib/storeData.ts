import { supabase, type StoreDataRow } from '@/lib/supabase'
import type { Master, Config, Vendor, Item } from '@/lib/types'
import { DEFAULT_CATEGORIES } from '@/lib/storage'

function normalizeMaster(raw: unknown): Master | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  if (!Array.isArray(o.vendors)) return null
  const vendors = o.vendors as Vendor[]
  if (vendors.length === 0) return null
  vendors.forEach((v: Vendor) => {
    (v.items || []).forEach((it: Item) => {
      if (typeof it.price !== 'number' && it.price !== undefined) it.price = Number(it.price) || 0
      if (typeof it.price !== 'number') it.price = 0
    })
  })
  const categories = Array.isArray(o.categories) ? o.categories : [...DEFAULT_CATEGORIES]
  return { vendors, categories }
}

function normalizeConfig(raw: unknown): Config | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  const staff = typeof o.staff === 'string' ? o.staff : '担当者未設定'
  const storeId = typeof o.storeId === 'string' ? o.storeId : 'default'
  return { staff, storeId }
}

/**
 * store_id に紐づくマスタ・設定を Supabase から取得する。
 * 行が存在しないか失敗時は null。
 */
export async function fetchStoreData(storeId: string): Promise<{ master: Master; config: Config } | null> {
  try {
    const { data, error } = await supabase
      .from('store_data')
      .select('master, config')
      .eq('store_id', storeId)
      .maybeSingle() as { data: { master: unknown; config: unknown } | null; error: unknown }

    if (error || !data) return null

    const master = normalizeMaster(data.master)
    const config = normalizeConfig(data.config)
    if (!master || !config) return null

    return { master, config }
  } catch (err) {
    console.error('fetchStoreData:', err)
    return null
  }
}

/**
 * マスタ・設定を Supabase に upsert する（非同期でよい）。
 */
export async function upsertStoreData(storeId: string, master: Master, config: Config): Promise<void> {
  try {
    const row: StoreDataRow = {
      store_id: storeId,
      master,
      config,
      updated_at: Date.now(),
    }
    const { error } = await supabase
      .from('store_data')
      .upsert(row as never, { onConflict: 'store_id' })

    if (error) console.error('upsertStoreData:', error)
  } catch (err) {
    console.error('upsertStoreData:', err)
  }
}
