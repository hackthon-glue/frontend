export type SentimentPoint = {
  date: string;
  score: number;
};

export type WeatherPoint = {
  date: string;
  temperature: number;
};

export type NewsTone = "optimistic" | "cautious" | "urgent" | "celebratory";

export type NewsItem = {
  title: string;
  summary: string;
  url: string;
  category: string;
  tone: NewsTone;
};

export type InsightStat = {
  label: string;
  value: string;
  change: string;
  sentiment: "positive" | "neutral" | "negative";
};

export type WeatherDetail = {
  condition: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  wind: string;
  precipitationChance: number;
};

export type AlertLevel = "info" | "watch" | "warning";

export type Alert = {
  type: string;
  level: AlertLevel;
  message: string;
  recommendedAction: string;
};

export type CountryMock = {
  code: string;
  name: string;
  lat: number;
  lng: number;
  summary: {
    headline: string;
    weather: string;
    persona: string;
  };
  insights: {
    sentiment: SentimentPoint[];
    weatherTrend: WeatherPoint[];
    news: NewsItem[];
    stats: InsightStat[];
    weatherNow: WeatherDetail;
    alerts: Alert[];
    moodNarrative: string;
    todaySummary: string;
  };
};

const toTrend = (value: number) => (value > 0 ? `+${value}` : `${value}`);

export type CompositeMood = {
  score: number; // 0-100
  band: 'sad' | 'neutral' | 'happy';
};

export const computeCompositeMood = (country: CountryMock): CompositeMood => {
  // Base: average sentiment
  const sentiments = country.insights.sentiment;
  const avgSent = sentiments.length
    ? sentiments.reduce((a, b) => a + b.score, 0) / sentiments.length
    : 50;

  // Weather comfort: optimal 12–26°C, penalize outside
  const t = country.insights.weatherNow.temperature;
  const distance = t < 12 ? 12 - t : t > 26 ? t - 26 : 0;
  const comfort = Math.max(0, 100 - distance * 6); // ~6 pts per °C outside band

  // Alerts penalty
  const penalty = country.insights.alerts.reduce((acc, a) => {
    if (a.level === 'warning') return acc + 20;
    if (a.level === 'watch') return acc + 10;
    return acc + 5; // info
  }, 0);
  const alertScore = Math.max(0, 100 - Math.min(60, penalty));

  const raw = 0.7 * avgSent + 0.2 * comfort + 0.1 * alertScore;
  const score = Math.max(0, Math.min(100, Math.round(raw)));

  let band: CompositeMood['band'];
  if (score <= 30) band = 'sad';
  else if (score <= 70) band = 'neutral';
  else band = 'happy';

  return { score, band };
};

const dayKeyFromDate = (d: Date): string => {
  const keys = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return keys[d.getDay()];
};

const clampDays = (n: number) => Math.max(0, Math.min(30, n));

export const computeCompositeMoodAt = (
  country: CountryMock,
  at: Date
): CompositeMood => {
  // Sentiment: weight current day within last week more heavily
  const sentiments = country.insights.sentiment;
  const avgSent = sentiments.length
    ? sentiments.reduce((a, b) => a + b.score, 0) / sentiments.length
    : 50;

  // Assume insights.sentiment[6] (Day 7) ~ today; roll back by days delta within 0-30
  const today = new Date();
  const msPerDay = 24 * 60 * 60 * 1000;
  const diffDays = clampDays(Math.floor((today.setHours(0, 0, 0, 0) as unknown as number) / 1 - (new Date(at).setHours(0, 0, 0, 0) as unknown as number) / 1) / (msPerDay as unknown as number));
  const idx = sentiments.length
    ? (sentiments.length - 1 - (diffDays % sentiments.length) + sentiments.length) % sentiments.length
    : 0;
  const currentSent = sentiments[idx]?.score ?? avgSent;
  const weightedSent = 0.7 * currentSent + 0.3 * avgSent;

  // Weather by weekday
  const key = dayKeyFromDate(at);
  const wt = country.insights.weatherTrend.find((w) => w.date.startsWith(key));
  const temp = wt?.temperature ?? country.insights.weatherNow.temperature;
  const distance = temp < 12 ? 12 - temp : temp > 26 ? temp - 26 : 0;
  const comfort = Math.max(0, 100 - distance * 6);

  // Alerts: same penalty model as current
  const penalty = country.insights.alerts.reduce((acc, a) => {
    if (a.level === 'warning') return acc + 20;
    if (a.level === 'watch') return acc + 10;
    return acc + 5;
  }, 0);
  const alertScore = Math.max(0, 100 - Math.min(60, penalty));

  const raw = 0.7 * weightedSent + 0.2 * comfort + 0.1 * alertScore;
  const score = Math.max(0, Math.min(100, Math.round(raw)));

  let band: CompositeMood['band'];
  if (score <= 30) band = 'sad';
  else if (score <= 70) band = 'neutral';
  else band = 'happy';

  return { score, band };
};

