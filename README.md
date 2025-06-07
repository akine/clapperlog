# ClapperLog 🎬

撮影記録管理アプリ - 映像制作現場での撮影時刻とシーン情報を記録するWebアプリ

## 概要

ショートドラマ等の撮影現場で、香盤通りに撮影が行われない際に、実際の撮影時刻とシーン情報を記録し、後の編集作業（DaVinci Resolveでのメタデータ入力）を効率化するためのアプリです。

## 主な機能

- ⏰ **正確な時刻記録** - 撮影開始・終了時刻を秒単位で記録
- ⏸️ **一時中断・再開対応** - 撮影中断時の記録管理
- 📊 **CSV出力** - 編集時に使用できる形式でデータエクスポート
- 🔧 **カスタム入力** - 突発的な撮影（サムネイル撮影等）にも対応
- 🆕 **シーン番号範囲指定** - `s01~s05` のように連番登録可能

## 使用方法

### 1. 事前準備
- CSVまたはテキストでシーン情報を登録
- もしくは手動でシーン情報を登録

### 2. 撮影記録
1. 撮影するシーンを選択
2. 「撮影開始」ボタンを押す
3. 撮影実行
4. 「撮影終了」ボタンを押す

### 3. データ出力
- 撮影終了後、「CSV出力」ボタンでデータをダウンロード
- 編集時にDaVinci Resolveでメタデータ入力に活用

## セットアップ

### 必要な環境
- Node.js 18以上
- npm または yarn

### インストール
```bash
# リポジトリをクローン
git clone https://github.com/[username]/clapperlog.git
cd clapperlog

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

### デプロイ

#### Vercel (推奨)
```bash
# Vercel CLI をインストール
npm install -g vercel

# デプロイ
vercel
```

#### その他のプラットフォーム
```bash
# ビルド
npm run build

# 本番サーバー起動
npm start
```

## 技術スタック

- **Framework**: Next.js 14
- **UI**: React + Tailwind CSS
- **Icons**: Lucide React

## ファイル構成

```
clapperlog/
├── README.md
├── package.json
├── next.config.js
├── tailwind.config.js
├── src/
│   ├── app/
│   │   ├── layout.js
│   │   ├── page.js
│   │   └── globals.css
│   └── components/
│       └── ShootingRecorder.jsx
└── docs/
    └── specifications.md
```

## 仕様詳細

詳細な仕様については [docs/specifications.md](./docs/specifications.md) をご参照ください。

## 使用例

```
事前準備：
CSV/テキスト読み込み → シーン一括登録

撮影当日：
10:00 シーン07選択 → 撮影開始
10:45 撮影終了
→ 記録: s07-莉子環奈散歩, 10:00, 10:45

11:00 「サムネイル撮影」カスタム入力 → 撮影開始
11:15 撮影終了
→ 記録: サムネイル撮影, 11:00, 11:15
```

## 貢献

プルリクエストやイシューの作成を歓迎します。

## ライセンス

MIT License

## 作者

映像制作の現場効率化を目指して開発しました。