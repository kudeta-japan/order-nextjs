'use client'

import { useState, useCallback } from 'react'
import { useApp } from '@/contexts/AppContext'
import { useOrders } from '@/hooks/useOrders'
import { RecipeModal } from '@/components/RecipeModal'
import type { Order } from '@/lib/types'

export function PrepList() {
  const { orders, currentDate, master, config, updateOrder } = useApp()
  const { upsertOrder } = useOrders()
  const [recipeModal, setRecipeModal] = useState<{ itemName: string; vendor: string } | null>(null)

  const prepOrders = orders.filter(
    o => o.date === currentDate &&
         (o.prep ?? 0) > 0 &&
         (o.store_id || 'default') === (config.storeId || 'default')
  )

  const getItemRecipe = useCallback((vendor: string, itemName: string) => {
    const vendorData = master.vendors.find(v => v.name === vendor)
    const item = vendorData?.items.find(i => i.name === itemName)
    return item?.recipe
  }, [master])

  const handleToggleChecked = useCallback(async (order: Order) => {
    const newOrder: Order = {
      ...order,
      prep_checked: !order.prep_checked,
      updated_at: Date.now(),
    }
    updateOrder(newOrder)
    await upsertOrder(newOrder)
  }, [updateOrder, upsertOrder])

  const openRecipe = (itemName: string, vendor: string) => {
    setRecipeModal({ itemName, vendor })
  }

  if (prepOrders.length === 0) {
    return (
      <div className="p-4 max-w-[600px] mx-auto">
        <p className="text-center text-gray-500 py-8">本日の仕込みはありません。発注タブで品目の「仕込み」に数量を入力するとここに表示されます。</p>
      </div>
    )
  }

  return (
    <div className="p-3 sm:p-5 max-w-[600px] mx-auto">
      <p className="text-sm text-gray-600 mb-3">行をタップでレシピ表示。本日の仕込みをチェックで確認済みにします。</p>
      <ul className="list-none p-0 m-0 space-y-2">
        {prepOrders.map((order) => {
          const recipe = getItemRecipe(order.vendor, order.item)
          return (
            <li key={`${order.vendor}-${order.item}`}>
              <div
                className={`flex items-center gap-3 p-3 rounded-xl border touch-manipulation ${
                  order.prep_checked ? 'bg-green-50 border-green-300' : 'bg-white border-gray-200'
                }`}
              >
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleToggleChecked(order) }}
                  className="flex-shrink-0 w-8 h-8 rounded border-2 border-gray-300 flex items-center justify-center active:bg-gray-100"
                  aria-label={order.prep_checked ? '確認済みを解除' : '確認済みにする'}
                >
                  {order.prep_checked && <span className="text-green-600 text-lg">✓</span>}
                </button>
                <button
                  type="button"
                  onClick={() => openRecipe(order.item, order.vendor)}
                  className="flex-1 text-left min-w-0"
                >
                  <span className="font-bold text-base block truncate">{order.item}</span>
                  <span className="text-sm text-gray-500">
                    {order.vendor} ・ 仕込み {order.prep}
                  </span>
                </button>
              </div>
            </li>
          )
        })}
      </ul>

      {recipeModal && (
        <RecipeModal
          itemName={recipeModal.itemName}
          recipe={getItemRecipe(recipeModal.vendor, recipeModal.itemName)}
          onClose={() => setRecipeModal(null)}
        />
      )}
    </div>
  )
}
