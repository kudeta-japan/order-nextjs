'use client'

import { useState, useEffect } from 'react'
import { useApp } from '@/contexts/AppContext'
import type { Vendor, Item, Recipe } from '@/lib/types'

function defaultRecipe(): Recipe {
  return { ingredients: [], steps: [], points: '', estimatedMinutes: undefined }
}

export function MasterEditor() {
  const { master, setMaster } = useApp()
  const [vendors, setVendors] = useState<Vendor[]>(master.vendors)
  const [recipeOpenKey, setRecipeOpenKey] = useState<string | null>(null)
  const [collapsedVendors, setCollapsedVendors] = useState<Set<number>>(new Set())

  const toggleVendorCollapse = (vendorIndex: number) => {
    setCollapsedVendors(prev => {
      const next = new Set(prev)
      if (next.has(vendorIndex)) next.delete(vendorIndex)
      else next.add(vendorIndex)
      return next
    })
  }

  useEffect(() => {
    setVendors(master.vendors)
  }, [master])

  const handleVendorNameChange = (index: number, name: string) => {
    const updated = [...vendors]
    updated[index] = { ...updated[index], name }
    setVendors(updated)
  }

  const handleItemChange = (vendorIndex: number, itemIndex: number, field: keyof Item, value: string | number | Recipe | undefined) => {
    const updated = [...vendors]
    const items = [...updated[vendorIndex].items]
    items[itemIndex] = { ...items[itemIndex], [field]: value }
    updated[vendorIndex] = { ...updated[vendorIndex], items }
    setVendors(updated)
  }

  const handleRecipeChange = (vendorIndex: number, itemIndex: number, recipe: Recipe) => {
    handleItemChange(vendorIndex, itemIndex, 'recipe', recipe)
  }

  const handleAddItem = (vendorIndex: number) => {
    const updated = [...vendors]
    updated[vendorIndex].items.push({ name: '', unit: '', price: 0 })
    setVendors(updated)
  }

  const toggleRecipe = (key: string) => {
    setRecipeOpenKey(prev => prev === key ? null : key)
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

      {vendors.map((vendor, vendorIndex) => {
        const isCollapsed = collapsedVendors.has(vendorIndex)
        const itemCount = vendor.items.length
        return (
        <div key={vendorIndex} className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-3 mb-3">
          <div className="flex gap-2 items-center">
            <button
              type="button"
              onClick={() => toggleVendorCollapse(vendorIndex)}
              className="flex-shrink-0 w-9 h-9 rounded-md border border-gray-300 bg-white flex items-center justify-center active:bg-gray-100 touch-manipulation text-gray-600"
              aria-label={isCollapsed ? '展開する' : '折りたたむ'}
            >
              <span className="text-lg leading-none">{isCollapsed ? '▶' : '▼'}</span>
            </button>
            <input
              type="text"
              value={vendor.name}
              onChange={(e) => handleVendorNameChange(vendorIndex, e.target.value)}
              placeholder="業者名"
              className="flex-1 min-h-[44px] px-3 py-2 text-base sm:text-sm border border-gray-200 rounded-md touch-manipulation"
            />
            {isCollapsed && (
              <span className="text-sm text-gray-500 whitespace-nowrap">品目 {itemCount} 件</span>
            )}
            <button
              type="button"
              onClick={() => handleRemoveVendor(vendorIndex)}
              className="min-h-[44px] px-3 py-2 text-sm sm:text-xs rounded-md border border-red-600 text-red-600 active:bg-red-50 touch-manipulation whitespace-nowrap"
            >
              削除
            </button>
          </div>

          {!isCollapsed && (
          <>
          {vendor.items.map((item, itemIndex) => (
            <div key={itemIndex} className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center mb-2 sm:mb-1.5">
              <input
                type="text"
                value={item.name}
                onChange={(e) => handleItemChange(vendorIndex, itemIndex, 'name', e.target.value)}
                placeholder="品目名"
                className="flex-1 min-w-0 min-h-[44px] px-3 py-2 text-base sm:text-sm border border-gray-200 rounded-md touch-manipulation"
              />
              <div className="flex gap-2 flex-wrap">
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
          </>
          )}
        </div>
        )
      })}

      <button
        type="button"
        onClick={handleAddVendor}
        className="mt-2 w-full min-h-[56px] sm:min-h-[44px] px-3 py-3 sm:py-2.5 bg-green-600 text-white border-none rounded-lg font-bold text-base sm:text-sm active:bg-green-700 touch-manipulation"
      >
        ＋ 業者を追加
      </button>

      {/* 仕込みレシピ（仕込みタブ用） */}
      <div className="mt-10 pt-6 border-t-2 border-gray-200">
        <h4 className="text-sm font-bold mb-1">仕込みレシピ</h4>
        <p className="text-xs text-gray-500 mb-4">
          仕込みタブで行をタップしたときに表示するレシピを、品目ごとに設定できます。
        </p>
        {vendors.map((vendor, vendorIndex) => (
          <div key={vendorIndex} className="mb-4">
            <div className="text-xs font-bold text-gray-600 mb-2">{vendor.name || '（業者名未設定）'}</div>
            <ul className="list-none p-0 m-0 space-y-2">
              {vendor.items.map((item, itemIndex) => {
                const recipeKey = `prep-${vendorIndex}-${itemIndex}`
                const isRecipeOpen = recipeOpenKey === recipeKey
                const recipe = item.recipe ?? defaultRecipe()
                const itemLabel = item.name || '（品目名未設定）'
                return (
                  <li key={itemIndex} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="flex items-center gap-2 p-2">
                      <span className="flex-1 text-sm font-medium truncate">{itemLabel}</span>
                      <button
                        type="button"
                        onClick={() => toggleRecipe(recipeKey)}
                        className="min-h-[40px] px-3 py-2 text-sm rounded-md border border-blue-600 text-blue-600 active:bg-blue-50 touch-manipulation whitespace-nowrap"
                      >
                        {isRecipeOpen ? '閉じる' : 'レシピを編集'}
                      </button>
                    </div>
                    {isRecipeOpen && (
                      <div className="p-3 pt-0 border-t border-gray-100 space-y-3">
                        <div>
                          <label className="block text-xs font-bold text-gray-600 mb-1">材料（1行1項目）</label>
                          <textarea
                            value={(recipe.ingredients ?? []).join('\n')}
                            onChange={(e) => handleRecipeChange(vendorIndex, itemIndex, { ...recipe, ingredients: e.target.value.split('\n').map(s => s.trim()).filter(Boolean) })}
                            placeholder={'玉ねぎ 1個\nにんじん 1本'}
                            className="w-full min-h-[80px] px-3 py-2 text-base border border-gray-200 rounded-md touch-manipulation"
                            rows={3}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-600 mb-1">手順（1行1項目）</label>
                          <textarea
                            value={(recipe.steps ?? []).join('\n')}
                            onChange={(e) => handleRecipeChange(vendorIndex, itemIndex, { ...recipe, steps: e.target.value.split('\n').map(s => s.trim()).filter(Boolean) })}
                            placeholder={'野菜を切る\n炒める'}
                            className="w-full min-h-[80px] px-3 py-2 text-base border border-gray-200 rounded-md touch-manipulation"
                            rows={3}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-600 mb-1">ポイント</label>
                          <textarea
                            value={recipe.points ?? ''}
                            onChange={(e) => handleRecipeChange(vendorIndex, itemIndex, { ...recipe, points: e.target.value })}
                            placeholder="火を通しすぎない"
                            className="w-full min-h-[60px] px-3 py-2 text-base border border-gray-200 rounded-md touch-manipulation"
                            rows={2}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-600 mb-1">目安所要時間（分）</label>
                          <input
                            type="number"
                            value={recipe.estimatedMinutes ?? ''}
                            onChange={(e) => handleRecipeChange(vendorIndex, itemIndex, { ...recipe, estimatedMinutes: e.target.value === '' ? undefined : parseInt(e.target.value, 10) || 0 })}
                            placeholder="15"
                            min={0}
                            className="w-[100px] min-h-[44px] px-3 py-2 text-base border border-gray-200 rounded-md touch-manipulation"
                            inputMode="numeric"
                          />
                        </div>
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
            {vendor.items.length === 0 && (
              <p className="text-xs text-gray-400">品目がありません。上で業者に品目を追加してください。</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
