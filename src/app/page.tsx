"use client"
import React, { useState, useEffect, useRef } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
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
    DocumentData
} from 'firebase/firestore';

// --- Type Definitions ---
interface Question {
    text: string;
    answers: string[];
    correctAnswer: number;
    points: number;
    time: number;
}

interface Quiz {
    questions: Question[];
    hostId: string;
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
}


const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_MEASUREMENT_ID
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export default function App() {
    const [view, setView] = useState('home');
    const [gameCode, setGameCode] = useState('');
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
        <div className="bg-gray-100 text-gray-800 min-h-screen flex items-center justify-center font-sans p-2 sm:p-4">
            <div className="w-full max-w-5xl mx-auto px-2 sm:px-6">
                {renderView()}
            </div>
        </div>
    );
}

function HomeView({ setView }: { setView: (view: string) => void }) {
    return (
        <div className="text-center py-8 px-2 sm:px-8">
            <div className={`max-w-3xl mx-auto mb-8 p-6 rounded-xl border-2 shadow-lg transition-colors duration-300 bg-yellow-50 border-yellow-400 text-yellow-900`}
        style={{ fontSize: '1.08rem', lineHeight: '1.7' }}
      >
        <div className="mb-2 text-lg font-bold flex items-center gap-2">
          <span role="img" aria-label="Trophy">🏆</span>
          <span>Announcement</span>
        </div>
        <div className="mb-2">
          I am thrilled to announce that I have been selected as the winner of the 『ナノコネ コンペ形式インターンシップ』 (Nanoconnect Competition-Style Internship), hosted by 株式会社ナノコネクト (NANO CONNECT Inc.). My project, 『ナノメーター』 (<a href="https://nanometer.luqmanhadi.com" className="underline hover:text-blue-600 dark:hover:text-blue-300" target="_blank" rel="noopener noreferrer">nanometer.luqmanhadi.com</a>), was chosen from over 300 submissions by university students across Japan.<br/>
          『ナノメーター』 is a web application built with Next.js, TypeScript, Tailwind CSS, and Firebase. I am incredibly grateful for this recognition and would like to extend my sincere thanks to the team at NANO CONNECT Inc. for this valuable opportunity. This experience has further solidified my passion for front-end development and creating user-centric solutions.
        </div>
        <div className="border-t border-yellow-300 my-3" />
        <div>
          この度、株式会社ナノコネクト様主催の『ナノコネ コンペ形式インターンシップ』において、最優秀賞を受賞いたしましたことをご報告申し上げます。<br/>
          全国300名以上の大学生の中から、私のNext.js/React.jsプロジェクト『ナノメーター』（<a href="https://nanometer.luqmanhadi.com" className="underline hover:text-blue-600 dark:hover:text-blue-300" target="_blank" rel="noopener noreferrer">https://nanometer.luqmanhadi.com</a>）を選出していただきました。このアプリケーションは、React、TypeScript、Tailwind CSS、Firebaseを用いて開発しました。<br/>
          このような素晴らしい機会をいただき、株式会社ナノコネクトの皆様には心より感謝申し上げます。今回の経験を糧に、今後もフロントエンド開発のスキルを磨き、ユーザー中心のソリューション開発に貢献していきたいと考えております。
        </div>
        <div className="mt-4 flex justify-center gap-4">
            <a href="https://github.com/luqhardy/nanoconnect-internship" className="underline hover:text-blue-600" target="_blank" rel="noopener noreferrer">GitHub Repository</a>
            <a href="https://luqmanhadi.com" className="underline hover:text-blue-600" target="_blank" rel="noopener noreferrer">luqmanhadi.com</a>
        </div>
      </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4" style={{ color: '#4a4e9d' }}>ナノメーター</h1>
            <p className="text-gray-500 mb-8 sm:mb-12">リアルタイムでクイズを作成して参加しよう</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 w-full max-w-lg mx-auto">
                <button
                    onClick={() => setView('create')}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-lg text-lg sm:text-xl transition-transform transform hover:scale-105 shadow-lg w-full sm:w-auto"
                >
                    クイズを作成
                </button>
                <button
                    onClick={() => setView('join')}
                    className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-4 px-8 rounded-lg text-lg sm:text-xl transition-transform transform hover:scale-105 shadow-lg w-full sm:w-auto"
                >
                    ゲームに参加
                </button>
            </div>
        </div>
    );
}

