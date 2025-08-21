"use client"
import React, { useState, useEffect, useRef } from 'react';

import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, type User } from 'firebase/auth';
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

interface Question {
    text: string;
    answers: string[];
    correctAnswer: number;
    points: number;
    time: number;
}

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
        const newQuestion = {
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
             <header className="text-white p-4 flex justify-between items-center" style={{ backgroundColor: '#4a4e9d' }}>
                <h1 className="text-2xl font-bold">ナノメーター</h1>
                 <button onClick={handleStartQuiz} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition-transform transform hover:scale-105">
                    ゲームを開始
                </button>
            </header>
            <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-1/5 p-4" style={{ backgroundColor: '#e0e7ff' }}>
                    <div className="flex flex-row md:flex-col gap-3">
                        {questions.map((q, index) => (
                            <button key={index} onClick={() => setSelectedQuestionIndex(index)} className={`text-left p-3 rounded-lg w-full min-w-[80px] transition shadow-md ${selectedQuestionIndex === index ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-50'}`}>
                                問{index + 1}
                            </button>
                        ))}
                         <button onClick={handleAddQuestion} className="mt-2 w-full p-3 rounded-lg bg-white hover:bg-gray-50 transition flex items-center justify-center text-2xl text-gray-400 shadow-md">+</button>
                    </div>
                </div>
                <div className="w-full md:w-3/5 bg-white p-8 text-center flex flex-col justify-center">
                    <input type="text" value={currentQuestion.text} onChange={(e) => handleUpdateQuestion(selectedQuestionIndex, 'text', e.target.value)} className="text-3xl font-bold mb-8 text-center w-full outline-none" />
                    <div>
                        <h3 className="text-xl text-gray-500 mb-4">回答選択肢：</h3>
                        <div className="flex flex-col items-center gap-3">
                            {currentQuestion.answers.map((ans, i) => (
                                <input key={i} type="text" value={ans} onChange={(e) => handleUpdateQuestion(selectedQuestionIndex, `answer-${i}`, e.target.value)} className="w-full max-w-md bg-gray-100 text-gray-500 text-center p-3 text-2xl rounded-md outline-none focus:ring-2 ring-blue-400" />
                            ))}
                        </div>
                    </div>
                </div>
                <div className="w-full md:w-1/5 p-6 text-center" style={{ backgroundColor: '#bde0fe' }}>
                    <h3 className="text-2xl font-bold mb-6">設定</h3>
                    <div className="mb-6">
                        <label className="block text-sm text-gray-700 mb-2">与えるポイント：</label>
                        <input type="number" value={currentQuestion.points} onChange={(e) => handleUpdateQuestion(selectedQuestionIndex, 'points', parseInt(e.target.value))} className="w-full bg-white p-3 text-center text-xl rounded-lg shadow-md outline-none focus:ring-2 ring-blue-400" />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-700 mb-2">答える時間：</label>
                        <input type="number" value={currentQuestion.time} onChange={(e) => handleUpdateQuestion(selectedQuestionIndex, 'time', parseInt(e.target.value))} className="w-full bg-white p-3 text-center text-xl rounded-lg shadow-md outline-none focus:ring-2 ring-blue-400" placeholder="10秒" />
                    </div>
                </div>
            </div>
        </div>
    );
}

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
            const playerInfo = {
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
        <div className="p-8 rounded-2xl shadow-2xl w-full max-w-2xl mx-auto text-center" style={{ backgroundColor: '#bde0fe' }}>
            <h2 className="text-xl font-bold text-gray-700 mb-6">ゲームコードを入力してください</h2>
            <form onSubmit={handleJoin}>
                <input
                    type="text"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    placeholder="ABCXYZ"
                    maxLength={6}
                    className="w-full bg-white text-gray-500 text-center text-6xl font-bold p-6 rounded-lg mb-6 shadow-inner outline-none focus:ring-4 ring-blue-300 uppercase"
                />
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <button
                    type="submit"
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-lg text-xl transition-transform transform hover:scale-105 shadow-lg"
                >
                    参加
                </button>
            </form>
        </div>
    );
}

interface Player {
    uid: string;
    name: string;
    score: number;
}

interface LobbyViewProps {
    setView: React.Dispatch<React.SetStateAction<string>>;
    gameCode: string;
    isHost: boolean;
}

