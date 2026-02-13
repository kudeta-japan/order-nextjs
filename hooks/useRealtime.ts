import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Order } from '@/lib/types'
import { useApp } from '@/contexts/AppContext'

export function useRealtime() {
  const { currentDate, config, updateOrder, removeOrder, setSyncStatus } = useApp()

  useEffect(() => {
    if (!currentDate) return

    const channel = supabase
      .channel(`orders:${currentDate}:${config.storeId || 'default'}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `date=eq.${currentDate} AND store_id=eq.${config.storeId || 'default'}`,
        },
        (payload) => {
          console.log('Realtime update:', payload)
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            updateOrder(payload.new as Order)
            setSyncStatus('ready')
          } else if (payload.eventType === 'DELETE' && payload.old?.id) {
            removeOrder(payload.old.id as string)
            setSyncStatus('ready')
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status)
        if (status === 'SUBSCRIBED') {
          setSyncStatus('ready')
        } else if (status === 'CHANNEL_ERROR') {
          setSyncStatus('offline')
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentDate, config.storeId, updateOrder, removeOrder, setSyncStatus])
}
