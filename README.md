# Osakana (魚)

魚へん漢字をテーマにしたリアルタイムマルチプレイヤークイズゲームです。プレイヤーは漢字と読み（よみ）を提示され、正しく識別する必要があります。リアルタイム同期、ランキングシステム、時間制限付きラウンドなどの機能を備えています。

## 特徴

- **リアルタイム同期**: Server-Sent Events (SSE) によるライブゲーム状態の更新
- **マルチプレイヤー対応**: 複数のプレイヤーが同時に参加可能
- **ランキングシステム**: スコアを登録して競い合うことができます
- **時間制限ラウンド**: 30 秒ごとに問題が自動的にリセットされます
- **コンボシステム**: 連続正解でコンボポイントを獲得
- **NFC 対応**: モバイルクライアントで NFC タグから漢字情報を読み取り、回答として送信可能
- **モバイル & デスクトップ**: レスポンシブデザインで両方のインターフェースに対応

## アーキテクチャ

### 技術スタック

#### クライアント (`client/`)

- **フレームワーク**: Next.js 16.0.3 (App Router)
- **UI ライブラリ**: React 19.2.0
- **言語**: TypeScript 5
- **スタイリング**: Tailwind CSS 4, Sass/SCSS, DaisyUI 5.5.5
- **状態管理**: React hooks (useState, useEffect)
- **URL 状態**: nuqs 2.8.0
- **パッケージマネージャー**: pnpm
- **リンター/フォーマッター**: Biome 2.2.0, dprint

#### サーバー (`server/`)

- **言語**: Rust (Edition 2024)
- **Web フレームワーク**: Axum 0.8.7
- **非同期ランタイム**: Tokio 1.47.2
- **シリアライゼーション**: serde, serde_json
- **リアルタイム通信**: Server-Sent Events (SSE) via async-stream
- **HTTP ミドルウェア**: tower-http (CORS, tracing)
- **ロギング**: tracing, tracing-subscriber
- **ユーティリティ**: dotenvy, uuid, rand, thiserror

## プロジェクト構造

```
osakana/
├── client/                          # Next.js フロントエンド
│   ├── app/
│   │   ├── mobile/                  # モバイルインターフェース
│   │   │   ├── _components/         # モバイルコンポーネント
│   │   │   │   ├── combo.tsx        # コンボ表示
│   │   │   │   └── Keypad.tsx       # 入力キーパッド
│   │   │   ├── actions.ts           # サーバーアクション
│   │   │   ├── page.tsx             # モバイルメインページ
│   │   │   ├── register-user/       # ユーザー登録
│   │   │   ├── register-rank/       # ランキング登録
│   │   │   └── request/             # 回答送信
│   │   ├── screen/                  # デスクトップゲーム画面
│   │   │   ├── _components/         # 画面コンポーネント
│   │   │   │   ├── AllClear/        # オールクリアアニメーション
│   │   │   │   ├── BubbleContainer/ # バブルエフェクト
│   │   │   │   ├── Kanji/           # 漢字表示
│   │   │   │   ├── KanjiSplitter/   # 漢字分割エフェクト
│   │   │   │   ├── OceanBackground/ # 海のアニメーション
│   │   │   │   ├── QuestionCard/    # 問題カードコンポーネント
│   │   │   │   └── TimeGauge/       # タイマー表示
│   │   │   ├── page.tsx             # 画面メインページ
│   │   │   └── styles/              # 画面スタイル
│   │   ├── layout.tsx               # ルートレイアウト
│   │   └── page.tsx                 # ホームページ
│   ├── public/                      # 静的アセット
│   ├── biome.json                   # Biome 設定
│   ├── dprint.json                  # dprint 設定
│   ├── next.config.ts               # Next.js 設定
│   ├── package.json                 # 依存関係
│   └── tsconfig.json                # TypeScript 設定
│
└── server/                          # Rust バックエンド
    ├── src/
    │   ├── domain/                  # ドメインロジック (DDD)
    │   │   ├── answer.rs            # 回答処理
    │   │   ├── questions.rs         # 問題取得
    │   │   ├── ranking.rs           # ランキング登録
    │   │   └── user.rs              # ユーザー作成
    │   ├── kanji.rs                 # 漢字データ読み込み
    │   ├── main.rs                  # アプリケーションエントリーポイント
    │   ├── questions.rs             # 問題タイプ & ロジック
    │   ├── sse_event.rs             # SSE イベントタイプ
    │   └── user.rs                  # ユーザータイプ
    ├── data.csv                     # 漢字データソース
    ├── Cargo.toml                   # Rust 依存関係
    ├── compose.yaml                 # Docker Compose 設定
    └── Dockerfile                   # Docker ビルド設定
```

