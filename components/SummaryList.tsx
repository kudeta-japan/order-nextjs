'use client'

import { useMemo, useState, useEffect } from 'react'
import { useApp } from '@/contexts/AppContext'

export function SummaryList() {
  const { orders, currentDate, master, config } = useApp()
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [confirmedAt, setConfirmedAt] = useState<string | null>(null)

  // 確定状態の読み込み
  useEffect(() => {
    if (typeof window !== 'undefined' && currentDate) {
      const key = `order_confirmed_${currentDate}_${config.storeId || 'default'}`
      const confirmed = localStorage.getItem(key)
      if (confirmed) {
        setIsConfirmed(true)
        setConfirmedAt(confirmed)
      } else {
        setIsConfirmed(false)
        setConfirmedAt(null)
      }
    }
  }, [currentDate, config.storeId])

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

  const handleCopy = () => {
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
    }).catch(() => {
      alert('コピーに失敗しました')
    })
  }

  const handleConfirm = () => {
    const totalItems = Object.values(summary).reduce((sum, items) => sum + items.length, 0)
    const totalQty = Object.values(summary).reduce((sum, items) => 
      sum + items.reduce((s, item) => s + item.qty, 0), 0
    )

    if (totalItems === 0 || totalQty === 0) {
      alert('発注データがありません。発注を確定できません。')
      return
    }

    const confirmMessage = `以下の発注内容を確定しますか？\n\n日付: ${currentDate}\n業者数: ${Object.keys(summary).length}社\n品目数: ${totalItems}品目\n合計数量: ${totalQty}\n\n確定後は変更できません。`
    
    if (window.confirm(confirmMessage)) {
      const now = new Date().toISOString()
      const key = `order_confirmed_${currentDate}_${config.storeId || 'default'}`
      localStorage.setItem(key, now)
      setIsConfirmed(true)
      setConfirmedAt(now)
      alert(`発注を確定しました。\n確定日時: ${new Date(now).toLocaleString('ja-JP')}`)
    }
  }

  const formatConfirmedAt = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (Object.keys(summary).length === 0) {
    return (
      <div className="max-w-[600px] mx-auto">
        <p className="text-center text-gray-500 py-8">発注データがありません</p>
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
          </div>
        )
      })}
      {isConfirmed && confirmedAt && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-green-600 font-bold">✓ 発注確定済み</span>
          </div>
          <p className="text-sm text-green-700">
            確定日時: {formatConfirmedAt(confirmedAt)}
          </p>
        </div>
      )}
      
      <div className="mt-2.5 flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className="flex-1 min-h-[56px] sm:min-h-[44px] px-4 py-3 sm:py-2.5 bg-blue-600 text-white border-none rounded-lg font-bold text-base sm:text-sm active:opacity-90 touch-manipulation"
        >
          発注内容をコピー
        </button>
        {!isConfirmed && (
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 min-h-[56px] sm:min-h-[44px] px-4 py-3 sm:py-2.5 bg-green-600 text-white border-none rounded-lg font-bold text-base sm:text-sm active:opacity-90 touch-manipulation"
          >
            発注を確定する
          </button>
        )}
      </div>
    </div>
  )
}
