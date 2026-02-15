'use client'

import { useState, useEffect } from 'react'
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

type Tab = 'main' | 'prep' | 'list' | 'settings'

export default function Home() {
  const [currentTab, setCurrentTab] = useState<Tab>('main')
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
              <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3">
                {currentVendorData.items.map((item) => (
                  <ItemCard
                    key={item.name}
                    vendor={currentVendorData.name}
                    item={item}
                  />
                ))}
              </div>
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