## API 仕様

### ベース URL

- 開発環境: `http://localhost:8000`
- 本番環境: `FRONTEND_URL` 環境変数で設定

### エンドポイント

#### 1. ユーザー作成

- **メソッド**: `POST`
- **パス**: `/user`
- **リクエストボディ**: なし
- **レスポンス**:
  ```json
  {
    "user_id": "uuid-string"
  }
  ```
- **説明**: 新しいユーザーを作成し、一意のユーザー ID を返します

#### 2. 現在の問題取得

- **メソッド**: `GET`
- **パス**: `/questions/current`
- **レスポンス**:
  ```json
  {
    "current_questions": [
      {
        "index": 0,
        "kanji": {
          "unicode": "9b2c",
          "yomi": "まぐろ",
          "kanji": "鮪",
          "difficulty": "Easy"
        },
        "is_solved": false
      }
    ]
  }
  ```
- **説明**: 現在の問題セットを取得します

#### 3. 回答送信

- **メソッド**: `POST`
- **パス**: `/answer`
- **リクエストボディ**:
  ```json
  {
    "user_id": "uuid-string",
    "question_index": 0,
    "kanji_unicode": "9b2c"
  }
  ```
- **レスポンス**:
  ```json
  {
    "is_correct": true,
    "combo": 5
  }
  ```
- **説明**: 回答を送信し、正解かどうかとコンボ数を返します
- **ステータスコード**:
  - `200 OK`: 成功
  - `404 NOT_FOUND`: ユーザーまたは問題が見つかりません

#### 4. ランキング登録

- **メソッド**: `POST`
- **パス**: `/ranking`
- **リクエストボディ**:
  ```json
  {
    "user_id": "uuid-string",
    "username": "PlayerName"
  }
  ```
- **レスポンス**: `200 OK` (ボディなし)
- **説明**: ユーザーのスコアをランキングシステムに登録します
- **ステータスコード**:
  - `200 OK`: 成功
  - `404 NOT_FOUND`: ユーザーが見つかりません

#### 5. ランキング取得

- **メソッド**: `GET`
- **パス**: `/ranking`
- **レスポンス**:
  ```json
  [
    {
      "id": "uuid-string",
      "username": "PlayerName",
      "combo": 10
    }
  ]
  ```
- **説明**: ランキング一覧を取得します

#### 6. Server-Sent Events (SSE)

- **メソッド**: `GET`
- **パス**: `/sse`
- **レスポンス**: イベントストリーム
- **イベントタイプ**:

  ```json
  // 問題リロードイベント
  {
    "ReloadQuestions": {
      "questions": [...]
    }
  }

  // 時間更新イベント
  {
    "RemainingTimePercentage": {
      "percentage": 75.5
    }
  }

  // 回答イベント
  {
    "Answer": {
      "index": 0,
      "is_correct": true
    }
  }
  ```

- **説明**: ゲーム状態のリアルタイム更新のためのイベントストリーム
- **更新頻度**: 時間パーセンテージは 500ms ごとに更新

## ゲームメカニクス

