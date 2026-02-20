# 要件定義書

## はじめに

本システムは、Cloudflareインフラストラクチャ（Next.js、Workers、D1データベース）を使用したシンプルなメモ帳Webアプリケーションです。ユーザーはノートの作成、閲覧、編集、削除を行うことができます。

## 用語集

- **System**: メモ帳Webアプリケーション全体
- **Note**: タイトルと本文を持つメモエントリ
- **Note_List**: ノートの一覧表示画面
- **Note_Detail**: 個別ノートの詳細表示画面
- **Note_Form**: ノート作成・編集用のフォーム
- **D1_Database**: Cloudflare D1データベース
- **User**: アプリケーションを使用する人

## 要件

### 要件1: ノート一覧の表示

**ユーザーストーリー:** ユーザーとして、すべてのノートの一覧を見たい。そうすることで、保存されているノートを素早く確認できる。

#### 受入基準

1. WHEN ユーザーがルートパス（/）にアクセスしたとき、THE System SHALL すべてのノートをリスト形式で表示する
2. WHEN ノートが表示されるとき、THE System SHALL 各ノートのタイトルと作成日時を表示する
3. WHEN ノートリストが空のとき、THE System SHALL 「ノートがありません」というメッセージを表示する
4. WHEN ユーザーがノートのタイトルをクリックしたとき、THE System SHALL そのノートの詳細画面に遷移する
5. THE Note_List SHALL 新規作成画面へのリンクを含む

### 要件2: ノートの新規作成

**ユーザーストーリー:** ユーザーとして、新しいノートを作成したい。そうすることで、情報を記録できる。

#### 受入基準

1. WHEN ユーザーが /notes/new にアクセスしたとき、THE System SHALL ノート作成フォームを表示する
2. THE Note_Form SHALL タイトル入力フィールドを含む
3. THE Note_Form SHALL 本文入力フィールドを含む
4. WHEN ユーザーが空のタイトルで保存しようとしたとき、THE System SHALL エラーメッセージを表示し、保存を拒否する
5. WHEN ユーザーが有効なタイトルと本文を入力して保存したとき、THE System SHALL ノートをD1_Databaseに保存する
6. WHEN ノートが正常に保存されたとき、THE System SHALL ユーザーをノート一覧画面にリダイレクトする
7. WHEN 保存中にエラーが発生したとき、THE System SHALL エラーメッセージを表示し、フォームデータを保持する

### 要件3: ノートの詳細表示

**ユーザーストーリー:** ユーザーとして、ノートの完全な内容を見たい。そうすることで、保存した情報を確認できる。

#### 受入基準

1. WHEN ユーザーが /notes/[id] にアクセスしたとき、THE System SHALL 指定されたIDのノートを表示する
2. THE Note_Detail SHALL ノートのタイトルを表示する
3. THE Note_Detail SHALL ノートの本文を表示する
4. THE Note_Detail SHALL ノートの作成日時を表示する
5. THE Note_Detail SHALL 編集ボタンを含む
6. THE Note_Detail SHALL 削除ボタンを含む
7. WHEN 指定されたIDのノートが存在しないとき、THE System SHALL 404エラーページを表示する

### 要件4: ノートの編集

**ユーザーストーリー:** ユーザーとして、既存のノートを編集したい。そうすることで、情報を更新できる。

#### 受入基準

1. WHEN ユーザーが詳細画面で編集ボタンをクリックしたとき、THE System SHALL 編集可能なフォームを表示する
2. THE Note_Form SHALL 既存のタイトルと本文を初期値として表示する
3. WHEN ユーザーが変更を保存したとき、THE System SHALL D1_Databaseのノートを更新する
4. WHEN ノートが正常に更新されたとき、THE System SHALL ユーザーをそのノートの詳細画面にリダイレクトする
5. WHEN ユーザーが空のタイトルで更新しようとしたとき、THE System SHALL エラーメッセージを表示し、更新を拒否する
6. WHEN 更新中にエラーが発生したとき、THE System SHALL エラーメッセージを表示し、フォームデータを保持する

### 要件5: ノートの削除

**ユーザーストーリー:** ユーザーとして、不要なノートを削除したい。そうすることで、整理された状態を保てる。

#### 受入基準

1. WHEN ユーザーが詳細画面で削除ボタンをクリックしたとき、THE System SHALL 削除確認ダイアログを表示する
2. WHEN ユーザーが削除を確認したとき、THE System SHALL D1_Databaseからノートを削除する
3. WHEN ノートが正常に削除されたとき、THE System SHALL ユーザーをノート一覧画面にリダイレクトする
4. WHEN 削除中にエラーが発生したとき、THE System SHALL エラーメッセージを表示し、ノートを保持する
5. WHEN ユーザーが削除をキャンセルしたとき、THE System SHALL 詳細画面に留まる

### 要件6: データ永続化

**ユーザーストーリー:** ユーザーとして、作成したノートが永続的に保存されることを期待する。そうすることで、後でアクセスできる。

#### 受入基準

1. THE System SHALL すべてのノートをCloudflare D1_Databaseに保存する
2. WHEN ノートが作成されるとき、THE System SHALL 一意のIDを生成して割り当てる
3. WHEN ノートが作成されるとき、THE System SHALL 作成日時のタイムスタンプを記録する
4. WHEN ノートが更新されるとき、THE System SHALL 更新日時のタイムスタンプを記録する
5. THE System SHALL ノートのタイトル、本文、作成日時、更新日時を保存する

### 要件7: アプリケーション構成

**ユーザーストーリー:** 開発者として、Cloudflareインフラストラクチャを使用したい。そうすることで、スケーラブルで高速なアプリケーションを構築できる。

#### 受入基準

1. THE System SHALL Next.js App Routerを使用してフロントエンドを実装する
2. THE System SHALL Cloudflare Workersでホストされる
3. THE System SHALL Cloudflare D1をデータベースとして使用する
4. THE System SHALL サーバーサイドレンダリング（SSR）またはサーバーコンポーネントを活用する
5. THE System SHALL APIルートまたはServer Actionsを使用してデータベース操作を実行する

### 要件8: UIスタイリング

**ユーザーストーリー:** ユーザーとして、見やすく使いやすいインターフェースを使いたい。そうすることで、快適にノートを管理できる。

#### 受入基準

1. THE System SHALL TailwindCSSを使用してすべてのUIコンポーネントをスタイリングする
2. THE System SHALL レスポンシブデザインを実装し、モバイルとデスクトップの両方で適切に表示する
3. THE System SHALL 一貫したカラースキームとタイポグラフィを使用する
4. THE System SHALL ボタン、フォーム、リンクに適切なホバー状態とフォーカス状態を提供する
5. THE System SHALL 読みやすいレイアウトと適切な余白を維持する

### 要件9: エラーハンドリング

**ユーザーストーリー:** ユーザーとして、エラーが発生したときに明確なフィードバックを受け取りたい。そうすることで、何が問題なのかを理解できる。

#### 受入基準

1. WHEN データベース接続エラーが発生したとき、THE System SHALL ユーザーフレンドリーなエラーメッセージを表示する
2. WHEN バリデーションエラーが発生したとき、THE System SHALL 具体的なエラーメッセージをフォームの近くに表示する
3. WHEN 予期しないエラーが発生したとき、THE System SHALL 一般的なエラーメッセージを表示し、エラーをログに記録する
4. THE System SHALL ネットワークエラーを適切に処理し、ユーザーに通知する
