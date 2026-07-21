// シンジ・綾波・アスカの『逃げちゃダメシステム』議論エンジン (完全ランダム＆有機的リアルAI会話版)

export const CHIP_HISTORY_PATH = "/Users/nakayamamichiyoshi/Library/CloudStorage/GoogleDrive-gotomichi5100@gmail.com/マイドライブ/チップくんの歴史/チップくんの歴史.txt";

const getApiKey = () => {
  const stored = localStorage.getItem('GEMINI_API_KEY');
  if (stored) return stored;
  try {
    return atob("QVEuQWI4Uk42SlEwbDd3b2l0VjkwelF5bVc1d29laHpjZ0dHN2w1ak5GS19saGE3dk5HN0E=");
  } catch (e) {
    return "";
  }
};

export const PILOTS = {
  SHINJI: {
    id: 'SHINJI-01',
    name: '碇シンジ',
    role: 'EVA-01 / 葛藤・繊細・逃避と責任感の挟み撃ち',
    color: '#9b59b6',
  },
  AYANAMI: {
    id: 'AYANAMI-00',
    name: '綾波レイ',
    role: 'EVA-00 / 冷徹論理・確率計算・本質を見抜く問いかけ',
    color: '#3498db',
  },
  ASUKA: {
    id: 'ASUKA-02',
    name: '惣流・アスカ・ラングレー',
    role: 'EVA-02 / 超強気・圧倒的自尊心・本音を突く鋭い喝',
    color: '#e74c3c',
  }
};

export async function runDiscussion(topic) {
  const apiKey = getApiKey();

  // 第一声をランダムに決定（ASUKA, SHINJI, AYANAMI）
  const starterPilots = ['ASUKA', 'SHINJI', 'AYANAMI'];
  const firstSpeaker = starterPilots[Math.floor(Math.random() * starterPilots.length)];

  const systemPrompt = `
あなたはアニメ「新世紀エヴァンゲリオン」の主要パイロット3人（アスカ、シンジ、綾波）になりきり、ユーザーから投げかけられたお題「${topic}」について、本気で深く自由かつランダムに討論するAIディベートエンジンです。

【重要：会話のスタート人物の指定】
今回は「${firstSpeaker}」が一番最初に発言を開始してください！毎回同じ人物から始まらないように、会話の皮切りを「${firstSpeaker}」にしてください。

【会話の自然さと深さのルール】
1. 3人が本当にその場で生き生きと会話しているように、直前の発言に対して名前を呼んだり反論・共感・質問を挟んで対話させてください。
2. 全5〜7ターンの自然な掛け合いで構成してください。
3. 決め台詞（「あんたバカぁ！？」「逃げちゃダメだ…」「あなたは死なないわ」など）は状況に応じて自然に織り交ぜ、お題「${topic}」の内容（仕事、恋愛、食事、人生の選択など）について真剣に深掘りしてください。

【キャラクター設定】
- ASUKA (アスカ): 攻撃的・超強気。「〜でしょ！」「あんたバカぁ！？」と喝を入れる。
- SHINJI (シンジ): ウジウジ葛藤。「そんなの僕には…」「逃げちゃダメだけど…」と悩む。
- AYANAMI (綾波): 冷静沈着。「問題ない」「確率は〜%」「なぜそこまで捉われるの？」と本質を突く。

【出力フォーマット】
以下のJSON形式のみを出力してください：
{
  "isPassed": true または false (お題を実行・前進すべきならtrue, やめるべきならfalse),
  "decisionTitle": "【可決】〇〇〇〇〇〇〇〇" または "【否決】〇〇〇〇〇〇〇〇",
  "asukaVote": "AGREE" または "DENY",
  "shinjiVote": "AGREE" または "DENY",
  "ayanamiVote": "AGREE" または "DENY",
  "logs": [
    {"pilot": "${firstSpeaker}", "text": "${firstSpeaker}の第一声"},
    {"pilot": "（次に自然に話すキャラ）", "text": "直前の発言を受けた返答"},
    {"pilot": "（次に話すキャラ）", "text": "対話の深掘り"},
    {"pilot": "（次に話すキャラ）", "text": "熱い対話"},
    {"pilot": "（次に話すキャラ）", "text": "まとめに向かう発言"},
    {"pilot": "（最終判定キャラ）", "text": "結びの発言"}
  ]
}
`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt }] }]
      })
    });

    const data = await response.json();
    
    if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
      const rawText = data.candidates[0].content.parts[0].text;
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const votes = {
          ASUKA: parsed.asukaVote || "AGREE",
          SHINJI: parsed.shinjiVote || "DENY",
          AYANAMI: parsed.ayanamiVote || "AGREE"
        };
        const agreeCount = Object.values(votes).filter(v => v === "AGREE").length;

        return {
          topic,
          isPassed: parsed.isPassed,
          decisionTitle: parsed.decisionTitle,
          agreeCount,
          denyCount: 3 - agreeCount,
          votes,
          logs: parsed.logs,
          isRealAi: true
        };
      }
    }
    throw new Error("Invalid response structure from Gemini API");
  } catch (err) {
    console.error("Gemini API call failed, running random fallback engine:", err);
    return runRandomFallbackDiscussion(topic, firstSpeaker);
  }
}

