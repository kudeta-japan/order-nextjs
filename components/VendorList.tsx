'use client'

import { useApp } from '@/contexts/AppContext'
import { ALL_VENDORS_KEY } from '@/lib/types'

export function VendorList() {
  const { master, currentVendor, setCurrentVendor } = useApp()

  return (
    <aside className="bg-white border-r border-gray-200 p-2.5 overflow-y-auto min-h-0">
      <div
        onClick={() => setCurrentVendor(ALL_VENDORS_KEY)}
        className={`px-4 py-3 rounded-lg cursor-pointer font-bold mb-2 transition-colors ${
          currentVendor === ALL_VENDORS_KEY
            ? 'bg-blue-50 text-blue-600 border border-blue-600'
            : 'text-gray-500 border border-transparent hover:bg-gray-50'
        }`}
      >
        全ての業者
      </div>
      {master.vendors.map(vendor => (
        <div
          key={vendor.name}
          onClick={() => setCurrentVendor(vendor.name)}
          className={`px-4 py-3 rounded-lg cursor-pointer font-bold mb-1 transition-colors ${
            currentVendor === vendor.name
              ? 'bg-blue-50 text-blue-600 border border-blue-600'
              : 'text-gray-500 border border-transparent hover:bg-gray-50'
          }`}
        >
          {vendor.name}
        </div>
      ))}
    </aside>
  )
}
