"use client"
import React, { useState, useEffect, useRef } from 'react';

import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged, 
  type User 
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  collection,
  addDoc,
  serverTimestamp,
  type Timestamp,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAo50MPJ5eLv1s1bELrq8CFEmwGaVBrquk",
  authDomain: "nanoconnect-internship.firebaseapp.com",
  projectId: "nanoconnect-internship",
  storageBucket: "nanoconnect-internship.firebasestorage.app",
  messagingSenderId: "1025906397407",
  appId: "1:1025906397407:web:098666459236676844596a",
  measurementId: "G-Z6B0KTNVVV"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export default function App() {
  const [view, setView] = useState('home');
  const [gameCode, setGameCode] = useState<string>('');
  const [user, setUser] = useState<User | null>(null);
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        signInAnonymously(auth).catch((error) => {
          console.error("Anonymous sign-in failed:", error);
        });
      }
    });
    return () => unsubscribe();
  }, []);

  const renderView = () => {
    if (!user) {
      return <div className="text-center">接続中...</div>;
    }

    switch (view) {
      case 'create':
        return <CreateQuizView setView={setView} setGameCode={setGameCode} user={user} setIsHost={setIsHost} />;
      case 'join':
        return <JoinGameView setView={setView} setGameCode={setGameCode} user={user} setIsHost={setIsHost} />;
      case 'lobby':
        return <LobbyView setView={setView} gameCode={gameCode} isHost={isHost} />;
      case 'play':
        return <PlayerView gameCode={gameCode} user={user} isHost={isHost} setView={setView} />;
      case 'home':
      default:
        return <HomeView setView={setView} />;
    }
  };

  return (
    <div className="bg-gray-100 text-gray-800 min-h-screen flex items-center justify-center font-sans p-4">
      <div className="w-full max-w-5xl mx-auto">
        {renderView()}
      </div>
    </div>
  );
}

/* -------------------- HomeView -------------------- */
interface HomeViewProps {
  setView: React.Dispatch<React.SetStateAction<string>>;
}
function HomeView({ setView }: HomeViewProps) {
  return (
    <div className="text-center">
      <h1 className="text-5xl font-bold mb-4" style={{ color: '#4a4e9d' }}>ナノメーター</h1>
      <p className="text-gray-500 mb-12">リアルタイムでクイズを作成して参加しよう</p>
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <button
          onClick={() => setView('create')}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-lg text-xl transition-transform transform hover:scale-105 shadow-lg"
        >
          クイズを作成
        </button>
        <button
          onClick={() => setView('join')}
          className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-4 px-8 rounded-lg text-xl transition-transform transform hover:scale-105 shadow-lg"
        >
          ゲームに参加
        </button>
      </div>
    </div>
  );
}

/* -------------------- 型定義 -------------------- */
interface Question {
  text: string;
  answers: string[];
  correctAnswer: number;
  points: number;
  time: number;
}
interface Player {
  uid: string;
  name: string;
  score: number;
}
interface Game {
  quizId: string;
  hostId: string;
  state: 'lobby' | 'in-progress' | 'finished';
  currentQuestionIndex: number;
  players: { [key: string]: Player };
  createdAt: Timestamp;
}
interface Quiz {
  questions: Question[];
  createdAt: Timestamp;
  hostId: string;
}

/* -------------------- CreateQuizView -------------------- */
interface CreateQuizViewProps {
  setView: React.Dispatch<React.SetStateAction<string>>;
  setGameCode: React.Dispatch<React.SetStateAction<string>>;
  user: User;
  setIsHost: React.Dispatch<React.SetStateAction<boolean>>;
}
function CreateQuizView({ setView, setGameCode, user, setIsHost }: CreateQuizViewProps) {
  const [questions, setQuestions] = useState<Question[]>([
    {
      text: '好きな恐竜を教えてください',
      answers: ['ティラノサウルス', 'スピノサウルス', 'トリケラトプス', 'プテラノドン'],
      correctAnswer: 0,
      points: 1000,
      time: 10,
    },
  ]);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      text: '新しい問題',
      answers: ['回答1', '回答2', '回答3', '回答4'],
      correctAnswer: 0,
      points: 1000,
      time: 20,
    };
    setQuestions([...questions, newQuestion]);
    setSelectedQuestionIndex(questions.length);
  };

  const handleUpdateQuestion = (index: number, field: string, value: string | number) => {
    setQuestions(currentQuestions =>
      currentQuestions.map((q, i) => {
        if (i !== index) return q;

        if (field.startsWith('answer-')) {
          const answerIndex = parseInt(field.split('-')[1], 10);
          const newAnswers = [...q.answers];
          newAnswers[answerIndex] = String(value);
          return { ...q, answers: newAnswers };
        }
        return { ...q, [field]: value };
      })
    );
  };

  const handleStartQuiz = async () => {
    if (!user) {
      alert("ユーザー情報が読み込まれていません。");
      return;
    }

    const newGameCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    setGameCode(newGameCode);
    setIsHost(true);

    try {
      const quizDocRef = await addDoc(collection(db, "quizzes"), {
        questions: questions,
        createdAt: serverTimestamp(),
        hostId: user.uid,
      });

      const gameDocRef = doc(db, "games", newGameCode);
      await setDoc(gameDocRef, {
        quizId: quizDocRef.id,
        hostId: user.uid,
        state: 'lobby',
        currentQuestionIndex: -1,
        players: {},
        createdAt: serverTimestamp(),
      });

      setView('lobby');
    } catch (error) {
      console.error("Error creating game:", error);
      alert("ゲームの作成に失敗しました。");
    }
  };

  const currentQuestion = questions[selectedQuestionIndex];

  return (
    <div className="w-full mx-auto rounded-2xl shadow-2xl overflow-hidden">
      {/* 省略: UI はあなたのコードと同じ */}
      {/* ... */}
      <button onClick={handleStartQuiz}>ゲームを開始</button>
    </div>
  );
}

