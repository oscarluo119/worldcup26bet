export const TEAM_PROFILE_DIMENSIONS = [
  { key: "attack", label: "进攻火力" },
  { key: "defense", label: "防守硬度" },
  { key: "midfield", label: "中场控制" },
  { key: "pace", label: "速度冲击" },
  { key: "setPiece", label: "定位球威胁" },
  { key: "experience", label: "大赛经验" },
];

export const TEAM_PROFILE_RATING_GUIDELINES = {
  baselineDate: "2026-06-11",
  note: "六维战力为静态策划评分，统一按进攻火力、防守硬度、中场控制、速度冲击、定位球威胁、大赛经验六项口径维护，满分 100。",
  criteria: {
    attack: "近期进球、射门、前锋身价、进攻球员状态",
    defense: "失球数、后防身价、门将能力、零封率",
    midfield: "控球率、传球成功率、中场球员身价",
    pace: "边锋速度、反击能力、转换进攻",
    setPiece: "角球、任意球、头球强点",
    experience: "世界杯及洲际大赛经历、淘汰赛经验",
  },
};

const DEFAULT_VERIFIED_AT = "2026-06-11";
const PLACEHOLDER_VALUE = "待复核";

const LAST_WORLD_CUP_RESULTS = {
  MEX: "2022 世界杯小组出局",
  RSA: "未晋级 2022 世界杯",
  KOR: "2022 世界杯十六强",
  CZE: "未晋级 2022 世界杯",
  CAN: "2022 世界杯小组出局",
  BIH: "未晋级 2022 世界杯",
  USA: "2022 世界杯十六强",
  PAR: "未晋级 2022 世界杯",
  QAT: "2022 世界杯小组出局",
  SUI: "2022 世界杯十六强",
  BRA: "2022 世界杯八强",
  MAR: "2022 世界杯殿军",
  HTI: "未晋级 2022 世界杯",
  SCO: "未晋级 2022 世界杯",
  AUS: "2022 世界杯十六强",
  TUR: "未晋级 2022 世界杯",
  GER: "2022 世界杯小组出局",
  CUW: "未晋级 2022 世界杯",
  NED: "2022 世界杯八强",
  JPN: "2022 世界杯十六强",
  CIV: "未晋级 2022 世界杯",
  ECU: "2022 世界杯小组出局",
  SWE: "未晋级 2022 世界杯",
  TUN: "2022 世界杯小组出局",
  ESP: "2022 世界杯十六强",
  CPV: "未晋级 2022 世界杯",
  BEL: "2022 世界杯小组出局",
  EGY: "未晋级 2022 世界杯",
  KSA: "2022 世界杯小组出局",
  URU: "2022 世界杯小组出局",
  IRN: "2022 世界杯小组出局",
  NZL: "未晋级 2022 世界杯",
  FRA: "2022 世界杯亚军",
  SEN: "2022 世界杯十六强",
  IRQ: "未晋级 2022 世界杯",
  NOR: "未晋级 2022 世界杯",
  ARG: "2022 世界杯冠军",
  ALG: "未晋级 2022 世界杯",
  AUT: "未晋级 2022 世界杯",
  JOR: "未晋级 2022 世界杯",
  POR: "2022 世界杯八强",
  COD: "未晋级 2022 世界杯",
  ENG: "2022 世界杯八强",
  CRO: "2022 世界杯季军",
  GHA: "2022 世界杯小组出局",
  PAN: "未晋级 2022 世界杯",
  UZB: "未晋级 2022 世界杯",
  COL: "未晋级 2022 世界杯",
};

