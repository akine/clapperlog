# 撮影記録管理アプリ - ローカル環境構築ガイド

## 📋 概要
このガイドでは、撮影記録管理アプリをローカル環境で動作させるための手順を説明します。

## 🛠️ 必要な環境

### Node.js
- **バージョン**: 18.0.0 以上推奨
- **ダウンロード**: https://nodejs.org/

### パッケージマネージャー
以下のいずれかが必要です：
- **npm** (Node.jsに同梱)
- **pnpm** (推奨)
- **yarn**

## 📦 環境構築手順

### 1. プロジェクトファイルの展開
```bash
# ダウンロードしたzipファイルを展開
unzip shooting-record-app-local.zip
cd shooting-record-app-local
```

### 2. 依存関係のインストール

#### pnpmを使用する場合（推奨）
```bash
# pnpmがインストールされていない場合
npm install -g pnpm

# 依存関係をインストール
pnpm install
```

#### npmを使用する場合
```bash
npm install
```

#### yarnを使用する場合
```bash
yarn install
```

### 3. 開発サーバーの起動

#### pnpmの場合
```bash
pnpm run dev
```

#### npmの場合
```bash
npm run dev
```

#### yarnの場合
```bash
yarn dev
```

### 4. ブラウザでアクセス
開発サーバーが起動したら、以下のURLにアクセスしてください：
```
http://localhost:5173/
```

## 🏗️ 本番ビルド

### ビルドの実行
```bash
# pnpmの場合
pnpm run build

# npmの場合
npm run build

# yarnの場合
yarn build
```

### ビルド結果の確認
```bash
# プレビューサーバーの起動
pnpm run preview  # または npm run preview / yarn preview
```

ビルドされたファイルは `dist/` フォルダに生成されます。

## 📁 プロジェクト構造

```
shooting-record-app-local/
├── public/                 # 静的ファイル
│   └── undone_logo.svg    # 会社ロゴ
├── src/                   # ソースコード
│   ├── components/        # UIコンポーネント
│   ├── App.jsx           # メインアプリケーション
│   ├── App.css           # スタイルシート
│   └── main.jsx          # エントリーポイント
├── package.json          # プロジェクト設定
├── vite.config.js        # Vite設定
└── tailwind.config.js    # Tailwind CSS設定
```

## 🔧 主要な技術スタック

- **React 18**: UIライブラリ
- **Vite**: ビルドツール
- **Tailwind CSS**: CSSフレームワーク
- **Lucide React**: アイコンライブラリ

## 🌐 デプロイ

### 静的ホスティングサービスへのデプロイ
ビルド後の `dist/` フォルダを以下のサービスにアップロードできます：
- Vercel
- Netlify
- GitHub Pages
- Firebase Hosting

### 例：Vercelへのデプロイ
```bash
# Vercel CLIのインストール
npm install -g vercel

# デプロイ
vercel --prod
```

## 🐛 トラブルシューティング

### ポートが使用中の場合
```bash
# 別のポートで起動
pnpm run dev --port 3000
```

### 依存関係のエラー
```bash
# node_modulesを削除して再インストール
rm -rf node_modules
pnpm install
```

### キャッシュのクリア
```bash
# Viteのキャッシュをクリア
pnpm run dev --force
```

## 📝 開発時の注意事項

### ローカルストレージ
- アプリの状態はブラウザのローカルストレージに保存されます
- 開発者ツールでローカルストレージをクリアできます

### ホットリロード
- ファイルを保存すると自動的にブラウザが更新されます
- CSSの変更は即座に反映されます

## 🔄 アップデート

新しいバージョンが提供された場合：
1. 新しいzipファイルをダウンロード
2. 既存のプロジェクトをバックアップ
3. 新しいファイルで置き換え
4. `pnpm install` で依存関係を更新

## 📞 サポート

問題が発生した場合は、以下の情報を含めてお問い合わせください：
- OS（Windows/Mac/Linux）
- Node.jsのバージョン
- エラーメッセージ
- 実行したコマンド

---

**開発者**: UNDONE
**最終更新**: 2025年6月8日

