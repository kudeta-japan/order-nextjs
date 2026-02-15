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
import { ALL_VENDORS_KEY } from '@/lib/types'

type Tab = 'main' | 'prep' | 'list' | 'settings'

/** カテゴリーごとの左ボーダー色（発注カードの色分け用） */
const CATEGORY_BORDER_COLORS = [
  'border-l-4 border-l-green-500',
  'border-l-4 border-l-blue-500',
  'border-l-4 border-l-amber-500',
  'border-l-4 border-l-violet-500',
  'border-l-4 border-l-rose-400',
  'border-l-4 border-l-sky-500',
  'border-l-4 border-l-emerald-500',
  'border-l-4 border-l-orange-400',
  'border-l-4 border-l-teal-500',
  'border-l-4 border-l-fuchsia-400',
]

function getCategoryBorderClass(categoryLabel: string, categoryOrder: string[]): string {
  if (!categoryLabel || categoryLabel === '未設定') return 'border-l-4 border-l-gray-300'
  const index = categoryOrder.indexOf(categoryLabel)
  if (index < 0) return 'border-l-4 border-l-gray-300'
  return CATEGORY_BORDER_COLORS[index % CATEGORY_BORDER_COLORS.length] ?? 'border-l-4 border-l-gray-300'
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
  const isAllVendors = currentVendor === ALL_VENDORS_KEY

  /** 全ての業者時: { vendor, item }[]。単一業者時: null（filteredItems は Item[] で別計算） */
  const { filteredItemsAll, filteredItemsSingle, categoriesForFilter } = useMemo(() => {
    if (isAllVendors) {
      const allEntries: { vendor: string; item: Item }[] = master.vendors.flatMap(v =>
        v.items.map(item => ({ vendor: v.name, item }))
      )
      const categories = Array.from(new Set(allEntries.map(e => e.item.category?.trim() || '未設定')))
      const sortedCategories = [...categories].sort((a, b) => (a === '未設定' ? 1 : b === '未設定' ? -1 : a.localeCompare(b)))
      const filtered = categoryFilter === ''
        ? allEntries
        : allEntries.filter(e => (e.item.category?.trim() || '未設定') === categoryFilter)
      return { filteredItemsAll: filtered, filteredItemsSingle: null, categoriesForFilter: sortedCategories }
    }
    if (!currentVendorData) {
      return { filteredItemsAll: [], filteredItemsSingle: null, categoriesForFilter: [] as string[] }
    }
    const items = currentVendorData.items
    const categories = Array.from(new Set(items.map(i => i.category?.trim() || '未設定')))
    const sortedCategories = [...categories].sort((a, b) => (a === '未設定' ? 1 : b === '未設定' ? -1 : a.localeCompare(b)))
    const filtered = categoryFilter === ''
      ? items
      : items.filter(i => (i.category?.trim() || '未設定') === categoryFilter)
    return { filteredItemsAll: null, filteredItemsSingle: filtered, categoriesForFilter: sortedCategories }
  }, [isAllVendors, currentVendorData, master.vendors, categoryFilter])

  const categoryOrder = useMemo(() => master.categories ?? [], [master.categories])

  return (
    <div className="min-h-screen pb-[max(60px,calc(60px+env(safe-area-inset-bottom)))]">
      <Header />

      {currentTab === 'main' && (
        <main className="grid grid-cols-[200px_1fr] min-h-[calc(100vh-180px)] max-md:grid-cols-1">
          <VendorList />
          <div className="p-3 sm:p-4 bg-gray-50 min-h-0">
            <h2 className="mt-0 mb-3 sm:mb-4 text-lg sm:text-xl font-bold">
              {isAllVendors ? '全ての業者' : currentVendorData ? currentVendorData.name : '業者を選択'}
            </h2>
            {(isAllVendors || currentVendorData) && (
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
                <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3">
                  {isAllVendors && filteredItemsAll
                    ? filteredItemsAll.map(({ vendor, item }) => (
                        <ItemCard
                          key={`${vendor}-${item.name}`}
                          vendor={vendor}
                          item={item}
                          showVendorLabel
                          categoryBorderClass={getCategoryBorderClass(item.category?.trim() || '未設定', categoryOrder)}
                        />
                      ))
                    : filteredItemsSingle?.map((item) => (
                        <ItemCard
                          key={item.name}
                          vendor={currentVendorData!.name}
                          item={item}
                          categoryBorderClass={getCategoryBorderClass(item.category?.trim() || '未設定', categoryOrder)}
                        />
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
