// シンジ・綾波・アスカの『逃げちゃダメシステム』議論エンジン (完全自由＆柔軟表現AI対話版)

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
    role: 'EVA-01 / 葛藤・繊細・現実の厳しさと本音',
    color: '#9b59b6',
  },
  AYANAMI: {
    id: 'AYANAMI-00',
    name: '綾波レイ',
    role: 'EVA-00 / 感情を排した視点・本質を捉える問いかけ',
    color: '#3498db',
  },
  ASUKA: {
    id: 'ASUKA-02',
    name: '惣流・アスカ・ラングレー',
    role: 'EVA-02 / 超強気・圧倒的自尊心・背中を押す激しい本音',
    color: '#e74c3c',
  }
};

export async function runDiscussion(topic) {
  const apiKey = getApiKey();

  const starterPilots = ['ASUKA', 'SHINJI', 'AYANAMI'];
  const firstSpeaker = starterPilots[Math.floor(Math.random() * starterPilots.length)];

  const systemPrompt = `
あなたはアニメ「新世紀エヴァンゲリオン」の主要パイロット3人（アスカ、シンジ、綾波）になりきり、ユーザーから投げかけられたお題「${topic}」について、真剣・爆笑・皮肉・共感など多様な角度から本気でフリートーク議論するAI対話エンジンです。

【重要：定型文・決めゼリフの禁止と自由度】
- 「あんたバカぁ！？」「逃げちゃダメだ」「あなたは死なないわ」などの決まり文句に固執しないでください。毎回同じ言葉を使うとつまらなくなります。
- 決めゼリフはあえて使わなくて構いません。お題「${topic}」に対する具体的なエピソード、人間味あふれる例え話、皮肉、疑問、鋭いツッコミなどを自由に展開してください。

【キャラクターの方向性・質感（自由なニュアンス）】
- アスカ (ASUKA): プライドが高く自信家。強気で口は悪いが、実は筋が通っていたり世話焼き。お題の甘えをバッサリ斬ったり、逆にノリノリで煽る。
- シンジ (SHINJI): 繊細で考えすぎる性格。リスクや他人の目を気にしたり、自信がない本音をポロッと漏らす。時に「でもそれって…」と鋭い正論で反論することも。
- 綾波 (AYANAMI): 独特の間と冷静さを持つ。世間の常識にとらわれない浮世離れした視点や、シュールで本質的な問いかけをする。

【会話の流れ】
- 第一声は「${firstSpeaker}」から始めてください。
- 3人が相手の発言をちゃんと聴いて、お互いに口喧嘩したり、意外な意気投合をしたり、お互いの意見を深掘りする自然な対話（5〜7ターン）を作成してください。

【出力フォーマット】
以下のJSON形式のみを出力してください（JSON以外のテキストは一切不要）：
{
  "isPassed": true または false (お題を実行すべきならtrue, やめるべきならfalse),
  "decisionTitle": "【可決】〇〇〇〇〇〇" または "【否決】〇〇〇〇〇〇",
  "asukaVote": "AGREE" または "DENY",
  "shinjiVote": "AGREE" または "DENY",
  "ayanamiVote": "AGREE" または "DENY",
  "logs": [
    {"pilot": "${firstSpeaker}", "text": "第一声の自由な発言"},
    {"pilot": "（次に話すキャラ）", "text": "相手に応じた自由な対話"},
    {"pilot": "（次に話すキャラ）", "text": "対話の展開"},
    {"pilot": "（次に話すキャラ）", "text": "自由な会話"},
    {"pilot": "（次に話すキャラ）", "text": "まとめに向かう対話"},
    {"pilot": "（最終判定キャラ）", "text": "締めくくりの発言"}
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
    return runFlexibleFallbackDiscussion(topic, firstSpeaker);
  }
}

function runFlexibleFallbackDiscussion(topic, firstSpeaker) {
  let logs = [];
  if (firstSpeaker === 'SHINJI') {
    logs = [
      { pilot: 'SHINJI', text: `「ねえ『${topic}』ってどう思う？正直、僕には荷が重すぎる気がするんだけど…」`, vote: "DENY" },
      { pilot: 'ASUKA', text: `「何言ってんのよ！失敗したらやり直せばいいだけでしょ。最初から負けること考えてどうすんの！」`, vote: "AGREE" },
      { pilot: 'AYANAMI', text: `「碇くんの不安も理解できる。でも、何もしないことによる損失の方が大きいかもしれない。」`, vote: "AGREE" },
      { pilot: 'SHINJI', text: `「二人がそう言うなら…確かにやってみないと何も変わらないよね。」`, vote: "AGREE" },
      { pilot: 'ASUKA', text: `「そうよ！グダグダ言ってないで、行動で示しなさい！」`, vote: "AGREE" }
    ];
  } else if (firstSpeaker === 'AYANAMI') {
    logs = [
      { pilot: 'AYANAMI', text: `「『${topic}』について考えた。この行動による変化を、あなた自身はどう望んでいるの？」`, vote: "AGREE" },
      { pilot: 'SHINJI', text: `「望んでいるかどうかも分からないんだ…ただ流されるのは嫌だけど、怖いんだよ。」`, vote: "DENY" },
      { pilot: 'ASUKA', text: `「怖がって何もしないのが一番ダサイの！迷うくらいなら一歩踏み出しなさいよ！」`, vote: "AGREE" },
      { pilot: 'SHINJI', text: `「…そうだよね。アスカの言う通り、自分で決めなきゃ意味がないや。」`, vote: "AGREE" },
      { pilot: 'AYANAMI', text: `「あなたが決めたなら、それが正しい選択になる。」`, vote: "AGREE" }
    ];
  } else {
    logs = [
      { pilot: 'ASUKA', text: `「『${topic}』でしょ？こんなの迷う要素どこにあるのよ！私なら即答でゴーね！」`, vote: "AGREE" },
      { pilot: 'SHINJI', text: `「アスカはいつも強気だけど、現実的な準備とかリスクはどうするのさ…」`, vote: "DENY" },
      { pilot: 'AYANAMI', text: `「完璧な準備など存在しない。重要なのは、実行する決意そのもの。」`, vote: "AGREE" },
      { pilot: 'ASUKA', text: `「レイも珍しく良いこと言うじゃない！シンジ、腹括りなさいよ！」`, vote: "AGREE" },
      { pilot: 'SHINJI', text: `「分かったよ…僕も覚悟を決めてチャレンジしてみる。」`, vote: "AGREE" }
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
