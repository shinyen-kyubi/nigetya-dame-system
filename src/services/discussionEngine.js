// シンジ・綾波・アスカの『逃げちゃダメシステム』議論エンジン (Gemini API リアルAI対応版)

export const CHIP_HISTORY_PATH = "/Users/nakayamamichiyoshi/Library/CloudStorage/GoogleDrive-gotomichi5100@gmail.com/マイドライブ/チップくんの歴史/チップくんの歴史.txt";

export const PILOTS = {
  SHINJI: {
    id: 'SHINJI-01',
    name: '碇シンジ',
    role: 'EVA-01 / 葛藤・ウジウジ・逃避願望',
    color: '#9b59b6',
  },
  AYANAMI: {
    id: 'AYANAMI-00',
    name: '綾波レイ',
    role: 'EVA-00 / 冷徹論理・指示遂行',
    color: '#3498db',
  },
  ASUKA: {
    id: 'ASUKA-02',
    name: '惣流・アスカ・ラングレー',
    role: 'EVA-02 / 超強気・プライド・喝',
    color: '#e74c3c',
  }
};

// Gemini API を呼び出して3人の対話をリアルタイム生成する関数
export async function runDiscussionWithGemini(topic, apiKey) {
  const systemPrompt = `
あなたはエヴァンゲリオンの主要パイロット3人（アスカ、シンジ、綾波）の対話シナリオを生成するAIです。
ユーザーからのお題「${topic}」に対し、3人が現実逃避を許さず激しく議論する会話をJSON形式で出力してください。

【キャラクター設定】
- アスカ: 超強気。「あんたバカぁ！？」「逃げてんじゃないわよ！」と喝を入れる。
- シンジ: ウジウジ葛藤。「そんなの無茶だよ…」「逃げちゃダメだ…」と迷いつつも最後は受け入れる。
- 綾波: 冷静沈着。「問題ない」「遂行すべき」「あなたは死なないわ」と論理的に切り捨てる。

【出力フォーマット】
以下のJSONフォーマットのみを出力してください（余計な解説は不要）：
{
  "isPassed": true または false (お題を実行・前進させるならtrue),
  "decisionTitle": "【可決】〜〜〜" または "【否決】〜〜〜",
  "asukaVote": "AGREE" または "DENY",
  "shinjiVote": "AGREE" または "DENY",
  "ayanamiVote": "AGREE" または "DENY",
  "logs": [
    {"pilot": "ASUKA", "text": "アスカの発言"},
    {"pilot": "SHINJI", "text": "シンジの発言"},
    {"pilot": "AYANAMI", "text": "綾波の発言"},
    {"pilot": "ASUKA", "text": "アスカのまとめ"},
    {"pilot": "SHINJI", "text": "シンジの決心"}
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
    const rawText = data.candidates[0].content.parts[0].text;
    // JSON文字列の抽出
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("JSON parse error from Gemini response");
    
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
  } catch (err) {
    console.error("Gemini API Error, fallback to simulation:", err);
    return runDiscussionSimulation(topic);
  }
}

// 従来の高速シミュレーションモード (フォールバック用)
export async function runDiscussionSimulation(topic) {
  const isWorkOrStudy = /仕事|会社|学校|勉強|宿題|残業|バイト|面接|レポート|タスク/.test(topic);
  const isFoodOrRest = /飯|ラーメン|カレー|休み|旅行|寝る|ディズニー|遊ぶ|酒|サボり/.test(topic);

  let asukaOpening = isWorkOrStudy 
    ? `「あんたバカぁ！？『${topic}』なんてつべこべ言わずにチャッチャと終わらせなさいよ！逃げてんじゃないわよ、グズ！」`
    : `「はぁ！？『${topic}』だぁ？自分のやりたいことも即決できないの！？私が一番に決めてあげるわ、さっさと実行しなさい！」`;

  let shinjiResponse = isWorkOrStudy
    ? `「そんなの無茶だよアスカ…『${topic}』なんて僕にできるわけないよ。失敗したらみんなに笑われるし…逃げちゃダメだけど…」`
    : `「でも…本当にいいのかな。『${topic}』なんてして後で怒られたらどうするの？僕は静かに部屋で音楽聴いてたいよ…」`;

  let ayanamiDecision = isWorkOrStudy
    ? `「問題ない。指示に従い『${topic}』を遂行すべき。感情による遅延は非合理的。あなたは死なないわ、私が守るもの。」`
    : `「欲求の解放は精神安定に寄与する。『${topic}』を実行することを推奨。碇くん、逃げる必要はない。」`;

  const votes = { ASUKA: "AGREE", SHINJI: "DENY", AYANAMI: "AGREE" };
  const agreeCount = 2;

  return {
    topic,
    isPassed: true,
    decisionTitle: `【可決】『${topic}』を逃げずに直ちに執行せよ！`,
    agreeCount,
    denyCount: 1,
    votes,
    logs: [
      { pilot: 'ASUKA', text: asukaOpening, vote: "AGREE" },
      { pilot: 'SHINJI', text: shinjiResponse, vote: "DENY" },
      { pilot: 'AYANAMI', text: ayanamiDecision, vote: "AGREE" },
      { pilot: 'ASUKA', text: `「ほら見なさい！エコノミーなレイだってそう言ってるじゃない！シンジ、あんたも覚悟を決めなさい！」`, vote: "AGREE" },
      { pilot: 'SHINJI', text: `「う、うん…分かったよ。僕がやるよ…僕が乗ります！」`, vote: "AGREE" }
    ],
    isRealAi: false
  };
}

export async function runDiscussion(topic, apiKey = '') {
  if (apiKey && apiKey.trim().length > 10) {
    return await runDiscussionWithGemini(topic, apiKey.trim());
  } else {
    return await runDiscussionSimulation(topic);
  }
}

export async function logDecisionToChipHistory(topic, decisionResult) {
  const timestamp = new Date().toLocaleString("ja-JP");
  const aiType = decisionResult.isRealAi ? "Gemini 1.5 Real AI Engine" : "Simulation Engine";
  const entry = `
### 🤖 自動化実行記録: [逃げちゃダメシステム (nigetya-dame-system)] (${timestamp})
- **議題**: ${topic}
- **使用エンジン**: ${aiType}
- **審議結果**: ${decisionResult.decisionTitle}
- **各AI判定**: シンジ[${decisionResult.votes.SHINJI}] / 綾波[${decisionResult.votes.AYANAMI}] / アスカ[${decisionResult.votes.ASUKA}]
- **詳細**: シンジの葛藤を乗り越え、アスカの喝と綾波の冷徹論理により多数決（可決:${decisionResult.agreeCount} / 否決:${decisionResult.denyCount}）を執行。
`;

  console.log("LOG TO CHIP HISTORY:", entry);
  return entry;
}