const CONFEDERATIONS = {
  MEX: "CONCACAF",
  RSA: "CAF",
  KOR: "AFC",
  CZE: "UEFA",
  CAN: "CONCACAF",
  BIH: "UEFA",
  USA: "CONCACAF",
  PAR: "CONMEBOL",
  QAT: "AFC",
  SUI: "UEFA",
  BRA: "CONMEBOL",
  MAR: "CAF",
  HTI: "CONCACAF",
  SCO: "UEFA",
  AUS: "AFC",
  TUR: "UEFA",
  GER: "UEFA",
  CUW: "CONCACAF",
  NED: "UEFA",
  JPN: "AFC",
  CIV: "CAF",
  ECU: "CONMEBOL",
  SWE: "UEFA",
  TUN: "CAF",
  ESP: "UEFA",
  CPV: "CAF",
  BEL: "UEFA",
  EGY: "CAF",
  KSA: "AFC",
  URU: "CONMEBOL",
  IRN: "AFC",
  NZL: "OFC",
  FRA: "UEFA",
  SEN: "CAF",
  IRQ: "AFC",
  NOR: "UEFA",
  ARG: "CONMEBOL",
  ALG: "CAF",
  AUT: "UEFA",
  JOR: "AFC",
  POR: "UEFA",
  COD: "CAF",
  ENG: "UEFA",
  CRO: "UEFA",
  GHA: "CAF",
  PAN: "CONCACAF",
  UZB: "AFC",
  COL: "CONMEBOL",
};

const CONTINENTS = {
  CONCACAF: "北中美及加勒比",
  CAF: "非洲",
  AFC: "亚洲",
  UEFA: "欧洲",
  CONMEBOL: "南美洲",
  OFC: "大洋洲",
};