/* -------------------- JoinGameView -------------------- */
interface JoinGameViewProps {
  setView: React.Dispatch<React.SetStateAction<string>>;
  setGameCode: React.Dispatch<React.SetStateAction<string>>;
  user: User;
  setIsHost: React.Dispatch<React.SetStateAction<boolean>>;
}
function JoinGameView({ setView, setGameCode, user, setIsHost }: JoinGameViewProps) {
  const [inputCode, setInputCode] = useState('');
  const [error, setError] = useState('');

  const handleJoin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    const code = inputCode.trim().toUpperCase();
    if (!code) return;

    const gameDocRef = doc(db, "games", code);
    const gameDocSnap = await getDoc(gameDocRef);

    if (gameDocSnap.exists()) {
      const playerInfo: Player = {
        uid: user.uid,
        name: `プレイヤー${Math.floor(Math.random() * 1000)}`,
        score: 0,
      };
      await updateDoc(gameDocRef, {
        [`players.${user.uid}`]: playerInfo
      });

      setGameCode(code);
      setIsHost(false);
      setView('lobby');
    } else {
      setError("ゲームが見つかりません。コードを確認してください。");
    }
  };

  return (
    <form onSubmit={handleJoin}>
      <input value={inputCode} onChange={(e) => setInputCode(e.target.value)} />
      <button type="submit">参加</button>
      {error && <p>{error}</p>}
    </form>
  );
}

/* -------------------- PlayerView -------------------- */
interface PlayerViewProps {
  gameCode: string;
  user: User;
  isHost: boolean;
  setView: React.Dispatch<React.SetStateAction<string>>;
}
function PlayerView({ gameCode, user, isHost, setView }: PlayerViewProps) {
  const [game, setGame] = useState<Game | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const quizRef = useRef<Quiz | null>(null);

  useEffect(() => {
    const gameDocRef = doc(db, "games", gameCode);
    const unsubscribe = onSnapshot(gameDocRef, async (docSnap) => {
      if (!docSnap.exists()) {
        alert("ゲームセッションが見つかりません。");
        setView('home');
        return;
      }

      const gameData = docSnap.data() as Game;
      setGame(gameData);

      if (!quizRef.current && gameData.quizId) {
        const quizDocRef = doc(db, "quizzes", gameData.quizId);
        const quizDocSnap = await getDoc(quizDocRef);
        if (quizDocSnap.exists()) {
          quizRef.current = quizDocSnap.data() as Quiz;
          setQuiz(quizRef.current);
        }
      }

      if (quizRef.current && gameData.currentQuestionIndex >= 0) {
        const currentQ = quizRef.current.questions[gameData.currentQuestionIndex];
        setHasAnswered(false);
        setTimeLeft(currentQ.time);
      }

      if (gameData.state === 'finished') {
        const myScore = gameData.players[user.uid]?.score ?? 0;
        alert(`クイズ終了！最終スコアは ${myScore}点です。`);
        setView('home');
      }
    });

    return () => unsubscribe();
  }, [gameCode, user.uid, setView]);

  useEffect(() => {
    if (timeLeft === null) return;

    if (timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft((prev) => (prev ?? 0) - 1), 1000);
    } else {
      setHasAnswered(true);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeLeft]);

  const handleAnswer = async (answerIndex: number) => {
    if (!game || !quiz) return;
    if (hasAnswered) return;

    setHasAnswered(true);

    const currentQuestion = quiz.questions[game.currentQuestionIndex];
    let pointsAwarded = 0;
    if (answerIndex === currentQuestion.correctAnswer && timeLeft !== null) {
      pointsAwarded = Math.round(currentQuestion.points * (timeLeft / currentQuestion.time));
    }

    const gameDocRef = doc(db, "games", gameCode);
    const currentScore = game.players[user.uid]?.score || 0;

    await updateDoc(gameDocRef, {
      [`players.${user.uid}.score`]: currentScore + pointsAwarded
    });
  };

  const handleNextQuestion = async () => {
    if (!isHost || !game || !quiz) return;

    const nextIndex = game.currentQuestionIndex + 1;
    const gameDocRef = doc(db, "games", gameCode);

    if (nextIndex < quiz.questions.length) {
      await updateDoc(gameDocRef, { currentQuestionIndex: nextIndex });
    } else {
      await updateDoc(gameDocRef, { state: 'finished' });
    }
  };

  if (!game || !quiz || game.currentQuestionIndex < 0) {
    return <div className="text-center">クイズの読み込み中...</div>;
  }

  /* 省略: UI は元コードと同じ */
  return (
    <div>
      <h2>{quiz.questions[game.currentQuestionIndex].text}</h2>
      <button onClick={handleNextQuestion}>次の問題へ</button>
    </div>
  );
}