interface CreateQuizViewProps {
    setView: (view: string) => void;
    setGameCode: (code: string) => void;
    user: User;
    setIsHost: (isHost: boolean) => void;
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
        const newQuestions = questions.map((q, i) => {
            if (i === index) {
                const updatedQuestion = { ...q };
                if (field.startsWith('answer-')) {
                    const answerIndex = parseInt(field.split('-')[1]);
                    const newAnswers = [...updatedQuestion.answers];
                    newAnswers[answerIndex] = String(value);
                    updatedQuestion.answers = newAnswers;
                } else {
                    const key = field as keyof Question;
                    if (key === 'text') {
                        updatedQuestion[key] = String(value);
                    } else if (key === 'points' || key === 'time' || key === 'correctAnswer') {
                        updatedQuestion[key] = Number(value);
                    }
                }
                return updatedQuestion;
            }
            return q;
        });
        setQuestions(newQuestions);
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
        <div className="w-full mx-auto rounded-2xl shadow-2xl overflow-hidden bg-white">
            <header className="text-white p-4 flex flex-col sm:flex-row justify-between items-center gap-2" style={{ backgroundColor: '#4a4e9d' }}>
                <h1 className="text-xl sm:text-2xl font-bold">ナノメーター</h1>
                <button onClick={handleStartQuiz} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition-transform transform hover:scale-105 w-full sm:w-auto">
                    ゲームを開始
                </button>
            </header>
            <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-1/5 p-2 sm:p-4" style={{ backgroundColor: '#e0e7ff' }}>
                    <div className="flex flex-row md:flex-col gap-2 sm:gap-3">
                        {questions.map((q, index) => (
                            <button key={index} onClick={() => setSelectedQuestionIndex(index)} className={`text-left p-2 sm:p-3 rounded-lg w-full min-w-[60px] sm:min-w-[80px] transition shadow-md ${selectedQuestionIndex === index ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-50'}`}>
                                問{index + 1}
                            </button>
                        ))}
                        <button onClick={handleAddQuestion} className="mt-2 w-full p-2 sm:p-3 rounded-lg bg-white hover:bg-gray-50 transition flex items-center justify-center text-xl sm:text-2xl text-gray-400 shadow-md">+</button>
                    </div>
                </div>
                <div className="w-full md:w-3/5 bg-white p-4 sm:p-8 text-center flex flex-col justify-center">
                    <input type="text" value={currentQuestion.text} onChange={(e) => handleUpdateQuestion(selectedQuestionIndex, 'text', e.target.value)} className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center w-full outline-none" />
                    <div>
                        <h3 className="text-lg sm:text-xl text-gray-500 mb-2 sm:mb-4">回答選択肢：</h3>
                        <div className="flex flex-col items-center gap-2 sm:gap-3">
                            {currentQuestion.answers.map((ans, i) => (
                                <input key={i} type="text" value={ans} onChange={(e) => handleUpdateQuestion(selectedQuestionIndex, `answer-${i}`, e.target.value)} className="w-full max-w-xs sm:max-w-md bg-gray-100 text-gray-500 text-center p-2 sm:p-3 text-lg sm:text-2xl rounded-md outline-none focus:ring-2 ring-blue-400" />
                            ))}
                        </div>
                    </div>
                </div>
                <div className="w-full md:w-1/5 p-4 sm:p-6 text-center" style={{ backgroundColor: '#bde0fe' }}>
                    <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">設定</h3>
                    <div className="mb-4 sm:mb-6">
                        <label className="block text-xs sm:text-sm text-gray-700 mb-1 sm:mb-2">与えるポイント：</label>
                        <input type="number" value={currentQuestion.points} onChange={(e) => handleUpdateQuestion(selectedQuestionIndex, 'points', parseInt(e.target.value))} className="w-full bg-white p-2 sm:p-3 text-center text-lg sm:text-xl rounded-lg shadow-md outline-none focus:ring-2 ring-blue-400" />
                    </div>
                    <div>
                        <label className="block text-xs sm:text-sm text-gray-700 mb-1 sm:mb-2">答える時間：</label>
                        <input type="number" value={currentQuestion.time} onChange={(e) => handleUpdateQuestion(selectedQuestionIndex, 'time', parseInt(e.target.value))} className="w-full bg-white p-2 sm:p-3 text-center text-lg sm:text-xl rounded-lg shadow-md outline-none focus:ring-2 ring-blue-400" placeholder="10秒" />
                    </div>
                </div>
            </div>
        </div>
    );
}

interface JoinGameViewProps {
    setView: (view: string) => void;
    setGameCode: (code: string) => void;
    user: User;
    setIsHost: (isHost: boolean) => void;
}

function JoinGameView({ setView, setGameCode, user, setIsHost }: JoinGameViewProps) {
    const [inputCode, setInputCode] = useState('');
    const [error, setError] = useState('');

    const handleJoin = async (e: React.FormEvent) => {
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
        <div className="p-4 sm:p-8 rounded-2xl shadow-2xl w-full max-w-lg sm:max-w-2xl mx-auto text-center" style={{ backgroundColor: '#bde0fe' }}>
            <h2 className="text-lg sm:text-xl font-bold text-gray-700 mb-4 sm:mb-6">ゲームコードを入力してください</h2>
            <form onSubmit={handleJoin}>
                <input
                    type="text"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    placeholder="ABCXYZ"
                    maxLength={6}
                    className="w-full bg-white text-gray-500 text-center text-4xl sm:text-6xl font-bold p-4 sm:p-6 rounded-lg mb-4 sm:mb-6 shadow-inner outline-none focus:ring-4 ring-blue-300 uppercase"
                />
                {error && <p className="text-red-500 mb-2 sm:mb-4">{error}</p>}
                <button
                    type="submit"
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-lg text-lg sm:text-xl transition-transform transform hover:scale-105 shadow-lg"
                >
                    参加
                </button>
            </form>
        </div>
    );
}