const BASE_TEAM_PROFILES = [
  { key: "MEX", displayNameZh: "墨西哥", teamName: "Mexico", countryCode: "mx", fifaRank: 15, coach: "哈维尔·阿吉雷", topValuablePlayer: "圣地亚哥·希门尼斯", topValuablePlayerValue: "1800万欧元", totalSquadValue: "1.92亿欧元", ratings: [74, 68, 70, 72, 67, 79] },
  { key: "RSA", displayNameZh: "南非", teamName: "South Africa", countryCode: "za", fifaRank: 60, coach: "雨果·布罗斯", topValuablePlayer: "莱尔·福斯特", topValuablePlayerValue: "800万欧元", totalSquadValue: "4925万欧元", ratings: [60, 61, 58, 67, 55, 62] },
  { key: "KOR", displayNameZh: "韩国", teamName: "South Korea", countryCode: "kr", fifaRank: 25, coach: "洪明甫", topValuablePlayer: "李刚仁", topValuablePlayerValue: "2800万欧元", totalSquadValue: "1.39亿欧元", ratings: [76, 68, 72, 84, 70, 74] },
  { key: "CZE", displayNameZh: "捷克", teamName: "Czech Republic", countryCode: "cz", fifaRank: 36, coach: "伊万·哈谢克", topValuablePlayer: "帕特里克·希克", topValuablePlayerValue: PLACEHOLDER_VALUE, totalSquadValue: PLACEHOLDER_VALUE, ratings: [71, 72, 69, 63, 68, 71] },
  { key: "CAN", displayNameZh: "加拿大", teamName: "Canada", countryCode: "ca", fifaRank: 30, coach: "杰西·马希", topValuablePlayer: "阿方索·戴维斯", topValuablePlayerValue: "4000万欧元", totalSquadValue: "1.99亿欧元", ratings: [74, 65, 67, 83, 68, 66] },
  { key: "BIH", displayNameZh: "波黑", teamName: "Bosnia and Herzegovina", countryCode: "ba", fifaRank: 74, coach: "谢尔盖·巴尔巴雷兹", topValuablePlayer: "埃丁·哲科", topValuablePlayerValue: PLACEHOLDER_VALUE, totalSquadValue: PLACEHOLDER_VALUE, ratings: [62, 61, 60, 58, 56, 68] },
  { key: "USA", displayNameZh: "美国", teamName: "USA", countryCode: "us", fifaRank: 11, coach: "毛里西奥·波切蒂诺", topValuablePlayer: "克里斯蒂安·普利希奇", topValuablePlayerValue: "5000万欧元", totalSquadValue: "3.86亿欧元", ratings: [78, 73, 75, 82, 77, 73] },
  { key: "PAR", displayNameZh: "巴拉圭", teamName: "Paraguay", countryCode: "py", fifaRank: 56, coach: "丹尼尔·加尔内罗", topValuablePlayer: "米格尔·阿尔米隆", topValuablePlayerValue: PLACEHOLDER_VALUE, totalSquadValue: "1.54亿欧元", ratings: [64, 71, 62, 66, 63, 69] },
  { key: "QAT", displayNameZh: "卡塔尔", teamName: "Qatar", countryCode: "qa", fifaRank: 35, coach: "胡伦·洛佩特吉", topValuablePlayer: "阿克拉姆·阿菲夫", topValuablePlayerValue: PLACEHOLDER_VALUE, totalSquadValue: "1993万欧元", ratings: [70, 62, 68, 73, 64, 65] },
  { key: "SUI", displayNameZh: "瑞士", teamName: "Switzerland", countryCode: "ch", fifaRank: 19, coach: "穆拉特·雅金", topValuablePlayer: "格拉尼特·扎卡", topValuablePlayerValue: PLACEHOLDER_VALUE, totalSquadValue: "3.33亿欧元", ratings: [74, 78, 77, 66, 74, 80] },
  { key: "BRA", displayNameZh: "巴西", teamName: "Brazil", countryCode: "br", fifaRank: 6, coach: "卡洛·安切洛蒂", topValuablePlayer: "维尼修斯·儒尼奥尔", topValuablePlayerValue: "1.40亿欧元", totalSquadValue: "9.28亿欧元", ratings: [90, 78, 84, 89, 86, 92] },
  { key: "MAR", displayNameZh: "摩洛哥", teamName: "Morocco", countryCode: "ma", fifaRank: 8, coach: "瓦利德·雷格拉吉", topValuablePlayer: "阿什拉夫·哈基米", topValuablePlayerValue: PLACEHOLDER_VALUE, totalSquadValue: "4.48亿欧元", ratings: [76, 82, 74, 81, 76, 85] },
  { key: "HTI", displayNameZh: "海地", teamName: "Haiti", countryCode: "ht", fifaRank: 88, coach: "塞巴斯蒂安·米涅", topValuablePlayer: "杜肯斯·纳宗", topValuablePlayerValue: PLACEHOLDER_VALUE, totalSquadValue: "5590万欧元", ratings: [58, 55, 54, 63, 50, 52] },
  { key: "SCO", displayNameZh: "苏格兰", teamName: "Scotland", countryCode: "gb-sct", fifaRank: 39, coach: "史蒂夫·克拉克", topValuablePlayer: "斯科特·麦克托米奈", topValuablePlayerValue: "4000万欧元", totalSquadValue: "1.70亿欧元", ratings: [68, 71, 69, 67, 66, 73] },
  { key: "AUS", displayNameZh: "澳大利亚", teamName: "Australia", countryCode: "au", fifaRank: 24, coach: "托尼·波波维奇", topValuablePlayer: "马修·瑞安", topValuablePlayerValue: PLACEHOLDER_VALUE, totalSquadValue: PLACEHOLDER_VALUE, ratings: [67, 72, 66, 69, 68, 76] },
  { key: "TUR", displayNameZh: "土耳其", teamName: "Turkey", countryCode: "tr", fifaRank: 42, coach: "文琴佐·蒙特拉", topValuablePlayer: "阿尔达·居莱尔", topValuablePlayerValue: PLACEHOLDER_VALUE, totalSquadValue: "4.74亿欧元", ratings: [73, 64, 71, 74, 67, 64] },
  { key: "GER", displayNameZh: "德国", teamName: "Germany", countryCode: "de", fifaRank: 10, coach: "尤利安·纳格尔斯曼", topValuablePlayer: "弗洛里安·维尔茨", topValuablePlayerValue: "1.00亿欧元", totalSquadValue: "9.47亿欧元", ratings: [84, 79, 86, 78, 83, 89] },
  { key: "CUW", displayNameZh: "库拉索", teamName: "Curacao", countryCode: "cw", fifaRank: 90, coach: "迪克·阿德沃卡特", topValuablePlayer: "莱安德罗·巴库纳", topValuablePlayerValue: PLACEHOLDER_VALUE, totalSquadValue: PLACEHOLDER_VALUE, ratings: [57, 56, 55, 60, 52, 58] },
  { key: "NED", displayNameZh: "荷兰", teamName: "Netherlands", countryCode: "nl", fifaRank: 7, coach: "罗纳德·科曼", topValuablePlayer: "赖恩·赫拉芬贝赫", topValuablePlayerValue: "8000万欧元", totalSquadValue: "7.54亿欧元", ratings: [84, 83, 85, 76, 82, 90] },
  { key: "JPN", displayNameZh: "日本", teamName: "Japan", countryCode: "jp", fifaRank: 9, coach: "森保一", topValuablePlayer: "佐野海舟", topValuablePlayerValue: "4000万欧元", totalSquadValue: "2.71亿欧元", ratings: [77, 74, 78, 82, 75, 79] },
  { key: "CIV", displayNameZh: "科特迪瓦", teamName: "Ivory Coast", countryCode: "ci", fifaRank: 41, coach: "埃梅塞·法埃", topValuablePlayer: "塞巴斯蒂安·阿莱", topValuablePlayerValue: PLACEHOLDER_VALUE, totalSquadValue: "5.22亿欧元", ratings: [72, 69, 65, 78, 66, 67] },
  { key: "ECU", displayNameZh: "厄瓜多尔", teamName: "Ecuador", countryCode: "ec", fifaRank: 30, coach: "费利克斯·桑切斯", topValuablePlayer: "莫伊塞斯·凯塞多", topValuablePlayerValue: PLACEHOLDER_VALUE, totalSquadValue: PLACEHOLDER_VALUE, ratings: [69, 74, 71, 75, 70, 72] },
  { key: "SWE", displayNameZh: "瑞典", teamName: "Sweden", countryCode: "se", fifaRank: 28, coach: "约恩·达尔·托马松", topValuablePlayer: "亚历山大·伊萨克", topValuablePlayerValue: PLACEHOLDER_VALUE, totalSquadValue: "4.06亿欧元", ratings: [75, 70, 69, 74, 69, 75] },
  { key: "TUN", displayNameZh: "突尼斯", teamName: "Tunisia", countryCode: "tn", fifaRank: 52, coach: "法乌齐·本扎尔蒂", topValuablePlayer: "埃利耶斯·斯希里", topValuablePlayerValue: PLACEHOLDER_VALUE, totalSquadValue: PLACEHOLDER_VALUE, ratings: [60, 69, 63, 61, 60, 68] },
  { key: "ESP", displayNameZh: "西班牙", teamName: "Spain", countryCode: "es", fifaRank: 2, coach: "路易斯·德拉富恩特", topValuablePlayer: "拉明·亚马尔", topValuablePlayerValue: "2.00亿欧元", totalSquadValue: "12.20亿欧元", ratings: [88, 80, 92, 81, 84, 88] },
  { key: "CPV", displayNameZh: "佛得角", teamName: "Cape Verde", countryCode: "cv", fifaRank: 64, coach: "布比斯塔", topValuablePlayer: "洛甘·科斯塔", topValuablePlayerValue: "1500万欧元", totalSquadValue: "5450万欧元", ratings: [61, 63, 60, 64, 57, 59] },
  { key: "BEL", displayNameZh: "比利时", teamName: "Belgium", countryCode: "be", fifaRank: 8, coach: "鲁迪·加西亚", topValuablePlayer: "凯文·德布劳内", topValuablePlayerValue: PLACEHOLDER_VALUE, totalSquadValue: "5.48亿欧元", ratings: [86, 75, 84, 77, 80, 86] },
  { key: "EGY", displayNameZh: "埃及", teamName: "Egypt", countryCode: "eg", fifaRank: 37, coach: "胡萨姆·哈桑", topValuablePlayer: "穆罕默德·萨拉赫", topValuablePlayerValue: PLACEHOLDER_VALUE, totalSquadValue: PLACEHOLDER_VALUE, ratings: [74, 67, 66, 77, 63, 71] },
  { key: "KSA", displayNameZh: "沙特阿拉伯", teamName: "Saudi Arabia", countryCode: "sa", fifaRank: 53, coach: "乔治奥斯·多尼斯", topValuablePlayer: "萨利姆·多萨里", topValuablePlayerValue: PLACEHOLDER_VALUE, totalSquadValue: "4068万欧元", ratings: [65, 63, 64, 70, 61, 66] },
  { key: "URU", displayNameZh: "乌拉圭", teamName: "Uruguay", countryCode: "uy", fifaRank: 17, coach: "马塞洛·贝尔萨", topValuablePlayer: "费德里科·巴尔韦德", topValuablePlayerValue: "9000万欧元", totalSquadValue: "3.59亿欧元", ratings: [82, 79, 78, 80, 79, 88] },
  { key: "IRN", displayNameZh: "伊朗", teamName: "Iran", countryCode: "ir", fifaRank: 20, coach: "阿米尔·加莱诺伊", topValuablePlayer: "迈赫迪·塔雷米", topValuablePlayerValue: PLACEHOLDER_VALUE, totalSquadValue: PLACEHOLDER_VALUE, ratings: [73, 72, 68, 70, 67, 78] },
  { key: "NZL", displayNameZh: "新西兰", teamName: "New Zealand", countryCode: "nz", fifaRank: 95, coach: "达伦·贝兹利", topValuablePlayer: "克里斯·伍德", topValuablePlayerValue: PLACEHOLDER_VALUE, totalSquadValue: "3435万欧元", ratings: [59, 58, 55, 57, 54, 61] },
  { key: "FRA", displayNameZh: "法国", teamName: "France", countryCode: "fr", fifaRank: 1, coach: "迪迪埃·德尚", topValuablePlayer: "基利安·姆巴佩", topValuablePlayerValue: "1.80亿欧元", totalSquadValue: "15.20亿欧元", ratings: [91, 83, 85, 90, 88, 94] },
  { key: "SEN", displayNameZh: "塞内加尔", teamName: "Senegal", countryCode: "sn", fifaRank: 18, coach: "帕普·蒂亚乌", topValuablePlayer: "尼古拉斯·雅克松", topValuablePlayerValue: PLACEHOLDER_VALUE, totalSquadValue: "4.78亿欧元", ratings: [75, 77, 68, 79, 72, 77] },
  { key: "IRQ", displayNameZh: "伊拉克", teamName: "Iraq", countryCode: "iq", fifaRank: 55, coach: "赫苏斯·卡萨斯", topValuablePlayer: "艾曼·侯赛因", topValuablePlayerValue: PLACEHOLDER_VALUE, totalSquadValue: PLACEHOLDER_VALUE, ratings: [63, 62, 61, 64, 58, 65] },
  { key: "NOR", displayNameZh: "挪威", teamName: "Norway", countryCode: "no", fifaRank: 43, coach: "斯塔勒·索尔巴肯", topValuablePlayer: "埃尔林·哈兰德", topValuablePlayerValue: "2.00亿欧元", totalSquadValue: "5.90亿欧元", ratings: [80, 66, 68, 73, 67, 69] },
  { key: "ARG", displayNameZh: "阿根廷", teamName: "Argentina", countryCode: "ar", fifaRank: 3, coach: "利昂内尔·斯卡洛尼", topValuablePlayer: "胡利安·阿尔瓦雷斯", topValuablePlayerValue: "1.00亿欧元", totalSquadValue: "7.83亿欧元", ratings: [89, 84, 88, 79, 85, 96] },
  { key: "ALG", displayNameZh: "阿尔及利亚", teamName: "Algeria", countryCode: "dz", fifaRank: 44, coach: "弗拉基米尔·佩特科维奇", topValuablePlayer: "里亚德·马赫雷斯", topValuablePlayerValue: PLACEHOLDER_VALUE, totalSquadValue: "2.57亿欧元", ratings: [71, 66, 68, 72, 64, 70] },
  { key: "AUT", displayNameZh: "奥地利", teamName: "Austria", countryCode: "at", fifaRank: 22, coach: "拉尔夫·朗尼克", topValuablePlayer: "马塞尔·萨比策", topValuablePlayerValue: PLACEHOLDER_VALUE, totalSquadValue: "2.45亿欧元", ratings: [74, 76, 74, 71, 72, 76] },
  { key: "JOR", displayNameZh: "约旦", teamName: "Jordan", countryCode: "jo", fifaRank: 68, coach: "侯赛因·阿穆塔", topValuablePlayer: "穆萨·塔马里", topValuablePlayerValue: "1000万欧元", totalSquadValue: "2030万欧元", ratings: [62, 60, 58, 68, 55, 60] },
  { key: "POR", displayNameZh: "葡萄牙", teamName: "Portugal", countryCode: "pt", fifaRank: 5, coach: "罗伯托·马丁内斯", topValuablePlayer: "若昂·内维斯", topValuablePlayerValue: "1.40亿欧元", totalSquadValue: "10.10亿欧元", ratings: [87, 79, 86, 78, 83, 90] },
  { key: "COD", displayNameZh: "刚果民主共和国", teamName: "DR Congo", countryCode: "cd", fifaRank: 61, coach: "塞巴斯蒂安·德萨布尔", topValuablePlayer: "约安·维萨", topValuablePlayerValue: PLACEHOLDER_VALUE, totalSquadValue: PLACEHOLDER_VALUE, ratings: [65, 63, 60, 71, 58, 61] },
  { key: "ENG", displayNameZh: "英格兰", teamName: "England", countryCode: "gb-eng", fifaRank: 3, coach: "托马斯·图赫尔", topValuablePlayer: "裘德·贝林厄姆", topValuablePlayerValue: "1.30亿欧元", totalSquadValue: "13.60亿欧元", ratings: [88, 82, 84, 77, 90, 91] },
  { key: "CRO", displayNameZh: "克罗地亚", teamName: "Croatia", countryCode: "hr", fifaRank: 11, coach: "兹拉特科·达利奇", topValuablePlayer: "约什科·格瓦迪奥尔", topValuablePlayerValue: "7000万欧元", totalSquadValue: "3.87亿欧元", ratings: [78, 80, 83, 68, 75, 93] },
  { key: "GHA", displayNameZh: "加纳", teamName: "Ghana", countryCode: "gh", fifaRank: 72, coach: "奥托·阿多", topValuablePlayer: "穆罕默德·库杜斯", topValuablePlayerValue: PLACEHOLDER_VALUE, totalSquadValue: PLACEHOLDER_VALUE, ratings: [68, 61, 60, 74, 58, 65] },
  { key: "PAN", displayNameZh: "巴拿马", teamName: "Panama", countryCode: "pa", fifaRank: 43, coach: "托马斯·克里斯蒂安森", topValuablePlayer: "阿达尔韦托·卡拉斯基利亚", topValuablePlayerValue: PLACEHOLDER_VALUE, totalSquadValue: PLACEHOLDER_VALUE, ratings: [64, 67, 65, 62, 63, 68] },
  { key: "UZB", displayNameZh: "乌兹别克斯坦", teamName: "Uzbekistan", countryCode: "uz", fifaRank: 57, coach: "斯雷奇科·卡塔内茨", topValuablePlayer: "阿博斯别克·法伊祖拉耶夫", topValuablePlayerValue: PLACEHOLDER_VALUE, totalSquadValue: PLACEHOLDER_VALUE, ratings: [63, 64, 66, 65, 59, 62] },
  { key: "COL", displayNameZh: "哥伦比亚", teamName: "Colombia", countryCode: "co", fifaRank: 12, coach: "内斯托尔·洛伦索", topValuablePlayer: "路易斯·迪亚斯", topValuablePlayerValue: PLACEHOLDER_VALUE, totalSquadValue: "3.02亿欧元", ratings: [83, 76, 79, 84, 77, 82] },
];

