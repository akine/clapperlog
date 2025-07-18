# ClapperLog 🎬

撮影記録管理アプリ - 映像制作現場での撮影時刻とシーン情報を記録する Web アプリです。

## 主な機能

- ⏰ **撮影タイマー**: 開始・一時停止・再開・終了をワンクリックで記録
- 🔢 **シーン管理**: 連番登録 (例: `s01~s05`) やカスタムシーンの追加
- 📊 **CSV 出力**: 撮影履歴をワンクリックでダウンロード
- 💾 **ローカル保存**: すべてのデータはブラウザのローカルストレージに保存
- ☁️ **クラウド保存**: Supabase によるユーザー認証とデータ永続化
- 📱 **レスポンシブ対応**: モバイルでもデスクトップでも快適に利用可能

## セットアップ

### 必要な環境
- Node.js 18 以上
- npm / pnpm / yarn のいずれか

### インストール
```bash
# リポジトリをクローン
git clone https://github.com/yourname/clapperlog.git
cd clapperlog

# 依存関係をインストール (pnpm 推奨)
pnpm install   # npm install / yarn install でも可
```

### 環境変数の設定
プロジェクトルートに `.env` ファイルを作成します。サンプルとして `.env.example` が含まれているのでコピーして利用してください。

```bash
cp .env.example .env
```
`.env` には Supabase の URL と anon key を設定します。

### データベースセットアップ
`supabase/schema.sql` を Supabase プロジェクトに適用してテーブルを作成します。

### 開発サーバーの起動
```bash
pnpm run dev   # npm run dev / yarn dev
# `.env` に Supabase のキーを設定してから起動してください
```
ブラウザで [http://localhost:5173](http://localhost:5173) を開きます。

## ビルド
```bash
pnpm run build   # npm run build / yarn build

# ビルド内容をプレビュー
pnpm run preview  # npm run preview / yarn preview
```

## プロジェクト構成
```
clapperlog/
├── public/              # 静的ファイル
│   └── undone_logo.svg
├── src/                 # ソースコード
│   ├── components/      # UI コンポーネント
│   ├── assets/          # 画像など
│   ├── hooks/           # React Hooks
│   ├── App.jsx          # メインコンポーネント
│   ├── App.css          # スタイル
│   └── main.jsx         # エントリーポイント
├── components.json      # shadcn 生成設定
├── jsconfig.json        # パスエイリアス設定
├── package.json         # プロジェクト設定
├── vite.config.js       # Vite 設定
└── pnpm-lock.yaml       # 依存関係ロックファイル
```

## 使用技術
- **React 18**
- **Vite** + **@tailwindcss/vite**
- **Tailwind CSS**
- **Lucide React** アイコン

---
**開発者**: 合同会社Undone
**最終更新**: 2025年6月8日
