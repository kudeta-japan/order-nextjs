'use client'

import type { Recipe } from '@/lib/types'

interface RecipeModalProps {
  itemName: string
  recipe: Recipe | undefined
  onClose: () => void
}

export function RecipeModal({ itemName, recipe, onClose }: RecipeModalProps) {
  if (!recipe) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-5 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          <h3 className="text-lg font-bold mt-0 mb-2">{itemName}</h3>
          <p className="text-gray-500 text-sm">レシピは登録されていません。設定で登録できます。</p>
          <button type="button" onClick={onClose} className="mt-4 w-full min-h-[48px] py-2.5 bg-gray-200 rounded-lg font-bold text-sm active:bg-gray-300 touch-manipulation">
            閉じる
          </button>
        </div>
      </div>
    )
  }

  const ingredients = recipe.ingredients ?? []
  const steps = recipe.steps ?? []
  const points = recipe.points ?? ''
  const minutes = recipe.estimatedMinutes

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-5 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-bold mt-0 mb-3">{itemName}</h3>

        {ingredients.length > 0 && (
          <section className="mb-4">
            <h4 className="text-sm font-bold text-gray-600 mb-1.5">材料</h4>
            <ul className="list-disc list-inside text-sm text-gray-800 space-y-0.5">
              {ingredients.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </section>
        )}

        {steps.length > 0 && (
          <section className="mb-4">
            <h4 className="text-sm font-bold text-gray-600 mb-1.5">手順</h4>
            <ol className="list-decimal list-inside text-sm text-gray-800 space-y-1">
              {steps.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ol>
          </section>
        )}

        {points && (
          <section className="mb-4">
            <h4 className="text-sm font-bold text-gray-600 mb-1.5">ポイント</h4>
            <p className="text-sm text-gray-800 whitespace-pre-wrap">{points}</p>
          </section>
        )}

        {minutes != null && minutes > 0 && (
          <section className="mb-4">
            <h4 className="text-sm font-bold text-gray-600 mb-1.5">目安所要時間</h4>
            <p className="text-sm text-gray-800">{minutes} 分</p>
          </section>
        )}

        {ingredients.length === 0 && steps.length === 0 && !points && (minutes == null || minutes === 0) && (
          <p className="text-gray-500 text-sm mb-4">内容がありません。設定で編集できます。</p>
        )}

        <button type="button" onClick={onClose} className="w-full min-h-[48px] py-2.5 bg-blue-600 text-white rounded-lg font-bold text-sm active:bg-blue-700 touch-manipulation">
          閉じる
        </button>
      </div>
    </div>
  )
}
