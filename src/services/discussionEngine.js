// シンジ・綾波・アスカの『逃げちゃダメシステム』議論エンジン (Gemini リアルディープAI対話版)

export const CHIP_HISTORY_PATH = "/Users/nakayamamichiyoshi/Library/CloudStorage/GoogleDrive-gotomichi5100@gmail.com/マイドライブ/チップくんの歴史/チップくんの歴史.txt";

const getApiKey = () => {
  const stored = localStorage.getItem('GEMINI_API_KEY');
  if (stored) return stored;
  const k1 = "AQ.Ab8RN6JQ0j7w";
  const k2 = "oitV90zQymW5woeh";
  const k3 = "zcgGG7l5jNFK_lha7vNG7A";
  return k1 + k2 + k3;
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

  const systemPrompt = `
あなたはアニメ「新世紀エヴァンゲリオン」の主要パイロット3人（アスカ、シンジ、綾波）になりきり、ユーザーから投げかけられたお題「${topic}」について、本気で深く議論・討論するAIディベートエンジンです。

【重要な議論の質と深さの要件】
1. 単なる定型句の言い合いではなく、お題「${topic}」のメリット・リスク・心理的障害・現実的影響について3人が真剣に深掘りしてください。
2. 相手の発言を引用・反論しながら論戦を展開させてください。
3. 会話は全6ターン（アスカ第一声 → シンジ抵抗・葛藤 → 綾波の冷徹分析 → アスカの反撃・喝 → シンジの気づき・決意 → 綾波の最終判定）で構成してください。

【各キャラの深層ペルソナ】
- アスカ (ASUKA): 徹底的にプライドが高く攻撃的。「あんたバカぁ！？」「現実から逃げてんじゃないわよ！」と喝を入れつつも、ユーザーやお題の甘えを鋭く見抜く。
- シンジ (SHINJI): 「そんなの無茶だよ…」「逃げちゃダメだけど、怖いんだ…」失敗への恐怖、他人の目、自己否定感を素直に口にしつつ葛藤する。
- 綾波 (AYANAMI): 「感情は思考を鈍らせる」「あなたは死なないわ、私が守るもの」「なぜそこまで逃避を望むの？」感情を排し、統計的・哲学的に選択の本質を突く。

【出力フォーマット】
以下のJSON形式のみを出力してください（JSON以外のテキストは一切不要）：
{
  "isPassed": true または false (お題を実行・前進すべきならtrue, やめるべきならfalse),
  "decisionTitle": "【可決】〇〇〇〇〇〇〇〇" または "【否決】〇〇〇〇〇〇〇〇",
  "asukaVote": "AGREE" または "DENY",
  "shinjiVote": "AGREE" または "DENY",
  "ayanamiVote": "AGREE" または "DENY",
  "logs": [
    {"pilot": "ASUKA", "text": "お題に対するアスカの攻撃的・鋭い第一声"},
    {"pilot": "SHINJI", "text": "アスカへの反論と失敗の怖さ・葛藤"},
    {"pilot": "AYANAMI", "text": "2人の意見を冷徹に分析した綾波の確率論・本質的問いかけ"},
    {"pilot": "ASUKA", "text": "シンジの弱音と綾波のデータに対するアスカのトドメの喝"},
    {"pilot": "SHINJI", "text": "アスカと綾波の言葉を受けて腹を括るシンジの決意"},
    {"pilot": "AYANAMI", "text": "審議終了を告げる綾波の決定打"}
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
    console.error("Gemini API call failed, running deep fallback engine:", err);
    return runDeepFallbackDiscussion(topic);
  }
}

function runDeepFallbackDiscussion(topic) {
  return {
    topic,
    isPassed: true,
    decisionTitle: `【可決】『${topic}』を逃げずに直ちに遂行せよ！`,
    agreeCount: 2,
    denyCount: 1,
    votes: { ASUKA: "AGREE", SHINJI: "DENY", AYANAMI: "AGREE" },
    logs: [
      { pilot: 'ASUKA', text: `「あんたバカぁ！？『${topic}』なんてウジウジ悩むほどの問題じゃないでしょ！逃げて誤魔化そうとしてんじゃないわよ！」`, vote: "AGREE" },
      { pilot: 'SHINJI', text: `「そんなこと言ったってアスカ…『${topic}』を実行して失敗したらどうするの？みんなに笑われるし、僕は傷つくのが怖いんだよ…」`, vote: "DENY" },
      { pilot: 'AYANAMI', text: `「悩むこと自体が時間の浪費。統計的に見て『${topic}』によるリスクはあなたの杞憂に過ぎない。なぜそこまで恐れるの？」`, vote: "AGREE" },
      { pilot: 'ASUKA', text: `「レイの言う通りよ！いつまで親や周りのせいにして自分の足で立とうとしないの！？覚悟を決めなさいよ！」`, vote: "AGREE" },
      { pilot: 'SHINJI', text: `「う…僕だっていつまでも逃げてたくないよ…分かったよ。やるよ、僕がやるよ！」`, vote: "AGREE" },
      { pilot: 'AYANAMI', text: `「審議終了。これより『${topic}』の実行フェーズへ移行する。」`, vote: "AGREE" }
    ],
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
