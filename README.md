
# NanoMeter - Real-time Quiz Platform
# ナノメーター - リアルタイムクイズプラットフォーム


A real-time, multiplayer quiz game application built with Next.js, React, and Firebase. Users can create their own quizzes, host game lobbies, and have others join using a unique game code to compete in real-time.

Next.js、React、Firebaseで構築されたリアルタイムのマルチプレイヤークイズゲームアプリです。ユーザーは自分だけのクイズを作成し、ゲームロビーをホストし、他の人はユニークなゲームコードを使ってリアルタイムで参加・対戦できます。


## Features
## 主な機能


-   **Quiz Creation:** Dynamically create custom quizzes with multiple questions, answers, points, and time limits.
    -   クイズ作成：複数の問題、回答、ポイント、制限時間を自由に設定してクイズを作成できます。
-   **Game Lobbies:** Generate a unique, short game code for others to join your game lobby.
    -   ゲームロビー：ユニークな短いゲームコードを発行し、他のユーザーがロビーに参加できます。
-   **Real-time Multiplayer:** See players join the lobby in real-time.
    -   リアルタイムマルチプレイ：ロビーに参加したプレイヤーがリアルタイムで表示されます。
-   **Live Gameplay:** The host controls the start of the game, and all players see questions simultaneously.
    -   ライブゲームプレイ：ホストがゲーム開始を操作し、全員が同時に問題を表示します。
-   **Scoring System:** Earn points based on correct answers and the time remaining.
    -   スコアリングシステム：正解と残り時間に応じてポイントを獲得できます。
-   **Firebase Integration:** Utilizes Firebase for anonymous user authentication and Firestore for real-time database updates.
    -   Firebase連携：Firebaseによる匿名認証とFirestoreによるリアルタイムデータベースを利用しています。


## Tech Stack
## 技術スタック


-   **Framework:** Next.js
    -   フレームワーク：Next.js
-   **UI Library:** React
    -   UIライブラリ：React
-   **Styling:** Tailwind CSS
    -   スタイリング：Tailwind CSS
-   **Backend & Database:** Firebase (Authentication, Firestore)
    -   バックエンド＆データベース：Firebase（認証、Firestore）


## Getting Started
## はじめに


### 1. Prerequisites
### 1. 必要条件


-   Node.js (v18.18 or later)
    -   Node.js（v18.18以上）
-   A Firebase project.
    -   Firebaseプロジェクト


### 2. Firebase Setup
### 2. Firebaseのセットアップ


This project requires a Firebase project to handle authentication and the database.
このプロジェクトでは認証とデータベース管理のためにFirebaseプロジェクトが必要です。


1.  Create a project on the Firebase Console.
    -   Firebaseコンソールで新しいプロジェクトを作成します。
2.  Enable **Authentication** (with the Anonymous sign-in method) and **Firestore Database**.
    -   認証（匿名サインイン）とFirestoreデータベースを有効にします。
3.  In your Firebase project settings, find your web app's configuration credentials.
    -   Firebaseプロジェクト設定でWebアプリの構成情報を取得します。
4.  Create a `.env.local` file in the root of this project by copying the example:
    -   プロジェクトのルートに`.env.local`ファイルを作成します（例をコピーしてください）。


    ```bash
    cp .env.example .env.local
    ```


5.  Add your Firebase configuration values to the `.env.local` file.
    -   `.env.local`ファイルにFirebaseの構成値を記入します。


### 3. Installation & Running Locally
### 3. インストールとローカル実行


First, install the dependencies and run the development server:
まず依存パッケージをインストールし、開発サーバーを起動します。


```bash
npm install
npm run dev
```


Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
ブラウザで [http://localhost:3000](http://localhost:3000) を開いて動作を確認してください。


You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.
`app/page.tsx` を編集することでページをカスタマイズできます。編集内容は自動で反映されます。


This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.
このプロジェクトは [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) を使って [Geist](https://vercel.com/font) フォントを自動最適化・読み込みしています。


## Learn More
## 詳しく学ぶ


To learn more about Next.js, take a look at the following resources:
Next.jsについてさらに学ぶには、以下のリソースをご覧ください。


- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
    - [Next.js公式ドキュメント](https://nextjs.org/docs) - Next.jsの機能やAPIについて学べます。
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
    - [Next.jsチュートリアル](https://nextjs.org/learn) - インタラクティブなNext.js学習教材です。


You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
Next.jsのGitHubリポジトリもご覧ください。フィードバックやコントリビューションも歓迎です！


## Deploy on Vercel
## Vercelでデプロイ


The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.
Next.jsアプリをデプロイする最も簡単な方法は、Next.js開発元の[Vercelプラットフォーム](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)を利用することです。


Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
詳細は[Next.jsデプロイメントドキュメント](https://nextjs.org/docs/app/building-your-application/deploying)をご覧ください。