function LobbyView({ setView, gameCode, isHost }: LobbyViewProps) {
    const [players, setPlayers] = useState<Player[]>([]);

    useEffect(() => {
        const gameDocRef = doc(db, "games", gameCode);
        const unsubscribe = onSnapshot(gameDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setPlayers(Object.values(data.players || {}));
                
                if (data.state === 'in-progress') {
                    setView('play');
                }
            } else {
                alert("Game not found!");
                setView('home');
            }
        });

        return () => unsubscribe();
    }, [gameCode, setView]);

    const handleStartGame = async () => {
        if (isHost) {
            const gameDocRef = doc(db, "games", gameCode);
            await updateDoc(gameDocRef, {
                state: 'in-progress',
                currentQuestionIndex: 0,
            });
        }
    };

    return (
        <div className="p-8 rounded-2xl shadow-2xl w-full max-w-2xl mx-auto text-center bg-white">
            <h2 className="text-3xl font-bold mb-4">ゲームロビー</h2>
            <p className="text-gray-500 mb-6">ゲームコード:</p>
            <div className="bg-gray-200 text-4xl font-mono tracking-widest p-4 rounded-lg mb-8">{gameCode}</div>
            
            <h3 className="text-2xl font-bold mb-4">参加者 ({players.length})</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8 min-h-[100px]">
                {players.map(p => (
                    <div key={p.uid} className="bg-blue-100 p-3 rounded-lg shadow-sm">{p.name}</div>
                ))}
            </div>

            {isHost ? (
                <button onClick={handleStartGame} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-lg text-xl">
                    ゲームを開始！
                </button>
            ) : (
                <p className="text-xl text-gray-600">ホストがゲームを開始するのを待っています...</p>
            )}
        </div>
    );
}

interface PlayerViewProps {
    gameCode: string;
    user: User;
    isHost: boolean;
    setView: React.Dispatch<React.SetStateAction<string>>;
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

function PlayerView({ gameCode, user, isHost, setView }: PlayerViewProps) {
    const [game, setGame] = useState<Game | null>(null);
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [hasAnswered, setHasAnswered] = useState(false);
    
    const timerRef = useRef<NodeJS.Timeout | null>(null);
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
                 alert(`クイズ終了！最終スコアは ${gameData.players[user.uid].score}点です。`);
                 setView('home');
            }
        });

        return () => unsubscribe();
    }, [gameCode, user.uid, setView]);

    useEffect(() => {
        if (timeLeft === null) return;

        if (timeLeft > 0) {
            timerRef.current = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        } else {
            setHasAnswered(true);
        }
        
        return () => clearTimeout(timerRef.current);
    }, [timeLeft]);

    const handleAnswer = async (answerIndex) => {
        if (hasAnswered) return;
        setHasAnswered(true);

        const currentQuestion = quiz.questions[game.currentQuestionIndex];
        let pointsAwarded = 0;
        if (answerIndex === currentQuestion.correctAnswer) {
            pointsAwarded = Math.round(currentQuestion.points * (timeLeft / currentQuestion.time));
        }
        
        const gameDocRef = doc(db, "games", gameCode);
        const currentScore = game.players[user.uid].score || 0;
        
        await updateDoc(gameDocRef, {
            [`players.${user.uid}.score`]: currentScore + pointsAwarded
        });
    };

    const handleNextQuestion = async () => {
        if (!isHost) return;

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

    const currentQuestion = quiz.questions[game.currentQuestionIndex];
    const myPlayerInfo = game.players[user.uid];
    const answerLabels = ['ア', 'イ', 'ウ', 'エ'];

    return (
        <div className="bg-white rounded-2xl shadow-2xl w-full flex flex-col h-[80vh] max-h-[700px] overflow-hidden">
            <div className="flex-grow p-8 text-center flex flex-col justify-center relative">
                 <div className="absolute top-4 right-4 text-right text-gray-500">
                    <div className="text-2xl font-bold">スコア：<span className="text-green-500">{myPlayerInfo?.score || 0}</span>点</div>
                    <div className="text-lg">残り{timeLeft}秒</div>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">{currentQuestion.text}</h2>
                <div className="w-full max-w-3xl mx-auto">
                    <h3 className="text-xl text-gray-500 mb-4">回答選択肢：</h3>
                    <div className="grid grid-cols-1 gap-3 text-2xl text-gray-600">
                        {currentQuestion.answers.map((answer, index) => (
                            <div key={index}>{answer}</div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4" style={{ backgroundColor: '#bde0fe' }}>
                {currentQuestion.answers.map((_, index) => (
                     <button
                        key={index}
                        onClick={() => handleAnswer(index)}
                        disabled={hasAnswered}
                        className={`p-6 rounded-lg text-4xl font-bold text-gray-700 transition shadow-md ${hasAnswered ? 'bg-gray-300' : 'bg-white hover:bg-gray-50'}`}
                     >
                        {answerLabels[index]}
                    </button>
                ))}
            </div>
            {isHost && (
                <div className="p-4 bg-gray-700">
                    <button onClick={handleNextQuestion} className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg">
                        次の問題へ
                    </button>
                </div>
            )}
        </div>
    );
}
