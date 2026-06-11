const TEAM_PROFILE_DEFINITIONS = [
  { key: "MEX", displayNameZh: "墨西哥", teamName: "Mexico", countryCode: "mx", fifaRank: 17, coach: "哈维尔·阿吉雷", starPlayer: "圣地亚哥·希门尼斯", tag: "主场气势足", ratings: [74, 68, 70, 72, 67, 79] },
  { key: "RSA", displayNameZh: "南非", teamName: "South Africa", countryCode: "za", fifaRank: 58, coach: "雨果·布罗斯", starPlayer: "珀西·陶", tag: "冲击力先行", ratings: [60, 61, 58, 67, 55, 62] },
  { key: "KOR", displayNameZh: "韩国", teamName: "South Korea", countryCode: "kr", fifaRank: 23, coach: "洪明甫", starPlayer: "孙兴慜", tag: "高速压迫", ratings: [76, 68, 72, 84, 70, 74] },
  { key: "CZE", displayNameZh: "捷克", teamName: "Czech Republic", countryCode: "cz", fifaRank: 36, coach: "伊万·哈谢克", starPlayer: "帕特里克·希克", tag: "整体纪律强", ratings: [71, 72, 69, 63, 68, 71] },
  { key: "CAN", displayNameZh: "加拿大", teamName: "Canada", countryCode: "ca", fifaRank: 31, coach: "杰西·马希", starPlayer: "阿方索·戴维斯", tag: "边路爆点多", ratings: [74, 65, 67, 83, 68, 66] },
  { key: "BIH", displayNameZh: "波黑", teamName: "Bosnia and Herzegovina", countryCode: "ba", fifaRank: 74, coach: "谢尔盖·巴尔巴雷兹", starPlayer: "埃丁·哲科", tag: "老将压阵", ratings: [62, 61, 60, 58, 56, 68] },
  { key: "USA", displayNameZh: "美国", teamName: "USA", countryCode: "us", fifaRank: 11, coach: "毛里西奥·波切蒂诺", starPlayer: "克里斯蒂安·普利希奇", tag: "冲击与跑动", ratings: [78, 73, 75, 82, 77, 73] },
  { key: "PAR", displayNameZh: "巴拉圭", teamName: "Paraguay", countryCode: "py", fifaRank: 56, coach: "丹尼尔·加尔内罗", starPlayer: "米格尔·阿尔米隆", tag: "对抗强硬", ratings: [64, 71, 62, 66, 63, 69] },
  { key: "QAT", displayNameZh: "卡塔尔", teamName: "Qatar", countryCode: "qa", fifaRank: 35, coach: "马尔克斯·洛佩斯", starPlayer: "阿克拉姆·阿菲夫", tag: "技术流反击", ratings: [70, 62, 68, 73, 64, 65] },
  { key: "SUI", displayNameZh: "瑞士", teamName: "Switzerland", countryCode: "ch", fifaRank: 19, coach: "穆拉特·雅金", starPlayer: "格拉尼特·扎卡", tag: "结构稳定", ratings: [74, 78, 77, 66, 74, 80] },
  { key: "BRA", displayNameZh: "巴西", teamName: "Brazil", countryCode: "br", fifaRank: 5, coach: "多里瓦尔·儒尼奥尔", starPlayer: "维尼修斯", tag: "天赋上限高", ratings: [90, 78, 84, 89, 86, 92] },
  { key: "MAR", displayNameZh: "摩洛哥", teamName: "Morocco", countryCode: "ma", fifaRank: 13, coach: "瓦利德·雷格拉吉", starPlayer: "阿什拉夫·哈基米", tag: "转换效率高", ratings: [76, 82, 74, 81, 76, 85] },
  { key: "HTI", displayNameZh: "海地", teamName: "Haiti", countryCode: "ht", fifaRank: 88, coach: "塞巴斯蒂安·米涅", starPlayer: "杜肯斯·纳宗", tag: "反击直接", ratings: [58, 55, 54, 63, 50, 52] },
  { key: "SCO", displayNameZh: "苏格兰", teamName: "Scotland", countryCode: "gb-sct", fifaRank: 39, coach: "史蒂夫·克拉克", starPlayer: "安德鲁·罗伯逊", tag: "硬仗属性强", ratings: [68, 71, 69, 67, 66, 73] },
  { key: "AUS", displayNameZh: "澳大利亚", teamName: "Australia", countryCode: "au", fifaRank: 24, coach: "托尼·波波维奇", starPlayer: "马修·瑞安", tag: "身体对抗好", ratings: [67, 72, 66, 69, 68, 76] },
  { key: "TUR", displayNameZh: "土耳其", teamName: "Turkey", countryCode: "tr", fifaRank: 42, coach: "文琴佐·蒙特拉", starPlayer: "阿尔达·居莱尔", tag: "技术冒险型", ratings: [73, 64, 71, 74, 67, 64] },
  { key: "GER", displayNameZh: "德国", teamName: "Germany", countryCode: "de", fifaRank: 10, coach: "尤利安·纳格尔斯曼", starPlayer: "贾马尔·穆西亚拉", tag: "体系推进强", ratings: [84, 79, 86, 78, 83, 89] },
  { key: "CUW", displayNameZh: "库拉索", teamName: "Curacao", countryCode: "cw", fifaRank: 90, coach: "迪克·艾德沃卡特", starPlayer: "利安德罗·巴库纳", tag: "小组黑马型", ratings: [57, 56, 55, 60, 52, 58] },
  { key: "NED", displayNameZh: "荷兰", teamName: "Netherlands", countryCode: "nl", fifaRank: 7, coach: "罗纳德·科曼", starPlayer: "维吉尔·范戴克", tag: "攻守平衡", ratings: [84, 83, 85, 76, 82, 90] },
  { key: "JPN", displayNameZh: "日本", teamName: "Japan", countryCode: "jp", fifaRank: 16, coach: "森保一", starPlayer: "久保建英", tag: "战术执行满格", ratings: [77, 74, 78, 82, 75, 79] },
  { key: "CIV", displayNameZh: "科特迪瓦", teamName: "Ivory Coast", countryCode: "ci", fifaRank: 41, coach: "埃默斯·法埃", starPlayer: "塞巴斯蒂安·阿莱", tag: "力量与速度兼具", ratings: [72, 69, 65, 78, 66, 67] },
  { key: "ECU", displayNameZh: "厄瓜多尔", teamName: "Ecuador", countryCode: "ec", fifaRank: 30, coach: "费利克斯·桑切斯", starPlayer: "莫伊塞斯·凯塞多", tag: "跑动覆盖强", ratings: [69, 74, 71, 75, 70, 72] },
  { key: "SWE", displayNameZh: "瑞典", teamName: "Sweden", countryCode: "se", fifaRank: 28, coach: "约恩·达尔·托马松", starPlayer: "亚历山大·伊萨克", tag: "纵深打法", ratings: [75, 70, 69, 74, 69, 75] },
  { key: "TUN", displayNameZh: "突尼斯", teamName: "Tunisia", countryCode: "tn", fifaRank: 52, coach: "法乌齐·本扎尔蒂", starPlayer: "埃利耶斯·斯希里", tag: "防守韧性足", ratings: [60, 69, 63, 61, 60, 68] },
  { key: "ESP", displayNameZh: "西班牙", teamName: "Spain", countryCode: "es", fifaRank: 3, coach: "路易斯·德拉富恩特", starPlayer: "拉明·亚马尔", tag: "控场能力顶级", ratings: [88, 80, 92, 81, 84, 88] },
  { key: "CPV", displayNameZh: "佛得角", teamName: "Cape Verde", countryCode: "cv", fifaRank: 64, coach: "布巴·桑戈雷", starPlayer: "瑞安·门德斯", tag: "组织紧凑", ratings: [61, 63, 60, 64, 57, 59] },
  { key: "BEL", displayNameZh: "比利时", teamName: "Belgium", countryCode: "be", fifaRank: 8, coach: "多梅尼科·特德斯科", starPlayer: "凯文·德布劳内", tag: "创造力出众", ratings: [86, 75, 84, 77, 80, 86] },
  { key: "EGY", displayNameZh: "埃及", teamName: "Egypt", countryCode: "eg", fifaRank: 37, coach: "霍萨姆·哈桑", starPlayer: "穆罕默德·萨拉赫", tag: "核心驱动型", ratings: [74, 67, 66, 77, 63, 71] },
  { key: "KSA", displayNameZh: "沙特阿拉伯", teamName: "Saudi Arabia", countryCode: "sa", fifaRank: 53, coach: "罗伯托·曼奇尼", starPlayer: "萨利姆·多萨里", tag: "节奏变化快", ratings: [65, 63, 64, 70, 61, 66] },
  { key: "URU", displayNameZh: "乌拉圭", teamName: "Uruguay", countryCode: "uy", fifaRank: 14, coach: "马塞洛·贝尔萨", starPlayer: "费德里科·巴尔韦德", tag: "高压反抢", ratings: [82, 79, 78, 80, 79, 88] },
  { key: "IRN", displayNameZh: "伊朗", teamName: "Iran", countryCode: "ir", fifaRank: 20, coach: "阿米尔·加伦诺伊", starPlayer: "迈赫迪·塔雷米", tag: "反击效率高", ratings: [73, 72, 68, 70, 67, 78] },
  { key: "NZL", displayNameZh: "新西兰", teamName: "New Zealand", countryCode: "nz", fifaRank: 95, coach: "达伦·贝兹利", starPlayer: "克里斯·伍德", tag: "高空球优势", ratings: [59, 58, 55, 57, 54, 61] },
  { key: "FRA", displayNameZh: "法国", teamName: "France", countryCode: "fr", fifaRank: 2, coach: "迪迪埃·德尚", starPlayer: "基利安·姆巴佩", tag: "高压逼抢", ratings: [91, 83, 85, 90, 88, 94] },
  { key: "SEN", displayNameZh: "塞内加尔", teamName: "Senegal", countryCode: "sn", fifaRank: 18, coach: "帕普·蒂亚乌", starPlayer: "尼古拉斯·雅克松", tag: "身体条件优越", ratings: [75, 77, 68, 79, 72, 77] },
  { key: "IRQ", displayNameZh: "伊拉克", teamName: "Iraq", countryCode: "iq", fifaRank: 55, coach: "赫苏斯·卡萨斯", starPlayer: "艾曼·侯赛因", tag: "士气型球队", ratings: [63, 62, 61, 64, 58, 65] },
  { key: "NOR", displayNameZh: "挪威", teamName: "Norway", countryCode: "no", fifaRank: 43, coach: "斯塔勒·索尔巴肯", starPlayer: "埃尔林·哈兰德", tag: "终结能力强", ratings: [80, 66, 68, 73, 67, 69] },
  { key: "ARG", displayNameZh: "阿根廷", teamName: "Argentina", countryCode: "ar", fifaRank: 1, coach: "利昂内尔·斯卡洛尼", starPlayer: "劳塔罗·马丁内斯", tag: "冠军气场足", ratings: [89, 84, 88, 79, 85, 96] },
  { key: "ALG", displayNameZh: "阿尔及利亚", teamName: "Algeria", countryCode: "dz", fifaRank: 44, coach: "弗拉基米尔·佩特科维奇", starPlayer: "里亚德·马赫雷斯", tag: "边路创造多", ratings: [71, 66, 68, 72, 64, 70] },
  { key: "AUT", displayNameZh: "奥地利", teamName: "Austria", countryCode: "at", fifaRank: 22, coach: "拉尔夫·朗尼克", starPlayer: "马塞尔·萨比策", tag: "前场施压强", ratings: [74, 76, 74, 71, 72, 76] },
  { key: "JOR", displayNameZh: "约旦", teamName: "Jordan", countryCode: "jo", fifaRank: 68, coach: "侯赛因·阿穆塔", starPlayer: "穆萨·塔马里", tag: "黑马气质", ratings: [62, 60, 58, 68, 55, 60] },
  { key: "POR", displayNameZh: "葡萄牙", teamName: "Portugal", countryCode: "pt", fifaRank: 6, coach: "罗伯托·马丁内斯", starPlayer: "布鲁诺·费尔南德斯", tag: "脚下技术细腻", ratings: [87, 79, 86, 78, 83, 90] },
  { key: "COD", displayNameZh: "刚果民主共和国", teamName: "DR Congo", countryCode: "cd", fifaRank: 61, coach: "塞巴斯蒂安·德萨布尔", starPlayer: "约安·维萨", tag: "纵向推进快", ratings: [65, 63, 60, 71, 58, 61] },
  { key: "ENG", displayNameZh: "英格兰", teamName: "England", countryCode: "gb-eng", fifaRank: 4, coach: "托马斯·图赫尔", starPlayer: "裘德·贝林厄姆", tag: "阵容厚度豪华", ratings: [88, 82, 84, 77, 90, 91] },
  { key: "CRO", displayNameZh: "克罗地亚", teamName: "Croatia", countryCode: "hr", fifaRank: 9, coach: "兹拉特科·达利奇", starPlayer: "卢卡·莫德里奇", tag: "大赛老辣", ratings: [78, 80, 83, 68, 75, 93] },
  { key: "GHA", displayNameZh: "加纳", teamName: "Ghana", countryCode: "gh", fifaRank: 72, coach: "奥托·阿多", starPlayer: "穆罕默德·库杜斯", tag: "爆点驱动", ratings: [68, 61, 60, 74, 58, 65] },
  { key: "PAN", displayNameZh: "巴拿马", teamName: "Panama", countryCode: "pa", fifaRank: 43, coach: "托马斯·克里斯蒂安森", starPlayer: "阿达尔贝托·卡拉斯基利亚", tag: "整体执行好", ratings: [64, 67, 65, 62, 63, 68] },
  { key: "UZB", displayNameZh: "乌兹别克斯坦", teamName: "Uzbekistan", countryCode: "uz", fifaRank: 57, coach: "斯雷奇科·卡塔内茨", starPlayer: "阿博斯别克·法伊祖拉耶夫", tag: "组织有耐心", ratings: [63, 64, 66, 65, 59, 62] },
  { key: "COL", displayNameZh: "哥伦比亚", teamName: "Colombia", countryCode: "co", fifaRank: 12, coach: "内斯托尔·洛伦索", starPlayer: "路易斯·迪亚斯", tag: "节奏变化丰富", ratings: [83, 76, 79, 84, 77, 82] },
];

export const TEAM_PROFILE_DIMENSIONS = [
  { key: "attack", label: "进攻火力" },
  { key: "defense", label: "防守硬度" },
  { key: "midfield", label: "中场控制" },
  { key: "pace", label: "速度冲击" },
  { key: "depth", label: "阵容深度" },
  { key: "experience", label: "大赛经验" },
];

function normalizeProfileLookupValue(value) {
  return String(value || "").trim().replace(/[\s·,，.。/／()（）-]/g, "").toLowerCase();
}

function createAliases(definition) {
  return [
    definition.key,
    definition.displayNameZh,
    definition.teamName,
    definition.countryCode,
  ]
    .filter(Boolean)
    .map((value) => normalizeProfileLookupValue(value));
}

export const TEAM_PROFILES = TEAM_PROFILE_DEFINITIONS.map((definition) => ({
  ...definition,
  aliases: createAliases(definition),
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