export const countries: CountryMock[] = [
  {
    code: "jp",
    name: "Japan",
    lat: 36.2048,
    lng: 138.2529,
    summary: {
      headline: "AI協業報道でテック業界が活況",
      weather: "東京: 18°C、今夜は小雨予想",
      persona: "落ち着きつつ集中し、世界とイノベーションを模索"
    },
    insights: {
      sentiment: [
        { date: "Day 1", score: 62 },
        { date: "Day 2", score: 65 },
        { date: "Day 3", score: 59 },
        { date: "Day 4", score: 68 },
        { date: "Day 5", score: 71 },
        { date: "Day 6", score: 74 },
        { date: "Day 7", score: 69 }
      ],
      weatherTrend: [
        { date: "Mon", temperature: 19 },
        { date: "Tue", temperature: 21 },
        { date: "Wed", temperature: 18 },
        { date: "Thu", temperature: 17 },
        { date: "Fri", temperature: 20 },
        { date: "Sat", temperature: 22 },
        { date: "Sun", temperature: 23 }
      ],
      news: [
        {
          title: "東京でロボティクス博開幕",
          summary: "災害支援や介護を想定した協働型ヒューマノイドが来場者の関心を集めた。",
          url: "https://example.com/jp-robotics",
          category: "イノベーション",
          tone: "celebratory"
        },
        {
          title: "スマートエネルギー地区が本格運用",
          summary: "ピーク電力を17%削減する予測制御が都内2地区で常時稼働に移行。",
          url: "https://example.com/jp-energy",
          category: "エネルギー",
          tone: "optimistic"
        },
        {
          title: "京都の量子研究が気候モデル加速へ",
          summary: "高精度の誤り訂正回路が確認され、環境シミュレーション活用が期待される。",
          url: "https://example.com/jp-quantum",
          category: "研究",
          tone: "optimistic"
        }
      ],
      stats: [
        {
          label: "ムード変化率",
          value: "↑8pt",
          change: toTrend(8),
          sentiment: "positive"
        },
        {
          label: "ヘッドライン感情",
          value: "ポジティブ",
          change: "AI期待感",
          sentiment: "positive"
        },
        {
          label: "体感気候",
          value: "穏やかで小雨",
          change: "やや気温低下",
          sentiment: "neutral"
        }
      ],
      weatherNow: {
        condition: "小雨と時折の晴れ間",
        temperature: 18,
        feelsLike: 17,
        humidity: 64,
        wind: "北東 9 km/h",
        precipitationChance: 48
      },
      alerts: [
        {
          type: "交通",
          level: "info",
          message: "山手線は夜間保守で軽微な遅延が見込まれます。",
          recommendedAction: "移動時間に10分の余裕を。"
        },
        {
          type: "天候",
          level: "watch",
          message: "関東では深夜にかけてにわか雨が強まる可能性。",
          recommendedAction: "屋外機材は早めに片付けを。"
        }
      ],
      moodNarrative:
        "ロボティクスと量子技術の進展が話題を独占し、雨模様でも都市全体に静かな前向きさが広がった一日。",
      todaySummary:
        "Evening showers kept umbrellas open across Tokyo, yet the robotics expo still drew long queues of students and investors. Quantum labs announced fresh climate-modeling breakthroughs, prompting manufacturers from Nagoya to book follow-up visits. Neighborhood chatter framed the weather as a gentle backdrop to a calmly optimistic day of collaboration."
    }
  },
  {
    code: "us",
    name: "United States",
    lat: 37.0902,
    lng: -95.7129,
    summary: {
      headline: "サステナ企業が過去最高の資金調達",
      weather: "ニューヨーク: 11°C、ひんやり快晴",
      persona: "大胆なサプライチェーン変革を語るエネルギッシュな姿勢"
    },
    insights: {
      sentiment: [
        { date: "Day 1", score: 48 },
        { date: "Day 2", score: 52 },
        { date: "Day 3", score: 57 },
        { date: "Day 4", score: 60 },
        { date: "Day 5", score: 63 },
        { date: "Day 6", score: 65 },
        { date: "Day 7", score: 67 }
      ],
      weatherTrend: [
        { date: "Mon", temperature: 8 },
        { date: "Tue", temperature: 6 },
        { date: "Wed", temperature: 9 },
        { date: "Thu", temperature: 10 },
        { date: "Fri", temperature: 12 },
        { date: "Sat", temperature: 13 },
        { date: "Sun", temperature: 11 }
      ],
      news: [
        {
          title: "住宅用蓄電の導入が第1四半期で倍増",
          summary: "カリフォルニアとテキサスで電力会社の共同出資プログラムが拡大。",
          url: "https://example.com/us-solar",
          category: "エネルギー",
          tone: "optimistic"
        },
        {
          title: "西海岸港湾で水素回廊の実証",
          summary: "ロサンゼルスとシアトルを結ぶ長距離輸送で水素補給網をテスト。",
          url: "https://example.com/us-hydrogen",
          category: "インフラ",
          tone: "cautious"
        },
        {
          title: "中西部で建物改修が雇用を創出",
          summary: "断熱・省エネ改修により25,000人のグリーンジョブが新設。",
          url: "https://example.com/us-retrofit",
          category: "雇用",
          tone: "celebratory"
        }
      ],
      stats: [
        {
          label: "ムード変化率",
          value: "↑19pt",
          change: toTrend(19),
          sentiment: "positive"
        },
        {
          label: "ヘッドライン感情",
          value: "建設的",
          change: "資金流入",
          sentiment: "positive"
        },
        {
          label: "体感気候",
          value: "ひんやり快適",
          change: "徐々に暖かく",
          sentiment: "positive"
        }
      ],
      weatherNow: {
        condition: "快晴で涼しい風",
        temperature: 11,
        feelsLike: 9,
        humidity: 40,
        wind: "北西 12 km/h",
        precipitationChance: 5
      },
      alerts: [
        {
          type: "大気質",
          level: "info",
          message: "北東部のAQIは交通量減で中程度を維持。",
          recommendedAction: "屋外アクティビティを推奨。"
        }
      ],
      moodNarrative:
        "明るい青空のもと、グリーン投資のニュースが全国の自信と活動量を押し上げた。",
      todaySummary:
        "Coast-to-coast sunshine set the stage for record clean-tech funding announcements, and livestreamed demo days pulled in peak audiences from venture hubs. Utilities in California and Texas expanded rooftop storage incentives while Midwest retrofit crews reported steady hiring gains. Conversations framed the day as quietly bullish, energized by crisp air and clear policy signals."
    }
  },
  {
    code: "fr",
    name: "France",
    lat: 46.2276,
    lng: 2.2137,
    summary: {
      headline: "パリ気候フォーラムが包摂的炭素政策を討議",
      weather: "パリ: 15°C、厚い雲と穏やかな風",
      persona: "エスプレッソを片手に協調を促すビジョナリー"
    },
    insights: {
      sentiment: [
        { date: "Day 1", score: 55 },
        { date: "Day 2", score: 58 },
        { date: "Day 3", score: 54 },
        { date: "Day 4", score: 56 },
        { date: "Day 5", score: 60 },
        { date: "Day 6", score: 63 },
        { date: "Day 7", score: 61 }
      ],
      weatherTrend: [
        { date: "Mon", temperature: 13 },
        { date: "Tue", temperature: 12 },
        { date: "Wed", temperature: 11 },
        { date: "Thu", temperature: 12 },
        { date: "Fri", temperature: 14 },
        { date: "Sat", temperature: 15 },
        { date: "Sun", temperature: 16 }
      ],
      news: [
        {
          title: "パリ屋上で水耕農園が拡大",
          summary: "市内学校向け野菜の30%を地産地消で賄う計画が始動。",
          url: "https://example.com/fr-hydroponics",
          category: "食料システム",
          tone: "optimistic"
        },
        {
          title: "大西洋風力回廊が試験段階へ",
          summary: "浮体式タービンが安定的な基幹電源化に向けたテストを実施。",
          url: "https://example.com/fr-wind",
          category: "エネルギー",
          tone: "cautious"
        },
        {
          title: "AI主導の交通サービスを地方で展開",
          summary: "地方都市が需要応答型のEVシャトル導入を加速。",
          url: "https://example.com/fr-mobility",
          category: "モビリティ",
          tone: "optimistic"
        }
      ],
      stats: [
        {
          label: "ムード変化率",
          value: "↑8pt",
          change: toTrend(8),
          sentiment: "positive"
        },
        {
          label: "ヘッドライン感情",
          value: "思慮深い",
          change: "合意形成",
          sentiment: "neutral"
        },
        {
          label: "体感気候",
          value: "ひんやり穏やか",
          change: "緩やかな昇温",
          sentiment: "neutral"
        }
      ],
      weatherNow: {
        condition: "厚い雲と穏やかな風",
        temperature: 15,
        feelsLike: 14,
        humidity: 58,
        wind: "南西 7 km/h",
        precipitationChance: 18
      },
      alerts: [
        {
          type: "河川水位",
          level: "watch",
          message: "上流の降雨でセーヌ川が今夜12cm上昇予測。",
          recommendedAction: "低地の倉庫は状況確認を。"
        }
      ],
      moodNarrative:
        "曇天の下でも対話が進み、現実的な協調策を模索する落ち着いた空気が漂った。",
      todaySummary:
        "Policy delegates and community advocates shared a long afternoon of carbon-pricing negotiations, while cafés along the Seine closed early to watch river levels. Mobility founders in Lyon and Toulouse highlighted pilot wins that now attract regional partners. The day felt steady and deliberate, with every conversation circling back to inclusive climate planning."
    }
  },
  {
    code: "br",
    name: "Brazil",
    lat: -14.235,
    lng: -51.9253,
    summary: {
      headline: "アマゾン再生プロジェクトが四半期目標を達成",
      weather: "マナウス: 28°C、湿度高く局地的な雷雨",
      persona: "生物多様性を笑顔で守ろうと奔走する情熱家"
    },
    insights: {
      sentiment: [
        { date: "Day 1", score: 42 },
        { date: "Day 2", score: 45 },
        { date: "Day 3", score: 47 },
        { date: "Day 4", score: 51 },
        { date: "Day 5", score: 55 },
        { date: "Day 6", score: 58 },
        { date: "Day 7", score: 61 }
      ],
      weatherTrend: [
        { date: "Mon", temperature: 30 },
        { date: "Tue", temperature: 31 },
        { date: "Wed", temperature: 29 },
        { date: "Thu", temperature: 28 },
        { date: "Fri", temperature: 27 },
        { date: "Sat", temperature: 29 },
        { date: "Sun", temperature: 31 }
      ],
      news: [
        {
          title: "地域主導の再植林が節目を突破",
          summary: "衛星データでパイロット区域の樹冠が15%回復したと確認。",
          url: "https://example.com/br-reforest",
          category: "森林",
          tone: "celebratory"
        },
        {
          title: "アグロフォレストリー輸出にプレミアム価格",
          summary: "炭素ポジティブ作物がEUとの新たな貿易協定を獲得。",
          url: "https://example.com/br-agroforestry",
          category: "貿易",
          tone: "optimistic"
        },
        {
          title: "違法伐採をAIドローンで抑止",
          summary: "疑わしい動きを数分以内に通報する監視システムが実装。",
          url: "https://example.com/br-monitoring",
          category: "テクノロジー",
          tone: "urgent"
        }
      ],
      stats: [
        {
          label: "ムード変化率",
          value: "↑19pt",
          change: toTrend(19),
          sentiment: "positive"
        },
        {
          label: "ヘッドライン感情",
          value: "希望的",
          change: "森林回復",
          sentiment: "positive"
        },
        {
          label: "体感気候",
          value: "蒸し暑く雷雨",
          change: "高温が緩和",
          sentiment: "neutral"
        }
      ],
      weatherNow: {
        condition: "高湿度で夕方にスコール",
        temperature: 28,
        feelsLike: 32,
        humidity: 82,
        wind: "北 14 km/h",
        precipitationChance: 62
      },
      alerts: [
        {
          type: "洪水",
          level: "watch",
          message: "今夜は支流の水位上昇に注意。",
          recommendedAction: "コミュニティの避難計画を再確認。"
        },
        {
          type: "暑さ",
          level: "info",
          message: "高湿度が週半ばまで継続見込み。",
          recommendedAction: "フィールドチームはこまめな水分補給を。"
        }
      ],
      moodNarrative:
        "再植林の成果が活力を生み、湿度の高さの中でも警戒と連携が強まった。",
      todaySummary:
        "Restoration crews spent the morning mapping new canopy targets with community notebooks while afternoon squalls tested flood alert channels. Barge logistics stayed on schedule, and an agroforestry export ceremony in Belém drew twice last year’s young farmers. The humid air felt heavy, yet collaboration and measurable wins kept morale energized."
    }
  },
  {
    code: "au",
    name: "Australia",
    lat: -25.2744,
    lng: 133.7751,
    summary: {
      headline: "大規模蓄電池が再エネ供給を安定化",
      weather: "シドニー: 24°C、視界良好の海風",
      persona: "波のように柔軟なデータ思考で次の一手を探る"
    },
    insights: {
      sentiment: [
        { date: "Day 1", score: 58 },
        { date: "Day 2", score: 61 },
        { date: "Day 3", score: 63 },
        { date: "Day 4", score: 66 },
        { date: "Day 5", score: 65 },
        { date: "Day 6", score: 67 },
        { date: "Day 7", score: 70 }
      ],
      weatherTrend: [
        { date: "Mon", temperature: 25 },
        { date: "Tue", temperature: 26 },
        { date: "Wed", temperature: 27 },
        { date: "Thu", temperature: 25 },
        { date: "Fri", temperature: 24 },
        { date: "Sat", temperature: 23 },
        { date: "Sun", temperature: 22 }
      ],
      news: [
        {
          title: "アウトバックの太陽光が都市部に余剰供給",
          summary: "長距離HVDCラインで沿岸部の需要に数ギガワットを送電。",
          url: "https://example.com/au-solar",
          category: "エネルギー",
          tone: "celebratory"
        },
        {
          title: "海洋保護区でAIリーフ監視を展開",
          summary: "自律型グライダーがサンゴの健康データを公開共有。",
          url: "https://example.com/au-reef",
          category: "海洋",
          tone: "optimistic"
        },
        {
          title: "循環型鉱業イニシアチブが廃棄物削減",
          summary: "リチウム採掘で水使用の70%をリサイクルする工程を導入。",
          url: "https://example.com/au-mining",
          category: "資源",
          tone: "optimistic"
        }
      ],
      stats: [
        {
          label: "ムード変化率",
          value: "↑12pt",
          change: toTrend(12),
          sentiment: "positive"
        },
        {
          label: "ヘッドライン感情",
          value: "軽快",
          change: "蓄電池の成功",
          sentiment: "positive"
        },
        {
          label: "体感気候",
          value: "沿岸のそよ風",
          change: "週末は涼しく",
          sentiment: "positive"
        }
      ],
      weatherNow: {
        condition: "晴天で涼しい海風",
        temperature: 24,
        feelsLike: 23,
        humidity: 52,
        wind: "南東 18 km/h",
        precipitationChance: 6
      },
      alerts: [
        {
          type: "波浪",
          level: "info",
          message: "NSW沿岸の小型船舶注意報が解除され、うねりは減少傾向。",
          recommendedAction: "リーフ監視航行を再開可能。"
        }
      ],
      moodNarrative:
        "澄んだ空と蓄電技術の成果が呼応し、エネルギー計画への信頼が高まった。",
      todaySummary:
        "Sydney’s sea breeze kept the coast cool while investors toured the mega-battery control rooms alongside regional mayors. Inland, a hydrogen freight trial completed its run and mining partners released new circular-water metrics. Reef guardians streamed fresh coral footage to volunteers, capping a day where climate tech optimism matched the bright, salty air."
    }
  },
  {
    code: "cn",
    name: "China",
    lat: 35.8617,
    lng: 104.1954,
    summary: {
      headline: "グリーン製造クラスターが稼働開始",
      weather: "北京: 14°C、薄曇りで微小粒子は軽度",
      persona: "静かな集中力で都市と地方をつなぐ調整役"
    },
    insights: {
      sentiment: [
        { date: "Day 1", score: 52 },
        { date: "Day 2", score: 54 },
        { date: "Day 3", score: 57 },
        { date: "Day 4", score: 59 },
        { date: "Day 5", score: 60 },
        { date: "Day 6", score: 63 },
        { date: "Day 7", score: 65 }
      ],
      weatherTrend: [
        { date: "Mon", temperature: 13 },
        { date: "Tue", temperature: 15 },
        { date: "Wed", temperature: 16 },
        { date: "Thu", temperature: 14 },
        { date: "Fri", temperature: 12 },
        { date: "Sat", temperature: 11 },
        { date: "Sun", temperature: 13 }
      ],
      news: [
        {
          title: "長江デルタで再エネ産業団地が起動",
          summary: "電池と電動車部品のサプライチェーンを統合する拠点が正式稼働した。",
          url: "https://example.com/cn-greencluster",
          category: "産業",
          tone: "celebratory"
        },
        {
          title: "浙江省で洋上風力の新たな連系",
          summary: "潮流の安定化制御により夜間供給を20%拡大。",
          url: "https://example.com/cn-offshore",
          category: "エネルギー",
          tone: "optimistic"
        },
        {
          title: "深センが都市農業のデータプラットフォーム公開",
          summary: "物流AIと連動し生鮮品のフードロス削減を進める。",
          url: "https://example.com/cn-urbanfarm",
          category: "食料",
          tone: "optimistic"
        }
      ],
      stats: [
        {
          label: "ムード変化率",
          value: "↑13pt",
          change: toTrend(13),
          sentiment: "positive"
        },
        {
          label: "ヘッドライン感情",
          value: "前向き",
          change: "工業政策",
          sentiment: "positive"
        },
        {
          label: "体感気候",
          value: "乾燥気味で涼しい",
          change: "粒子濃度改善",
          sentiment: "neutral"
        }
      ],
      weatherNow: {
        condition: "薄曇りで軽い北風",
        temperature: 14,
        feelsLike: 13,
        humidity: 48,
        wind: "北 11 km/h",
        precipitationChance: 10
      },
      alerts: [
        {
          type: "大気質",
          level: "watch",
          message: "夕方にPM2.5が一時的に中レベルへ上昇する恐れ。",
          recommendedAction: "屋外作業は予備マスクを携行。"
        }
      ],
      moodNarrative:
        "製造クラスターの稼働とクリーンエネルギー供給が同時に進み、慎重ながら期待が高まった。",
      todaySummary:
        "Factory managers across the Yangtze Delta walked journalists through new clean-power dashboards while Beijing commuters noticed clearer afternoon skies. Urban farming pilots in Shenzhen livestreamed data to grocers, and provincial planners framed the day as proof that climate-aligned industrial policy can feel both pragmatic and calm."
    }
  },
  {
    code: "de",
    name: "Germany",
    lat: 51.1657,
    lng: 10.4515,
    summary: {
      headline: "水素回廊と鉄道の協調運用が本格化",
      weather: "ベルリン: 9°C、時折日差し",
      persona: "工程ごとに精緻に調律しながら進む戦略家"
    },
    insights: {
      sentiment: [
        { date: "Day 1", score: 50 },
        { date: "Day 2", score: 52 },
        { date: "Day 3", score: 55 },
        { date: "Day 4", score: 57 },
        { date: "Day 5", score: 58 },
        { date: "Day 6", score: 60 },
        { date: "Day 7", score: 62 }
      ],
      weatherTrend: [
        { date: "Mon", temperature: 6 },
        { date: "Tue", temperature: 7 },
        { date: "Wed", temperature: 9 },
        { date: "Thu", temperature: 10 },
        { date: "Fri", temperature: 8 },
        { date: "Sat", temperature: 7 },
        { date: "Sun", temperature: 9 }
      ],
      news: [
        {
          title: "北部水素ハブが物流鉄道と連携",
          summary: "貨物列車が燃料供給ステーションと同期し脱炭素輸送を実証。",
          url: "https://example.com/de-hydrail",
          category: "インフラ",
          tone: "optimistic"
        },
        {
          title: "ライン川沿いで洪水対策ダッシュボード公開",
          summary: "自治体同士がリアルタイム水位データを共有する仕組みが拡張。",
          url: "https://example.com/de-flood",
          category: "レジリエンス",
          tone: "cautious"
        },
        {
          title: "バイエルンの住宅断熱で補助金追加",
          summary: "低所得世帯向けに断熱改修の助成枠が20%拡張。",
          url: "https://example.com/de-insulation",
          category: "住宅",
          tone: "optimistic"
        }
      ],
      stats: [
        {
          label: "ムード変化率",
          value: "↑12pt",
          change: toTrend(12),
          sentiment: "positive"
        },
        {
          label: "ヘッドライン感情",
          value: "堅実",
          change: "水素連携",
          sentiment: "positive"
        },
        {
          label: "体感気候",
          value: "冷涼で安定",
          change: "日差し増加",
          sentiment: "neutral"
        }
      ],
      weatherNow: {
        condition: "薄雲からの晴れ間",
        temperature: 9,
        feelsLike: 7,
        humidity: 55,
        wind: "西 15 km/h",
        precipitationChance: 12
      },
      alerts: [
        {
          type: "河川水位",
          level: "info",
          message: "ライン川下流で通常範囲内の揺れ。巡視を継続。",
          recommendedAction: "自治体は日次チェックを継続。"
        }
      ],
      moodNarrative:
        "インフラ協調の進展と住宅支援の拡充が安心感を生み、冷涼な空気の中で落ち着きが広がった。",
      todaySummary:
        "Hydrogen locomotives glided through Lower Saxony while municipal engineers compared flood dashboards along the Rhine. Bavarian homeowners lined up digital consultations on insulation subsidies, and the tone nationwide was measured but confident, underscored by crisp spring light."
    }
  },
  {
    code: "in",
    name: "India",
    lat: 20.5937,
    lng: 78.9629,
    summary: {
      headline: "モンスーン予測とソーラーファーム連係が強化",
      weather: "デリー: 26°C、乾いた南風",
      persona: "大胆さと現場感を持ち合わせた共創ドライバー"
    },
    insights: {
      sentiment: [
        { date: "Day 1", score: 47 },
        { date: "Day 2", score: 49 },
        { date: "Day 3", score: 52 },
        { date: "Day 4", score: 54 },
        { date: "Day 5", score: 57 },
        { date: "Day 6", score: 60 },
        { date: "Day 7", score: 63 }
      ],
      weatherTrend: [
        { date: "Mon", temperature: 28 },
        { date: "Tue", temperature: 30 },
        { date: "Wed", temperature: 31 },
        { date: "Thu", temperature: 32 },
        { date: "Fri", temperature: 33 },
        { date: "Sat", temperature: 31 },
        { date: "Sun", temperature: 29 }
      ],
      news: [
        {
          title: "中央州で農業気象APIが公開",
          summary: "モンスーン予測と灌漑設備を連動させる試験サービスが始まった。",
          url: "https://example.com/in-agri",
          category: "農業",
          tone: "optimistic"
        },
        {
          title: "ラジャスタンのメガソーラーが都市配電と直結",
          summary: "夜間の需要ピークをピークシフト電力で補完。",
          url: "https://example.com/in-solar",
          category: "エネルギー",
          tone: "celebratory"
        },
        {
          title: "ハイデラバードでスタートアップ支援拠点を拡張",
          summary: "クリーンテック分野のインキュベーション枠が倍増。",
          url: "https://example.com/in-startup",
          category: "起業",
          tone: "optimistic"
        }
      ],
      stats: [
        {
          label: "ムード変化率",
          value: "↑16pt",
          change: toTrend(16),
          sentiment: "positive"
        },
        {
          label: "ヘッドライン感情",
          value: "活気",
          change: "気象連係",
          sentiment: "positive"
        },
        {
          label: "体感気候",
          value: "暑さが増し乾燥",
          change: "モンスーン前",
          sentiment: "neutral"
        }
      ],
      weatherNow: {
        condition: "晴れで乾いた風",
        temperature: 26,
        feelsLike: 27,
        humidity: 38,
        wind: "南 17 km/h",
        precipitationChance: 8
      },
      alerts: [
        {
          type: "熱波",
          level: "watch",
          message: "北西インドで最高気温が35°Cを超える予報。",
          recommendedAction: "日中の作業は短時間で区切り、冷却休憩を確保。"
        }
      ],
      moodNarrative:
        "モンスーン準備と再エネ拡張が並行し、暑さの中でも前進するエネルギーが感じられた。",
      todaySummary:
        "Developers in Rajasthan synced mega-solar output with evening city peaks while Hyderabad’s new incubator cohort pitched drought-tech tools. Farmers sampled the agrimet API and radio stations relayed heat advisories, framing the day as assertive, solutions-oriented, and just on the edge of monsoon anticipation."
    }
  },
  {
    code: "ke",
    name: "Kenya",
    lat: -0.0236,
    lng: 37.9062,
    summary: {
      headline: "地熱電力とデジタル農業が国内で加速",
      weather: "ナイロビ: 23°C、午後にスコール",
      persona: "地域と世界を結ぶ俊敏なストーリーテラー"
    },
    insights: {
      sentiment: [
        { date: "Day 1", score: 44 },
        { date: "Day 2", score: 46 },
        { date: "Day 3", score: 48 },
        { date: "Day 4", score: 50 },
        { date: "Day 5", score: 52 },
        { date: "Day 6", score: 55 },
        { date: "Day 7", score: 57 }
      ],
      weatherTrend: [
        { date: "Mon", temperature: 24 },
        { date: "Tue", temperature: 25 },
        { date: "Wed", temperature: 24 },
        { date: "Thu", temperature: 26 },
        { date: "Fri", temperature: 25 },
        { date: "Sat", temperature: 24 },
        { date: "Sun", temperature: 23 }
      ],
      news: [
        {
          title: "リフトバレーの地熱拡張プロジェクトが稼働",
          summary: "新設タービンが送電網に接続され再エネ比率が30%を突破。",
          url: "https://example.com/ke-geothermal",
          category: "エネルギー",
          tone: "celebratory"
        },
        {
          title: "モバイル気象サービスが小規模農家へ拡大",
          summary: "SMSで病害虫アラートと市場価格を提供し試験ユーザーが倍増。",
          url: "https://example.com/ke-agtech",
          category: "農業",
          tone: "optimistic"
        },
        {
          title: "ナイロビのクリエイティブハブが循環経済を紹介",
          summary: "アップサイクル製品の展示会に国際バイヤーが参加。",
          url: "https://example.com/ke-circular",
          category: "クリエイティブ",
          tone: "optimistic"
        }
      ],
      stats: [
        {
          label: "ムード変化率",
          value: "↑13pt",
          change: toTrend(13),
          sentiment: "positive"
        },
        {
          label: "ヘッドライン感情",
          value: "活気",
          change: "地熱拡張",
          sentiment: "positive"
        },
        {
          label: "体感気候",
          value: "スコール混じりの涼しさ",
          change: "気温安定",
          sentiment: "neutral"
        }
      ],
      weatherNow: {
        condition: "午後に短い雷雨",
        temperature: 23,
        feelsLike: 24,
        humidity: 68,
        wind: "南東 13 km/h",
        precipitationChance: 55
      },
      alerts: [
        {
          type: "豪雨",
          level: "watch",
          message: "夕方のスコールで一部道路が冠水するおそれ。",
          recommendedAction: "通勤は早めに切り上げ、排水路の掃除を。"
        }
      ],
      moodNarrative:
        "地熱とモバイル農業サービスの成果が報じられ、都市も農村も前向きな声が続いた。",
      todaySummary:
        "Kenyans juggled bursts of afternoon rain with a sense of momentum as new geothermal turbines came online and SMS agronomy tips pinged across Rift Valley farms. Nairobi’s circular-design showcase drew overseas buyers, and the day’s conversations radiated confident, community-minded creativity."
    }
  },
  {
    code: "ae",
    name: "United Arab Emirates",
    lat: 23.4241,
    lng: 53.8478,
    summary: {
      headline: "砂漠都市が分散型エネルギーと水再生を強化",
      weather: "アブダビ: 29°C、乾燥した北風",
      persona: "最先端テクノロジーを軽やかに仕立てるファシリテーター"
    },
    insights: {
      sentiment: [
        { date: "Day 1", score: 56 },
        { date: "Day 2", score: 58 },
        { date: "Day 3", score: 60 },
        { date: "Day 4", score: 62 },
        { date: "Day 5", score: 64 },
        { date: "Day 6", score: 66 },
        { date: "Day 7", score: 68 }
      ],
      weatherTrend: [
        { date: "Mon", temperature: 30 },
        { date: "Tue", temperature: 31 },
        { date: "Wed", temperature: 32 },
        { date: "Thu", temperature: 33 },
        { date: "Fri", temperature: 32 },
        { date: "Sat", temperature: 31 },
        { date: "Sun", temperature: 30 }
      ],
      news: [
        {
          title: "マスダールシティで分散型蓄電池が稼働",
          summary: "ビル間でエネルギーをシェアするマイクログリッドが拡張。",
          url: "https://example.com/ae-storage",
          category: "エネルギー",
          tone: "celebratory"
        },
        {
          title: "海水淡水化プラントが再エネ連携テスト",
          summary: "昼間の太陽光で稼働し夜間には蓄電池で負荷平準化。",
          url: "https://example.com/ae-desal",
          category: "水資源",
          tone: "optimistic"
        },
        {
          title: "ドバイでクライメートアートフェス開催",
          summary: "湾岸各国のアーティストが気候適応をテーマに展示。",
          url: "https://example.com/ae-art",
          category: "カルチャー",
          tone: "optimistic"
        }
      ],
      stats: [
        {
          label: "ムード変化率",
          value: "↑12pt",
          change: toTrend(12),
          sentiment: "positive"
        },
        {
          label: "ヘッドライン感情",
          value: "洗練",
          change: "分散電源",
          sentiment: "positive"
        },
        {
          label: "体感気候",
          value: "乾燥で日差し強め",
          change: "夜間はやや涼しく",
          sentiment: "neutral"
        }
      ],
      weatherNow: {
        condition: "快晴で乾いた北風",
        temperature: 29,
        feelsLike: 28,
        humidity: 32,
        wind: "北 20 km/h",
        precipitationChance: 2
      },
      alerts: [
        {
          type: "砂塵",
          level: "info",
          message: "内陸で夕方に軽度の沙塵が予報。",
          recommendedAction: "屋外イベントは防塵メガネを準備。"
        }
      ],
      moodNarrative:
        "分散型エネルギーと水技術の実証が進み、文化イベントも相まって都市に洗練された活気が漂った。",
      todaySummary:
        "Solar-linked batteries hummed quietly across Masdar City while desalination engineers stress-tested new nighttime storage routines. Galleries in Dubai unveiled climate adaptation pieces to visiting delegates, and desert air stayed crisp thanks to a steady shamal, leaving residents optimistic about tech-infused resilience."
    }
  }
];

export const getCountryByCode = (code: string) =>
  countries.find((country) => country.code === code.toLowerCase());
