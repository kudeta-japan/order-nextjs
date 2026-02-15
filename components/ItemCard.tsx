'use client'

import { useRef, useCallback } from 'react'
import { useApp } from '@/contexts/AppContext'
import { useOrders } from '@/hooks/useOrders'
import type { Item } from '@/lib/types'

interface ItemCardProps {
  vendor: string
  item: Item
  /** 全ての業者表示時に業者名を表示する */
  showVendorLabel?: boolean
  /** カテゴリー色分け用の左ボーダークラス（例: border-l-4 border-l-green-500） */
  categoryBorderClass?: string
}

export function ItemCard({ vendor, item, showVendorLabel, categoryBorderClass }: ItemCardProps) {
  const {
    currentDate,
    config,
    orders,
    updateOrder,
  } = useApp()
  const { upsertOrder } = useOrders()

  const order = orders.find(
    o => o.date === currentDate &&
         o.vendor === vendor &&
         o.item === item.name &&
         (o.store_id || 'default') === (config.storeId || 'default')
  )

  const qty = order?.qty || 0
  const stock = order?.stock || 0
  const prep = order?.prep ?? 0
  const price = item.price || 0
  const amount = qty * price

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  const saveOrder = useCallback(async (newQty: number, newStock: number, newPrep?: number) => {
    const now = Date.now()
    const orderData = {
      id: order?.id,
      date: currentDate,
      vendor,
      item: item.name,
      qty: newQty,
      stock: newStock,
      prep: newPrep ?? prep,
      prep_checked: order?.prep_checked ?? false,
      updated_at: now,
      updated_by: config.staff,
      store_id: config.storeId || 'default',
    }

    // 即座にUIを更新
    updateOrder(orderData)
    
    // デバウンス処理：既存のタイマーをクリア
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // 新しいタイマーを設定
    debounceTimerRef.current = setTimeout(async () => {
      await upsertOrder(orderData)
      debounceTimerRef.current = null
    }, 600)
  }, [currentDate, vendor, item.name, config.staff, config.storeId, order?.id, order?.prep_checked, prep, updateOrder, upsertOrder])

  const handleQtyChange = (delta: number) => {
    const newQty = Math.max(0, qty + delta)
    saveOrder(newQty, stock)
  }

  const handleStockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStock = Math.max(0, parseInt(e.target.value) || 0)
    saveOrder(qty, newStock)
  }

  const handlePrepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPrep = Math.max(0, parseInt(e.target.value) || 0)
    saveOrder(qty, stock, newPrep)
  }

  return (
    <div
      className={`bg-white p-3 sm:p-4 rounded-xl border shadow-sm flex justify-between items-start gap-3 ${
        qty > 0 ? 'border-green-500 bg-green-50' : 'border-gray-200'
      } ${categoryBorderClass ?? ''}`}
    >
      <div className="flex-1 min-w-0">
        {showVendorLabel && (
          <div className="text-xs text-gray-500 mb-0.5 truncate">{vendor}</div>
        )}
        <div className="font-bold text-base sm:text-lg mb-2 truncate">{item.name}</div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mt-2">
          <div className="flex items-center gap-2 flex-shrink-0 whitespace-nowrap">
            <button
              type="button"
              onClick={() => handleQtyChange(-1)}
              className="min-w-[56px] min-h-[56px] w-14 h-14 sm:min-w-[48px] sm:min-h-[48px] sm:w-12 sm:h-12 rounded-lg border-2 border-gray-200 bg-white text-2xl sm:text-xl font-bold flex items-center justify-center active:bg-gray-100 touch-manipulation select-none"
              aria-label="数量を減らす"
            >
              −
            </button>
            <span className="text-2xl sm:text-xl font-extrabold min-w-[40px] sm:min-w-[32px] text-center">{qty}</span>
            <button
              type="button"
              onClick={() => handleQtyChange(1)}
              className="min-w-[56px] min-h-[56px] w-14 h-14 sm:min-w-[48px] sm:min-h-[48px] sm:w-12 sm:h-12 rounded-lg border-2 border-gray-200 bg-white text-2xl sm:text-xl font-bold flex items-center justify-center active:bg-gray-100 touch-manipulation select-none"
              aria-label="数量を増やす"
            >
              +
            </button>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="text-sm sm:text-xs text-gray-500 whitespace-nowrap">{item.unit}</div>
            {price > 0 && (
              <>
                <div className="text-sm sm:text-xs text-gray-500">単価: ¥{price.toLocaleString()}</div>
                {amount > 0 && (
                  <div className="font-bold text-blue-600 text-base sm:text-sm">¥{amount.toLocaleString()}</div>
                )}
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 mt-2 flex-wrap">
          <label className="text-sm sm:text-xs text-gray-600 whitespace-nowrap">在庫:</label>
          <input
            type="number"
            value={stock}
            onChange={handleStockChange}
            min="0"
            className="w-[80px] sm:w-[70px] min-h-[44px] px-2 py-2 text-base sm:text-sm border border-gray-200 rounded-md touch-manipulation"
            inputMode="numeric"
            pattern="[0-9]*"
          />
          <label className="text-sm sm:text-xs text-gray-600 whitespace-nowrap">仕込み:</label>
          <input
            type="number"
            value={prep}
            onChange={handlePrepChange}
            min="0"
            className="w-[80px] sm:w-[70px] min-h-[44px] px-2 py-2 text-base sm:text-sm border border-gray-200 rounded-md touch-manipulation"
            inputMode="numeric"
            pattern="[0-9]*"
          />
        </div>
      </div>
    </div>
  )
}
