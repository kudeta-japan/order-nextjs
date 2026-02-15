'use client'

import { useState } from 'react'

type Tab = 'main' | 'prep' | 'list' | 'settings'

interface NavProps {
  currentTab: Tab
  onTabChange: (tab: Tab) => void
}

export function Nav({ currentTab, onTabChange }: NavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white grid grid-cols-4 py-3 sm:py-2.5 pb-[max(12px,env(safe-area-inset-bottom))] border-t border-gray-200 shadow-lg touch-manipulation">
      <button
        onClick={() => onTabChange('main')}
        className={`text-center text-sm sm:text-xs font-bold py-3 sm:py-2 min-h-[56px] sm:min-h-0 active:bg-gray-50 touch-manipulation ${
          currentTab === 'main' ? 'text-blue-600' : 'text-gray-500'
        }`}
      >
        <div className="text-xl sm:text-base mb-1 sm:mb-0">🛒</div>
        <div className="hidden sm:block">発注</div>
        <div className="sm:hidden">発注</div>
      </button>
      <button
        onClick={() => onTabChange('prep')}
        className={`text-center text-sm sm:text-xs font-bold py-3 sm:py-2 min-h-[56px] sm:min-h-0 active:bg-gray-50 touch-manipulation ${
          currentTab === 'prep' ? 'text-blue-600' : 'text-gray-500'
        }`}
      >
        <div className="text-xl sm:text-base mb-1 sm:mb-0">🥗</div>
        <div className="hidden sm:block">仕込み</div>
        <div className="sm:hidden">仕込み</div>
      </button>
      <button
        onClick={() => onTabChange('list')}
        className={`text-center text-sm sm:text-xs font-bold py-3 sm:py-2 min-h-[56px] sm:min-h-0 active:bg-gray-50 touch-manipulation ${
          currentTab === 'list' ? 'text-blue-600' : 'text-gray-500'
        }`}
      >
        <div className="text-xl sm:text-base mb-1 sm:mb-0">📋</div>
        <div className="hidden sm:block">確認</div>
        <div className="sm:hidden">確認</div>
      </button>
      <button
        onClick={() => onTabChange('settings')}
        className={`text-center text-sm sm:text-xs font-bold py-3 sm:py-2 min-h-[56px] sm:min-h-0 active:bg-gray-50 touch-manipulation ${
          currentTab === 'settings' ? 'text-blue-600' : 'text-gray-500'
        }`}
      >
        <div className="text-xl sm:text-base mb-1 sm:mb-0">⚙️</div>
        <div className="hidden sm:block">設定</div>
        <div className="sm:hidden">設定</div>
      </button>
    </nav>
  )
}
