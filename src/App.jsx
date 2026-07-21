import React, { useState, useEffect, useRef } from 'react';
import { sounds } from './services/soundEffects';
import { PILOTS, runDiscussion, logDecisionToChipHistory, CHIP_HISTORY_PATH } from './services/discussionEngine';
import { AlertTriangle, Flame, ShieldAlert, Cpu, History, Volume2, VolumeX, Key, Sparkles, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  const [topic, setTopic] = useState('');
  const [apiKey, setApiKey] = useState(localStorage.getItem('GEMINI_API_KEY') || '');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('SYSTEM'); // 'SYSTEM' | 'HISTORY'
  const [currentResult, setCurrentResult] = useState(null);
  const [visibleLogs, setVisibleLogs] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [chipHistoryText, setChipHistoryText] = useState('履歴データを読み込み中...');

  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchHistoryText();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [visibleLogs]);

  const handleSaveApiKey = (key) => {
    setApiKey(key);
    localStorage.setItem('GEMINI_API_KEY', key);
  };

  const fetchHistoryText = () => {
    const sampleHistory = `---
## 🚀 第15章: 逃げちゃダメシステム (nigetya-dame-system) の立ち上げ (2026-07-21)
- **目的**: シンジ・綾波・アスカの3つの思考AIが激しく議論・掛け合いを展開するエヴァンゲリオンMAGI風パロディWebエンタメシステム。
- **AIエンジン**: Gemini 1.5 Flash API (1 Key 3 Persona) & Simulation Engine
- **共有ファイルパス**: ${CHIP_HISTORY_PATH}
- **自動同期ステータス**: ACTIVE (NotebookLM Realtime Sync)
`;
    setChipHistoryText(sampleHistory);
  };

  const handleStartDeliberation = async (e) => {
    e.preventDefault();
    if (!topic.trim() || isAnalyzing) return;

    if (soundEnabled) {
      sounds.playAlarm();
    }

    setIsAnalyzing(true);
    setCurrentResult(null);
    setVisibleLogs([]);

    // 1. Gemini API / シミュレーション論理呼び出し
    const result = await runDiscussion(topic, apiKey);

    // 2. 対話ストリームの再生演出
    for (let i = 0; i < result.logs.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1100));
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
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } else {
        sounds.playDecisionReject();
      }
    }

    logDecisionToChipHistory(topic, result);
  };

  return (
    <div className={`min-h-screen p-4 md:p-8 ${isAnalyzing ? 'alarm-active' : ''}`}>
      {/* MAGI ヘッダー */}
      <header className="max-w-6xl mx-auto mb-6 flex flex-col md:flex-row justify-between items-center border-b-2 border-amber-500/50 pb-4 gap-4">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-10 h-10 text-red-500 animate-pulse" />
          <div>
            <h1 className="glitch-title">逃げちゃダメシステム</h1>
            <p className="text-xs text-amber-500/80 tracking-widest font-mono flex items-center gap-2">
              MAGI SYSTEM PARODY v6.01 
              {apiKey ? (
                <span className="text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 border border-emerald-500/50 rounded flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> REAL GEMINI AI ACTIVE
                </span>
              ) : (
                <span className="text-amber-500/60 font-bold">SIMULATION MODE</span>
              )}
            </p>
          </div>
        </div>

        {/* コントロール＆タブ切替 */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowKeyInput(!showKeyInput)}
            className="px-3 py-2 text-xs font-bold border border-amber-500/60 text-amber-400 hover:bg-amber-500/20 flex items-center gap-1"
            title="Gemini APIキー設定"
          >
            <Key className="w-4 h-4" /> {apiKey ? 'APIキー登録済' : 'Gemini API連携'}
          </button>
          <button
            onClick={() => setActiveTab('SYSTEM')}
            className={`px-4 py-2 text-sm font-bold border ${activeTab === 'SYSTEM' ? 'bg-amber-500 text-black border-amber-500' : 'border-amber-500/50 text-amber-500'}`}
          >
            <Cpu className="inline-w-4 h-4 mr-1" /> MAGI MONITOR
          </button>
          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`px-4 py-2 text-sm font-bold border ${activeTab === 'HISTORY' ? 'bg-amber-500 text-black border-amber-500' : 'border-amber-500/50 text-amber-500'}`}
          >
            <History className="inline-w-4 h-4 mr-1" /> チップ歴史.txt
          </button>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 border border-amber-500/50 text-amber-500 hover:bg-amber-500/20"
            title="効果音 ON/OFF"
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-gray-500" />}
          </button>
        </div>
      </header>

      {/* Gemini APIキー設定ポップアップ */}
      {showKeyInput && (
        <div className="max-w-6xl mx-auto mb-6 p-4 bg-neutral-900 border-2 border-amber-500 font-mono text-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-amber-400 font-bold flex items-center gap-2">
              <Key className="w-4 h-4" /> Gemini API キー設定 (1キーで3キャラ同時起動)
            </span>
            <button onClick={() => setShowKeyInput(false)} className="text-xs text-gray-400 hover:text-white">閉じる ✖</button>
          </div>
          <p className="text-xs text-gray-300 mb-3">
            Google AI Studioの無料APIキーを入力すると、Gemini 1.5 Flashがシンジ・綾波・アスカの3人のAIとしてリアルタイム思考・議論を展開します。未入力時は超高速シミュレーションモード動作となります。
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="AIzaSy... (Gemini API Key)"
              value={apiKey}
              onChange={(e) => handleSaveApiKey(e.target.value)}
              className="text-sm p-2 bg-black border border-amber-500/70 text-white flex-1"
            />
            <button
              onClick={() => setShowKeyInput(false)}
              className="px-4 py-2 bg-amber-500 text-black font-bold text-xs hover:bg-amber-400"
            >
              保存して完了
            </button>
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto">
        {activeTab === 'SYSTEM' ? (
          <>
            {/* CODE: 601 警報ステータスバー */}
            <div className="bg-black/80 border border-amber-500 p-3 mb-6 flex justify-between items-center font-mono text-sm">
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-full bg-red-600 animate-ping"></span>
                <span className="text-red-500 font-bold">CODE: 601</span>
                <span className="text-amber-500">
                  {isAnalyzing ? (currentResult?.isRealAi ? "REAL GEMINI AI THINKING (3キャラ思考中...)" : "EMERGENCY DELIBERATION (審議中...)") : "READY FOR INPUT"}
                </span>
              </div>
              <div className="text-xs text-amber-500/70 hidden sm:block">
                EMERGENCY ESCAPE PREVENTION SYSTEM
              </div>
            </div>

            {/* お題入力フォーム */}
            <form onSubmit={handleStartDeliberation} className="mb-8">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="悩み・お題を入力（例：明日仕事休んでディズニー行っていい？、昼飯ラーメンにする？）"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  disabled={isAnalyzing}
                />
                <button
                  type="submit"
                  disabled={isAnalyzing || !topic.trim()}
                  className="btn-magi flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <Flame className="w-5 h-5" />
                  {isAnalyzing ? "逃避阻止・審議中..." : "逃避不能・審議開始"}
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
                    {currentResult ? (currentResult.votes.SHINJI === 'AGREE' ? 'AGREE' : 'DENY') : (isAnalyzing ? 'THINKING...' : 'IDLE')}
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
                    {currentResult ? (currentResult.votes.AYANAMI === 'AGREE' ? 'AGREE' : 'DENY') : (isAnalyzing ? 'THINKING...' : 'IDLE')}
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
                    {currentResult ? (currentResult.votes.ASUKA === 'AGREE' ? 'AGREE' : 'DENY') : (isAnalyzing ? 'THINKING...' : 'IDLE')}
                  </span>
                </div>
              </div>
            </div>

            {/* 討論チャットログ */}
            {visibleLogs.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-mono text-amber-500 mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    MAGI STREAMING DISCUSSION LOG:
                  </span>
                  {currentResult?.isRealAi && (
                    <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Generated by Real Gemini AI
                    </span>
                  )}
                </h3>
                <div className="discussion-box">
                  {visibleLogs.map((log, idx) => (
                    <div key={idx} className={`chat-bubble ${log.pilot}`}>
                      <div className="text-xs font-bold font-mono mb-1 opacity-80">
                        [{PILOTS[log.pilot].name}] :
                      </div>
                      <div className="text-sm md:text-base leading-relaxed text-white">
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
                <div className="text-xs font-mono tracking-normal mt-2 opacity-80">
                  MAJORITY VOTES: AGREE {currentResult.agreeCount} / DENY {currentResult.denyCount}
                </div>
              </div>
            )}
          </>
        ) : (
          /* チップくんの歴史.txt 閲覧パネル */
          <div className="bg-black/90 border-2 border-amber-500 p-6 font-mono">
            <div className="flex justify-between items-center border-b border-amber-500/50 pb-3 mb-4">
              <div className="flex items-center gap-2 text-amber-500 font-bold">
                <History className="w-5 h-5" />
                <span>「チップくんの歴史.txt」ナレッジ同期モニター</span>
              </div>
              <button
                onClick={fetchHistoryText}
                className="text-xs text-amber-500 border border-amber-500/50 px-3 py-1 hover:bg-amber-500/20 flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> 最新状態を取得
              </button>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              Google Drive上の共有ファイルパス:<br />
              <code className="text-amber-400">{CHIP_HISTORY_PATH}</code>
            </p>
            <pre className="bg-neutral-950 p-4 border border-amber-500/30 text-amber-500/90 text-sm overflow-x-auto whitespace-pre-wrap max-h-96 leading-relaxed">
              {chipHistoryText}
            </pre>
          </div>
        )}
      </main>

      <footer className="max-w-6xl mx-auto mt-12 text-center text-xs text-amber-500/50 font-mono border-t border-amber-500/20 pt-4">
        逃げちゃダメシステム (ESCAPE DAME SYSTEM) // PRODUCED FOR ENTERTAINMENT PURPOSES ONLY
      </footer>
    </div>
  );
}
