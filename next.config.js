/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 静的エクスポート用の設定（ku-deta.jpのサーバーにアップロードする場合）
  // output: 'export',
  // images: {
  //   unoptimized: true,
  // },
}

module.exports = nextConfig
