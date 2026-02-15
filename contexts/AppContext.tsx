'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { Order, Master, Config, SyncStatus } from '@/lib/types'
import { loadMaster, persistMaster, loadConfig, persistConfig, migrateV4ToV5, DEFAULT_MASTER } from '@/lib/storage'
import { fetchStoreData, upsertStoreData } from '@/lib/storeData'

interface AppContextType {
  orders: Order[]
  master: Master
  config: Config
  currentVendor: string
  currentDate: string
  syncStatus: SyncStatus
  setOrders: (orders: Order[]) => void
  updateOrder: (order: Order) => void
  removeOrder: (orderId: string) => void
  setMaster: (master: Master) => void
  setConfig: (config: Config) => void
  setCurrentVendor: (vendor: string) => void
  setCurrentDate: (date: string) => void
  setSyncStatus: (status: SyncStatus) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([])
  const [master, setMasterState] = useState<Master>(() => {
    if (typeof window !== 'undefined') {
      migrateV4ToV5()
      return loadMaster()
    }
    // サーバー側でもデフォルト値を返す（ハイドレーションエラー回避）
    return JSON.parse(JSON.stringify(DEFAULT_MASTER))
  })
  const [config, setConfigState] = useState<Config>(() => {
    if (typeof window !== 'undefined') {
      return loadConfig()
    }
    // サーバー側でもデフォルト値を返す（ハイドレーションエラー回避）
    return { staff: '担当者未設定', storeId: 'default' }
  })
  const [currentVendor, setCurrentVendor] = useState<string>('')
  const [currentDate, setCurrentDate] = useState<string>(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('ready')

  // Master の永続化（localStorage + Supabase）
  const setMaster = useCallback((newMaster: Master) => {
    setMasterState(newMaster)
    persistMaster(newMaster)
    upsertStoreData(config.storeId, newMaster, config).catch(() => {})
  }, [config])

  // Config の永続化（localStorage + Supabase）
  const setConfig = useCallback((newConfig: Config) => {
    setConfigState(newConfig)
    persistConfig(newConfig)
    upsertStoreData(newConfig.storeId, master, newConfig).catch(() => {})
  }, [master])

  // Order の更新（既存のものを更新、なければ追加）
  const updateOrder = useCallback((order: Order) => {
    setOrders(prev => {
      const existing = prev.findIndex(
        o => o.date === order.date && 
             o.vendor === order.vendor && 
             o.item === order.item &&
             (o.store_id || 'default') === (order.store_id || 'default')
      )
      if (existing >= 0) {
        const updated = [...prev]
        updated[existing] = order
        return updated
      }
      return [...prev, order]
    })
  }, [])

  // Order の削除
  const removeOrder = useCallback((orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId))
  }, [])

  // 初回マスタ読み込み（Supabase にあればそれを採用、なければ localStorage）
  useEffect(() => {
    if (typeof window === 'undefined') return
    migrateV4ToV5()
    const localConfig = loadConfig()
    const storeId = localConfig.storeId || 'default'

    fetchStoreData(storeId).then((data) => {
      if (data) {
        setMasterState(data.master)
        setConfigState(data.config)
        persistMaster(data.master)
        persistConfig(data.config)
      } else {
        const localMaster = loadMaster()
        setMasterState(localMaster)
        setConfigState(localConfig)
        upsertStoreData(storeId, localMaster, localConfig).catch(() => {})
      }
    }).catch(() => {
      setMasterState(loadMaster())
      setConfigState(localConfig)
    })
  }, [])

  // 初回業者選択
  useEffect(() => {
    if (master.vendors.length > 0 && !currentVendor) {
      setCurrentVendor(master.vendors[0].name)
    }
  }, [master.vendors, currentVendor])

  return (
    <AppContext.Provider
      value={{
        orders,
        master,
        config,
        currentVendor,
        currentDate,
        syncStatus,
        setOrders,
        updateOrder,
        removeOrder,
        setMaster,
        setConfig,
        setCurrentVendor,
        setCurrentDate,
        setSyncStatus,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}