### 問題システム

- **問題数**: 1 ラウンドあたり 10 問
- **時間制限**: 1 ラウンド 30 秒
- **リセット**: 時間経過後に自動リセット
- **選択**: 漢字データベースからランダム選択
- **難易度**: 3 段階 (Easy, Medium, Hard)

### スコアリングシステム

- **コンボ**: 正解するたびに増加
- **リセット**: 不正解でコンボがリセット（推測）
- **ランキング**: コンボ数に基づく

### リアルタイム更新

- **時間更新**: SSE 経由で 500ms ごと
- **回答イベント**: 検証後すぐにブロードキャスト
- **問題リロード**: ラウンドリセット時にブロードキャスト

### NFC 回答システム

- **NFC タグ読み取り**: モバイルデバイスで NFC タグを読み取ることで回答を送信
- **データ形式**: NFC タグには回答ページへの URL が記録されています
  - URL 形式: `/mobile/request?unicode=<unicode値>`
  - unicode 値は 16 進数形式（例: "9b2c"）で指定します
  - 例: `/mobile/request?unicode=9b2c`
- **動作フロー**:
  1. ユーザーが問題番号をキーパッドで選択（1-10）
  2. NFC タグをデバイスに近づける
  3. タグに記録された URL が開かれ、クエリパラメータから unicode 情報を取得
  4. 自動的にサーバーに回答として送信
  5. 正解/不正解の結果とコンボ数を表示
- **実装**: URL のクエリパラメータ（`unicode`）をパースして回答処理を行います
- **利点**: 標準的な NFC URL 形式を使用するため、特別な API やブラウザ対応が不要です

## 環境変数

### サーバー

- `FRONTEND_URL` (必須): CORS 設定用のフロントエンド URL
  - 例: `https://osakana.vercel.app`
- `CLOUDFLARED_TOKEN` (オプション): Docker Compose 用の Cloudflare Tunnel トークン

### クライアント

- `NEXT_PUBLIC_BACKEND_URL`: バックエンド API URL
  - 例: `http://localhost:8000` (開発環境) または本番 URL

## 開発コマンド

### クライアント

```bash
cd client
pnpm dev          # 開発サーバー起動 (ポート3000)
pnpm build         # 本番用ビルド
pnpm start         # 本番サーバー起動
pnpm lint          # リンター実行
pnpm format        # コードフォーマット
```

### サーバー

```bash
cd server
cargo run          # ビルド & 実行 (ポート8000)
cargo check        # ビルドせずにチェック
cargo build        # ビルドのみ
cargo fmt          # コードフォーマット
cargo clippy       # リンター実行
cargo test         # テスト実行
```

### Docker

```bash
cd server
docker compose up  # サービス起動
docker compose down # サービス停止
docker compose logs # ログ表示
```

## コードスタイルガイドライン

### TypeScript/React

- **インデント**: 2 スペース
- **行幅**: 100 文字
- **コンポーネント**: PascalCase
- **関数/変数**: camelCase
- **ファイル**: コンポーネントは PascalCase、ユーティリティは kebab-case
- **スタイリング**: CSS Modules (`.module.scss`) + Tailwind CSS

### Rust

- **フォーマット**: `cargo fmt` (rustfmt)
- **モジュール**: snake_case
- **型/構造体**: PascalCase
- **関数**: snake_case
- **エラーハンドリング**: `Result<T, E>` と `thiserror` を使用

## 重要な実装詳細

### サーバー側

1. **ゲーム状態管理**

   - 共有可変状態に `Arc<Mutex<GameState>>` を使用
   - バックグラウンドタスクが 500ms ごとにタイマーを更新
   - SSE イベントは Tokio ブロードキャストチャネル経由でブロードキャスト

2. **漢字データ読み込み**

   - 起動時に `data.csv` から読み込み
   - グローバルアクセス用に `OnceLock` に保存
   - CSV 形式: `[index, yomi, level, ?, unicode]`

