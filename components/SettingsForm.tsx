'use client'

import { useState, useEffect } from 'react'
import { useApp } from '@/contexts/AppContext'
import { MasterEditor } from './MasterEditor'

export function SettingsForm() {
  const { config, setConfig } = useApp()
  const [staffNames, setStaffNames] = useState<string[]>([])
  const [newName, setNewName] = useState('')

  useEffect(() => {
    const list = config.staff
      ? config.staff.split(',').map(s => s.trim()).filter(Boolean)
      : []
    setStaffNames(list.length > 0 ? list : ['担当者未設定'])
  }, [config.staff])

  const applyStaffToConfig = (names: string[]) => {
    const value = names.length > 0 ? names.join(',') : '担当者未設定'
    setConfig({ ...config, staff: value })
  }

  const handleRegister = () => {
    const name = newName.trim()
    if (!name) {
      alert('名前を入力してください')
      return
    }
    if (staffNames.includes(name)) {
      alert('同じ名前が既に登録されています')
      return
    }
    const next = staffNames[0] === '担当者未設定' ? [name] : [...staffNames, name]
    setStaffNames(next)
    applyStaffToConfig(next)
    setNewName('')
  }

  const handleRemoveStaff = (index: number) => {
    const next = staffNames.filter((_, i) => i !== index)
    if (next.length === 0) next.push('担当者未設定')
    setStaffNames(next)
    applyStaffToConfig(next)
  }

  return (
    <div className="max-w-[500px] mx-auto bg-white p-4 sm:p-5 rounded-xl">
      <h3 className="text-lg sm:text-xl font-bold mb-4">システム設定</h3>

      <div className="mb-4">
        <label className="block text-xs sm:text-sm font-bold mb-1">
          担当者（発注時の記録用）
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
            placeholder="名前を入力"
            className="flex-1 min-h-[44px] px-3 py-2.5 text-base sm:text-sm border border-gray-200 rounded-md touch-manipulation"
          />
          <button
            type="button"
            onClick={handleRegister}
            className="min-h-[44px] px-4 py-2.5 bg-blue-600 text-white rounded-md font-bold text-sm whitespace-nowrap touch-manipulation"
          >
            登録
          </button>
        </div>
        <ul className="mt-2 list-none p-0 space-y-1">
          {staffNames.map((name, i) => (
            <li key={i} className="flex items-center justify-between py-1 border-b border-gray-100">
              <span className="text-sm">{name}</span>
              {name !== '担当者未設定' && (
                <button
                  type="button"
                  onClick={() => handleRemoveStaff(i)}
                  className="text-xs text-red-600 touch-manipulation"
                >
                  削除
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      <MasterEditor />

      <p className="text-xs text-gray-500 mt-4 leading-relaxed">
        担当者・業者マスタは変更時に自動保存されます。業者マスタ・設定はこのブラウザ内（localStorage）に保存され、発注データは Supabase に保存されます。
      </p>
    </div>
  )
}