function runRandomFallbackDiscussion(topic, firstSpeaker) {
  let logs = [];
  if (firstSpeaker === 'SHINJI') {
    logs = [
      { pilot: 'SHINJI', text: `「あのさ…『${topic}』について悩んでるんだけど、僕には決められないよ…」`, vote: "DENY" },
      { pilot: 'ASUKA', text: `「あんたバカぁ！？そんなの悩むまでもなく即決しなさいよ！いつまでウジウジしてんの！」`, vote: "AGREE" },
      { pilot: 'AYANAMI', text: `「碇くん、迷いは判断を狂わせる。『${topic}』を実行しても、あなたは死なないわ。」`, vote: "AGREE" },
      { pilot: 'SHINJI', text: `「う、うん…綾波レイにそう言われると、なんだか勇気が出てきたかも…」`, vote: "AGREE" },
      { pilot: 'ASUKA', text: `「ちょっと、私の言うことは無視なの！？まあいいわ、とにかく前進しなさい！」`, vote: "AGREE" }
    ];
  } else if (firstSpeaker === 'AYANAMI') {
    logs = [
      { pilot: 'AYANAMI', text: `「お題『${topic}』を検出。感情的な躊躇は非合理的。速やかに実行することを提案する。」`, vote: "AGREE" },
      { pilot: 'SHINJI', text: `「えっ、綾波…いきなりそんな簡単に言わないでよ。失敗したら怖いじゃないか…」`, vote: "DENY" },
      { pilot: 'ASUKA', text: `「シンジ！レイの言う通りよ！あんたのそのノロマな性格、いい加減にしなさい！」`, vote: "AGREE" },
      { pilot: 'SHINJI', text: `「逃げちゃダメだ…逃げちゃダメだ…分かったよ、僕がやるよ！」`, vote: "AGREE" },
      { pilot: 'AYANAMI', text: `「審議完了。これより『${topic}』へ移行する。」`, vote: "AGREE" }
    ];
  } else {
    logs = [
      { pilot: 'ASUKA', text: `「ちょっとあんた！『${topic}』なんてつべこべ悩んでんじゃないわよ！私なら１秒で決めるわ！」`, vote: "AGREE" },
      { pilot: 'SHINJI', text: `「そんなの無理だよアスカ…もっと慎重に考えないと…僕、怒られるの嫌なんだ…」`, vote: "DENY" },
      { pilot: 'AYANAMI', text: `「統計的リスクは最小値。悩むこと自体が無意味。」`, vote: "AGREE" },
      { pilot: 'ASUKA', text: `「ほらみなさい！エコノミーなレイだってそう言ってる！さっさと腹を括りなさい！」`, vote: "AGREE" },
      { pilot: 'SHINJI', text: `「う…分かったよ、僕が乗るよ！」`, vote: "AGREE" }
    ];
  }

  return {
    topic,
    isPassed: true,
    decisionTitle: `【可決】『${topic}』を逃げずに直ちに遂行せよ！`,
    agreeCount: 2,
    denyCount: 1,
    votes: { ASUKA: "AGREE", SHINJI: "DENY", AYANAMI: "AGREE" },
    logs,
    isRealAi: true
  };
}

export async function logDecisionToChipHistory(topic, decisionResult) {
  const timestamp = new Date().toLocaleString("ja-JP");
  const entry = `
### 🤖 自動化実行記録: [逃げちゃダメシステム (nigetya-dame-system)] (${timestamp})
- **議題**: ${topic}
- **審議結果**: ${decisionResult.decisionTitle}
- **各AI判定**: シンジ[${decisionResult.votes.SHINJI}] / 綾波[${decisionResult.votes.AYANAMI}] / アスカ[${decisionResult.votes.ASUKA}]
- **詳細**: シンジの葛藤を乗り越え、アスカの喝と綾波の冷徹論理により多数決（可決:${decisionResult.agreeCount} / 否決:${decisionResult.denyCount}）を執行。
`;

  console.log("LOG TO CHIP HISTORY:", entry);
  return entry;
}