const VERIFIED_SOURCE_OVERRIDES = {
  BRA: {
    rankingSource: "https://inside.fifa.com/fifa-world-ranking/BRA?gender=men",
    coachSource: "https://inside.fifa.com/associations/BRA/organisation",
    marketValueSource: "https://www.transfermarkt.com/brazil/kader/verein/3439",
  },
  CAN: {
    rankingSource: "https://inside.fifa.com/fifa-world-ranking/CAN?gender=men",
    coachSource: "https://inside.fifa.com/associations/CAN/organisation",
    marketValueSource: "https://www.transfermarkt.com/canada/kader/verein/3510",
  },
  CRO: {
    rankingSource: "https://inside.fifa.com/fifa-world-ranking/CRO?gender=men",
    coachSource: "https://inside.fifa.com/associations/CRO/organisation",
    marketValueSource: "https://www.transfermarkt.com/croatia/kader/verein/3556",
  },
  ENG: {
    rankingSource: "https://inside.fifa.com/fifa-world-ranking/ENG?gender=men",
    coachSource: "https://inside.fifa.com/associations/ENG/organisation",
    marketValueSource: "https://www.transfermarkt.com/england/kader/verein/3299",
  },
  ESP: {
    rankingSource: "https://inside.fifa.com/fifa-world-ranking/ESP?gender=men",
    coachSource: "https://inside.fifa.com/associations/ESP/organisation",
    marketValueSource: "https://www.transfermarkt.com/spain/kader/verein/3375",
  },
  FRA: {
    rankingSource: "https://inside.fifa.com/fifa-world-ranking/FRA?gender=men",
    coachSource: "https://inside.fifa.com/associations/FRA/organisation",
    marketValueSource: "https://www.transfermarkt.com/france/startseite/verein/3377",
  },
  GER: {
    rankingSource: "https://inside.fifa.com/fifa-world-ranking/GER?gender=men",
    coachSource: "https://inside.fifa.com/associations/GER/organisation",
    marketValueSource: "https://www.transfermarkt.com/germany/kader/verein/3262",
  },
  JPN: {
    rankingSource: "https://inside.fifa.com/fifa-world-ranking/JPN?gender=men",
    coachSource: "https://inside.fifa.com/associations/JPN/organisation",
    marketValueSource: "https://www.transfermarkt.com/japan/kader/verein/3435",
  },
  KOR: {
    rankingSource: "https://inside.fifa.com/fifa-world-ranking/KOR?gender=men",
    coachSource: "https://inside.fifa.com/associations/KOR/organisation",
    marketValueSource: "https://www.transfermarkt.com/south-korea/kader/verein/3589",
  },
  MAR: {
    rankingSource: "https://inside.fifa.com/fifa-world-ranking/MAR?gender=men",
    coachSource: "https://inside.fifa.com/associations/MAR/organisation",
    marketValueSource: "https://www.transfermarkt.com/morocco/kader/verein/3575",
  },
  MEX: {
    rankingSource: "https://inside.fifa.com/fifa-world-ranking/MEX?gender=men",
    coachSource: "https://inside.fifa.com/associations/MEX/organisation",
    marketValueSource: "https://www.transfermarkt.com/mexico/kader/verein/6303",
  },
  NED: {
    rankingSource: "https://inside.fifa.com/fifa-world-ranking/NED?gender=men",
    coachSource: "https://inside.fifa.com/associations/NED/organisation",
    marketValueSource: "https://www.transfermarkt.com/niederlande/kader/verein/3379",
  },
  POR: {
    rankingSource: "https://inside.fifa.com/fifa-world-ranking/POR?gender=men",
    coachSource: "https://inside.fifa.com/associations/POR/organisation",
    marketValueSource: "https://www.transfermarkt.com/portugal/kader/verein/3300",
  },
  RSA: {
    rankingSource: "https://inside.fifa.com/fifa-world-ranking/RSA?gender=men",
    coachSource: "https://inside.fifa.com/associations/RSA/organisation",
    marketValueSource: "https://www.transfermarkt.com/south-africa/marktwertanalyse/verein/3806",
  },
  SCO: {
    rankingSource: "https://inside.fifa.com/fifa-world-ranking/SCO?gender=men",
    coachSource: "https://inside.fifa.com/associations/SCO/organisation",
    marketValueSource: "https://www.transfermarkt.com/schottland/teuersteelf/verein/3380",
  },
  URU: {
    rankingSource: "https://inside.fifa.com/fifa-world-ranking/URU?gender=men",
    coachSource: "https://inside.fifa.com/associations/URU/organisation",
    marketValueSource: "https://www.transfermarkt.com/uruguay/kader/verein/3449",
  },
};

