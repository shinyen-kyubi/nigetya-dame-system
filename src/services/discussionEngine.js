// シンジ・綾波・アスカの『逃げちゃダメシステム』議論エンジン

// チップくんの歴史.txt の保存先パス
export const CHIP_HISTORY_PATH = "/Users/nakayamamichiyoshi/Library/CloudStorage/GoogleDrive-gotomichi5100@gmail.com/マイドライブ/チップくんの歴史/チップくんの歴史.txt";

export const PILOTS = {
  SHINJI: {
    id: 'SHINJI-01',
    name: '碇シンジ',
    role: 'EVA-01 / 葛藤・ウジウジ・逃避願望',
    color: '#9b59b6', // パープル
    subColor: '#8e44ad',
  },
  AYANAMI: {
    id: 'AYANAMI-00',
    name: '綾波レイ',
    role: 'EVA-00 / 冷徹論理・命じられれば実行',
    color: '#3498db', // ブルー
    subColor: '#2980b9',
  },
  ASUKA: {
    id: 'ASUKA-02',
    name: '惣流・アスカ・ラングレー',
    role: 'EVA-02 / 超強気・プライド・喝',
    color: '#e74c3c', // レッド
    subColor: '#c0392b',
  }
};

// お題に応じたキャラクター対話生成ロジック
export async function runDiscussion(topic) {
  // 審議ステップ
  const steps = [];

  // トピックのキーワード分析（ポジティブ／ネガティブ／逃避感）
  const isWorkOrStudy = /仕事|会社|学校|勉強|宿題|残業|バイト|面接|レポート|タスク/.test(topic);
  const isFoodOrRest = /飯|ラーメン|カレー|休み|旅行|寝る|ディズニー|遊ぶ|酒|サボり/.test(topic);

  // 1. アスカの強烈な第一声 (喝)
  let asukaOpening = "";
  let asukaVote = "AGREE";
  if (isWorkOrStudy) {
    asukaOpening = `「あんたバカぁ！？『${topic}』なんてつべこべ言わずにチャッチャと終わらせなさいよ！逃げてんじゃないわよ、グズ！」`;
    asukaVote = "AGREE";
  } else if (isFoodOrRest) {
    asukaOpening = `「はぁ！？『${topic}』だぁ？自分のやりたいことも即決できないの！？私が一番に決めてあげるわ、さっさと実行しなさい！」`;
    asukaVote = "AGREE";
  } else {
    asukaOpening = `「ちょっとあんた！『${topic}』なんてウジウジ悩むほどの価値もないわよ！やるなら全力でやりなさいよ！」`;
    asukaVote = "AGREE";
  }

  // 2. シンジのウジウジ反論 (葛藤)
  let shinjiResponse = "";
  let shinjiVote = "DENY";
  if (isWorkOrStudy) {
    shinjiResponse = `「そんなの無茶だよアスカ…『${topic}』なんて僕にできるわけないよ。失敗したらみんなに笑われるし、怒られるのはもう嫌なんだ…逃げちゃダメだけど…」`;
    shinjiVote = "DENY";
  } else if (isFoodOrRest) {
    shinjiResponse = `「でも…本当にいいのかな。『${topic}』なんてして、後でしっぺ返しが来たらどうするの？僕は静かに部屋で音楽聴いてたいよ…」`;
    shinjiVote = "DENY";
  } else {
    shinjiResponse = `「無理だよ…父さんだって僕のこと認めてくれないのに、そんなことしたって誰も喜ばないよ…逃げちゃダメだ…逃げちゃダメだ…」`;
    shinjiVote = "DENY";
  }

  // 3. 綾波の冷静な切り捨て (決定打)
  let ayanamiDecision = "";
  let ayanamiVote = "AGREE";
  if (isWorkOrStudy) {
    ayanamiDecision = `「問題ない。指示に従い『${topic}』を遂行すべき。感情による遅延は非合理的。あなたは死なないわ、私が守るもの。」`;
    ayanamiVote = "AGREE";
  } else if (isFoodOrRest) {
    ayanamiDecision = `「欲求の解放は精神安定に寄与する。『${topic}』を実行することを推奨。碇くん、逃げる必要はない。」`;
    ayanamiVote = "AGREE";
  } else {
    ayanamiDecision = `「私は人形じゃない。でも、この問いに対する答えは一つ。『${topic}』を行うのが最善。」`;
    ayanamiVote = "AGREE";
  }

  // 4. アスカのトドメ
  const asukaCloser = `「ほら見なさい！エコノミーなレイだってそう言ってるじゃない！シンジ、あんたもウジウジ言ってないで覚悟を決めなさい！」`;

  // 5. シンジの覚悟
  const shinjiCloser = `「う、うん…分かったよ。僕がやるよ…僕が乗ります！」`;

  const votes = {
    ASUKA: asukaVote,
    SHINJI: shinjiVote,
    AYANAMI: ayanamiVote
  };

  // 多数決判定 (2:1 or 3:0 で可決、1:2 or 0:3 で否決)
  const agreeCount = Object.values(votes).filter(v => v === "AGREE").length;
  const isPassed = agreeCount >= 2;

  const decisionTitle = isPassed 
    ? `【可決】『${topic}』を逃げずに直ちに執行せよ！` 
    : `【否決】『${topic}』は却下！別の現実に向き合え！`;

  const logs = [
    { pilot: 'ASUKA', text: asukaOpening, vote: asukaVote, delay: 600 },
    { pilot: 'SHINJI', text: shinjiResponse, vote: shinjiVote, delay: 1800 },
    { pilot: 'AYANAMI', text: ayanamiDecision, vote: ayanamiVote, delay: 3000 },
    { pilot: 'ASUKA', text: asukaCloser, vote: asukaVote, delay: 4200 },
    { pilot: 'SHINJI', text: shinjiCloser, vote: "AGREE", delay: 5400 } // 最終的に折れる
  ];

  return {
    topic,
    isPassed,
    decisionTitle,
    agreeCount,
    denyCount: 3 - agreeCount,
    votes,
    logs
  };
}

// チップくんの歴史.txt へ合議録をログ追記する関数
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
