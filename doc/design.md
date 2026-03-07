# 設計書

## 1. 目的

本書は、BudgetMaster（badget）の現行実装をもとに、システム構成・画面構成・データ構造・主要な処理の流れを整理した設計書です。  
`doc/spec.md` の要件および `doc/software_specification.md` の仕様を、実装レベルで参照しやすい形にまとめることを目的とします。

---

## 2. システム概要

本システムは、プロジェクトごとの予算計画と支出実績を月単位で管理するローカル実行型の予実管理アプリケーションです。

- フロントエンドは React + TypeScript + Vite で構成する
- バックエンドは Node.js + Express で構成する
- データベースは SQLite を利用する
- 配布形態として `.exe` 化を想定し、単体起動時はブラウザを自動起動する

---

## 3. アーキテクチャ設計

### 3.1 全体構成

```text
┌────────────────────────────────────┐
│ Frontend (React / Vite)            │
│ - ダッシュボード                   │
│ - プロジェクト管理                 │
│ - カテゴリ管理                     │
│ - 予実管理マトリックス             │
│ - レポート表示                     │
└──────────────┬─────────────────────┘
               │ HTTP(JSON)
┌──────────────▼─────────────────────┐
│ Backend (Node.js / Express)        │
│ - REST API                         │
│ - DB初期化                         │
│ - 静的ファイル配信                 │
└──────────────┬─────────────────────┘
               │
┌──────────────▼─────────────────────┐
│ SQLite                             │
│ - projects                         │
│ - categories                       │
│ - project_categories               │
│ - budget_plans                     │
│ - expenses                         │
└────────────────────────────────────┘
```

### 3.2 ディレクトリ構成

- `frontend/src/App.tsx`
  - 画面ルーティング定義
- `frontend/src/pages/`
  - 画面単位のコンポーネント
- `frontend/src/components/`
  - 共通 UI 部品
- `frontend/src/hooks/`
  - API 呼び出しと画面ロジック
- `backend/src/index.ts`
  - Express アプリ起点
- `backend/src/controllers/`
  - API ごとの処理
- `backend/src/routes/`
  - エンドポイント定義
- `backend/src/config/database.ts`
  - SQLite 接続とテーブル初期化

---

## 4. フロントエンド設計

### 4.1 ルーティング

`frontend/src/App.tsx` にて以下のルーティングを定義します。

| パス | 画面 | 役割 |
| --- | --- | --- |
| `/` | Dashboard | 全体サマリーとプロジェクト状況の表示 |
| `/projects` | Projects | プロジェクト一覧・作成・編集導線 |
| `/projects/:id` | ProjectDetail | 個別プロジェクトの予実管理 |
| `/categories` | Categories | 共通カテゴリ管理 |
| `/reports` | Reports | 予算と実績のレポート表示 |

### 4.2 主要画面

#### Dashboard

- 全プロジェクト横断のサマリーを表示する
- 総予算、総支出、残額、消化率をカード表示する
- プロジェクトごとの進捗を一覧表示する

#### Projects

- プロジェクトの新規作成・更新・削除を行う
- 期間、総予算、利用カテゴリを設定する

#### ProjectDetail

- 対象プロジェクトの予実管理を行う中心画面
- 左側に `ExpenseForm`、右側に `BudgetMatrix` を配置する

#### Categories

- 全プロジェクト共通で利用するカテゴリを管理する

#### Reports

- プロジェクト単位で予算と実績を比較するグラフを表示する

### 4.3 主要コンポーネント

#### Layout

- サイドバー付きの共通レイアウトを提供する
- 各画面へのナビゲーションを担う

#### BudgetMatrix

- 月別・カテゴリ別の予算計画と支出実績を一覧表示する
- 予定額のインライン編集を行う
- 実績の明細展開、完了状態切替、編集、削除を行う
- CSV ダウンロード機能を提供する

#### ExpenseForm

- 支出実績の登録・更新を行う
- カテゴリ、発生月、金額、備考、完了フラグを入力する
- 最近の登録一覧から再編集・削除ができる

### 4.4 フロントエンドの状態管理

- 画面ロジックは `hooks` 配下に集約する
- 主な Hook は以下の通り
  - `useProjects`: プロジェクト一覧取得
  - `useProject`: 単一プロジェクト取得
  - `useCategories`: カテゴリ取得
  - `useBudget`: 予算計画・支出実績の取得と更新
  - `useDashboard`: ダッシュボード集計

---

## 5. バックエンド設計

### 5.1 API 構成

`backend/src/index.ts` で `/api` 配下に API を公開します。

| エンドポイント | メソッド | 概要 |
| --- | --- | --- |
| `/api/health` | GET | ヘルスチェック |
| `/api/projects` | GET | プロジェクト一覧取得 |
| `/api/projects/:id` | GET | プロジェクト詳細取得 |
| `/api/projects` | POST | プロジェクト作成 |
| `/api/projects/:id` | PUT | プロジェクト更新 |
| `/api/projects/:id` | DELETE | プロジェクト削除 |
| `/api/categories` | GET | カテゴリ一覧取得 |
| `/api/categories` | POST | カテゴリ作成 |
| `/api/categories/:id` | DELETE | カテゴリ削除 |
| `/api/budget_plans` | GET | 予算計画取得 |
| `/api/budget_plans` | POST | 予算計画登録・更新 |
| `/api/budget_plans/:id` | DELETE | 予算計画削除 |
| `/api/expenses` | GET | 支出実績取得 |
| `/api/expenses` | POST | 支出実績登録 |
| `/api/expenses/:id` | PUT | 支出実績更新 |
| `/api/expenses/:id` | DELETE | 支出実績削除 |