function buildDefaultSources(key) {
  return {
    rankingSource: VERIFIED_SOURCE_OVERRIDES[key]?.rankingSource || `https://inside.fifa.com/fifa-world-ranking/${key}?gender=men`,
    coachSource: VERIFIED_SOURCE_OVERRIDES[key]?.coachSource || `https://inside.fifa.com/associations/${key}/organisation`,
    marketValueSource:
      VERIFIED_SOURCE_OVERRIDES[key]?.marketValueSource ||
      "Transfermarkt national team profile, manually prepared static snapshot for 2026 World Cup",
  };
}

function normalizeProfileLookupValue(value) {
  return String(value || "")
    .trim()
    .replace(/[\s·'.，。()（）,-]/g, "")
    .toLowerCase();
}

function createAliases(profile) {
  return [profile.key, profile.displayNameZh, profile.teamName, profile.countryCode]
    .filter(Boolean)
    .map((value) => normalizeProfileLookupValue(value));
}

export const TEAM_PROFILES = BASE_TEAM_PROFILES.map((profile) => ({
  ...profile,
  confederation: CONFEDERATIONS[profile.key] || PLACEHOLDER_VALUE,
  continent: CONTINENTS[CONFEDERATIONS[profile.key]] || PLACEHOLDER_VALUE,
  lastWorldCupResult: LAST_WORLD_CUP_RESULTS[profile.key] || "待补充",
  verifiedAt: DEFAULT_VERIFIED_AT,
  sources: buildDefaultSources(profile.key),
  aliases: createAliases(profile),
}));

const TEAM_PROFILE_LOOKUP = TEAM_PROFILES.reduce((acc, profile) => {
  profile.aliases.forEach((alias) => {
    if (alias) acc[alias] = profile;
  });
  return acc;
}, {});

export function getTeamProfileByName(value) {
  const normalized = normalizeProfileLookupValue(value);
  if (!normalized) return null;
  return TEAM_PROFILE_LOOKUP[normalized] || null;
}

export function getTeamProfileByCountryCode(countryCode) {
  const normalized = normalizeProfileLookupValue(countryCode);
  if (!normalized) return null;
  return TEAM_PROFILE_LOOKUP[normalized] || null;
}
