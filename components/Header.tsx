'use client'

import { useApp } from '@/contexts/AppContext'
import { useOrders } from '@/hooks/useOrders'
import { useEffect } from 'react'

export function Header() {
  const {
    currentDate,
    setCurrentDate,
    currentVendor,
    setCurrentVendor,
    master,
    config,
    setConfig,
    syncStatus,
    setSyncStatus,
    setOrders,
  } = useApp()
  const { getOrdersByDate } = useOrders()
  
  // 担当者リストの計算（初期値も含めて）
  const staffList = config.staff
    ? config.staff.split(',').map(s => s.trim()).filter(Boolean)
    : ['担当者未設定']
  
  if (staffList.length === 0) {
    staffList.push('担当者未設定')
  }

  // 日付変更時のデータ取得
  useEffect(() => {
    if (currentDate) {
      getOrdersByDate(currentDate).then(setOrders)
    }
  }, [currentDate, getOrdersByDate, setOrders])

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentDate(e.target.value)
  }

  const handlePrevDay = () => {
    const date = new Date(currentDate)
    date.setDate(date.getDate() - 1)
    setCurrentDate(date.toISOString().split('T')[0])
  }

  const handleNextDay = () => {
    const date = new Date(currentDate)
    date.setDate(date.getDate() + 1)
    setCurrentDate(date.toISOString().split('T')[0])
  }

  const handleVendorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentVendor(e.target.value)
  }

  const handleStaffChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setConfig({ ...config, staff: e.target.value })
  }

  const getStatusText = () => {
    switch (syncStatus) {
      case 'ready': return 'READY'
      case 'syncing': return '同期中...'
      case 'saved': return '保存済み'
      case 'offline': return 'オフライン'
      case 'conflict': return '競合'
      default: return 'READY'
    }
  }

  const getStatusClass = () => {
    switch (syncStatus) {
      case 'ready': return 'bg-slate-200 text-slate-600'
      case 'syncing': return 'bg-yellow-100 text-yellow-800'
      case 'saved': return 'bg-green-100 text-green-800'
      case 'offline': return 'bg-red-100 text-red-800'
      case 'conflict': return 'bg-orange-100 text-orange-800'
      default: return 'bg-slate-200 text-slate-600'
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white px-3 sm:px-4 py-2 sm:py-2.5 border-b border-gray-200 shadow-sm flex flex-wrap items-center gap-2 justify-between">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handlePrevDay}
            className="min-h-[44px] px-3 py-2 text-xs sm:text-sm rounded-md border border-gray-200 bg-white active:bg-gray-50 touch-manipulation"
            title="前日"
          >
            ← 前日
          </button>
          <input
            type="date"
            value={currentDate}
            onChange={handleDateChange}
            className="font-bold border-none p-0 w-auto min-h-[44px] text-sm sm:text-base"
          />
          <button
            type="button"
            onClick={handleNextDay}
            className="min-h-[44px] px-3 py-2 text-xs sm:text-sm rounded-md border border-gray-200 bg-white active:bg-gray-50 touch-manipulation"
            title="翌日"
          >
            翌日 →
          </button>
        </div>
        <span className={`text-xs px-2 py-1 rounded font-extrabold ${getStatusClass()}`}>
          {getStatusText()}
        </span>
      </div>
      <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
        <div className="hidden md:block" />
        <div className="md:hidden">
          <label className="text-[10px] block mb-1">業者</label>
          <select
            value={currentVendor || ''}
            onChange={handleVendorChange}
            className="min-w-[140px] min-h-[44px] px-2.5 py-2 text-base font-bold border border-gray-200 rounded-md touch-manipulation"
          >
            {master.vendors.length > 0 ? (
              master.vendors.map(v => (
                <option key={v.name} value={v.name}>{v.name}</option>
              ))
            ) : (
              <option value="">業者を選択</option>
            )}
          </select>
        </div>
        <div>
          <label className="text-[10px] block mb-1">担当者</label>
          <select
            value={config.staff || '担当者未設定'}
            onChange={handleStaffChange}
            className="w-[120px] min-h-[44px] px-2 py-2 text-base border border-gray-200 rounded-md touch-manipulation"
          >
            {staffList.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>
    </header>
  )
}
