/**
 * 既存のGAS SpreadsheetデータをSupabaseに移行するスクリプト
 * 
 * 使用方法:
 * 1. GAS Spreadsheetからデータをエクスポート（JSON形式）
 * 2. このスクリプトを実行: npx tsx scripts/migrate-from-gas.ts <exported-data.json>
 * 
 * データ形式:
 * {
 *   "orders": {
 *     "2024-01-01": {
 *       "vendor1": {
 *         "item1": { "qty": 10, "stock": 5, "updatedAt": 1234567890, "updatedBy": "担当者" }
 *       }
 *     }
 *   },
 *   "storeId": "default"
 * }
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Missing Supabase environment variables')
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface OldOrderData {
  qty: number
  stock?: number
  updatedAt?: number
  updatedBy?: string
}

interface OldOrders {
  [date: string]: {
    [vendor: string]: {
      [item: string]: OldOrderData | number
    }
  }
}

interface ExportData {
  orders?: OldOrders
  storeId?: string
}

async function migrateData(jsonPath: string) {
  console.log(`Reading data from ${jsonPath}...`)
  
  const fileContent = fs.readFileSync(jsonPath, 'utf-8')
  const data: ExportData = JSON.parse(fileContent)
  
  if (!data.orders) {
    console.error('Error: No orders data found in JSON')
    process.exit(1)
  }

  const storeId = data.storeId || 'default'
  const orders: Array<{
    date: string
    vendor: string
    item: string
    qty: number
    stock: number
    updated_at: number
    updated_by: string
    store_id: string
  }> = []

  console.log('Converting data format...')

  for (const [date, vendors] of Object.entries(data.orders)) {
    for (const [vendor, items] of Object.entries(vendors)) {
      for (const [item, orderData] of Object.entries(items)) {
        let qty = 0
        let stock = 0
        let updatedAt = Date.now()
        let updatedBy = ''

        if (typeof orderData === 'number') {
          qty = orderData
        } else if (orderData && typeof orderData === 'object') {
          qty = orderData.qty || 0
          stock = orderData.stock || 0
          updatedAt = orderData.updatedAt || Date.now()
          updatedBy = orderData.updatedBy || ''
        }

        orders.push({
          date,
          vendor,
          item,
          qty,
          stock,
          updated_at: updatedAt,
          updated_by: updatedBy,
          store_id: storeId,
        })
      }
    }
  }

  console.log(`Found ${orders.length} orders to migrate`)
  console.log(`Store ID: ${storeId}`)

  // バッチでアップロード（Supabaseの制限に合わせて100件ずつ）
  const batchSize = 100
  let successCount = 0
  let errorCount = 0

  for (let i = 0; i < orders.length; i += batchSize) {
    const batch = orders.slice(i, i + batchSize)
    console.log(`Uploading batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(orders.length / batchSize)}...`)

    const { error } = await supabase
      .from('orders')
      .upsert(batch, {
        onConflict: 'date,vendor,item,store_id',
      })

    if (error) {
      console.error(`Error uploading batch:`, error)
      errorCount += batch.length
    } else {
      successCount += batch.length
      console.log(`✓ Uploaded ${batch.length} orders`)
    }
  }

  console.log('\n=== Migration Summary ===')
  console.log(`Total orders: ${orders.length}`)
  console.log(`Success: ${successCount}`)
  console.log(`Errors: ${errorCount}`)
  console.log('Migration completed!')
}

// コマンドライン引数からJSONファイルパスを取得
const jsonPath = process.argv[2]

if (!jsonPath) {
  console.error('Usage: npx tsx scripts/migrate-from-gas.ts <exported-data.json>')
  process.exit(1)
}

if (!fs.existsSync(jsonPath)) {
  console.error(`Error: File not found: ${jsonPath}`)
  process.exit(1)
}

migrateData(jsonPath).catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
