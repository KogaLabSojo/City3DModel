/** 通町筋周辺。座標は OpenStreetMap（2026-10-23 取得）を模型の基準にしている。 */

export const ORIGIN = {
  id: "city-hall",
  name: "熊本市役所",
  lat: 32.8032975,
  lon: 130.7080255,
}

export const CATEGORIES = {
  public: {label: "公共", color: "#2a6f97"},
  transit: {label: "交通", color: "#1d7a45"},
  shopping: {label: "商業", color: "#b5812f"},
  history: {label: "歴史", color: "#c23b22"},
  culture: {label: "文化", color: "#5c4d86"},
  nature: {label: "みどり", color: "#3d7a62"},
}

export const PLACES = [
  {
    id: "city-hall",
    name: "熊本市役所",
    reading: "くまもとしやくしょ",
    category: "public",
    lat: 32.8032975,
    lon: 130.7080255,
    summary:
      "中央区手取本町の本庁舎です。模型では屋上の ArUco マーカーが、すべての表示位置の基準になります。",
  },
  {
    id: "city-hall-stop",
    name: "熊本城・市役所前",
    reading: "くまもとじょう・しやくしょまえ",
    category: "transit",
    lat: 32.8032115,
    lon: 130.7072567,
    summary: "市電の電停です。市役所の正面側にあり、熊本城方面へ歩くときの入口になります。",
  },
  {
    id: "toricho",
    name: "通町筋",
    reading: "とおりちょうすじ",
    category: "shopping",
    lat: 32.8033389,
    lon: 130.7097744,
    summary:
      "中心商店街と市電が交わる電停です。上通・下通・新市街へ分かれる、この模型の中心になる交差点です。",
  },
  {
    id: "suidocho",
    name: "水道町",
    reading: "すいどうちょう",
    category: "transit",
    lat: 32.8024735,
    lon: 130.7123314,
    summary: "市電の電停です。上通の東端に近く、水前寺方面と中心部をつなぎます。",
  },
  {
    id: "hanabata",
    name: "花畑町",
    reading: "はなばたちょう",
    category: "transit",
    lat: 32.8012085,
    lon: 130.7054759,
    summary: "市電の電停です。花畑公園のそばで、桜町方面と城下へ向かう位置にあります。",
  },
  {
    id: "sakuramachi",
    name: "桜町バスターミナル",
    reading: "さくらまちばすたーみなる",
    category: "transit",
    lat: 32.800295,
    lon: 130.7032868,
    summary: "熊本桜町バスターミナルです。高速バスと市電が接続し、SAKURA MACHI Kumamoto に面しています。",
  },
  {
    id: "tsuruya",
    name: "鶴屋百貨店",
    reading: "つるやひゃっかてん",
    category: "shopping",
    lat: 32.8023556,
    lon: 130.7110447,
    summary: "通町筋に面した百貨店です。中心商店街の目印として、長くこの通りに店を構えています。",
  },
  {
    id: "ginza",
    name: "銀座通り",
    reading: "ぎんざどおり",
    category: "shopping",
    lat: 32.8005436,
    lon: 130.7088116,
    summary: "下通の東側に並行する商店街です。食事と買い物の店が並びます。",
  },
  {
    id: "johsaien",
    name: "桜の馬場 城彩苑",
    reading: "さくらのばば じょうさいえん",
    category: "culture",
    lat: 32.8035571,
    lon: 130.703562,
    summary: "熊本城の城下にある観光交流施設です。食事処、土産店、観光案内が集まっています。",
  },
  {
    id: "castle",
    name: "熊本城",
    reading: "くまもとじょう",
    category: "history",
    lat: 32.8052691,
    lon: 130.7054642,
    summary:
      "加藤清正が築いた城です。2016年の熊本地震で石垣や建造物が被災し、復旧と公開が進められています。",
  },
  {
    id: "kato",
    name: "加藤神社",
    reading: "かとうじんじゃ",
    category: "history",
    lat: 32.8072411,
    lon: 130.7051846,
    summary: "加藤清正を祀る神社です。熊本城の北、坪井川を越えた位置にあります。",
  },
]
