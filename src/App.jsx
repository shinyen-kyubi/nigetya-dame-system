import React, { useState, useEffect, useRef } from 'react';
import { sounds } from './services/soundEffects';
import { PILOTS, runDiscussion, logDecisionToChipHistory } from './services/discussionEngine';
import { AlertTriangle, Flame, ShieldAlert, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  const [topic, setTopic] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentResult, setCurrentResult] = useState(null);
  const [visibleLogs, setVisibleLogs] = useState([]);
  const [soundEnabled] = useState(true);

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [visibleLogs]);

  // 審議（討論）開始
  const handleStartDeliberation = async (e) => {
    e.preventDefault();
    if (!topic.trim() || isAnalyzing) return;

    if (soundEnabled) {
      sounds.playAlarm();
    }

    setIsAnalyzing(true);
    setCurrentResult(null);
    setVisibleLogs([]);

    // 1. Gemini AI による深掘りディベートの実行
    const result = await runDiscussion(topic);

    // 2. 6ターンの深い対話ストリームのリアルタイム表示
    for (let i = 0; i < result.logs.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1400));
      setVisibleLogs(prev => [...prev, result.logs[i]]);
      if (soundEnabled) {
        sounds.playNodeUpdate();
      }
    }

    // 3. 討論終了・判定提示
    await new Promise(resolve => setTimeout(resolve, 800));
    setCurrentResult(result);
    setIsAnalyzing(false);

    if (soundEnabled) {
      if (result.isPassed) {
        sounds.playDecisionPass();
        confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
      } else {
        sounds.playDecisionReject();
      }
    }

    logDecisionToChipHistory(topic, result);
  };

  return (
    <div className={`min-h-screen p-4 md:p-8 ${isAnalyzing ? 'alarm-active' : ''}`}>
      {/* 極簡MAGI ヘッダー (メニューボタン完全撤去) */}
      <header className="max-w-5xl mx-auto mb-6 border-b-2 border-amber-500/50 pb-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-10 h-10 text-red-500 animate-pulse" />
          <div>
            <h1 className="glitch-title">逃げちゃダメシステム</h1>
            <p className="text-xs text-amber-500/80 tracking-widest font-mono flex items-center gap-2 mt-1">
              MAGI SYSTEM PARODY v6.01 // PILOTS: SHINJI-01 / AYANAMI-00 / ASUKA-02
              <span className="text-emerald-400 font-bold bg-emerald-950/90 px-2 py-0.5 border border-emerald-500/50 rounded flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> GEMINI DEEP AI ACTIVE
              </span>
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto">
        {/* CODE: 601 警報ステータスバー */}
        <div className="bg-black/80 border border-amber-500 p-3 mb-6 flex justify-between items-center font-mono text-sm">
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-red-600 animate-ping"></span>
            <span className="text-red-500 font-bold">CODE: 601</span>
            <span className="text-amber-500 font-bold">
              {isAnalyzing ? "3 PILOTS DEEP DEBATING (3人が真剣議論中...)" : "READY FOR INPUT"}
            </span>
          </div>
          <div className="text-xs text-amber-500/70 hidden sm:block">
            EMERGENCY ESCAPE PREVENTION SYSTEM
          </div>
        </div>

        {/* お題入力フォーム（操作はこれだけ！） */}
        <form onSubmit={handleStartDeliberation} className="mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="悩み・お題を入力（例：明日会社休んで旅行行っていい？、今の仕事を続けるべき？）"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={isAnalyzing}
              className="text-lg p-4"
            />
            <button
              type="submit"
              disabled={isAnalyzing || !topic.trim()}
              className="btn-magi flex items-center justify-center gap-2 whitespace-nowrap text-lg py-4 px-8"
            >
              <Flame className="w-6 h-6" />
              {isAnalyzing ? "議論中..." : "逃避不能・審議開始"}
            </button>
          </div>
        </form>

        {/* 3人のパイロット・ヘキサゴンノード */}
        <div className="hexagon-container mb-8">
          {/* シンジ */}
          <div className="hex-card shinji">
            <div className="flex justify-between items-center border-b border-purple-500/50 pb-2 mb-3">
              <span className="font-bold text-purple-400">{PILOTS.SHINJI.name}</span>
              <span className="text-xs font-mono text-purple-300/70">{PILOTS.SHINJI.id}</span>
            </div>
            <p className="text-xs text-purple-300 mb-4">{PILOTS.SHINJI.role}</p>
            <div className="text-center my-6">
              <span className="text-3xl font-black font-mono text-purple-400">
                {currentResult ? (currentResult.votes.SHINJI === 'AGREE' ? 'AGREE' : 'DENY') : (isAnalyzing ? 'DEBATING...' : 'IDLE')}
              </span>
            </div>
          </div>

          {/* 綾波 */}
          <div className="hex-card ayanami">
            <div className="flex justify-between items-center border-b border-sky-500/50 pb-2 mb-3">
              <span className="font-bold text-sky-400">{PILOTS.AYANAMI.name}</span>
              <span className="text-xs font-mono text-sky-300/70">{PILOTS.AYANAMI.id}</span>
            </div>
            <p className="text-xs text-sky-300 mb-4">{PILOTS.AYANAMI.role}</p>
            <div className="text-center my-6">
              <span className="text-3xl font-black font-mono text-sky-400">
                {currentResult ? (currentResult.votes.AYANAMI === 'AGREE' ? 'AGREE' : 'DENY') : (isAnalyzing ? 'DEBATING...' : 'IDLE')}
              </span>
            </div>
          </div>

          {/* アスカ */}
          <div className="hex-card asuka">
            <div className="flex justify-between items-center border-b border-red-500/50 pb-2 mb-3">
              <span className="font-bold text-red-400">{PILOTS.ASUKA.name}</span>
              <span className="text-xs font-mono text-red-300/70">{PILOTS.ASUKA.id}</span>
            </div>
            <p className="text-xs text-red-300 mb-4">{PILOTS.ASUKA.role}</p>
            <div className="text-center my-6">
              <span className="text-3xl font-black font-mono text-red-500">
                {currentResult ? (currentResult.votes.ASUKA === 'AGREE' ? 'AGREE' : 'DENY') : (isAnalyzing ? 'DEBATING...' : 'IDLE')}
              </span>
            </div>
          </div>
        </div>

        {/* 6ターンのディープ討論チャットストリーム */}
        {visibleLogs.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-mono text-amber-500 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              MAGI REALTIME DEEP DISCUSSION STREAM:
            </h3>
            <div className="discussion-box space-y-3 p-4">
              {visibleLogs.map((log, idx) => (
                <div key={idx} className={`chat-bubble ${log.pilot} p-4 rounded`}>
                  <div className="text-xs font-bold font-mono mb-1 opacity-90">
                    [{PILOTS[log.pilot].name}] :
                  </div>
                  <div className="text-base leading-relaxed text-white font-medium">
                    {log.text}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          </div>
        )}

        {/* 重大決断バナー */}
        {currentResult && (
          <div className={`decision-banner ${currentResult.isPassed ? '' : 'rejected'} animate-bounce`}>
            <div>{currentResult.decisionTitle}</div>
            <div className="text-sm font-mono tracking-normal mt-2 opacity-90">
              MAJORITY VOTES: AGREE {currentResult.agreeCount} / DENY {currentResult.denyCount}
            </div>
          </div>
        )}
      </main>

      <footer className="max-w-5xl mx-auto mt-12 text-center text-xs text-amber-500/50 font-mono border-t border-amber-500/20 pt-4">
        逃げちゃダメシステム (ESCAPE DAME SYSTEM) // POWERED BY GEMINI DEEP AI
      </footer>
    </div>
  );
}