3. **問題リセットロジック**

   - データベースから 10 個の漢字をランダム選択
   - タイマーを 30 秒にリセット
   - すべての SSE クライアントにリロードイベントをブロードキャスト

4. **回答検証**
   - 送信された `kanji_unicode` と問題の漢字 unicode を比較
   - 正解時にユーザーのコンボを更新
   - リアルタイム UI 更新のための回答イベントをブロードキャスト

### クライアント側

1. **状態管理**

   - ローカル状態に React hooks (`useState`, `useEffect`) を使用
   - ユーザー ID と問題インデックスの永続化に Cookie を使用
   - エラーハンドリングとコンボ表示に URL 検索パラメータを使用

2. **モバイルインターフェース**

   - API 呼び出しにサーバーアクションを使用
   - Cookie ベースの認証
   - キーパッドコンポーネントによるフォームベースの入力
   - **NFC 機能**: NFC タグに記録された URL のクエリパラメータから漢字情報を読み取り
     - NFC タグには回答ページへの URL が記録されています（例: `/mobile/request?unicode=9b2c`）
     - タグを読み取ると、URL のクエリパラメータから unicode 情報を取得し、自動的に回答として送信されます
     - 物理的な NFC タグと連携することで、よりインタラクティブなゲーム体験を提供します

3. **デスクトップインターフェース (画面)**

   - クライアント側状態管理
   - タイマーベースの問題リロード
   - アニメーション状態: "idle", "entering", "exiting"

4. **エラーハンドリング**
   - 失敗時にエラーパラメータ付きでリダイレクト
   - API 呼び出し前の Cookie 検証
   - サーバーアクションエラーバウンダリ

## トラブルシューティング

### よくある問題

1. **CORS エラー**

   - `FRONTEND_URL` が実際のフロントエンド URL と一致していることを確認
   - `main.rs` の CORS 設定を確認

2. **SSE 接続の問題**

   - SSE エンドポイントがアクセス可能であることを確認
   - ブラウザコンソールで接続エラーを確認
   - サーバーが実行中でアクセス可能であることを確認

3. **ユーザーが見つからないエラー**

   - user_id Cookie が設定されていることを確認
   - ユーザー作成エンドポイントのレスポンスを確認
   - ゲーム状態にユーザーが存在することを確認

4. **問題が見つからないエラー**

   - question_index が有効であることを確認 (0-9)
   - 現在の問題エンドポイントを確認
   - CSV から問題が読み込まれていることを確認

5. **NFC 読み取りエラー**
   - NFC タグに正しい URL 形式が記録されていることを確認（`/mobile/request?unicode=<unicode値>`）
   - URL のクエリパラメータに `unicode` が含まれていることを確認
   - unicode 値が 16 進数形式（例: "9b2c"）で記録されていることを確認
   - デバイスの NFC 機能が有効になっていることを確認
   - NFC タグを読み取った際に正しい URL に遷移していることを確認

## デプロイ

### フロントエンド (Vercel)

- Git からの自動デプロイ
- Vercel ダッシュボード経由の環境変数
- ビルドコマンド: `pnpm build`

### バックエンド (Docker + Cloudflare Tunnel)

- `Dockerfile` から Docker イメージをビルド
- パブリックアクセス用の Cloudflare Tunnel
- `.env` ファイルまたは Docker Compose 経由の環境変数

## ライセンス

リポジトリの LICENSE ファイルを参照してください。

## 参考資料

- [Next.js ドキュメント](https://nextjs.org/docs)
- [Axum ドキュメント](https://docs.rs/axum/)
- [Tokio ドキュメント](https://tokio.rs/)
- [Server-Sent Events MDN](https://developer.mozilla.org/ja/docs/Web/API/Server-sent_events)

---

**最終更新**: 現在のコードベース状態に基づく
**メンテナー**: プロジェクトチーム
