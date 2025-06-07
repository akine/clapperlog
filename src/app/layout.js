export const metadata = {
  title: 'ClapperLog - 撮影記録管理アプリ',
  description: '映像制作現場での撮影時刻とシーン情報を記録',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>
        {children}
      </body>
    </html>
  )
}