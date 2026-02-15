import { useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Order } from '@/lib/types'
import { useApp } from '@/contexts/AppContext'

export function useOrders() {
  const { config, setOrders, setSyncStatus } = useApp()

  const getOrdersByDate = useCallback(async (date: string): Promise<Order[]> => {
    try {
      setSyncStatus('syncing')
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('date', date)
        .eq('store_id', config.storeId || 'default')
        .order('vendor', { ascending: true })
        .order('item', { ascending: true })

      if (error) {
        console.error('Error fetching orders:', error)
        setSyncStatus('offline')
        return []
      }

      setSyncStatus('ready')
      return data || []
    } catch (err) {
      console.error('Error fetching orders:', err)
      setSyncStatus('offline')
      return []
    }
  }, [config.storeId, setSyncStatus])

  const upsertOrder = useCallback(async (order: Order): Promise<boolean> => {
    try {
      setSyncStatus('syncing')
      const orderData = {
        date: order.date,
        vendor: order.vendor,
        item: order.item,
        qty: order.qty,
        stock: order.stock,
        prep: order.prep ?? 0,
        prep_checked: order.prep_checked ?? false,
        updated_at: order.updated_at,
        updated_by: order.updated_by || config.staff,
        store_id: order.store_id || config.storeId || 'default',
      }

      const { error } = await supabase
        .from('orders')
        .upsert(orderData as any, {
          onConflict: 'date,vendor,item,store_id',
        })

      if (error) {
        console.error('Error upserting order:', error)
        setSyncStatus('conflict')
        return false
      }

      setSyncStatus('saved')
      setTimeout(() => setSyncStatus('ready'), 2000)
      return true
    } catch (err) {
      console.error('Error upserting order:', err)
      setSyncStatus('offline')
      return false
    }
  }, [config.staff, config.storeId, setSyncStatus])

  const deleteOrder = useCallback(async (id: string): Promise<boolean> => {
    try {
      setSyncStatus('syncing')
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting order:', error)
        setSyncStatus('conflict')
        return false
      }

      setSyncStatus('saved')
      setTimeout(() => setSyncStatus('ready'), 2000)
      return true
    } catch (err) {
      console.error('Error deleting order:', err)
      setSyncStatus('offline')
      return false
    }
  }, [setSyncStatus])

  return {
    getOrdersByDate,
    upsertOrder,
    deleteOrder,
  }
}