### 5.2 サーバーの責務

- JSON API の提供
- SQLite の初期化
- CORS 設定
- フロントエンドのビルド成果物配信
- `.exe` 実行時のブラウザ自動起動
- 例外発生時のクラッシュログ出力

### 5.3 制御方針

- プロジェクト更新時はトランザクションでカテゴリ紐付けを更新する
- 予算計画は `project_id + category_id + year_month` の組み合わせを実質キーとして Upsert 的に扱う
- API は画面単位で必要なデータを取得しやすい構成とする

---

## 6. データベース設計

### 6.1 テーブル一覧

#### projects

| カラム | 型 | 説明 |
| --- | --- | --- |
| id | INTEGER | 主キー |
| name | TEXT | プロジェクト名 |
| term_start | TEXT | 開始年月 |
| term_end | TEXT | 終了年月 |
| total_budget | INTEGER | 総予算 |

#### categories

| カラム | 型 | 説明 |
| --- | --- | --- |
| id | INTEGER | 主キー |
| name | TEXT | カテゴリ名（一意） |

#### project_categories

| カラム | 型 | 説明 |
| --- | --- | --- |
| project_id | INTEGER | projects 参照 |
| category_id | INTEGER | categories 参照 |

#### budget_plans

| カラム | 型 | 説明 |
| --- | --- | --- |
| id | INTEGER | 主キー |
| project_id | INTEGER | projects 参照 |
| category_id | INTEGER | categories 参照 |
| year_month | TEXT | 対象年月 |
| planned_amount | INTEGER | 予定額 |

#### expenses

| カラム | 型 | 説明 |
| --- | --- | --- |
| id | INTEGER | 主キー |
| project_id | INTEGER | projects 参照 |
| category_id | INTEGER | categories 参照 |
| year_month | TEXT | 対象年月 |
| date | TEXT | 発生日 |
| actual_amount | INTEGER | 実績額 |
| note | TEXT | 備考 |
| is_completed | BOOLEAN | 予算実績へ反映する完了フラグ |

### 6.2 リレーション

- `projects` と `categories` は `project_categories` による多対多
- `projects` と `budget_plans` は 1 対多
- `projects` と `expenses` は 1 対多
- `categories` と `budget_plans` は 1 対多
- `categories` と `expenses` は 1 対多
- 外部キー制約は `ON DELETE CASCADE` を利用する

### 6.3 データ保持方針

- SQLite ファイルは `data/database.sqlite` に保存する
- `.exe` 配布時は実行ファイル配置先を基準に `data/` を生成する
- 環境変数 `DATA_DIR` が指定される場合はその配下を優先する

---

## 7. 主要処理フロー

### 7.1 プロジェクト作成

1. 画面で名称、期間、総予算、利用カテゴリを入力する
2. フロントエンドが `/api/projects` に POST する
3. バックエンドが `projects` に登録する
4. 選択カテゴリを `project_categories` に登録する

### 7.2 予算計画入力

1. `BudgetMatrix` で対象セルをクリックする
2. 予定額を入力し保存する
3. `/api/budget_plans` に送信する
4. 同一キーの既存データがある場合は更新し、なければ新規登録する

### 7.3 支出実績入力

1. `ExpenseForm` でカテゴリ、発生月、金額、備考、完了状態を入力する
2. 年月は入力値から `YYYY-MM` を導出する
3. `/api/expenses` に送信する
4. 登録後、一覧と予実マトリックスに反映する

### 7.4 ダッシュボード集計

1. プロジェクト一覧と支出実績を取得する
2. 完了済み支出を集計対象とする
3. 総予算、総実績、残額、消化率を算出する

### 7.5 CSV 出力

1. `BudgetMatrix` から CSV 出力を実行する
2. カテゴリごとに「予定」「実績」「差額」を出力する
3. 支出明細も内訳行として出力する
4. Excel で開きやすいように UTF-8 BOM を付与する

---

## 8. 非機能観点の設計

### 8.1 可搬性

- ローカル PC 上で完結する構成とし、ネットワーク常時接続を前提としない
- SQLite を利用することでセットアップを簡易化する

### 8.2 保守性

- フロントエンドは画面、部品、Hook を分離する
- バックエンドは route / controller / config を分離する
- TypeScript により型安全性を確保する

### 8.3 拡張性

- レポート追加時は `pages/Reports.tsx` を起点に拡張できる
- エクスポート機能追加時は既存の CSV 出力を踏襲して PDF 出力などに拡張できる
- バックアップ・リストア機能は SQLite ファイル操作または API 追加で対応可能

---

## 9. 現状の実装範囲と今後の拡張候補

### 9.1 実装済み

- プロジェクト管理
- カテゴリ管理
- 月別予算計画入力
- 支出実績入力・更新・削除
- ダッシュボード表示
- レポート表示
- CSV 出力

### 9.2 未実装または拡張候補

- PDF 出力
- バックアップ・リストア専用 UI
- 高度なグラフ分析
- アラートや通知機能
- 単体テスト・統合テスト基盤の整備

---

## 10. 関連資料

- 要件定義: `doc/spec.md`
- ソフトウェア仕様書: `doc/software_specification.md`
- 利用者向け説明: `doc/user_manual.md`
