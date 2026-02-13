'use client'

import { useState, useEffect } from 'react'
import { useApp } from '@/contexts/AppContext'
import { MasterEditor } from './MasterEditor'

export function SettingsForm() {
  const { config, setConfig } = useApp()
  const [gasUrl, setGasUrl] = useState(config.gasUrl || '')
  const [staffList, setStaffList] = useState(config.staff || '')
  const [gasUrlError, setGasUrlError] = useState('')
  const [staffListError, setStaffListError] = useState('')

  useEffect(() => {
    setGasUrl(config.gasUrl || '')
    setStaffList(config.staff || '')
  }, [config])

  const handleSave = () => {
    let hasError = false

    // GAS URL の検証（空でもOK、後方互換のため）
    if (gasUrl && !gasUrl.startsWith('https://')) {
      setGasUrlError('有効なHTTPS URLを入力してください')
      hasError = true
    } else {
      setGasUrlError('')
    }

    // 担当者リストの検証
    if (!staffList.trim()) {
      setStaffListError('担当者を1名以上入力してください')
      hasError = true
    } else {
      setStaffListError('')
    }

    if (!hasError) {
      setConfig({
        ...config,
        gasUrl: gasUrl.trim() || undefined,
        staff: staffList.trim(),
      })
      alert('設定を保存しました')
    }
  }

  return (
    <div className="max-w-[500px] mx-auto bg-white p-4 sm:p-5 rounded-xl">
      <h3 className="text-lg sm:text-xl font-bold mb-4">システム設定</h3>
      
      <div className="mb-4">
        <label className="block text-xs sm:text-sm font-bold mb-1">
          GAS WebアプリURL
          <span className="ml-2 text-gray-400 font-normal">（現在は使用していません）</span>
        </label>
        <input
          type="text"
          value={gasUrl}
          onChange={(e) => {
            setGasUrl(e.target.value)
            setGasUrlError('')
          }}
          placeholder="https://script.google.com/..."
          disabled
          className="w-full min-h-[44px] px-3 py-2.5 text-base sm:text-sm border border-gray-200 rounded-md bg-gray-50 text-gray-400 cursor-not-allowed touch-manipulation"
        />
        <p className="text-xs text-gray-500 mt-1">
          現在のNext.js版ではSupabaseを使用しているため、GAS URLは不要です。入力する必要はありません。
        </p>
      </div>

      <div className="mb-4">
        <label className="block text-xs sm:text-sm font-bold mb-1">
          担当者（カンマ区切り・発注時の記録用）
        </label>
        <input
          type="text"
          value={staffList}
          onChange={(e) => {
            setStaffList(e.target.value)
            setStaffListError('')
          }}
          placeholder="田中, 佐藤, 鈴木"
          className={`w-full min-h-[44px] px-3 py-2.5 text-base sm:text-sm border rounded-md touch-manipulation ${
            staffListError ? 'border-red-600' : 'border-gray-200'
          }`}
        />
        {staffListError && (
          <div className="text-xs text-red-600 mt-1">{staffListError}</div>
        )}
      </div>

      <MasterEditor />

      <button
        type="button"
        onClick={handleSave}
        className="w-full min-h-[56px] sm:min-h-[44px] bg-blue-600 text-white px-3 py-3 sm:py-2.5 border-none rounded-md font-bold mt-4 text-base sm:text-sm active:opacity-90 touch-manipulation"
      >
        保存して適用
      </button>

      <p className="text-xs text-gray-500 mt-3 leading-relaxed">
        ※業者マスタ・設定・発注データはこのブラウザ内（localStorage）に保存されます。別の端末やブラウザでは共有されません。クラウド同期を使うと Supabase にも発注データが保存されます。
      </p>
    </div>
  )
}
