# BudgetMaster - 予算管理アプリ

BudgetMaster は、プロジェクトごとの予算計画と支出実績を月単位で管理するためのローカル Web アプリケーションです。
React (Vite) と Node.js (Express) をベースにし、データベースに SQLite を使用しています。

## 主な機能

- **プロジェクト管理**: 期間（半期）と総予算の設定
- **予算管理マトリックス**:
  - 月別・カテゴリ別の予定金額の直接編集
  - 実績合計（完了・未完了別）の表示
  - 予算 vs 実績の差額（乖離）の自動計算
  - CSV エクスポート機能
- **支出実績の登録**: カテゴリ、発生月、金額、備考の入力
- **ダッシュボード**: 全プロジェクトの予算消化状況をサマリー表示
- **レポート**: プロジェクトごとの予算対実績グラフ (Recharts)

## 技術スタック

- **フロントエンド**: React, TypeScript, Tailwind CSS, Lucide React, Recharts
- **バックエンド**: Node.js, Express, SQLite3 (sqlite3), TypeScript

## セットアップと起動方法

プロジェクトはバックエンド（API）とフロントエンド（UI）の 2 つの構成になっています。

### 事前準備

- Node.js (v18 以上推奨) がインストールされていること

### 1. バックエンドの起動

```bash
cd backend
npm install  # 初回セットアップ時のみ
npm run dev
```

- `http://localhost:5000` でサーバーが起動します。
- 初回起動時に `backend/data/database.sqlite` が自動生成されます。

### 2. フロントエンドの起動

```bash
cd frontend
npm install  # 初回セットアップ時のみ
npm run dev
```

- `http://localhost:5173` でアプリケーションにアクセスできます。

## 開発・構成

- `frontend/`: React アプリケーションソース
- `backend/`: Express API サーバーソース
- `doc/`: ソフトウェア仕様書・[利用マニュアル](doc/user_manual.md)

## ライセンス

[MIT License](LICENSE)
