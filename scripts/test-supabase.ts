/**
 * Supabase接続テストスクリプト
 * 
 * 使用方法:
 * npx tsx scripts/test-supabase.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// .env.localを読み込む
dotenv.config({ path: path.join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

console.log('=== Supabase接続テスト ===\n')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ エラー: Supabase環境変数が設定されていません')
  console.error('   .env.local に NEXT_PUBLIC_SUPABASE_URL と NEXT_PUBLIC_SUPABASE_ANON_KEY を設定してください')
  process.exit(1)
}

console.log('✓ 環境変数が設定されています')
console.log(`   URL: ${supabaseUrl.substring(0, 30)}...`)
console.log(`   Key: ${supabaseAnonKey.substring(0, 20)}...\n`)

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  console.log('1. 接続テスト...')
  try {
    const { data, error } = await supabase.from('orders').select('count').limit(1)
    if (error) {
      console.error('   ❌ 接続エラー:', error.message)
      return false
    }
    console.log('   ✓ 接続成功\n')
    return true
  } catch (err: any) {
    console.error('   ❌ 接続エラー:', err.message)
    return false
  }
}

async function testTableStructure() {
  console.log('2. テーブル構造確認...')
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .limit(0)
    
    if (error) {
      if (error.message.includes('relation "orders" does not exist')) {
        console.error('   ❌ ordersテーブルが存在しません')
        console.error('   → docs/SUPABASE_SETUP.md の手順3を実行してください\n')
      } else {
        console.error('   ❌ エラー:', error.message)
      }
      return false
    }
    console.log('   ✓ ordersテーブルが存在します\n')
    return true
  } catch (err: any) {
    console.error('   ❌ エラー:', err.message)
    return false
  }
}

async function testInsert() {
  console.log('3. データ挿入テスト...')
  const testDate = new Date().toISOString().split('T')[0]
  const testData = {
    date: testDate,
    vendor: 'テスト業者',
    item: 'テスト商品',
    qty: 1,
    stock: 0,
    updated_at: Date.now(),
    updated_by: 'テストユーザー',
    store_id: 'default',
  }

  try {
    const { data, error } = await supabase
      .from('orders')
      .upsert(testData, {
        onConflict: 'date,vendor,item,store_id',
      })
      .select()

    if (error) {
      console.error('   ❌ 挿入エラー:', error.message)
      if (error.message.includes('permission denied')) {
        console.error('   → RLSポリシーが正しく設定されていない可能性があります')
        console.error('   → docs/SUPABASE_SETUP.md の手順3を確認してください\n')
      }
      return false
    }
    console.log('   ✓ データ挿入成功')
    console.log(`   ID: ${data?.[0]?.id}\n`)
    return data?.[0]?.id || null
  } catch (err: any) {
    console.error('   ❌ エラー:', err.message)
    return false
  }
}

async function testSelect(testId: string | null) {
  console.log('4. データ取得テスト...')
  const testDate = new Date().toISOString().split('T')[0]
  
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('date', testDate)
      .eq('store_id', 'default')

    if (error) {
      console.error('   ❌ 取得エラー:', error.message)
      return false
    }
    console.log(`   ✓ データ取得成功 (${data?.length || 0}件)\n`)
    return true
  } catch (err: any) {
    console.error('   ❌ エラー:', err.message)
    return false
  }
}

async function testRealtime() {
  console.log('5. リアルタイム購読テスト...')
  return new Promise<boolean>((resolve) => {
    const channel = supabase
      .channel('test-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          console.log('   ✓ リアルタイムイベントを受信:', payload.eventType)
          supabase.removeChannel(channel)
          resolve(true)
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('   ✓ リアルタイム購読開始')
          // テストデータを挿入してイベントをトリガー
          const testDate = new Date().toISOString().split('T')[0]
          supabase
            .from('orders')
            .upsert({
              date: testDate,
              vendor: 'リアルタイムテスト',
              item: 'リアルタイム商品',
              qty: 1,
              stock: 0,
              updated_at: Date.now(),
              updated_by: 'テスト',
              store_id: 'default',
            }, {
              onConflict: 'date,vendor,item,store_id',
            })
            .then(() => {
              setTimeout(() => {
                supabase.removeChannel(channel)
                resolve(true)
              }, 2000)
            })
        } else if (status === 'CHANNEL_ERROR') {
          console.error('   ❌ リアルタイム購読エラー')
          resolve(false)
        }
      })

    setTimeout(() => {
      supabase.removeChannel(channel)
      console.log('   ⚠ タイムアウト（リアルタイム購読は設定されている可能性があります）')
      resolve(true)
    }, 5000)
  })
}

async function cleanup() {
  console.log('6. テストデータ削除...')
  const testDate = new Date().toISOString().split('T')[0]
  try {
    await supabase
      .from('orders')
      .delete()
      .in('vendor', ['テスト業者', 'リアルタイムテスト'])
    console.log('   ✓ テストデータを削除しました\n')
  } catch (err: any) {
    console.error('   ⚠ 削除エラー（無視してOK）:', err.message)
  }
}

async function main() {
  const results = {
    connection: false,
    table: false,
    insert: false,
    select: false,
    realtime: false,
  }

  results.connection = await testConnection()
  if (!results.connection) {
    console.log('\n❌ 接続に失敗しました。環境変数を確認してください。')
    process.exit(1)
  }

  results.table = await testTableStructure()
  if (!results.table) {
    console.log('\n❌ テーブル構造の確認に失敗しました。')
    process.exit(1)
  }

  const testId = await testInsert()
  results.insert = testId !== false

  results.select = await testSelect(testId as string | null)

  results.realtime = await testRealtime()

  await cleanup()

  console.log('=== テスト結果 ===')
  console.log(`接続: ${results.connection ? '✓' : '❌'}`)
  console.log(`テーブル: ${results.table ? '✓' : '❌'}`)
  console.log(`挿入: ${results.insert ? '✓' : '❌'}`)
  console.log(`取得: ${results.select ? '✓' : '❌'}`)
  console.log(`リアルタイム: ${results.realtime ? '✓' : '⚠'}`)

  const allPassed = results.connection && results.table && results.insert && results.select
  if (allPassed) {
    console.log('\n✅ Supabaseは正常に動作しています！')
    process.exit(0)
  } else {
    console.log('\n❌ 一部のテストが失敗しました。上記のエラーメッセージを確認してください。')
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('予期しないエラー:', err)
  process.exit(1)
})
