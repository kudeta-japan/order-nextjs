'use client'

import { useState, useEffect } from 'react'
import { useApp } from '@/contexts/AppContext'
import type { Vendor, Item } from '@/lib/types'

export function MasterEditor() {
  const { master, setMaster } = useApp()
  const [vendors, setVendors] = useState<Vendor[]>(master.vendors)

  useEffect(() => {
    setVendors(master.vendors)
  }, [master])

  const handleVendorNameChange = (index: number, name: string) => {
    const updated = [...vendors]
    updated[index] = { ...updated[index], name }
    setVendors(updated)
  }

  const handleItemChange = (vendorIndex: number, itemIndex: number, field: keyof Item, value: string | number) => {
    const updated = [...vendors]
    const items = [...updated[vendorIndex].items]
    items[itemIndex] = { ...items[itemIndex], [field]: value }
    updated[vendorIndex] = { ...updated[vendorIndex], items }
    setVendors(updated)
  }

  const handleAddItem = (vendorIndex: number) => {
    const updated = [...vendors]
    updated[vendorIndex].items.push({ name: '', unit: '', price: 0 })
    setVendors(updated)
  }

  const handleRemoveItem = (vendorIndex: number, itemIndex: number) => {
    const updated = [...vendors]
    updated[vendorIndex].items.splice(itemIndex, 1)
    setVendors(updated)
  }

  const handleAddVendor = () => {
    setVendors([...vendors, { name: '', items: [] }])
  }

  const handleRemoveVendor = (index: number) => {
    setVendors(vendors.filter((_, i) => i !== index))
  }

  const handleBulkAdd = (vendorIndex: number, text: string) => {
    const lines = text.split('\n').filter(line => line.trim())
    const newItems: Item[] = lines.map(line => {
      const parts = line.trim().split(/\s+/)
      return {
        name: parts[0] || '',
        unit: parts[1] || '',
        price: parseFloat(parts[2]) || 0,
      }
    })
    const updated = [...vendors]
    updated[vendorIndex].items = [...updated[vendorIndex].items, ...newItems]
    setVendors(updated)
  }

  const handleSave = () => {
    setMaster({ vendors })
  }

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string)
        if (json && Array.isArray(json)) {
          const imported: Vendor[] = json.map((v: any) => ({
            name: v.name || '',
            items: (v.items || []).map((it: any) => ({
              name: it.name || '',
              unit: it.unit || '',
              price: typeof it.price === 'number' ? it.price : 0,
            })),
          }))
          setVendors(imported)
          setMaster({ vendors: imported })
          alert('マスタデータを読み込みました')
        } else {
          alert('JSON形式が正しくありません')
        }
      } catch (err) {
        alert('JSONの読み込みに失敗しました')
      }
    }
    reader.readAsText(file)
  }

  // 自動保存
  useEffect(() => {
    const timer = setTimeout(() => {
      setMaster({ vendors })
    }, 500)
    return () => clearTimeout(timer)
  }, [vendors, setMaster])

  return (
    <div className="mt-6 pt-5 border-t border-gray-200">
      <h4 className="text-sm font-bold mb-3">業者・品目マスタ</h4>
      <p className="text-xs text-gray-500 mb-2.5">
        業者を追加し、各業者の品目（名前と単位）を登録できます。
      </p>

      <div className="mb-3">
        <label className="block text-xs sm:text-sm font-bold mb-1">
          JSONからマスタを読み込み（master_seed.json など）
        </label>
        <input
          type="file"
          accept=".json,application/json"
          onChange={handleFileImport}
          className="w-full text-sm sm:text-xs mb-1.5 min-h-[44px] touch-manipulation"
        />
      </div>

      {vendors.map((vendor, vendorIndex) => (
        <div key={vendorIndex} className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-3 mb-3">
          <div className="flex gap-2 items-center mb-2.5">
            <input
              type="text"
              value={vendor.name}
              onChange={(e) => handleVendorNameChange(vendorIndex, e.target.value)}
              placeholder="業者名"
              className="flex-1 min-h-[44px] px-3 py-2 text-base sm:text-sm border border-gray-200 rounded-md touch-manipulation"
            />
            <button
              type="button"
              onClick={() => handleRemoveVendor(vendorIndex)}
              className="min-h-[44px] px-3 py-2 text-sm sm:text-xs rounded-md border border-red-600 text-red-600 active:bg-red-50 touch-manipulation whitespace-nowrap"
            >
              削除
            </button>
          </div>

          {vendor.items.map((item, itemIndex) => (
            <div key={itemIndex} className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center mb-2 sm:mb-1.5">
              <input
                type="text"
                value={item.name}
                onChange={(e) => handleItemChange(vendorIndex, itemIndex, 'name', e.target.value)}
                placeholder="品目名"
                className="flex-1 min-w-0 min-h-[44px] px-3 py-2 text-base sm:text-sm border border-gray-200 rounded-md touch-manipulation"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={item.unit}
                  onChange={(e) => handleItemChange(vendorIndex, itemIndex, 'unit', e.target.value)}
                  placeholder="単位"
                  className="w-[80px] sm:w-[60px] min-h-[44px] px-2 py-2 text-base sm:text-sm border border-gray-200 rounded-md touch-manipulation"
                />
                <input
                  type="number"
                  value={item.price}
                  onChange={(e) => handleItemChange(vendorIndex, itemIndex, 'price', parseFloat(e.target.value) || 0)}
                  placeholder="単価"
                  className="w-[100px] sm:w-[70px] min-h-[44px] px-2 py-2 text-base sm:text-sm border border-gray-200 rounded-md touch-manipulation"
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveItem(vendorIndex, itemIndex)}
                  className="min-h-[44px] px-3 py-2 text-sm sm:text-xs rounded-md border border-red-600 text-red-600 active:bg-red-50 touch-manipulation whitespace-nowrap"
                >
                  削除
                </button>
              </div>
            </div>
          ))}

          <div className="mt-2">
            <textarea
              placeholder="品目名 単位 単価（1行1品目）&#10;例: バター kg 500"
              className="w-full min-h-[80px] sm:min-h-[60px] px-3 py-2 text-base sm:text-xs border border-gray-200 rounded-md touch-manipulation"
              onBlur={(e) => {
                if (e.target.value.trim()) {
                  handleBulkAdd(vendorIndex, e.target.value)
                  e.target.value = ''
                }
              }}
            />
            <p className="text-xs text-gray-500 mt-1">
              複数行で一括追加できます（品目名 単位 単価）
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleAddItem(vendorIndex)}
            className="mt-2 w-full sm:w-auto min-h-[44px] px-3 py-2 text-sm rounded-md border border-gray-200 bg-white active:bg-gray-50 touch-manipulation"
          >
            ＋ 品目を追加
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={handleAddVendor}
        className="mt-2 w-full min-h-[56px] sm:min-h-[44px] px-3 py-3 sm:py-2.5 bg-green-600 text-white border-none rounded-lg font-bold text-base sm:text-sm active:bg-green-700 touch-manipulation"
      >
        ＋ 業者を追加
      </button>
    </div>
  )
}
