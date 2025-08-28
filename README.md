# NanoConnect - Real-time Quiz Platform

A real-time, multiplayer quiz game application built with Next.js, React, and Firebase. Users can create their own quizzes, host game lobbies, and have others join using a unique game code to compete in real-time.

## Features

-   **Quiz Creation:** Dynamically create custom quizzes with multiple questions, answers, points, and time limits.
-   **Game Lobbies:** Generate a unique, short game code for others to join your game lobby.
-   **Real-time Multiplayer:** See players join the lobby in real-time.
-   **Live Gameplay:** The host controls the start of the game, and all players see questions simultaneously.
-   **Scoring System:** Earn points based on correct answers and the time remaining.
-   **Firebase Integration:** Utilizes Firebase for anonymous user authentication and Firestore for real-time database updates.

## Tech Stack

-   **Framework:** Next.js
-   **UI Library:** React
-   **Styling:** Tailwind CSS
-   **Backend & Database:** Firebase (Authentication, Firestore)

## Getting Started

### 1. Prerequisites

-   Node.js (v18.18 or later)
-   A Firebase project.

### 2. Firebase Setup

This project requires a Firebase project to handle authentication and the database.

1.  Create a project on the Firebase Console.
2.  Enable **Authentication** (with the Anonymous sign-in method) and **Firestore Database**.
3.  In your Firebase project settings, find your web app's configuration credentials.
4.  Create a `.env.local` file in the root of this project by copying the example:

    ```bash
    cp .env.example .env.local
    ```

5.  Add your Firebase configuration values to the `.env.local` file.

### 3. Installation & Running Locally

First, install the dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