interface LobbyViewProps {
    setView: (view: string) => void;
    gameCode: string;
    isHost: boolean;
}

function LobbyView({ setView, gameCode, isHost }: LobbyViewProps) {
    const [players, setPlayers] = useState<Player[]>([]);

    useEffect(() => {
        const gameDocRef = doc(db, "games", gameCode);
        const unsubscribe = onSnapshot(gameDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data() as Game;
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
        <div className="p-4 sm:p-8 rounded-2xl shadow-2xl w-full max-w-lg sm:max-w-2xl mx-auto text-center bg-white">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-4">ゲームロビー</h2>
            <p className="text-gray-500 mb-4 sm:mb-6">ゲームコード:</p>
            <div className="bg-gray-200 text-2xl sm:text-4xl font-mono tracking-widest p-2 sm:p-4 rounded-lg mb-4 sm:mb-8">{gameCode}</div>
            <h3 className="text-lg sm:text-2xl font-bold mb-2 sm:mb-4">参加者 ({players.length})</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-8 min-h-[60px] sm:min-h-[100px]">
                {players.map(p => (
                    <div key={p.uid} className="bg-blue-100 p-2 sm:p-3 rounded-lg shadow-sm text-xs sm:text-base">{p.name}</div>
                ))}
            </div>
            {isHost ? (
                <button onClick={handleStartGame} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-lg text-lg sm:text-xl">
                    ゲームを開始！
                </button>
            ) : (
                <p className="text-base sm:text-xl text-gray-600">ホストがゲームを開始するのを待っています...</p>
            )}
        </div>
    );
}

interface PlayerViewProps {
    gameCode: string;
    user: User;
    isHost: boolean;
    setView: (view: string) => void;
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
            
            if (gameData.state === 'finished' && gameData.players[user.uid]) {
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
        
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [timeLeft]);

    const handleAnswer = async (answerIndex: number) => {
        if (hasAnswered || !quiz || !game) return;
        setHasAnswered(true);

        const currentQuestion = quiz.questions[game.currentQuestionIndex];
        let pointsAwarded = 0;
        if (answerIndex === currentQuestion.correctAnswer && timeLeft) {
            pointsAwarded = Math.round(currentQuestion.points * (timeLeft / currentQuestion.time));
        }
        
        const gameDocRef = doc(db, "games", gameCode);
        const currentScore = game.players[user.uid]?.score || 0;
        
        await updateDoc(gameDocRef, {
            [`players.${user.uid}.score`]: currentScore + pointsAwarded
        });
    };

    const handleNextQuestion = async () => {
        if (!isHost || !quiz || !game) return;

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
            <div className="flex-grow p-4 sm:p-8 text-center flex flex-col justify-center relative">
                <div className="absolute top-2 sm:top-4 right-2 sm:right-4 text-right text-gray-500">
                    <div className="text-lg sm:text-2xl font-bold">スコア：<span className="text-green-500">{myPlayerInfo?.score || 0}</span>点</div>
                    <div className="text-base sm:text-lg">残り{timeLeft}秒</div>
                </div>
                <h2 className="text-xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">{currentQuestion.text}</h2>
                <div className="w-full max-w-xl sm:max-w-3xl mx-auto">
                    <h3 className="text-base sm:text-xl text-gray-500 mb-2 sm:mb-4">回答選択肢：</h3>
                    <div className="grid grid-cols-1 gap-2 sm:gap-3 text-lg sm:text-2xl text-gray-600">
                        {currentQuestion.answers.map((answer: string, index: number) => (
                            <div key={index}>{answer}</div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="p-4 sm:p-6 grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4" style={{ backgroundColor: '#bde0fe' }}>
                {currentQuestion.answers.map((_: string, index: number) => (
                    <button
                        key={index}
                        onClick={() => handleAnswer(index)}
                        disabled={hasAnswered}
                        className={`p-4 sm:p-6 rounded-lg text-2xl sm:text-4xl font-bold text-gray-700 transition shadow-md ${hasAnswered ? 'bg-gray-300' : 'bg-white hover:bg-gray-50'}`}
                    >
                        {answerLabels[index]}
                    </button>
                ))}
            </div>
            {isHost && (
                <div className="p-2 sm:p-4 bg-gray-700">
                    <button onClick={handleNextQuestion} className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg">
                        次の問題へ
                    </button>
                </div>
            )}
        </div>
    );
}
