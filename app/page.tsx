'use client'

import { useState, useEffect, useMemo } from 'react'
import { Header } from '@/components/Header'
import { Nav } from '@/components/Nav'
import { VendorList } from '@/components/VendorList'
import { ItemCard } from '@/components/ItemCard'
import { SettingsForm } from '@/components/SettingsForm'
import { SummaryList } from '@/components/SummaryList'
import { PrepList } from '@/components/PrepList'
import { useApp } from '@/contexts/AppContext'
import { useRealtime } from '@/hooks/useRealtime'
import { useOrders } from '@/hooks/useOrders'
import type { Item } from '@/lib/types'

type Tab = 'main' | 'prep' | 'list' | 'settings'

/** 品目をカテゴリーでグループ化（未設定は最後） */
function groupItemsByCategory(items: Item[]): { categoryLabel: string; items: Item[] }[] {
  const map = new Map<string, Item[]>()
  for (const item of items) {
    const key = item.category?.trim() || '未設定'
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(item)
  }
  const sortedKeys = Array.from(map.keys()).sort((a, b) => {
    if (a === '未設定') return 1
    if (b === '未設定') return -1
    return a.localeCompare(b)
  })
  return sortedKeys.map(categoryLabel => ({
    categoryLabel,
    items: map.get(categoryLabel)!,
  }))
}

export default function Home() {
  const [currentTab, setCurrentTab] = useState<Tab>('main')
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const {
    currentVendor,
    master,
    currentDate,
    orders,
    setOrders,
  } = useApp()
  const { getOrdersByDate } = useOrders()

  // リアルタイム購読
  useRealtime()

  // 初回データ読み込み
  useEffect(() => {
    if (currentDate) {
      getOrdersByDate(currentDate).then(setOrders)
    }
  }, [currentDate, getOrdersByDate, setOrders])

  const currentVendorData = master.vendors.find(v => v.name === currentVendor)

  const { filteredItems, categoriesForFilter } = useMemo(() => {
    if (!currentVendorData) {
      return { filteredItems: [], categoriesForFilter: [] as string[] }
    }
    const items = currentVendorData.items
    const categories = Array.from(new Set(items.map(i => i.category?.trim() || '未設定')))
    const sortedCategories = [...categories].sort((a, b) => (a === '未設定' ? 1 : b === '未設定' ? -1 : a.localeCompare(b)))
    const filtered = categoryFilter === ''
      ? items
      : items.filter(i => (i.category?.trim() || '未設定') === categoryFilter)
    return { filteredItems: filtered, categoriesForFilter: sortedCategories }
  }, [currentVendorData, categoryFilter])

  const groupedForDisplay = useMemo(() => groupItemsByCategory(filteredItems), [filteredItems])

  return (
    <div className="min-h-screen pb-[max(60px,calc(60px+env(safe-area-inset-bottom)))]">
      <Header />

      {currentTab === 'main' && (
        <main className="grid grid-cols-[200px_1fr] min-h-[calc(100vh-180px)] md:grid-cols-[200px_1fr] max-md:grid-cols-1">
          <VendorList />
          <div className="p-3 sm:p-4 bg-gray-50 min-h-0">
            <h2 className="mt-0 mb-3 sm:mb-4 text-lg sm:text-xl font-bold">
              {currentVendorData ? currentVendorData.name : '業者を選択'}
            </h2>
            {currentVendorData && (
              <>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="text-sm text-gray-600">カテゴリー:</span>
                  <button
                    type="button"
                    onClick={() => setCategoryFilter('')}
                    className={`min-h-[36px] px-3 py-1.5 rounded-lg text-sm font-medium touch-manipulation ${
                      categoryFilter === '' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-700'
                    }`}
                  >
                    すべて
                  </button>
                  {categoriesForFilter.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategoryFilter(cat)}
                      className={`min-h-[36px] px-3 py-1.5 rounded-lg text-sm font-medium touch-manipulation ${
                        categoryFilter === cat ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <div className="space-y-6">
                  {groupedForDisplay.map(({ categoryLabel, items: groupItems }) => (
                    <section key={categoryLabel}>
                      <h3 className="text-sm font-bold text-gray-600 mb-2 sticky top-0 bg-gray-50 py-1 z-10">
                        {categoryLabel}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3">
                        {groupItems.map((item) => (
                          <ItemCard
                            key={item.name}
                            vendor={currentVendorData.name}
                            item={item}
                          />
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              </>
            )}
          </div>
        </main>
      )}

      {currentTab === 'prep' && (
        <main className="p-3 sm:p-5 pb-20 sm:pb-5">
          <PrepList />
        </main>
      )}

      {currentTab === 'list' && (
        <main className="p-3 sm:p-5 pb-20 sm:pb-5">
          <SummaryList />
        </main>
      )}

      {currentTab === 'settings' && (
        <main className="p-3 sm:p-5 pb-20 sm:pb-5">
          <SettingsForm />
        </main>
      )}

      <Nav currentTab={currentTab} onTabChange={setCurrentTab} />
    </div>
  )
}
