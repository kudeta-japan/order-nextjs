'use client'

import { useMemo, useState, useEffect } from 'react'
import { useApp } from '@/contexts/AppContext'
import { loadOrderHistory, saveOrderHistoryEntry } from '@/lib/storage'
import type { OrderHistoryEntry } from '@/lib/types'

export function SummaryList() {
  const { orders, currentDate, master, config } = useApp()
  const [orderHistory, setOrderHistory] = useState<OrderHistoryEntry[]>([])
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrderHistory(loadOrderHistory())
    }
  }, [currentDate])

  const summary = useMemo(() => {
    const dateOrders = orders.filter(o => o.date === currentDate && o.qty > 0)
    const byVendor: Record<string, Array<{ item: string; qty: number; unit: string; price: number; amount: number }>> = {}

    dateOrders.forEach(order => {
      if (!byVendor[order.vendor]) {
        byVendor[order.vendor] = []
      }

      const vendor = master.vendors.find(v => v.name === order.vendor)
      const item = vendor?.items.find(i => i.name === order.item)
      const price = item?.price || 0
      const amount = order.qty * price

      byVendor[order.vendor].push({
        item: order.item,
        qty: order.qty,
        unit: item?.unit || '',
        price,
        amount,
      })
    })

    return byVendor
  }, [orders, currentDate, master])

  const todayHistory = useMemo(() => {
    return orderHistory.filter(h => h.date === currentDate)
  }, [orderHistory, currentDate])

  const handleCopyAll = () => {
    let text = `【発注内容】${currentDate}\n\n`
    Object.entries(summary).forEach(([vendor, items]) => {
      text += `■ ${vendor}\n`
      items.forEach(({ item, qty, unit }) => {
        text += `  ${item} ${qty}${unit}\n`
      })
      text += '\n'
    })
    navigator.clipboard.writeText(text).then(() => {
      alert('発注内容をクリップボードにコピーしました')
    }).catch(() => alert('コピーに失敗しました'))
  }

  const handleOrderVendor = (vendor: string, items: Array<{ item: string; qty: number; unit: string }>) => {
    let text = `【発注】${currentDate} ${vendor}\n\n`
    items.forEach(({ item, qty, unit }) => {
      text += `${item} ${qty}${unit}\n`
    })
    navigator.clipboard.writeText(text).then(() => {
      const entry: OrderHistoryEntry = {
        date: currentDate,
        vendor,
        timestamp: Date.now(),
      }
      saveOrderHistoryEntry(entry)
      setOrderHistory(loadOrderHistory())
      alert(`${vendor} の発注内容をコピーしました。発注履歴に記録しました。`)
    }).catch(() => alert('コピーに失敗しました'))
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('ja-JP', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (Object.keys(summary).length === 0) {
    return (
      <div className="max-w-[600px] mx-auto">
        <p className="text-center text-gray-500 py-8">発注データがありません</p>
        {todayHistory.length > 0 && (
          <div className="mt-4 p-4 border border-gray-200 rounded-xl">
            <button
              type="button"
              onClick={() => setShowHistory(!showHistory)}
              className="text-sm font-bold text-blue-600"
            >
              {showHistory ? '発注履歴を閉じる' : `本日の発注履歴（${todayHistory.length}件）`}
            </button>
            {showHistory && (
              <ul className="mt-2 list-none p-0 text-sm text-gray-600">
                {todayHistory.map((h, i) => (
                  <li key={i}>{h.vendor} — {formatTime(h.timestamp)}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-[600px] mx-auto">
      {Object.entries(summary).map(([vendor, items]) => {
        const total = items.reduce((sum, item) => sum + item.amount, 0)
        return (
          <div key={vendor} className="mb-5 border border-gray-200 rounded-xl overflow-hidden">
            <h3 className="m-0 px-4 py-3 bg-blue-600 text-white text-base font-bold">
              {vendor}
            </h3>
            <ul className="m-0 p-0 list-none">
              {items.map((item, index) => (
                <li
                  key={index}
                  className="px-4 py-2.5 border-b border-gray-200 flex justify-between items-center last:border-b-0"
                >
                  <span>
                    {item.item} {item.qty}{item.unit}
                  </span>
                  {item.amount > 0 && (
                    <span className="font-bold text-blue-600">
                      ¥{item.amount.toLocaleString()}
                    </span>
                  )}
                </li>
              ))}
              {total > 0 && (
                <li className="px-4 py-2.5 bg-gray-50 flex justify-between items-center font-bold">
                  <span>合計</span>
                  <span className="text-blue-600">¥{total.toLocaleString()}</span>
                </li>
              )}
            </ul>
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
              <button
                type="button"
                onClick={() => handleOrderVendor(vendor, items)}
                className="w-full min-h-[48px] px-4 py-2.5 bg-green-600 text-white border-none rounded-lg font-bold text-sm active:opacity-90 touch-manipulation"
              >
                発注する（{vendor}）
              </button>
            </div>
          </div>
        )
      })}

      {todayHistory.length > 0 && (
        <div className="mb-4 p-4 border border-gray-200 rounded-xl">
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="text-sm font-bold text-blue-600"
          >
            {showHistory ? '発注履歴を閉じる' : `本日の発注履歴（${todayHistory.length}件）`}
          </button>
          {showHistory && (
            <ul className="mt-2 list-none p-0 text-sm text-gray-600 space-y-1">
              {todayHistory.map((h, i) => (
                <li key={i} className="flex justify-between">
                  <span>{h.vendor}</span>
                  <span>{formatTime(h.timestamp)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={handleCopyAll}
        className="w-full min-h-[48px] px-4 py-3 bg-blue-600 text-white border-none rounded-lg font-bold text-sm active:opacity-90 touch-manipulation"
      >
        全業者分をコピー
      </button>
    </div>
  )
}
