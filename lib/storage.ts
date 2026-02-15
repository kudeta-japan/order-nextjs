import type { Master, Config, Vendor, Item, OrderHistoryEntry } from './types'

const ORDER_HISTORY_KEY = 'order_history_v5'

const STORE_ID = 'default'

export const DEFAULT_CATEGORIES = ['野菜', '果物', '乳製品', '肉・魚', '調味料', 'その他']

export const DEFAULT_MASTER: Master = {
  vendors: [
    { name: '大光', items: [{ name: 'バター', unit: 'kg', price: 0 }, { name: '牛乳', unit: '本', price: 0 }] },
    { name: '高瀬', items: [{ name: 'キャベツ', unit: '玉', price: 0 }, { name: 'レタス', unit: '玉', price: 0 }] },
    { name: '安田青果', items: [{ name: '玉ねぎ', unit: 'kg', price: 0 }] }
  ],
  categories: [...DEFAULT_CATEGORIES],
}

export function loadMaster(): Master {
  if (typeof window === 'undefined') return DEFAULT_MASTER
  const raw = localStorage.getItem('orderMaster_v5')
  if (!raw) return JSON.parse(JSON.stringify(DEFAULT_MASTER))
  try {
    const parsed = JSON.parse(raw)
    if (parsed && Array.isArray(parsed.vendors) && parsed.vendors.length) {
      // price フィールドの正規化
      parsed.vendors.forEach((v: Vendor) => {
        (v.items || []).forEach((it: Item) => {
          if (typeof it.price !== 'number' && it.price !== undefined) it.price = Number(it.price) || 0
          if (typeof it.price !== 'number') it.price = 0
        })
      })
      if (!Array.isArray(parsed.categories)) parsed.categories = [...DEFAULT_CATEGORIES]
      return parsed
    }
  } catch (_) {}
  return JSON.parse(JSON.stringify(DEFAULT_MASTER))
}

export function persistMaster(master: Master): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('orderMaster_v5', JSON.stringify(master))
}

export function loadConfig(): Config {
  if (typeof window === 'undefined') {
    return { staff: '担当者未設定', storeId: STORE_ID }
  }
  const raw = localStorage.getItem('orderConfig_v5')
  if (!raw) return { staff: '担当者未設定', storeId: STORE_ID }
  try {
    const parsed = JSON.parse(raw)
    return {
      staff: parsed.staff || '担当者未設定',
      storeId: parsed.storeId || STORE_ID
    }
  } catch (_) {
    return { staff: '担当者未設定', storeId: STORE_ID }
  }
}

export function persistConfig(config: Config): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('orderConfig_v5', JSON.stringify(config))
}

export function loadOrderHistory(): OrderHistoryEntry[] {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem(ORDER_HISTORY_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (_) {
    return []
  }
}

export function saveOrderHistoryEntry(entry: OrderHistoryEntry): void {
  if (typeof window === 'undefined') return
  const list = loadOrderHistory()
  list.unshift(entry)
  localStorage.setItem(ORDER_HISTORY_KEY, JSON.stringify(list))
}

// v4からの移行（初回のみ）
export function migrateV4ToV5(): void {
  if (typeof window === 'undefined') return
  if (localStorage.getItem('orders_v5') !== null) return
  
  const rawOrders = localStorage.getItem('orders_v4')
  const rawConfig = localStorage.getItem('orderConfig_v4')
  if (!rawOrders && !rawConfig) return

  if (rawOrders) {
    try {
      const v4 = JSON.parse(rawOrders)
      const now = Date.now()
      const v5: Record<string, Record<string, Record<string, { qty: number; stock: number; updatedAt: number; updatedBy: string }>>> = {}
      
      for (const date of Object.keys(v4)) {
        v5[date] = {}
        for (const vendor of Object.keys(v4[date] || {})) {
          v5[date][vendor] = {}
          for (const item of Object.keys(v4[date][vendor] || {})) {
            const o = v4[date][vendor][item]
            v5[date][vendor][item] = {
              qty: typeof o === 'object' && o !== null && 'qty' in o ? o.qty : (Number(o) || 0),
              stock: (o && typeof o.stock !== 'undefined') ? Number(o.stock) : 0,
              updatedAt: (o && o.updatedAt) || now,
              updatedBy: (o && o.updatedBy) || ''
            }
          }
        }
      }
      localStorage.setItem('orders_v5', JSON.stringify(v5))
    } catch (_) {}
  }

  if (rawConfig) {
    try {
      const c = JSON.parse(rawConfig)
      persistConfig({ staff: c.staff || '担当者未設定', storeId: STORE_ID })
    } catch (_) {}
  }
}
