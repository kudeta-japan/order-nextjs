/**
 * カテゴリーの色選択用。発注カードの左ボーダーに使用。
 */
export const CATEGORY_COLOR_OPTIONS = [
  { key: 'green', label: '緑', class: 'border-l-4 border-l-green-500' },
  { key: 'blue', label: '青', class: 'border-l-4 border-l-blue-500' },
  { key: 'amber', label: '黄', class: 'border-l-4 border-l-amber-500' },
  { key: 'violet', label: '紫', class: 'border-l-4 border-l-violet-500' },
  { key: 'rose', label: 'ピンク', class: 'border-l-4 border-l-rose-400' },
  { key: 'sky', label: '水色', class: 'border-l-4 border-l-sky-500' },
  { key: 'emerald', label: 'エメラルド', class: 'border-l-4 border-l-emerald-500' },
  { key: 'orange', label: 'オレンジ', class: 'border-l-4 border-l-orange-400' },
  { key: 'teal', label: 'ティール', class: 'border-l-4 border-l-teal-500' },
  { key: 'fuchsia', label: 'マゼンタ', class: 'border-l-4 border-l-fuchsia-400' },
  { key: 'gray', label: 'グレー', class: 'border-l-4 border-l-gray-300' },
] as const

const CLASS_BY_KEY: Record<string, string> = Object.fromEntries(
  CATEGORY_COLOR_OPTIONS.map(o => [o.key, o.class])
)

const DEFAULT_CLASS = 'border-l-4 border-l-gray-300'

/**
 * カテゴリーの左ボーダークラスを返す。
 * categoryColors に指定があればその色、なければ categoryOrder の並び順で自動割り当て。
 */
export function getCategoryBorderClass(
  categoryLabel: string,
  categoryOrder: string[],
  categoryColors?: Record<string, string> | null
): string {
  if (!categoryLabel || categoryLabel === '未設定') return DEFAULT_CLASS
  const colorKey = categoryColors?.[categoryLabel]
  if (colorKey && CLASS_BY_KEY[colorKey]) return CLASS_BY_KEY[colorKey]
  const index = categoryOrder.indexOf(categoryLabel)
  if (index < 0) return DEFAULT_CLASS
  return CATEGORY_COLOR_OPTIONS[index % CATEGORY_COLOR_OPTIONS.length]?.class ?? DEFAULT_CLASS
}
