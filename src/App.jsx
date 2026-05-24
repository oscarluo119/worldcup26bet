import React, { useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Crown,
  Flame,
  Home,
  KeyRound,
  Loader2,
  Lock,
  LogOut,
  Mail,
  Medal,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Trophy,
  Unlock,
  User,
  Users,
  XCircle,
} from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { isSupabaseConfigured, supabase } from "./lib/supabase";
import {
  ACHIEVEMENT_DEFINITIONS,
  ACHIEVEMENT_RARITIES,
  buildAchievementCollections,
  getAchievementBadgeClass,
  getAchievementTheme,
} from "./achievements";

const STAGES = {
  GROUP: { label: "小组赛", multiplier: 1 },
  R32: { label: "32强赛", multiplier: 2 },
  R16: { label: "16强赛", multiplier: 2 },
  QF: { label: "8进4 / 四分之一决赛", multiplier: 4 },
  SF: { label: "4进2 / 半决赛", multiplier: 8 },
  THIRD: { label: "三四名决赛", multiplier: 8 },
  FINAL: { label: "决赛", multiplier: 16 },
};

const TEAM_FLAGS = {
  墨西哥: "🇲🇽",
  南非: "🇿🇦",
  韩国: "🇰🇷",
  捷克: "🇨🇿",
  加拿大: "🇨🇦",
  波黑: "🇧🇦",
  美国: "🇺🇸",
  巴拉圭: "🇵🇾",
  卡塔尔: "🇶🇦",
  瑞士: "🇨🇭",
  巴西: "🇧🇷",
  摩洛哥: "🇲🇦",
  海地: "🇭🇹",
  苏格兰: "🏴",
  澳大利亚: "🇦🇺",
  土耳其: "🇹🇷",
  德国: "🇩🇪",
  库拉索: "🇨🇼",
  荷兰: "🇳🇱",
  日本: "🇯🇵",
  科特迪瓦: "🇨🇮",
  厄瓜多尔: "🇪🇨",
  瑞典: "🇸🇪",
  突尼斯: "🇹🇳",
  沙特阿拉伯: "🇸🇦",
  乌拉圭: "🇺🇾",
  西班牙: "🇪🇸",
  佛得角: "🇨🇻",
  伊朗: "🇮🇷",
  新西兰: "🇳🇿",
  比利时: "🇧🇪",
  埃及: "🇪🇬",
  法国: "🇫🇷",
  塞内加尔: "🇸🇳",
  伊拉克: "🇮🇶",
  挪威: "🇳🇴",
  阿根廷: "🇦🇷",
  阿尔及利亚: "🇩🇿",
  奥地利: "🇦🇹",
  约旦: "🇯🇴",
  英格兰: "🏴",
  克罗地亚: "🇭🇷",
  加纳: "🇬🇭",
  巴拿马: "🇵🇦",
  葡萄牙: "🇵🇹",
  刚果民主共和国: "🇨🇩",
  乌兹别克斯坦: "🇺🇿",
  哥伦比亚: "🇨🇴",
};

const initialPlayers = [];

const initialMatches = [
  { id: "m1", no: 1, stage: "GROUP", group: "A组", home: "墨西哥", away: "南非", kickoff: "2026-06-12T03:00:00+08:00", status: "open", homeScore: null, awayScore: null },
  { id: "m2", no: 2, stage: "GROUP", group: "A组", home: "加拿大", away: "日本", kickoff: "2026-06-12T08:00:00+08:00", status: "open", homeScore: null, awayScore: null },
  { id: "m3", no: 3, stage: "GROUP", group: "B组", home: "巴西", away: "克罗地亚", kickoff: "2026-06-13T03:00:00+08:00", status: "open", homeScore: null, awayScore: null },
  { id: "m4", no: 4, stage: "GROUP", group: "C组", home: "阿根廷", away: "法国", kickoff: "2026-06-14T03:00:00+08:00", status: "settled", homeScore: 2, awayScore: 1 },
  { id: "m5", no: 65, stage: "R16", group: "淘汰赛", home: "葡萄牙", away: "乌拉圭", kickoff: "2026-07-05T03:00:00+08:00", status: "settled", homeScore: 1, awayScore: 1 },
  { id: "m6", no: 77, stage: "QF", group: "淘汰赛", home: "英格兰", away: "荷兰", kickoff: "2026-07-10T03:00:00+08:00", status: "open", homeScore: null, awayScore: null },
  { id: "m7", no: 101, stage: "SF", group: "淘汰赛", home: "德国", away: "西班牙", kickoff: "2026-07-15T03:00:00+08:00", status: "open", homeScore: null, awayScore: null },
  { id: "m8", no: 103, stage: "THIRD", group: "三四名决赛", home: "半决赛负者A", away: "半决赛负者B", kickoff: "2026-07-19T03:00:00+08:00", status: "open", homeScore: null, awayScore: null },
  { id: "m9", no: 104, stage: "FINAL", group: "决赛", home: "半决赛胜者A", away: "半决赛胜者B", kickoff: "2026-07-20T03:00:00+08:00", status: "open", homeScore: null, awayScore: null },
];

const scheduleRows = [
  [1, "A组", "墨西哥", "南非", "2026-06-12T03:00:00+08:00", "墨西哥城体育场（阿兹特克体育场）", "墨西哥城"],
  [2, "A组", "韩国", "捷克", "2026-06-12T10:00:00+08:00", "瓜达拉哈拉体育场（阿克伦体育场）", "萨波潘"],
  [3, "B组", "加拿大", "波黑", "2026-06-13T03:00:00+08:00", "多伦多体育场（BMO球场）", "多伦多"],
  [4, "D组", "美国", "巴拉圭", "2026-06-13T09:00:00+08:00", "洛杉矶体育场（SoFi体育场）", "洛杉矶"],
  [8, "B组", "卡塔尔", "瑞士", "2026-06-14T03:00:00+08:00", "旧金山湾区体育场（李维斯体育场）", "圣克拉拉"],
  [7, "C组", "巴西", "摩洛哥", "2026-06-14T06:00:00+08:00", "纽约/新泽西体育场（大都会人寿体育场）", "东卢瑟福"],
  [5, "C组", "海地", "苏格兰", "2026-06-14T09:00:00+08:00", "波士顿体育场（吉列体育场）", "福克斯伯勒"],
  [6, "D组", "澳大利亚", "土耳其", "2026-06-14T12:00:00+08:00", "BC Place体育场", "温哥华"],
  [10, "E组", "德国", "库拉索", "2026-06-15T01:00:00+08:00", "休斯敦体育场（NRG体育场）", "休斯敦"],
  [11, "F组", "荷兰", "日本", "2026-06-15T04:00:00+08:00", "达拉斯体育场（AT&T体育场）", "阿灵顿"],
  [9, "E组", "科特迪瓦", "厄瓜多尔", "2026-06-15T07:00:00+08:00", "费城体育场（林肯金融球场）", "费城"],
  [12, "F组", "瑞典", "突尼斯", "2026-06-15T10:00:00+08:00", "蒙特雷体育场（BBVA体育场）", "瓜达卢佩"],
  [14, "H组", "西班牙", "佛得角", "2026-06-16T00:00:00+08:00", "亚特兰大体育场（梅赛德斯-奔驰体育场）", "亚特兰大"],
  [16, "G组", "比利时", "埃及", "2026-06-16T03:00:00+08:00", "西雅图体育场（流明球场）", "西雅图"],
  [13, "H组", "沙特阿拉伯", "乌拉圭", "2026-06-16T06:00:00+08:00", "迈阿密体育场（硬石体育场）", "迈阿密花园"],
  [15, "G组", "伊朗", "新西兰", "2026-06-16T09:00:00+08:00", "洛杉矶体育场（SoFi体育场）", "洛杉矶"],
  [17, "I组", "法国", "塞内加尔", "2026-06-17T03:00:00+08:00", "纽约/新泽西体育场（大都会人寿体育场）", "东卢瑟福"],
  [18, "I组", "伊拉克", "挪威", "2026-06-17T06:00:00+08:00", "波士顿体育场（吉列体育场）", "福克斯伯勒"],
  [19, "J组", "阿根廷", "阿尔及利亚", "2026-06-17T09:00:00+08:00", "堪萨斯城体育场（箭头体育场）", "堪萨斯城"],
  [20, "J组", "奥地利", "约旦", "2026-06-17T12:00:00+08:00", "旧金山湾区体育场（李维斯体育场）", "圣克拉拉"],
  [23, "K组", "葡萄牙", "刚果民主共和国", "2026-06-18T01:00:00+08:00", "休斯敦体育场（NRG体育场）", "休斯敦"],
  [22, "L组", "英格兰", "克罗地亚", "2026-06-18T04:00:00+08:00", "达拉斯体育场（AT&T体育场）", "阿灵顿"],
  [21, "L组", "加纳", "巴拿马", "2026-06-18T07:00:00+08:00", "多伦多体育场（BMO球场）", "多伦多"],
  [24, "K组", "乌兹别克斯坦", "哥伦比亚", "2026-06-18T10:00:00+08:00", "墨西哥城体育场（阿兹特克体育场）", "墨西哥城"],
  [25, "A组", "捷克", "南非", "2026-06-19T00:00:00+08:00", "亚特兰大体育场（梅赛德斯-奔驰体育场）", "亚特兰大"],
  [26, "B组", "瑞士", "波黑", "2026-06-19T03:00:00+08:00", "洛杉矶体育场（SoFi体育场）", "洛杉矶"],
  [27, "B组", "加拿大", "卡塔尔", "2026-06-19T06:00:00+08:00", "BC Place体育场", "温哥华"],
  [28, "A组", "墨西哥", "韩国", "2026-06-19T09:00:00+08:00", "瓜达拉哈拉体育场（阿克伦体育场）", "萨波潘"],
  [31, "D组", "土耳其", "巴拉圭", "2026-06-19T12:00:00+08:00", "旧金山湾区体育场（李维斯体育场）", "圣克拉拉"],
  [32, "D组", "美国", "澳大利亚", "2026-06-20T03:00:00+08:00", "西雅图体育场（流明球场）", "西雅图"],
  [30, "C组", "苏格兰", "摩洛哥", "2026-06-20T06:00:00+08:00", "波士顿体育场（吉列体育场）", "福克斯伯勒"],
  [29, "C组", "巴西", "海地", "2026-06-20T08:30:00+08:00", "费城体育场（林肯金融球场）", "费城"],
  [35, "F组", "荷兰", "瑞典", "2026-06-21T01:00:00+08:00", "休斯敦体育场（NRG体育场）", "休斯敦"],
  [33, "E组", "德国", "科特迪瓦", "2026-06-21T04:00:00+08:00", "多伦多体育场（BMO球场）", "多伦多"],
  [34, "E组", "厄瓜多尔", "库拉索", "2026-06-21T08:00:00+08:00", "堪萨斯城体育场（箭头体育场）", "堪萨斯城"],
  [36, "F组", "突尼斯", "日本", "2026-06-21T12:00:00+08:00", "蒙特雷体育场（BBVA体育场）", "瓜达卢佩"],
  [38, "H组", "西班牙", "沙特阿拉伯", "2026-06-22T00:00:00+08:00", "亚特兰大体育场（梅赛德斯-奔驰体育场）", "亚特兰大"],
  [39, "G组", "比利时", "伊朗", "2026-06-22T03:00:00+08:00", "洛杉矶体育场（SoFi体育场）", "洛杉矶"],
  [37, "H组", "乌拉圭", "佛得角", "2026-06-22T06:00:00+08:00", "迈阿密体育场（硬石体育场）", "迈阿密花园"],
  [40, "G组", "新西兰", "埃及", "2026-06-22T09:00:00+08:00", "BC Place体育场", "温哥华"],
  [43, "J组", "阿根廷", "奥地利", "2026-06-23T01:00:00+08:00", "达拉斯体育场（AT&T体育场）", "阿灵顿"],
  [42, "I组", "法国", "伊拉克", "2026-06-23T05:00:00+08:00", "费城体育场（林肯金融球场）", "费城"],
  [41, "I组", "挪威", "塞内加尔", "2026-06-23T08:00:00+08:00", "纽约/新泽西体育场（大都会人寿体育场）", "东卢瑟福"],
  [44, "J组", "约旦", "阿尔及利亚", "2026-06-23T11:00:00+08:00", "旧金山湾区体育场（李维斯体育场）", "圣克拉拉"],
  [47, "K组", "葡萄牙", "乌兹别克斯坦", "2026-06-24T01:00:00+08:00", "休斯敦体育场（NRG体育场）", "休斯敦"],
  [45, "L组", "英格兰", "加纳", "2026-06-24T04:00:00+08:00", "波士顿体育场（吉列体育场）", "福克斯伯勒"],
  [46, "L组", "巴拿马", "克罗地亚", "2026-06-24T07:00:00+08:00", "多伦多体育场（BMO球场）", "多伦多"],
  [48, "K组", "哥伦比亚", "刚果民主共和国", "2026-06-24T10:00:00+08:00", "瓜达拉哈拉体育场（阿克伦体育场）", "萨波潘"],
  [51, "B组", "瑞士", "加拿大", "2026-06-25T03:00:00+08:00", "BC Place体育场", "温哥华"],
  [52, "B组", "波黑", "卡塔尔", "2026-06-25T03:00:00+08:00", "西雅图体育场（流明球场）", "西雅图"],
  [49, "C组", "苏格兰", "巴西", "2026-06-25T06:00:00+08:00", "迈阿密体育场（硬石体育场）", "迈阿密花园"],
  [50, "C组", "摩洛哥", "海地", "2026-06-25T06:00:00+08:00", "亚特兰大体育场（梅赛德斯-奔驰体育场）", "亚特兰大"],
  [53, "A组", "捷克", "墨西哥", "2026-06-25T09:00:00+08:00", "墨西哥城体育场（阿兹特克体育场）", "墨西哥城"],
  [54, "A组", "南非", "韩国", "2026-06-25T09:00:00+08:00", "蒙特雷体育场（BBVA体育场）", "瓜达卢佩"],
  [55, "E组", "库拉索", "科特迪瓦", "2026-06-26T04:00:00+08:00", "费城体育场（林肯金融球场）", "费城"],
  [56, "E组", "厄瓜多尔", "德国", "2026-06-26T04:00:00+08:00", "纽约/新泽西体育场（大都会人寿体育场）", "东卢瑟福"],
  [57, "F组", "日本", "瑞典", "2026-06-26T07:00:00+08:00", "达拉斯体育场（AT&T体育场）", "阿灵顿"],
  [58, "F组", "突尼斯", "荷兰", "2026-06-26T07:00:00+08:00", "堪萨斯城体育场（箭头体育场）", "堪萨斯城"],
  [59, "D组", "土耳其", "美国", "2026-06-26T10:00:00+08:00", "洛杉矶体育场（SoFi体育场）", "洛杉矶"],
  [60, "D组", "巴拉圭", "澳大利亚", "2026-06-26T10:00:00+08:00", "旧金山湾区体育场（李维斯体育场）", "圣克拉拉"],
  [61, "I组", "挪威", "法国", "2026-06-27T03:00:00+08:00", "波士顿体育场（吉列体育场）", "福克斯伯勒"],
  [62, "I组", "塞内加尔", "伊拉克", "2026-06-27T03:00:00+08:00", "多伦多体育场（BMO球场）", "多伦多"],
  [65, "H组", "佛得角", "沙特阿拉伯", "2026-06-27T08:00:00+08:00", "休斯敦体育场（NRG体育场）", "休斯敦"],
  [66, "H组", "乌拉圭", "西班牙", "2026-06-27T08:00:00+08:00", "瓜达拉哈拉体育场（阿克伦体育场）", "萨波潘"],
  [63, "G组", "埃及", "伊朗", "2026-06-27T11:00:00+08:00", "西雅图体育场（流明球场）", "西雅图"],
  [64, "G组", "新西兰", "比利时", "2026-06-27T11:00:00+08:00", "BC Place体育场", "温哥华"],
  [67, "L组", "巴拿马", "英格兰", "2026-06-28T05:00:00+08:00", "纽约/新泽西体育场（大都会人寿体育场）", "东卢瑟福"],
  [68, "L组", "克罗地亚", "加纳", "2026-06-28T05:00:00+08:00", "费城体育场（林肯金融球场）", "费城"],
  [71, "K组", "哥伦比亚", "葡萄牙", "2026-06-28T07:30:00+08:00", "迈阿密体育场（硬石体育场）", "迈阿密花园"],
  [72, "K组", "刚果民主共和国", "乌兹别克斯坦", "2026-06-28T07:30:00+08:00", "亚特兰大体育场（梅赛德斯-奔驰体育场）", "亚特兰大"],
  [69, "J组", "阿尔及利亚", "奥地利", "2026-06-28T10:00:00+08:00", "堪萨斯城体育场（箭头体育场）", "堪萨斯城"],
  [70, "J组", "约旦", "阿根廷", "2026-06-28T10:00:00+08:00", "达拉斯体育场（AT&T体育场）", "阿灵顿"],
  [73, "32强赛", "A组第二", "B组第二", "2026-06-29T03:00:00+08:00", "洛杉矶体育场（SoFi体育场）", "洛杉矶"],
  [76, "32强赛", "C组第一", "F组第二", "2026-06-30T01:00:00+08:00", "休斯敦体育场（NRG体育场）", "休斯敦"],
  [74, "32强赛", "E组第一", "最佳小组第三（A/B/C/D/F）", "2026-06-30T04:30:00+08:00", "波士顿体育场（吉列体育场）", "福克斯伯勒"],
  [75, "32强赛", "F组第一", "C组第二", "2026-06-30T09:00:00+08:00", "蒙特雷体育场（BBVA体育场）", "瓜达卢佩"],
  [78, "32强赛", "E组第二", "I组第二", "2026-07-01T01:00:00+08:00", "达拉斯体育场（AT&T体育场）", "阿灵顿"],
  [77, "32强赛", "I组第一", "最佳小组第三（C/D/F/G/H）", "2026-07-01T05:00:00+08:00", "纽约/新泽西体育场（大都会人寿体育场）", "东卢瑟福"],
  [79, "32强赛", "A组第一", "最佳小组第三（C/E/F/H/I）", "2026-07-01T09:00:00+08:00", "墨西哥城体育场（阿兹特克体育场）", "墨西哥城"],
  [80, "32强赛", "L组第一", "最佳小组第三（E/H/I/J/K）", "2026-07-02T00:00:00+08:00", "亚特兰大体育场（梅赛德斯-奔驰体育场）", "亚特兰大"],
  [82, "32强赛", "G组第一", "最佳小组第三（A/E/H/I/J）", "2026-07-02T04:00:00+08:00", "西雅图体育场（流明球场）", "西雅图"],
  [81, "32强赛", "D组第一", "最佳小组第三（B/E/F/I/J）", "2026-07-02T08:00:00+08:00", "旧金山湾区体育场（李维斯体育场）", "圣克拉拉"],
  [84, "32强赛", "H组第一", "J组第二", "2026-07-03T03:00:00+08:00", "洛杉矶体育场（SoFi体育场）", "洛杉矶"],
  [83, "32强赛", "K组第二", "L组第二", "2026-07-03T07:00:00+08:00", "多伦多体育场（BMO球场）", "多伦多"],
  [85, "32强赛", "B组第一", "最佳小组第三（E/F/G/I/J）", "2026-07-03T11:00:00+08:00", "BC Place体育场", "温哥华"],
  [88, "32强赛", "D组第二", "G组第二", "2026-07-04T02:00:00+08:00", "达拉斯体育场（AT&T体育场）", "阿灵顿"],
  [86, "32强赛", "J组第一", "H组第二", "2026-07-04T06:00:00+08:00", "迈阿密体育场（硬石体育场）", "迈阿密花园"],
  [87, "32强赛", "K组第一", "最佳小组第三（D/E/I/J/L）", "2026-07-04T09:30:00+08:00", "堪萨斯城体育场（箭头体育场）", "堪萨斯城"],
  [90, "16强赛", "第73场胜者", "第75场胜者", "2026-07-05T01:00:00+08:00", "休斯敦体育场（NRG体育场）", "休斯敦"],
  [89, "16强赛", "第74场胜者", "第77场胜者", "2026-07-05T05:00:00+08:00", "费城体育场（林肯金融球场）", "费城"],
  [91, "16强赛", "第76场胜者", "第78场胜者", "2026-07-06T04:00:00+08:00", "纽约/新泽西体育场（大都会人寿体育场）", "东卢瑟福"],
  [92, "16强赛", "第79场胜者", "第80场胜者", "2026-07-06T08:00:00+08:00", "墨西哥城体育场（阿兹特克体育场）", "墨西哥城"],
  [93, "16强赛", "第83场胜者", "第84场胜者", "2026-07-07T03:00:00+08:00", "达拉斯体育场（AT&T体育场）", "阿灵顿"],
  [94, "16强赛", "第81场胜者", "第82场胜者", "2026-07-07T08:00:00+08:00", "西雅图体育场（流明球场）", "西雅图"],
  [95, "16强赛", "第86场胜者", "第88场胜者", "2026-07-08T00:00:00+08:00", "亚特兰大体育场（梅赛德斯-奔驰体育场）", "亚特兰大"],
  [96, "16强赛", "第85场胜者", "第87场胜者", "2026-07-08T04:00:00+08:00", "BC Place体育场", "温哥华"],
  [97, "四分之一决赛", "第89场胜者", "第90场胜者", "2026-07-10T04:00:00+08:00", "波士顿体育场（吉列体育场）", "福克斯伯勒"],
  [98, "四分之一决赛", "第93场胜者", "第94场胜者", "2026-07-11T03:00:00+08:00", "洛杉矶体育场（SoFi体育场）", "洛杉矶"],
  [99, "四分之一决赛", "第91场胜者", "第92场胜者", "2026-07-12T05:00:00+08:00", "迈阿密体育场（硬石体育场）", "迈阿密花园"],
  [100, "四分之一决赛", "第95场胜者", "第96场胜者", "2026-07-12T09:00:00+08:00", "堪萨斯城体育场（箭头体育场）", "堪萨斯城"],
  [101, "半决赛", "第97场胜者", "第98场胜者", "2026-07-15T03:00:00+08:00", "达拉斯体育场（AT&T体育场）", "阿灵顿"],
  [102, "半决赛", "第99场胜者", "第100场胜者", "2026-07-16T03:00:00+08:00", "亚特兰大体育场（梅赛德斯-奔驰体育场）", "亚特兰大"],
  [103, "三四名决赛", "第101场负者", "第102场负者", "2026-07-19T05:00:00+08:00", "迈阿密体育场（硬石体育场）", "迈阿密花园"],
  [104, "决赛", "第101场胜者", "第102场胜者", "2026-07-20T03:00:00+08:00", "纽约/新泽西体育场（大都会人寿体育场）", "东卢瑟福"],
];

const FALLBACK_COMPLETE_WORLD_CUP_SCHEDULE = scheduleRows.map(([no, group, home, away, kickoff, stadium, city]) => ({
  id: String(no),
  fixtureId: String(no),
  resultId: no,
  no,
  round: group,
  stage: getStageFromScheduleGroup(group),
  group,
  home,
  away,
  homeLogo: "",
  awayLogo: "",
  kickoff,
  localDate: "",
  localTime: "",
  location: stadium,
  stadium,
  city,
  source: "fallback",
}));

const WORLD_CUP_GOAL_REFERENCES = [
  { edition: "2022 卡塔尔世界杯", goals: 172 },
  { edition: "2018 俄罗斯世界杯", goals: 169 },
];

const emptyFunResults = { champion: "", goldenBoot: "", firstRedCardTeam: "", totalGoals: "" };
const DEFAULT_AVATAR_EMOJI = "⚽";
const AVATAR_EMOJIS = ["⚽", "🏆", "🥅", "🔥", "⭐", "👑", "💪", "🎯", "🚀", "🦁", "🐯", "🐼", "🦊", "🐲", "😎"];
const WORLDCUP_API_KEY = import.meta.env.VITE_WORLDCUP_API_KEY;
const WORLDCUP_FIXTURES_URL = "https://api.worldcupapi.com/fixtures";

const GROUP_ID_LABELS = {
  4286: "A组",
  4287: "B组",
  4288: "C组",
  4289: "D组",
  4290: "E组",
  4291: "F组",
  4292: "G组",
  4293: "H组",
  4297: "I组",
  4296: "J组",
  4295: "K组",
  4294: "L组",
};

const LOCATION_TIME_ZONES = [
  ["Mexico City", "America/Mexico_City"],
  ["Zapopan", "America/Mexico_City"],
  ["Guadalupe", "America/Monterrey"],
  ["Toronto", "America/Toronto"],
  ["Vancouver", "America/Vancouver"],
  ["Inglewood", "America/Los_Angeles"],
  ["Santa Clara", "America/Los_Angeles"],
  ["Seattle", "America/Los_Angeles"],
  ["Houston", "America/Chicago"],
  ["Arlington", "America/Chicago"],
  ["Kansas City", "America/Chicago"],
  ["Atlanta", "America/New_York"],
  ["Philadelphia", "America/New_York"],
  ["East Rutherford", "America/New_York"],
  ["Foxborough", "America/New_York"],
  ["Miami Gardens", "America/New_York"],
];

const TEAM_NAME_ZH = {
  "3rd Group A/B/C/D/F": "最佳小组第三（A/B/C/D/F）",
  "3rd Group A/E/H/I/J": "最佳小组第三（A/E/H/I/J）",
  "3rd Group B/E/F/I/J": "最佳小组第三（B/E/F/I/J）",
  "3rd Group C/D/F/G/H": "最佳小组第三（C/D/F/G/H）",
  "3rd Group C/E/F/H/I": "最佳小组第三（C/E/F/H/I）",
  "3rd Group D/E/I/J/L": "最佳小组第三（D/E/I/J/L）",
  "3rd Group E/F/G/I/J": "最佳小组第三（E/F/G/I/J）",
  "3rd Group E/H/I/J/K": "最佳小组第三（E/H/I/J/K）",
  Algeria: "阿尔及利亚",
  Argentina: "阿根廷",
  Australia: "澳大利亚",
  Austria: "奥地利",
  Belgium: "比利时",
  "Bosnia and Herzegovina": "波黑",
  Brazil: "巴西",
  Canada: "加拿大",
  "Cape Verde": "佛得角",
  Colombia: "哥伦比亚",
  Croatia: "克罗地亚",
  Curacao: "库拉索",
  "Czech Republic": "捷克",
  "DR Congo": "刚果民主共和国",
  Ecuador: "厄瓜多尔",
  Egypt: "埃及",
  England: "英格兰",
  France: "法国",
  Germany: "德国",
  Ghana: "加纳",
  Haiti: "海地",
  Iran: "伊朗",
  Iraq: "伊拉克",
  "Ivory Coast": "科特迪瓦",
  Japan: "日本",
  Jordan: "约旦",
  Mexico: "墨西哥",
  Morocco: "摩洛哥",
  Netherlands: "荷兰",
  "New Zealand": "新西兰",
  Norway: "挪威",
  Panama: "巴拿马",
  Paraguay: "巴拉圭",
  Portugal: "葡萄牙",
  Qatar: "卡塔尔",
  "Saudi Arabia": "沙特阿拉伯",
  Scotland: "苏格兰",
  Senegal: "塞内加尔",
  "South Africa": "南非",
  "South Korea": "韩国",
  Spain: "西班牙",
  Sweden: "瑞典",
  Switzerland: "瑞士",
  Tunisia: "突尼斯",
  Turkey: "土耳其",
  Uruguay: "乌拉圭",
  USA: "美国",
  Uzbekistan: "乌兹别克斯坦",
  TBD: "待定",
};

const LOCATION_ZH = {
  "Arrowhead Stadium, Kansas City": { stadium: "箭头体育场", city: "堪萨斯城" },
  "AT&T Stadium, Arlington": { stadium: "AT&T体育场", city: "阿灵顿" },
  "BC Place, Vancouver": { stadium: "BC Place体育场", city: "温哥华" },
  "BMO Field, Toronto": { stadium: "BMO球场", city: "多伦多" },
  "Estadio Akron, Zapopan": { stadium: "阿克伦体育场", city: "萨波潘" },
  "Estadio Azteca, Mexico City": { stadium: "阿兹特克体育场", city: "墨西哥城" },
  "Estadio BBVA, Guadalupe": { stadium: "BBVA体育场", city: "瓜达卢佩" },
  "Gillette Stadium, Foxborough": { stadium: "吉列体育场", city: "福克斯伯勒" },
  "Hard Rock Stadium, Miami Gardens": { stadium: "硬石体育场", city: "迈阿密花园" },
  "Levi's Stadium, Santa Clara": { stadium: "李维斯体育场", city: "圣克拉拉" },
  "Lincoln Financial Field, Philadelphia": { stadium: "林肯金融球场", city: "费城" },
  "Lumen Field, Seattle": { stadium: "流明球场", city: "西雅图" },
  "Mercedes-Benz Stadium, Atlanta": { stadium: "梅赛德斯-奔驰体育场", city: "亚特兰大" },
  "MetLife Stadium, East Rutherford": { stadium: "大都会人寿体育场", city: "东卢瑟福" },
  "NRG Stadium, Houston": { stadium: "NRG体育场", city: "休斯敦" },
  "SoFi Stadium, Inglewood": { stadium: "SoFi体育场", city: "英格尔伍德" },
};

function translateTeamName(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  if (TEAM_NAME_ZH[text]) return TEAM_NAME_ZH[text];

  let match = text.match(/^Winner Group ([A-L])$/);
  if (match) return `${match[1]}组第一`;
  match = text.match(/^Runner-up Group ([A-L])$/);
  if (match) return `${match[1]}组第二`;
  match = text.match(/^3rd Group ([A-L](?:\/[A-L])*)$/);
  if (match) return `最佳小组第三（${match[1]}）`;
  match = text.match(/^Winner R32 Match (\d+)$/);
  if (match) return `32强赛第${match[1]}场胜者`;
  match = text.match(/^Winner R16 Match (\d+)$/);
  if (match) return `16强赛第${match[1]}场胜者`;
  match = text.match(/^Winner QF Match (\d+)$/);
  if (match) return `四分之一决赛第${match[1]}场胜者`;
  match = text.match(/^Winner SF(\d+)$/);
  if (match) return `半决赛${match[1]}胜者`;
  match = text.match(/^Loser SF(\d+)$/);
  if (match) return `半决赛${match[1]}负者`;

  return text;
}

function translateLocation(value) {
  const text = String(value || "").trim();
  const translated = LOCATION_ZH[text];
  if (!translated) {
    const [stadium = text, city = ""] = text.split(",").map((part) => part.trim());
    return { stadium, city, location: city ? `${stadium}，${city}` : stadium };
  }
  return {
    ...translated,
    location: `${translated.stadium}，${translated.city}`,
  };
}

function translateDisplayText(value) {
  return translateTeamName(value);
}

function normalizeComparableText(value) {
  return translateDisplayText(value).replace(/[\s·,，.。/／()（）-]/g, "").toLowerCase();
}

function isSameDisplayValue(left, right) {
  const normalizedLeft = normalizeComparableText(left);
  const normalizedRight = normalizeComparableText(right);
  return Boolean(normalizedLeft && normalizedRight && normalizedLeft === normalizedRight);
}

function getStageFromScheduleGroup(group) {
  if (/^[A-L]组$/.test(group)) return "GROUP";
  if (group.includes("32")) return "R32";
  if (group.includes("16")) return "R16";
  if (group.includes("四分之一") || group.includes("8")) return "QF";
  if (group.includes("半决赛")) return "SF";
  if (group.includes("三四")) return "THIRD";
  if (group.includes("决赛")) return "FINAL";
  return "GROUP";
}

function getStageFromApiRound(round) {
  const value = String(round || "").toUpperCase();
  if (["1", "2", "3"].includes(value)) return "GROUP";
  if (value === "R32") return "R32";
  if (value === "R16") return "R16";
  if (value === "QF") return "QF";
  if (value === "SF") return "SF";
  if (value === "3PPO") return "THIRD";
  if (value === "F") return "FINAL";
  return "GROUP";
}

function getGroupLabelFromFixture(fixture) {
  if (fixture.group_id && GROUP_ID_LABELS[fixture.group_id]) return GROUP_ID_LABELS[fixture.group_id];
  const stage = getStageFromApiRound(fixture.round);
  if (stage === "GROUP") return `第${fixture.round}轮`;
  return STAGES[stage]?.label || String(fixture.round || "");
}

function getTimeZoneForLocation(location) {
  const found = LOCATION_TIME_ZONES.find(([needle]) => String(location || "").includes(needle));
  return found?.[1] || null;
}

function getTimeZoneOffset(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const asUTC = Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day), Number(values.hour), Number(values.minute), Number(values.second));
  return asUTC - date.getTime();
}

function zonedDateTimeToIso(dateText, timeText, timeZone) {
  const [year, month, day] = String(dateText).split("-").map(Number);
  const [hour, minute, second = 0] = String(timeText).split(":").map(Number);
  const guess = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  const offset = getTimeZoneOffset(guess, timeZone);
  return new Date(guess.getTime() - offset).toISOString();
}

function utcDateTimeToIso(dateText, timeText) {
  const [year, month, day] = String(dateText).split("-").map(Number);
  const [hour, minute, second = 0] = String(timeText || "00:00:00").split(":").map(Number);
  return new Date(Date.UTC(year, month - 1, day, hour, minute, second)).toISOString();
}

function normalizeWorldCupFixture(fixture, index) {
  const stage = getStageFromApiRound(fixture.round);
  const locationZh = translateLocation(fixture.location);
  const homeRaw = fixture.home?.name || "TBD";
  const awayRaw = fixture.away?.name || "TBD";
  return {
    id: String(fixture.id),
    fixtureId: String(fixture.id),
    resultId: Number(fixture.id),
    no: index + 1,
    round: String(fixture.round || ""),
    stage,
    group: getGroupLabelFromFixture(fixture),
    home: translateTeamName(homeRaw),
    away: translateTeamName(awayRaw),
    homeRaw,
    awayRaw,
    homeLogo: fixture.home?.logo || "",
    awayLogo: fixture.away?.logo || "",
    homeTeamId: fixture.home?.id || null,
    awayTeamId: fixture.away?.id || null,
    kickoff: utcDateTimeToIso(fixture.date, fixture.time),
    localDate: fixture.date,
    localTime: fixture.time,
    location: locationZh.location,
    stadium: locationZh.stadium,
    city: locationZh.city,
    locationRaw: fixture.location || "",
    stadiumRaw: String(fixture.location || "").split(",")[0]?.trim() || "",
    cityRaw: String(fixture.location || "").split(",").slice(1).join(",").trim(),
    status: "open",
    homeScore: null,
    awayScore: null,
    source: "worldcupapi",
  };
}

function getFallbackMatches() {
  return FALLBACK_COMPLETE_WORLD_CUP_SCHEDULE.map((match) => ({
    ...match,
    status: "open",
    homeScore: null,
    awayScore: null,
  }));
}

async function fetchWorldCupFixtures() {
  if (!WORLDCUP_API_KEY) throw new Error("缺少 VITE_WORLDCUP_API_KEY");
  const fixtures = [];
  for (let page = 1; page <= 10; page += 1) {
    const response = await fetch(`${WORLDCUP_FIXTURES_URL}?key=${encodeURIComponent(WORLDCUP_API_KEY)}&page=${page}`);
    if (!response.ok) throw new Error(`WorldCupAPI 请求失败：${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) break;
    fixtures.push(...data);
  }
  if (!fixtures.length) throw new Error("WorldCupAPI 没有返回赛程");
  return fixtures.map(normalizeWorldCupFixture);
}

function mapProfile(row) {
  return {
    id: row.id,
    name: row.username || row.email || "未命名用户",
    email: row.email || "",
    avatarEmoji: row.avatar_emoji || DEFAULT_AVATAR_EMOJI,
    isAdmin: Boolean(row.is_admin),
    joinedAt: row.joined_at || new Date().toISOString(),
  };
}

function mapPrediction(row) {
  return {
    id: row.id,
    playerId: row.user_id,
    matchId: row.match_id,
    home: row.home,
    away: row.away,
    submittedAt: row.submitted_at,
  };
}

function mapFunPredictions(rows) {
  return rows.reduce((acc, row) => {
    acc[row.user_id] = {
      champion: row.champion,
      goldenBoot: row.golden_boot,
      firstRedCardTeam: row.first_red_card_team,
      totalGoals: row.total_goals,
      submittedAt: row.submitted_at,
    };
    return acc;
  }, {});
}

function mergeMatchOverrides(rows, baseMatches = getFallbackMatches()) {
  const overrides = new Map(rows.map((row) => [row.match_id, row]));
  return baseMatches.map((match) => {
    const row = overrides.get(match.id);
    if (!row) return { ...match };
    return {
      ...match,
      status: row.status,
      homeScore: row.home_score,
      awayScore: row.away_score,
    };
  });
}

function mapWorldCupResults(rows) {
  return rows.reduce((acc, row) => {
    acc[row.match_no] = { homeScore: row.home_score, awayScore: row.away_score };
    return acc;
  }, {});
}

function mapFunResults(row) {
  if (!row) return { ...emptyFunResults };
  return {
    champion: row.champion || "",
    goldenBoot: row.golden_boot || "",
    firstRedCardTeam: row.first_red_card_team || "",
    totalGoals: row.total_goals ?? "",
  };
}

function getDisplayName(user, fallback = "未命名用户") {
  return user?.user_metadata?.username || user?.email?.split("@")[0] || fallback;
}

const tabs = [
  { id: "home", label: "首页", icon: Home },
  { id: "schedule", label: "赛程竞猜", icon: CalendarDays },
  { id: "completeSchedule", label: "完整赛程", icon: CalendarDays },
  { id: "worldCupStandings", label: "世界杯排名", icon: Medal },
  { id: "ranking", label: "竞猜排行榜", icon: Trophy },
  { id: "fun", label: "趣味预测", icon: Flame },
  { id: "achievements", label: "成就墙", icon: Crown },
  { id: "rules", label: "规则", icon: ShieldCheck },
  { id: "playerProfile", label: "个人主页", icon: Users },
  { id: "admin", label: "管理", icon: Settings, adminOnly: true },
];

function teamName(name) {
  return translateDisplayText(name);
}

function getWorldCupResultKey(match) {
  return match?.resultId || Number(match?.fixtureId) || Number(match?.id) || match?.no;
}

function TeamLogo({ logo, name, size = "h-6 w-6" }) {
  if (!logo) return <span className={`inline-flex ${size} items-center justify-center rounded-full bg-slate-800 text-xs text-slate-400`}>?</span>;
  return <img src={logo} alt={`${name} logo`} className={`${size} rounded-full bg-slate-900 object-contain`} loading="lazy" />;
}

function TeamName({ name, logo, className = "" }) {
  const displayName = translateDisplayText(name);
  return (
    <span className={`inline-flex min-w-0 items-center gap-2 ${className}`}>
      <TeamLogo logo={logo} name={displayName} />
      <span className="truncate">{displayName}</span>
    </span>
  );
}

function getOutcome(home, away) {
  if (home > away) return "H";
  if (home < away) return "A";
  return "D";
}

function isSettledMatch(match) {
  return Boolean(match && match.status === "settled" && Number.isFinite(match.homeScore) && Number.isFinite(match.awayScore));
}

function isWorldCupResultSettled(result) {
  return Boolean(result && Number.isFinite(result.homeScore) && Number.isFinite(result.awayScore));
}

function calculateBasePoints(prediction, match) {
  if (!prediction || !isSettledMatch(match)) return 0;
  if (prediction.home === match.homeScore && prediction.away === match.awayScore) return 4;
  if (getOutcome(match.homeScore, match.awayScore) !== getOutcome(prediction.home, prediction.away)) return 0;
  return match.homeScore - match.awayScore === prediction.home - prediction.away ? 2 : 1;
}

function calculatePoints(prediction, match) {
  if (!match) return 0;
  return calculateBasePoints(prediction, match) * (STAGES[match.stage]?.multiplier || 1);
}

function explainPoints(prediction, match) {
  if (!prediction) return "未竞猜";
  if (!isSettledMatch(match)) return "待结算";
  const base = calculateBasePoints(prediction, match);
  if (base === 4) return "完全猜中比分";
  if (base === 2) return "猜中胜平负 + 净胜球";
  if (base === 1) return "只猜中胜平负";
  return "完全猜错";
}

function formatDateTime(value) {
  return new Intl.DateTimeFormat("zh-CN", { timeZone: "Asia/Shanghai", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", weekday: "short", hour12: false }).format(new Date(value));
}

function formatDateOnly(value) {
  return new Intl.DateTimeFormat("zh-CN", { timeZone: "Asia/Shanghai", month: "2-digit", day: "2-digit", weekday: "long" }).format(new Date(value));
}

function getBeijingDateParts(value) {
  const parts = new Intl.DateTimeFormat("zh-CN", { timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", weekday: "short", hour12: false }).formatToParts(new Date(value));
  return Object.fromEntries(parts.map((part) => [part.type, part.value]));
}

function formatBeijingDateKey(value) {
  const parts = getBeijingDateParts(value);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function formatBeijingTime(value) {
  const parts = getBeijingDateParts(value);
  return `${parts.hour}:${parts.minute}`;
}

function formatBeijingDateTitle(value) {
  const parts = getBeijingDateParts(value);
  return `${parts.month}月${parts.day}日 ${parts.weekday}`;
}

function isSameBeijingDate(a, b) {
  return formatBeijingDateKey(a) === formatBeijingDateKey(b);
}

function isMatchLocked(match, now = new Date()) {
  return Boolean(match.status !== "open" || new Date(match.kickoff).getTime() <= new Date(now).getTime());
}

function formatCountdown(kickoff, now = new Date()) {
  const diff = new Date(kickoff).getTime() - new Date(now).getTime();
  if (diff <= 0) return "已锁定";
  const totalMinutes = Math.floor(diff / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days}天${hours}小时`;
  if (hours > 0) return `${hours}小时${minutes}分钟`;
  return `${minutes}分钟`;
}

function getMostCommonPrediction(playerPredictions) {
  if (!playerPredictions.length) return "暂无";
  const counts = playerPredictions.reduce((acc, prediction) => {
    const key = `${prediction.home}:${prediction.away}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0][0];
}

function getPlayerTitles(player, funPredictions, funResults, predictionStyleRankings, streakRankings, reverseLightPlayer) {
  const titles = [];
  const prediction = funPredictions[player.id];
  const resultTotalGoals = Number(funResults.totalGoals);
  const allGoalPredictions = Object.values(funPredictions).filter((item) => Number.isFinite(Number(item.totalGoals)) && Number.isFinite(resultTotalGoals));
  const closestGoalDiff = allGoalPredictions.length ? Math.min(...allGoalPredictions.map((item) => Math.abs(Number(item.totalGoals) - resultTotalGoals))) : null;

  if (prediction && funResults.champion && isSameDisplayValue(prediction.champion, funResults.champion)) titles.push("世界杯导演");
  if (prediction && funResults.goldenBoot && isSameDisplayValue(prediction.goldenBoot, funResults.goldenBoot)) titles.push("金靴伯乐");
  if (prediction && funResults.firstRedCardTeam && isSameDisplayValue(prediction.firstRedCardTeam, funResults.firstRedCardTeam)) titles.push("我闻到了火药味");
  if (prediction && closestGoalDiff !== null && Number.isFinite(resultTotalGoals) && Math.abs(Number(prediction.totalGoals) - resultTotalGoals) === closestGoalDiff) titles.push("进球神算子");

  const titleSources = [
    [predictionStyleRankings?.exactSnipers, "精准狙击手"],
    [predictionStyleRankings?.steadyMasters, "稳健大师"],
    [predictionStyleRankings?.conservativeMasters, "保守大师"],
    [predictionStyleRankings?.attackingMadmen, "进攻狂魔"],
    [streakRankings, "大预言家"],
  ];

  titleSources.forEach(([list, title]) => {
    const topValue = list?.[0]?.value ?? list?.[0]?.maxStreak ?? 0;
    const current = list?.find((item) => item.id === player.id);
    const currentValue = current?.value ?? current?.maxStreak ?? 0;
    if (currentValue > 0 && currentValue === topValue) titles.push(title);
  });

  if (reverseLightPlayer?.id === player.id) titles.push("毒奶之王");
  return [...new Set(titles)];
}

function formatAchievementTime(value) {
  return value ? formatDateTime(value) : "--";
}

function useCurrentTime() {
  const [now, setNow] = useState(new Date());
  React.useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(timer);
  }, []);
  return now;
}

function groupByDate(matches) {
  return matches.reduce((acc, match) => {
    const date = formatDateOnly(match.kickoff);
    if (!acc[date]) acc[date] = [];
    acc[date].push(match);
    return acc;
  }, {});
}

function filterVisibleScheduleMatches(matches, now = new Date(), recentPastDaysToKeep = 2) {
  const groups = matches.reduce((acc, match) => {
    const key = formatBeijingDateKey(match.kickoff);
    if (!acc[key]) acc[key] = [];
    acc[key].push(match);
    return acc;
  }, {});

  const groupEntries = Object.entries(groups)
    .map(([dateKey, items]) => ({
      dateKey,
      items: [...items].sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime()),
    }))
    .sort((a, b) => a.dateKey.localeCompare(b.dateKey));

  const nowTime = new Date(now).getTime();
  const pastGroups = groupEntries.filter(({ items }) => new Date(items[items.length - 1]?.kickoff).getTime() < nowTime);
  const visiblePastKeys = new Set(pastGroups.slice(-recentPastDaysToKeep).map((group) => group.dateKey));

  return groupEntries
    .filter(({ dateKey, items }) => {
      const lastKickoffTime = new Date(items[items.length - 1]?.kickoff).getTime();
      return lastKickoffTime >= nowTime || visiblePastKeys.has(dateKey);
    })
    .flatMap(({ items }) => items);
}

function createEmptyTeamStanding(group, team, logo = "") {
  return { group, team, logo, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0 };
}

function buildWorldCupStandings(schedule, results) {
  const groupMatches = schedule.filter((match) => /^[A-L]组$/.test(match.group));
  const tableMap = new Map();

  groupMatches.forEach((match) => {
    [[match.home, match.homeLogo], [match.away, match.awayLogo]].forEach(([team, logo]) => {
      const key = `${match.group}-${team}`;
      if (!tableMap.has(key)) tableMap.set(key, createEmptyTeamStanding(match.group, team, logo));
    });
  });

  groupMatches.forEach((match) => {
    const result = results[getWorldCupResultKey(match)];
    if (!isWorldCupResultSettled(result)) return;

    const homeKey = `${match.group}-${match.home}`;
    const awayKey = `${match.group}-${match.away}`;
    const homeTeam = tableMap.get(homeKey);
    const awayTeam = tableMap.get(awayKey);
    if (!homeTeam || !awayTeam) return;

    homeTeam.played += 1;
    awayTeam.played += 1;
    homeTeam.goalsFor += result.homeScore;
    homeTeam.goalsAgainst += result.awayScore;
    awayTeam.goalsFor += result.awayScore;
    awayTeam.goalsAgainst += result.homeScore;

    if (result.homeScore > result.awayScore) {
      homeTeam.won += 1;
      homeTeam.points += 3;
      awayTeam.lost += 1;
    } else if (result.homeScore < result.awayScore) {
      awayTeam.won += 1;
      awayTeam.points += 3;
      homeTeam.lost += 1;
    } else {
      homeTeam.drawn += 1;
      awayTeam.drawn += 1;
      homeTeam.points += 1;
      awayTeam.points += 1;
    }

    homeTeam.goalDifference = homeTeam.goalsFor - homeTeam.goalsAgainst;
    awayTeam.goalDifference = awayTeam.goalsFor - awayTeam.goalsAgainst;
  });

  return Array.from(tableMap.values()).reduce((acc, team) => {
    if (!acc[team.group]) acc[team.group] = [];
    acc[team.group].push(team);
    return acc;
  }, {});
}

function sortStandingsTable(table) {
  return [...table].sort((a, b) =>
    b.points - a.points ||
    b.goalDifference - a.goalDifference ||
    b.goalsFor - a.goalsFor ||
    a.team.localeCompare(b.team, "zh-CN")
  );
}

function getQualificationLabel(index) {
  if (index < 2) return { label: "直接出线区", className: "bg-emerald-500/15 text-emerald-200" };
  if (index === 2) return { label: "小组第三竞争区", className: "bg-amber-500/15 text-amber-200" };
  return { label: "待追赶", className: "bg-slate-800 text-slate-400" };
}

function Pill({ children, className = "" }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${className}`}>{children}</span>;
}

function Card({ children, className = "" }) {
  return <div className={`rounded-2xl border border-slate-700/70 bg-slate-900/80 p-4 shadow-xl ${className}`}>{children}</div>;
}

function DarkButton({ children, className = "", ...props }) {
  return <button className={`rounded-xl bg-slate-800 text-slate-100 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40 ${className}`} {...props}>{children}</button>;
}

function AvatarBadge({ children, size = "h-10 w-10", text = "text-xl" }) {
  return <div className={`flex ${size} items-center justify-center rounded-xl border border-slate-700 bg-slate-800 ${text} text-slate-100`}>{children}</div>;
}

function UserBadge({ player, size = "h-10 w-10", text = "text-sm" }) {
  const label = (player?.name || player?.email || "").trim().slice(0, 1).toUpperCase();
  return (
    <div className={`flex ${size} shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 ${text} font-black text-slate-100`}>
      {player?.avatarEmoji || label || <User className="h-4 w-4" />}
    </div>
  );
}

function UserNameOnly({ player, className = "", mono = false, wrap = false }) {
  return (
    <span
      title={player?.name || player?.email || "未命名用户"}
      className={`block min-w-0 text-slate-100 ${mono ? "font-mono font-semibold tracking-tight" : "font-black"} ${wrap ? "whitespace-normal break-all" : "truncate"} ${className}`}
    >
      {player?.name || player?.email || "未命名用户"}
    </span>
  );
}

function EmojiPicker({ value, onChange, disabled = false }) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {AVATAR_EMOJIS.map((emoji) => {
        const selected = value === emoji;
        return (
          <button
            key={emoji}
            type="button"
            disabled={disabled}
            onClick={() => onChange(emoji)}
            className={`flex h-10 w-full items-center justify-center rounded-xl border text-xl transition disabled:cursor-not-allowed disabled:opacity-50 ${selected ? "border-cyan-300 bg-cyan-500/15 shadow-lg shadow-cyan-950/30" : "border-slate-700 bg-slate-950 hover:bg-slate-800"}`}
            aria-label={`选择 ${emoji} 作为头像`}
          >
            {emoji}
          </button>
        );
      })}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-slate-800/70" />
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-slate-800 p-3"><Icon className="h-5 w-5" /></div>
        <div>
          <div className="text-sm text-slate-400">{label}</div>
          <div className="text-2xl font-black tracking-tight text-slate-100">{value}</div>
          {sub && <div className="mt-1 text-xs text-slate-500">{sub}</div>}
        </div>
      </div>
    </Card>
  );
}

function LoadingScreen({ message = "正在加载..." }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100">
      <div className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900 px-5 py-4">
        <Loader2 className="h-5 w-5 animate-spin text-cyan-200" />
        <span className="text-sm font-bold text-slate-300">{message}</span>
      </div>
    </div>
  );
}

function SupabaseSetupScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100">
      <Card className="max-w-xl">
        <div className="mb-3 flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-cyan-200" />
          <h1 className="text-2xl font-black">需要配置 Supabase</h1>
        </div>
        <p className="text-sm leading-relaxed text-slate-400">
          请根据 .env.example 创建 .env.local，并填写 VITE_SUPABASE_URL、VITE_SUPABASE_ANON_KEY 和 VITE_ADMIN_EMAILS。
        </p>
      </Card>
    </div>
  );
}

function AuthScreen({ onSignedIn }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [avatarEmoji, setAvatarEmoji] = useState(DEFAULT_AVATAR_EMOJI);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const isRegister = mode === "register";

  async function submitAuth(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const cleanEmail = email.trim();
      const cleanUsername = username.trim();
      if (isRegister && !cleanUsername) throw new Error("请填写用户名");
      if (!cleanEmail || !password) throw new Error("请填写邮箱和密码");

      if (isRegister) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: { data: { username: cleanUsername, avatar_emoji: avatarEmoji } },
        });
        if (signUpError) throw signUpError;
        if (data.user) {
          await supabase.from("profiles").insert({
            id: data.user.id,
            email: data.user.email || cleanEmail,
            username: cleanUsername,
            avatar_emoji: avatarEmoji,
          });
        }
        if (data.session) {
          onSignedIn?.(data.session);
        } else {
          setMessage("注册成功，请检查邮箱验证后再登录。");
          setMode("login");
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
        if (signInError) throw signInError;
        onSignedIn?.(data.session);
      }
    } catch (authError) {
      setError(authError.message || "操作失败，请稍后再试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-700 bg-slate-900">
            <Trophy className="h-8 w-8 text-cyan-200" />
          </div>
          <h1 className="text-3xl font-black">世界杯竞猜局</h1>
          <p className="mt-2 text-sm text-slate-400">登录后才能提交竞猜、查看朋友预测和排行榜。</p>
        </div>
        <Card>
          <div className="mb-5 grid grid-cols-2 rounded-2xl bg-slate-950 p-1">
            <button type="button" onClick={() => setMode("login")} className={`rounded-xl px-3 py-2 text-sm font-black ${!isRegister ? "bg-slate-800 text-slate-50" : "text-slate-500"}`}>登录</button>
            <button type="button" onClick={() => setMode("register")} className={`rounded-xl px-3 py-2 text-sm font-black ${isRegister ? "bg-slate-800 text-slate-50" : "text-slate-500"}`}>注册</button>
          </div>
          <form onSubmit={submitAuth} className="space-y-4">
            {isRegister && (
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-300">用户名</span>
                <div className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3">
                  <User className="h-4 w-4 text-slate-500" />
                  <input value={username} onChange={(event) => setUsername(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-500" placeholder="例如 Oscar" />
                </div>
              </label>
            )}
            {isRegister && (
              <div>
                <div className="mb-2 text-sm font-bold text-slate-300">选择头像</div>
                <EmojiPicker value={avatarEmoji} onChange={setAvatarEmoji} disabled={loading} />
              </div>
            )}
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-300">邮箱</span>
              <div className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3">
                <Mail className="h-4 w-4 text-slate-500" />
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-500" placeholder="you@example.com" />
              </div>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-300">密码</span>
              <div className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3">
                <KeyRound className="h-4 w-4 text-slate-500" />
                <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-500" placeholder="至少 6 位密码" />
              </div>
            </label>
            {error && <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">{error}</div>}
            {message && <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">{message}</div>}
            <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-700 px-4 py-3 text-sm font-black text-cyan-50 transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-50">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isRegister ? "注册并进入" : "登录竞猜"}
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
}

function MatchStatus({ match }) {
  if (match.status === "settled") return <Pill className="bg-emerald-500/15 text-emerald-200">已结算</Pill>;
  if (isMatchLocked(match)) return <Pill className="bg-amber-500/15 text-amber-200">已锁定</Pill>;
  return <Pill className="bg-sky-500/15 text-sky-200">可竞猜</Pill>;
}

function MatchCountdown({ match, now }) {
  if (match.status === "settled") return <Pill className="bg-emerald-500/15 text-emerald-200">已结束</Pill>;
  if (isMatchLocked(match, now)) return <Pill className="bg-amber-500/15 text-amber-200">已锁定</Pill>;
  return <Pill className="bg-cyan-500/15 text-cyan-200">距离锁定：{formatCountdown(match.kickoff, now)}</Pill>;
}

function MatchScore({ match }) {
  if (!Number.isFinite(match.homeScore) || !Number.isFinite(match.awayScore)) return <span className="text-slate-500">vs</span>;
  return <span className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1 text-base font-black text-slate-100">{match.homeScore} : {match.awayScore}</span>;
}

export default function WorldCupPredictionMVP() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState("");
  const [activeTab, setActiveTab] = useState("home");
  const [players, setPlayers] = useState(initialPlayers);
  const [currentPlayerId, setCurrentPlayerId] = useState("");
  const [completeSchedule, setCompleteSchedule] = useState(FALLBACK_COMPLETE_WORLD_CUP_SCHEDULE);
  const [scheduleSource, setScheduleSource] = useState("fallback");
  const [matches, setMatches] = useState(getFallbackMatches());
  const [predictions, setPredictions] = useState([]);
  const [funPredictions, setFunPredictions] = useState({});
  const [funResults, setFunResults] = useState(emptyFunResults);
  const [worldCupResults, setWorldCupResults] = useState({});
  const [selectedMatchId, setSelectedMatchId] = useState(FALLBACK_COMPLETE_WORLD_CUP_SCHEDULE[0]?.id || "");
  const [selectedProfilePlayerId, setSelectedProfilePlayerId] = useState("");
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("ALL");

  const currentTime = useCurrentTime();
  const fallbackPlayer = session?.user ? {
    id: session.user.id,
    name: getDisplayName(session.user),
    email: session.user.email || "",
    avatarEmoji: session.user.user_metadata?.avatar_emoji || DEFAULT_AVATAR_EMOJI,
    isAdmin: false,
    joinedAt: session.user.created_at || new Date().toISOString(),
  } : null;
  const currentPlayer = players.find((p) => p.id === currentPlayerId) || fallbackPlayer || players[0];
  const profilePlayer = players.find((p) => p.id === selectedProfilePlayerId) || currentPlayer;
  const isAdmin = Boolean(currentPlayer?.isAdmin);
  const visibleTabs = tabs.filter((tab) => !tab.adminOnly || isAdmin);
  const firstKickoff = useMemo(() => matches.reduce((earliest, match) => {
    const kickoff = new Date(match.kickoff);
    return kickoff < earliest ? kickoff : earliest;
  }, new Date(matches[0]?.kickoff || Date.now())), [matches]);
  const funPredictionLocked = new Date() >= firstKickoff;

  React.useEffect(() => {
    if (!isSupabaseConfigured) {
      setAuthLoading(false);
      return undefined;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthLoading(false);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function ensureProfile(user) {
    const email = user.email || "";
    const { data: existing, error: selectError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();
    if (selectError) throw selectError;
    if (existing) return;

    const { error } = await supabase.from("profiles").insert({
      id: user.id,
      email,
      username: getDisplayName(user),
      avatar_emoji: user.user_metadata?.avatar_emoji || DEFAULT_AVATAR_EMOJI,
    });
    if (error) throw error;
  }

  async function loadSupabaseData(baseMatches) {
    const [
      profilesResult,
      predictionsResult,
      funPredictionsResult,
      matchOverridesResult,
      worldCupResultsResult,
      funResultsResult,
    ] = await Promise.all([
      supabase.from("profiles").select("*").order("joined_at", { ascending: true }),
      supabase.from("predictions").select("*").order("submitted_at", { ascending: true }),
      supabase.from("fun_predictions").select("*"),
      supabase.from("match_overrides").select("*"),
      supabase.from("world_cup_results").select("*"),
      supabase.from("fun_results").select("*").eq("id", "main").maybeSingle(),
    ]);

    const firstError = [
      profilesResult,
      predictionsResult,
      funPredictionsResult,
      matchOverridesResult,
      worldCupResultsResult,
      funResultsResult,
    ].find((result) => result.error)?.error;
    if (firstError) throw firstError;

    const validMatchIds = new Set(baseMatches.map((match) => match.id));
    setPlayers((profilesResult.data || []).map(mapProfile));
    setPredictions((predictionsResult.data || []).map(mapPrediction).filter((prediction) => validMatchIds.has(prediction.matchId)));
    setFunPredictions(mapFunPredictions(funPredictionsResult.data || []));
    setMatches(mergeMatchOverrides(matchOverridesResult.data || [], baseMatches));
    setWorldCupResults(mapWorldCupResults(worldCupResultsResult.data || []));
    setFunResults(mapFunResults(funResultsResult.data));
  }

  React.useEffect(() => {
    let cancelled = false;
    async function bootstrapData() {
      if (!session?.user) {
        setPlayers([]);
        setPredictions([]);
        setFunPredictions({});
        setCompleteSchedule(FALLBACK_COMPLETE_WORLD_CUP_SCHEDULE);
        setScheduleSource("fallback");
        setMatches(getFallbackMatches());
        setWorldCupResults({});
        setFunResults(emptyFunResults);
        setCurrentPlayerId("");
        setSelectedProfilePlayerId("");
        return;
      }

      setDataLoading(true);
      setDataError("");
      try {
        let baseSchedule = FALLBACK_COMPLETE_WORLD_CUP_SCHEDULE;
        let baseMatches = getFallbackMatches();
        try {
          baseSchedule = await fetchWorldCupFixtures();
          baseMatches = baseSchedule.map((match) => ({ ...match }));
          setScheduleSource("worldcupapi");
        } catch (scheduleError) {
          setScheduleSource("fallback");
          setDataError(`${scheduleError.message || "官方赛程加载失败"}，已使用本地备用赛程。`);
        }
        setCompleteSchedule(baseSchedule);
        setMatches(baseMatches);
        setSelectedMatchId((prev) => (baseMatches.some((match) => match.id === prev) ? prev : baseMatches[0]?.id || ""));
        await ensureProfile(session.user);
        if (cancelled) return;
        await loadSupabaseData(baseMatches);
        if (cancelled) return;
        setCurrentPlayerId(session.user.id);
        setSelectedProfilePlayerId((prev) => prev || session.user.id);
      } catch (error) {
        if (!cancelled) setDataError(error.message || "加载 Supabase 数据失败");
      } finally {
        if (!cancelled) setDataLoading(false);
      }
    }
    bootstrapData();
    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  React.useEffect(() => {
    if (!isAdmin && activeTab === "admin") setActiveTab("home");
  }, [isAdmin, activeTab]);

  const rankings = useMemo(() => players.map((player) => {
    const playerPredictions = predictions.filter((p) => p.playerId === player.id);
    const settledPredictions = playerPredictions.filter((p) => isSettledMatch(matches.find((m) => m.id === p.matchId)));
    const total = settledPredictions.reduce((sum, p) => sum + calculatePoints(p, matches.find((m) => m.id === p.matchId)), 0);
    const exactCount = settledPredictions.filter((p) => calculateBasePoints(p, matches.find((m) => m.id === p.matchId)) === 4).length;
    const outcomeCount = settledPredictions.filter((p) => calculateBasePoints(p, matches.find((m) => m.id === p.matchId)) > 0).length;
    return { ...player, total, exactCount, outcomeCount, played: playerPredictions.length };
  }).sort((a, b) => b.total - a.total || b.exactCount - a.exactCount || b.outcomeCount - a.outcomeCount || b.played - a.played || new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime()), [players, predictions, matches]);

  const rankingTrend = useMemo(() => {
    const settledMatches = matches.filter(isSettledMatch).sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime());
    return settledMatches.map((currentMatch, index) => {
      const includedMatchIds = new Set(settledMatches.slice(0, index + 1).map((m) => m.id));
      const snapshot = players.map((player) => {
        const playerPredictions = predictions.filter((p) => p.playerId === player.id && includedMatchIds.has(p.matchId));
        const total = playerPredictions.reduce((sum, prediction) => sum + calculatePoints(prediction, matches.find((m) => m.id === prediction.matchId)), 0);
        const exactCount = playerPredictions.filter((prediction) => calculateBasePoints(prediction, matches.find((m) => m.id === prediction.matchId)) === 4).length;
        const outcomeCount = playerPredictions.filter((prediction) => calculateBasePoints(prediction, matches.find((m) => m.id === prediction.matchId)) > 0).length;
        return { ...player, total, exactCount, outcomeCount, played: playerPredictions.length };
      }).sort((a, b) => b.total - a.total || b.exactCount - a.exactCount || b.outcomeCount - a.outcomeCount || b.played - a.played || new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime());
      const row = { label: `第${index + 1}场`, match: `${teamName(currentMatch.home)} ${currentMatch.homeScore}:${currentMatch.awayScore} ${teamName(currentMatch.away)}` };
      snapshot.forEach((player) => { row[player.id] = player.total; });
      return row;
    });
  }, [players, predictions, matches]);

  const streakRankings = useMemo(() => {
    const settledMatches = matches.filter(isSettledMatch).sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime());
    return players.map((player) => {
      let currentStreak = 0;
      let maxStreak = 0;
      settledMatches.forEach((match) => {
        const prediction = predictions.find((p) => p.playerId === player.id && p.matchId === match.id);
        if (prediction && calculateBasePoints(prediction, match) > 0) {
          currentStreak += 1;
          maxStreak = Math.max(maxStreak, currentStreak);
        } else {
          currentStreak = 0;
        }
      });
      return { ...player, maxStreak };
    }).sort((a, b) => b.maxStreak - a.maxStreak || new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime());
  }, [players, predictions, matches]);

  const reverseLightPlayer = useMemo(() => [...rankings].sort((a, b) => a.total - b.total || a.exactCount - b.exactCount || a.outcomeCount - b.outcomeCount || b.played - a.played)[0], [rankings]);

  const dailyBestPlayers = useMemo(() => {
    const settledMatches = matches.filter(isSettledMatch).sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime());
    const dates = [...new Set(settledMatches.map((match) => formatDateOnly(match.kickoff)))];
    return dates.map((date) => {
      const matchesOnDate = settledMatches.filter((match) => formatDateOnly(match.kickoff) === date);
      const scores = players.map((player) => {
        const score = matchesOnDate.reduce((sum, match) => {
          const prediction = predictions.find((p) => p.playerId === player.id && p.matchId === match.id);
          return sum + calculatePoints(prediction, match);
        }, 0);
        return { ...player, score };
      });
      const topScore = Math.max(...scores.map((player) => player.score), 0);
      const winners = topScore > 0 ? scores.filter((player) => player.score === topScore) : [];
      return { date, matchCount: matchesOnDate.length, topScore, winners };
    }).slice(-3).reverse();
  }, [players, predictions, matches]);

  const predictionStyleRankings = useMemo(() => {
    const settledMatches = matches.filter(isSettledMatch);
    const buildRank = (getValue) => players.map((player) => ({ ...player, value: getValue(player) })).sort((a, b) => b.value - a.value || new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime());
    return {
      exactSnipers: buildRank((player) => settledMatches.filter((match) => {
        const prediction = predictions.find((p) => p.playerId === player.id && p.matchId === match.id);
        return prediction && calculateBasePoints(prediction, match) === 4;
      }).length),
      steadyMasters: buildRank((player) => settledMatches.filter((match) => {
        const prediction = predictions.find((p) => p.playerId === player.id && p.matchId === match.id);
        return prediction && calculateBasePoints(prediction, match) > 0;
      }).length),
      conservativeMasters: buildRank((player) => predictions.filter((prediction) => prediction.playerId === player.id && prediction.home === prediction.away).length),
      attackingMadmen: buildRank((player) => predictions.filter((prediction) => prediction.playerId === player.id && prediction.home + prediction.away >= 4).length),
    };
  }, [players, predictions, matches]);

  const achievementCollections = useMemo(() => buildAchievementCollections({
    players,
    currentPlayerId,
    predictions,
    matches,
    funPredictions,
    funResults,
  }), [players, currentPlayerId, predictions, matches, funPredictions, funResults]);

  const myStats = rankings.find((p) => p.id === currentPlayerId);
  const filteredMatches = useMemo(() => matches.filter((match) => {
    const text = `${match.home}${match.away}${match.homeRaw || ""}${match.awayRaw || ""}${match.group}${STAGES[match.stage]?.label || ""}`.toLowerCase();
    return text.includes(query.toLowerCase()) && (stageFilter === "ALL" || match.stage === stageFilter);
  }), [matches, query, stageFilter]);
  const scheduleVisibleMatches = useMemo(() => filterVisibleScheduleMatches(filteredMatches, currentTime, 2), [filteredMatches, currentTime]);
  const groupedMatches = groupByDate(scheduleVisibleMatches);
  const unPredictedCount = matches.filter((match) => !predictions.some((p) => p.playerId === currentPlayerId && p.matchId === match.id)).length;
  const settledCount = matches.filter(isSettledMatch).length;
  const worldCupStandings = useMemo(() => buildWorldCupStandings(completeSchedule, worldCupResults), [completeSchedule, worldCupResults]);
  const worldCupSettledCount = useMemo(() => Object.values(worldCupResults).filter(isWorldCupResultSettled).length, [worldCupResults]);

  React.useEffect(() => {
    setSelectedMatchId((prev) => {
      if (!scheduleVisibleMatches.length) return "";
      return scheduleVisibleMatches.some((match) => match.id === prev) ? prev : scheduleVisibleMatches[0].id;
    });
  }, [scheduleVisibleMatches]);

  async function upsertPrediction(matchId, home, away) {
    const match = matches.find((m) => m.id === matchId);
    if (!currentPlayerId || !match || isMatchLocked(match, currentTime) || !Number.isFinite(home) || !Number.isFinite(away)) return;
    const safeHome = Math.max(0, Math.floor(home));
    const safeAway = Math.max(0, Math.floor(away));
    const submittedAt = new Date().toISOString();
    const { data, error } = await supabase
      .from("predictions")
      .upsert({
        user_id: currentPlayerId,
        match_id: matchId,
        home: safeHome,
        away: safeAway,
        submitted_at: submittedAt,
      }, { onConflict: "user_id,match_id" })
      .select()
      .single();
    if (error) {
      setDataError(error.message);
      return;
    }
    const saved = mapPrediction(data);
    setPredictions((prev) => {
      const existing = prev.find((p) => p.playerId === currentPlayerId && p.matchId === matchId);
      if (existing) return prev.map((p) => (p.id === existing.id ? saved : p));
      return [...prev, saved];
    });
  }

  async function updateMatchResult(matchId, homeScore, awayScore) {
    if (!isAdmin || !Number.isFinite(homeScore) || !Number.isFinite(awayScore)) return;
    const match = matches.find((item) => item.id === matchId);
    if (!match) return;
    const nextHome = Math.max(0, Math.floor(homeScore));
    const nextAway = Math.max(0, Math.floor(awayScore));
    const resultKey = getWorldCupResultKey(match);
    const { error } = await supabase.rpc("admin_set_match_result", {
      p_match_id: matchId,
      p_match_no: resultKey,
      p_home_score: nextHome,
      p_away_score: nextAway,
    });
    if (error) {
      setDataError(error.message);
      return;
    }
    setMatches((prev) => prev.map((m) => m.id === matchId ? { ...m, homeScore: nextHome, awayScore: nextAway, status: "settled" } : m));
    setWorldCupResults((prev) => ({
      ...prev,
      [resultKey]: { homeScore: nextHome, awayScore: nextAway },
    }));
  }

  async function clearMatchResult(matchId) {
    if (!isAdmin) return;
    const match = matches.find((item) => item.id === matchId);
    if (!match) return;
    const resultKey = getWorldCupResultKey(match);
    const { error } = await supabase.rpc("admin_clear_match_result", {
      p_match_id: matchId,
      p_match_no: resultKey,
    });
    if (error) {
      setDataError(error.message);
      return;
    }
    setMatches((prev) => prev.map((m) => m.id === matchId ? { ...m, homeScore: null, awayScore: null, status: "open" } : m));
    setWorldCupResults((prev) => {
      const next = { ...prev };
      delete next[resultKey];
      return next;
    });
  }

  async function toggleLock(matchId) {
    if (!isAdmin) return;
    const match = matches.find((item) => item.id === matchId);
    if (!match || match.status === "settled") return;
    const nextStatus = match.status === "open" ? "closed" : "open";
    const { error } = await supabase.rpc("admin_set_match_lock", {
      p_match_id: matchId,
      p_status: nextStatus,
      p_home_score: match.homeScore,
      p_away_score: match.awayScore,
    });
    if (error) {
      setDataError(error.message);
      return;
    }
    setMatches((prev) => prev.map((m) => m.id === matchId ? { ...m, status: nextStatus } : m));
  }

  async function saveFunPrediction(champion, goldenBoot, firstRedCardTeam, totalGoals) {
    if (!currentPlayerId || funPredictionLocked) return;
    const cleanChampion = champion.trim();
    const cleanGoldenBoot = goldenBoot.trim();
    const cleanFirstRedCardTeam = firstRedCardTeam.trim();
    const cleanTotalGoalsText = String(totalGoals).trim();
    const cleanTotalGoals = Number(cleanTotalGoalsText);
    if (!cleanChampion || !cleanGoldenBoot || !cleanFirstRedCardTeam || !cleanTotalGoalsText || !Number.isFinite(cleanTotalGoals)) return;
    const submittedAt = new Date().toISOString();
    const { error } = await supabase.from("fun_predictions").upsert({
      user_id: currentPlayerId,
      champion: cleanChampion,
      golden_boot: cleanGoldenBoot,
      first_red_card_team: cleanFirstRedCardTeam,
      total_goals: cleanTotalGoals,
      submitted_at: submittedAt,
    });
    if (error) {
      setDataError(error.message);
      return;
    }
    setFunPredictions((prev) => ({
      ...prev,
      [currentPlayerId]: { champion: cleanChampion, goldenBoot: cleanGoldenBoot, firstRedCardTeam: cleanFirstRedCardTeam, totalGoals: cleanTotalGoals, submittedAt },
    }));
  }

  async function saveFunResults(nextResults) {
    if (!isAdmin) return;
    const { error } = await supabase.rpc("admin_save_fun_results", {
      p_champion: nextResults.champion || "",
      p_golden_boot: nextResults.goldenBoot || "",
      p_first_red_card_team: nextResults.firstRedCardTeam || "",
      p_total_goals: nextResults.totalGoals === "" ? null : Number(nextResults.totalGoals),
    });
    if (error) {
      setDataError(error.message);
      return;
    }
    setFunResults(nextResults);
  }

  async function updateProfile(profile) {
    if (!currentPlayer) return false;
    const cleanUsername = String(profile?.username || "").trim();
    if (!cleanUsername) {
      setDataError("请填写用户名");
      return false;
    }
    setDataError("");
    const { data, error } = await supabase
      .rpc("update_my_profile", {
        p_username: cleanUsername,
        p_avatar_emoji: profile?.avatarEmoji || DEFAULT_AVATAR_EMOJI,
      });
    if (error) {
      setDataError(error.message);
      return false;
    }
    const updatedPlayer = mapProfile(data);
    setPlayers((prev) => prev.map((player) => (player.id === updatedPlayer.id ? updatedPlayer : player)));
    return true;
  }

  function openPlayerProfile(playerId) {
    setSelectedProfilePlayerId(playerId);
    setActiveTab("playerProfile");
  }

  async function signOut() {
    await supabase.auth.signOut();
    setActiveTab("home");
  }

  if (!isSupabaseConfigured) return <SupabaseSetupScreen />;
  if (authLoading) return <LoadingScreen message="正在检查登录状态..." />;
  if (!session) return <AuthScreen onSignedIn={setSession} />;
  if (dataLoading && !players.length) return <LoadingScreen message="正在加载竞猜数据..." />;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row">
        <aside className="lg:sticky lg:top-6 lg:h-[calc(100vh-48px)] lg:w-72">
          <Card className="h-full bg-slate-950/80">
            <div className="flex items-center gap-3">
              <AvatarBadge size="h-12 w-12" text="text-xl"><Trophy className="h-7 w-7" /></AvatarBadge>
              <div><div className="text-lg font-black">世界杯竞猜局</div><div className="text-xs text-slate-500">Oscar&apos;s World Cup Room</div></div>
            </div>
            <div className="mt-5 rounded-2xl bg-slate-800/60 p-3">
              <div className="flex items-center gap-3">
                <UserBadge player={currentPlayer} size="h-11 w-11" text="text-base" />
                <div className="min-w-0">
                  <div className="truncate font-black">{currentPlayer?.name}</div>
                  <div className="truncate text-xs text-slate-500">{currentPlayer?.email}</div>
                </div>
              </div>
              {isAdmin && <Pill className="mt-3 bg-emerald-500/15 text-emerald-200">管理员</Pill>}
              <DarkButton onClick={signOut} className="mt-3 flex w-full items-center justify-center gap-2 px-3 py-2 text-sm font-black"><LogOut className="h-4 w-4" />退出登录</DarkButton>
              {dataError && <div className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-100">{dataError}</div>}
            </div>
            <nav className="mt-5 space-y-2">
              {visibleTabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return <button key={tab.id} onClick={() => { if (tab.id === "playerProfile") setSelectedProfilePlayerId(currentPlayerId); setActiveTab(tab.id); }} className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold transition ${active ? "bg-slate-800 text-slate-50 shadow-lg" : "bg-slate-900/70 text-slate-400 hover:bg-slate-800 hover:text-slate-100"}`}><Icon className="h-4 w-4" />{tab.label}</button>;
              })}
            </nav>
          </Card>
        </aside>
        <main className="min-w-0 flex-1">
          {activeTab === "home" && <HomePanel matches={matches} predictions={predictions} currentPlayerId={currentPlayerId} myStats={myStats} unPredictedCount={unPredictedCount} players={players} rankings={rankings} currentTime={currentTime} setSelectedMatchId={setSelectedMatchId} setActiveTab={setActiveTab} onOpenPlayerProfile={openPlayerProfile} />}
          {activeTab === "completeSchedule" && <FullScheduleCalendar schedule={completeSchedule} source={scheduleSource} />}
          {activeTab === "worldCupStandings" && <WorldCupStandingsPanel standings={worldCupStandings} settledCount={worldCupSettledCount} />}
          {activeTab === "schedule" && <SchedulePanel predictions={predictions} currentPlayerId={currentPlayerId} query={query} setQuery={setQuery} stageFilter={stageFilter} setStageFilter={setStageFilter} groupedMatches={groupedMatches} selectedMatchId={selectedMatchId} setSelectedMatchId={setSelectedMatchId} upsertPrediction={upsertPrediction} players={players} currentTime={currentTime} onOpenPlayerProfile={openPlayerProfile} />}
          {activeTab === "playerProfile" && <PlayerProfilePanel player={profilePlayer} currentPlayerId={currentPlayerId} players={players} rankings={rankings} predictions={predictions} matches={matches} streakRankings={streakRankings} predictionStyleRankings={predictionStyleRankings} reverseLightPlayer={reverseLightPlayer} funPredictions={funPredictions} funResults={funResults} achievementCollections={achievementCollections} onUpdateProfile={updateProfile} onBack={() => setActiveTab("ranking")} onOpenAchievements={() => setActiveTab("achievements")} onOpenFullHistory={(playerId) => { setSelectedProfilePlayerId(playerId); setActiveTab("allHistory"); }} />}
          {activeTab === "allHistory" && <AllHistoryPanel player={profilePlayer} predictions={predictions} matches={matches} onBack={() => setActiveTab("playerProfile")} />}
          {activeTab === "fun" && <FunPredictionPanel currentPlayer={currentPlayer} players={players} funPredictions={funPredictions} onSave={saveFunPrediction} locked={funPredictionLocked} firstKickoff={firstKickoff} funResults={funResults} />}
          {activeTab === "achievements" && <AchievementsPanel players={players} currentPlayerId={currentPlayerId} achievementCollections={achievementCollections} />}
          {activeTab === "ranking" && <RankingPanel players={players} rankingTrend={rankingTrend} predictionStyleRankings={predictionStyleRankings} streakRankings={streakRankings} reverseLightPlayer={reverseLightPlayer} dailyBestPlayers={dailyBestPlayers} rankings={rankings} currentPlayerId={currentPlayerId} settledCount={settledCount} onOpenPlayerProfile={openPlayerProfile} />}
          {isAdmin && activeTab === "admin" && <AdminPanel matches={matches} players={players} predictions={predictions} updateMatchResult={updateMatchResult} clearMatchResult={clearMatchResult} toggleLock={toggleLock} funResults={funResults} onSetFunResults={saveFunResults} />}
          {activeTab === "rules" && <RulesPanel />}
        </main>
      </div>
    </div>
  );
}

function HomePanel({ matches, predictions, currentPlayerId, myStats, unPredictedCount, rankings, currentTime, setSelectedMatchId, setActiveTab, onOpenPlayerProfile }) {
  const sortedMatches = [...matches].sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime());
  const todayMatches = sortedMatches.filter((match) => isSameBeijingDate(match.kickoff, currentTime));
  const soonLockMatches = sortedMatches.filter((match) => !isMatchLocked(match, currentTime)).slice(0, 6);

  function openMatch(matchId) {
    setSelectedMatchId(matchId);
    setActiveTab("schedule");
  }

  return (
    <section className="mt-6 space-y-6">
      <Card>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black">竞猜排行榜前三</h2>
            <p className="text-sm text-slate-400">点击玩家名字进入个人主页。</p>
          </div>
          <DarkButton onClick={() => setActiveTab("ranking")} className="px-3 py-2 text-sm font-bold">查看完整榜单</DarkButton>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {rankings.slice(0, 3).map((player, index) => (
            <button key={player.id} onClick={() => onOpenPlayerProfile(player.id)} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-700 bg-slate-950 p-3 text-left transition hover:bg-slate-800/80">
              <div className="flex min-w-0 items-center gap-3">
                <UserBadge player={player} size="h-9 w-9" />
                <div className="min-w-0">
                  <div className="truncate text-sm font-black md:text-base">#{index + 1} {player.name}</div>
                  <div className="truncate text-xs text-slate-500">命中比分 {player.exactCount} 场</div>
                </div>
              </div>
              <div className="shrink-0 text-lg font-black md:text-xl">{player.total}</div>
            </button>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard icon={Crown} label="我的积分" value={`${myStats?.total || 0}分`} sub="已结算比赛累计" />
        <StatCard icon={Medal} label="命中比分" value={`${myStats?.exactCount || 0}场`} sub="完全猜中比分" />
        <StatCard icon={CalendarDays} label="未竞猜" value={`${unPredictedCount}场`} sub="记得开赛前提交" />
        <StatCard icon={Users} label="当前排名" value={`#${rankings.findIndex((player) => player.id === currentPlayerId) + 1 || "-"}`} sub="点击玩家名可查看主页" />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <HomeMatchSection title="今日比赛" subtitle="按北京时间统计今天的比赛" matches={todayMatches} predictions={predictions} currentPlayerId={currentPlayerId} currentTime={currentTime} emptyText="今天暂无比赛" onOpenMatch={openMatch} />
        <HomeMatchSection title="即将锁定" subtitle="按开球时间排序，越靠前越需要尽快提交" matches={soonLockMatches} predictions={predictions} currentPlayerId={currentPlayerId} currentTime={currentTime} emptyText="暂无即将锁定的比赛" onOpenMatch={openMatch} />
      </div>
    </section>
  );
}

function HomeMatchSection({ title, subtitle, matches, predictions, currentPlayerId, currentTime, emptyText, onOpenMatch }) {
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black">{title}</h2>
          <p className="text-sm text-slate-400">{subtitle}</p>
        </div>
        <Pill className="bg-slate-800 text-slate-300">{matches.length} 场</Pill>
      </div>
      <div className="space-y-3">
        {matches.length ? matches.map((match) => (
          <MatchListButton key={match.id} match={match} pred={predictions.find((p) => p.playerId === currentPlayerId && p.matchId === match.id)} active={false} now={currentTime} onClick={() => onOpenMatch(match.id)} />
        )) : <div className="rounded-2xl border border-slate-700 bg-slate-950 p-5 text-center text-sm text-slate-500">{emptyText}</div>}
      </div>
    </Card>
  );
}

function MatchListButton({ match, pred, active, onClick, now = new Date() }) {
  const stage = STAGES[match.stage] || STAGES.GROUP;
  return (
    <button onClick={onClick} className={`w-full rounded-2xl border p-4 text-left transition ${active ? "border-cyan-300/40 bg-slate-800 shadow-lg shadow-cyan-950/20" : "border-slate-700 bg-slate-950/60 hover:bg-slate-800/80"}`}>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap gap-2">
            <Pill className="bg-slate-800 text-slate-300">#{match.no}</Pill>
            <Pill className="bg-indigo-500/15 text-indigo-200">{stage.label} x{stage.multiplier}</Pill>
            <MatchStatus match={match} />
            <MatchCountdown match={match} now={now} />
            {pred ? <Pill className="bg-emerald-500/15 text-emerald-200">已竞猜</Pill> : <Pill className="bg-rose-500/15 text-rose-200">未竞猜</Pill>}
            <Pill className={active ? "bg-cyan-500/15 text-cyan-200" : "bg-slate-800 text-slate-400"}>{active ? "收起详情" : "展开竞猜"}</Pill>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-lg font-black"><TeamName name={match.home} logo={match.homeLogo} /><span className="text-slate-500">vs</span><TeamName name={match.away} logo={match.awayLogo} /></div>
          <div className="mt-1 text-xs text-slate-500">{formatDateTime(match.kickoff)} · {match.group}</div>
        </div>
        <div className="text-left md:text-right"><MatchScore match={match} />{pred && <div className="mt-2 text-xs text-slate-500">我的预测：{pred.home}:{pred.away}</div>}</div>
      </div>
    </button>
  );
}

function getPlayerDisplayId(player) {
  return (player?.name || player?.email || "未命名用户").trim() || "未命名用户";
}

function SchedulePanel({ predictions, currentPlayerId, query, setQuery, stageFilter, setStageFilter, groupedMatches, selectedMatchId, setSelectedMatchId, upsertPrediction, players, currentTime, onOpenPlayerProfile }) {
  function handleMatchToggle(matchId) {
    setSelectedMatchId((prev) => (prev === matchId ? "" : matchId));
  }

  return (
    <section className="mt-6">
      <Card>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div><h2 className="text-xl font-black">赛程与竞猜</h2><p className="text-sm text-slate-400">开赛前可以修改，开赛后自动锁定。</p><p className="mt-2 text-xs leading-relaxed text-slate-500">竞猜页默认只显示当前比赛日、未来比赛日，以及最近 2 个已结束比赛日。更早历史比赛请到“完整赛程”页查看。</p></div>
          <div className="flex gap-2"><div className="relative min-w-0"><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜索球队/阶段" className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-sm outline-none placeholder:text-slate-500" /></div><select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)} className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none"><option value="ALL">全部</option>{Object.entries(STAGES).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}</select></div>
        </div>
        <div className="space-y-6">
          {Object.entries(groupedMatches).length ? Object.entries(groupedMatches).map(([date, items]) => <div key={date}><div className="mb-3 flex items-center gap-2 text-sm font-black text-slate-400"><CalendarDays className="h-4 w-4" /> {date}</div><div className="space-y-3">{items.map((match) => {
            const pred = predictions.find((p) => p.playerId === currentPlayerId && p.matchId === match.id);
            const active = selectedMatchId === match.id;
            return (
              <div key={match.id} className={`overflow-hidden rounded-3xl border transition ${active ? "border-cyan-300/30 bg-slate-900/70 shadow-xl shadow-cyan-950/20" : "border-transparent bg-transparent"}`}>
                <MatchListButton match={match} pred={pred} active={active} now={currentTime} onClick={() => handleMatchToggle(match.id)} />
                {active && (
                  <div className="border-t border-slate-700/80 px-4 pb-4 pt-4">
                    <MatchPredictionDetail match={match} players={players} predictions={predictions} currentPlayerId={currentPlayerId} onSubmit={upsertPrediction} now={currentTime} onOpenPlayerProfile={onOpenPlayerProfile} />
                  </div>
                )}
              </div>
            );
          })}</div></div>) : <div className="rounded-2xl border border-slate-700 bg-slate-950 p-6 text-center text-sm text-slate-500">当前筛选条件下没有可显示的比赛。更早历史比赛请到“完整赛程”页查看。</div>}
        </div>
      </Card>
    </section>
  );
}

function WorldCupStandingsPanel({ standings, settledCount }) {
  const groupKeys = Object.keys(standings).sort((a, b) => a.localeCompare(b, "zh-CN"));
  const bestThirdTeams = groupKeys
    .map((group) => ({ ...sortStandingsTable(standings[group])[2], group }))
    .filter(Boolean)
    .sort((a, b) =>
      b.points - a.points ||
      b.goalDifference - a.goalDifference ||
      b.goalsFor - a.goalsFor ||
      a.team.localeCompare(b.team, "zh-CN")
    );

  return (
    <section className="mt-6 space-y-5">
      <Card>
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300"><Medal className="h-3.5 w-3.5" /> 世界杯排名 · 小组积分</div>
            <h2 className="text-3xl font-black tracking-tight">世界杯小组实时积分榜</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-400">根据管理员已结算的小组赛比分自动更新。玩家可以观察每个小组的积分、净胜球、进球数，以及直接出线和小组第三竞争形势。</p>
          </div>
          <div className="rounded-2xl border border-slate-700 bg-slate-800 p-4 text-slate-100 shadow-xl"><div className="text-xs font-bold text-slate-400">已结算比赛</div><div className="mt-1 text-3xl font-black">{settledCount}</div></div>
        </div>
      </Card>

      <Card>
        <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <h3 className="text-xl font-black">出线形势说明</h3>
            <p className="text-sm text-slate-400">每组前二进入直接出线区；小组第三进入竞争区，最终会根据各组第三名成绩比较。</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Pill className="bg-emerald-500/15 text-emerald-200">前二直接出线</Pill>
            <Pill className="bg-amber-500/15 text-amber-200">小组第三竞争</Pill>
            <Pill className="bg-slate-800 text-slate-400">第四名待追赶</Pill>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {bestThirdTeams.slice(0, 8).map((team, index) => (
            <div key={`${team.group}-${team.team}`} className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3">
              <div className="mb-1 text-xs font-black text-amber-200">小组第三竞争 #{index + 1}</div>
              <div className="font-black"><TeamName name={team.team} logo={team.logo} /></div>
              <div className="mt-1 text-xs text-slate-400">{team.group} · {team.points}分 · 净胜球 {team.goalDifference} · 进球 {team.goalsFor}</div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-5">
        {groupKeys.map((group) => <GroupStandingsCard key={group} group={group} table={sortStandingsTable(standings[group])} />)}
      </div>
    </section>
  );
}

function GroupStandingsCard({ group, table }) {
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-black">{group}</h3>
          <p className="text-sm text-slate-400">实时积分 / 净胜球 / 进球数</p>
        </div>
        <Pill className="bg-slate-800 text-slate-300">{table.reduce((sum, team) => sum + team.played, 0) / 2} 场已赛</Pill>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-700">
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead className="bg-slate-800 text-slate-400">
            <tr>
              <th className="px-3 py-3">排名</th>
              <th className="px-3 py-3">球队</th>
              <th className="px-3 py-3 text-center">积分</th>
              <th className="px-3 py-3 text-center">赛</th>
              <th className="px-3 py-3 text-center">胜</th>
              <th className="px-3 py-3 text-center">平</th>
              <th className="px-3 py-3 text-center">负</th>
              <th className="px-3 py-3 text-center">进/失</th>
              <th className="px-3 py-3 text-center">净胜</th>
              <th className="px-3 py-3">形势</th>
            </tr>
          </thead>
          <tbody>
            {table.map((team, index) => {
              const status = getQualificationLabel(index);
              return (
                <tr key={team.team} className="border-t border-slate-700 bg-slate-950/60">
                  <td className="px-3 py-3 font-black">#{index + 1}</td>
                  <td className="px-3 py-3 font-black"><TeamName name={team.team} logo={team.logo} /></td>
                  <td className="px-3 py-3 text-center text-lg font-black text-emerald-200">{team.points}</td>
                  <td className="px-3 py-3 text-center">{team.played}</td>
                  <td className="px-3 py-3 text-center">{team.won}</td>
                  <td className="px-3 py-3 text-center">{team.drawn}</td>
                  <td className="px-3 py-3 text-center">{team.lost}</td>
                  <td className="px-3 py-3 text-center">{team.goalsFor}/{team.goalsAgainst}</td>
                  <td className="px-3 py-3 text-center">{team.goalDifference}</td>
                  <td className="px-3 py-3"><Pill className={status.className}>{status.label}</Pill></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function FullScheduleCalendar({ schedule, source }) {
  const [scheduleQuery, setScheduleQuery] = useState("");
  const [scheduleStage, setScheduleStage] = useState("ALL");
  const filteredSchedule = useMemo(() => schedule.filter((match) => {
    const text = `${match.no}${match.home}${match.away}${match.homeRaw || ""}${match.awayRaw || ""}${match.group}${match.stadium}${match.city}${match.location}${match.stadiumRaw || ""}${match.cityRaw || ""}${match.locationRaw || ""}`.toLowerCase();
    return text.includes(scheduleQuery.toLowerCase()) && (scheduleStage === "ALL" || match.group === scheduleStage);
  }), [schedule, scheduleQuery, scheduleStage]);
  const scheduleByDate = useMemo(() => filteredSchedule.reduce((acc, match) => {
    const key = formatBeijingDateKey(match.kickoff);
    if (!acc[key]) acc[key] = [];
    acc[key].push(match);
    acc[key].sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime());
    return acc;
  }, {}), [filteredSchedule]);
  const stageOptions = ["ALL", ...Array.from(new Set(schedule.map((match) => match.group)))];
  return (
    <section className="mt-6 space-y-5">
      <Card>
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300"><CalendarDays className="h-3.5 w-3.5" /> 完整赛程 · 北京时间</div>
            <h2 className="text-3xl font-black tracking-tight">完整赛程列表</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-400">赛程优先读取 WorldCupAPI 官方 fixtures，并统一转换为北京时间；API 失败时使用本地备用赛程。</p>
            <Pill className={source === "worldcupapi" ? "mt-3 bg-emerald-500/15 text-emerald-200" : "mt-3 bg-amber-500/15 text-amber-200"}>{source === "worldcupapi" ? "WorldCupAPI 实时赛程" : "本地备用赛程"}</Pill>
          </div>
          <div className="rounded-2xl border border-slate-700 bg-slate-800 p-4 text-slate-100 shadow-xl"><div className="text-xs font-bold text-slate-400">比赛总数</div><div className="mt-1 text-3xl font-black">{schedule.length}</div></div>
        </div>
      </Card>
      <Card>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div><h3 className="text-xl font-black">快速浏览</h3><p className="text-sm text-slate-400">适合手机端按日期查看，可按球队、球馆、城市或阶段搜索。</p></div>
          <div className="flex flex-col gap-2 sm:flex-row"><div className="relative min-w-0"><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" /><input value={scheduleQuery} onChange={(e) => setScheduleQuery(e.target.value)} placeholder="搜索球队 / 球馆 / 城市" className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-sm outline-none placeholder:text-slate-500 sm:w-64" /></div><select value={scheduleStage} onChange={(e) => setScheduleStage(e.target.value)} className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none">{stageOptions.map((stage) => <option key={stage} value={stage}>{stage === "ALL" ? "全部小组/阶段" : stage}</option>)}</select></div>
        </div>
      </Card>
      <Card>
        <div className="mb-4 flex items-center justify-between gap-3"><div><h3 className="text-xl font-black">按日期列表</h3><p className="text-sm text-slate-400">每个比赛日集中显示，方便赛前快速查看当天赛程。</p></div><Pill className="bg-slate-800 text-slate-300">{filteredSchedule.length} 场</Pill></div>
        <div className="space-y-4">
          {Object.entries(scheduleByDate).sort(([a], [b]) => a.localeCompare(b)).map(([dateKey, items]) => <div key={dateKey} className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4"><div className="mb-3 flex items-center gap-2 text-sm font-black text-slate-300"><CalendarDays className="h-4 w-4" /> {formatBeijingDateTitle(items[0].kickoff)}</div><div className="grid gap-3 md:grid-cols-2">{items.map((match) => <ScheduleLargeCard key={match.id} match={match} />)}</div></div>)}
        </div>
      </Card>
    </section>
  );
}

function ScheduleLargeCard({ match }) {
  return <div className="rounded-2xl border border-slate-700 bg-slate-950 p-3"><div className="mb-2 flex flex-wrap items-center gap-2"><Pill className="bg-slate-800 text-slate-300">#{match.no}</Pill><Pill className="bg-indigo-500/15 text-indigo-200">{match.group}</Pill><Pill className="bg-slate-800 text-slate-100">{formatBeijingTime(match.kickoff)} 北京时间</Pill></div><div className="flex flex-wrap items-center gap-2 text-lg font-black"><TeamName name={match.home} logo={match.homeLogo} /><span className="text-slate-500">vs</span><TeamName name={match.away} logo={match.awayLogo} /></div><div className="mt-2 text-sm text-slate-400">{match.stadium || match.location}</div><div className="text-xs text-slate-500">{match.city}</div></div>;
}

function MatchPredictionDetail({ match, players, predictions, currentPlayerId, onSubmit, now = new Date(), onOpenPlayerProfile }) {
  const existing = predictions.find((p) => p.playerId === currentPlayerId && p.matchId === match.id);
  const [home, setHome] = useState(existing?.home ?? 0);
  const [away, setAway] = useState(existing?.away ?? 0);
  React.useEffect(() => { const next = predictions.find((p) => p.playerId === currentPlayerId && p.matchId === match.id); setHome(next?.home ?? 0); setAway(next?.away ?? 0); }, [match.id, currentPlayerId, predictions]);
  const locked = isMatchLocked(match, now);
  const showAllPredictions = locked || match.status !== "open";
  const groupedFriendPredictions = useMemo(() => {
    const groups = {
      H: [],
      D: [],
      A: [],
      M: [],
    };

    players.forEach((player) => {
      const prediction = predictions.find((p) => p.playerId === player.id && p.matchId === match.id);
      const entry = {
        player,
        prediction,
        isMe: player.id === currentPlayerId,
        points: calculatePoints(prediction, match),
      };

      if (!prediction) {
        groups.M.push(entry);
        return;
      }

      groups[getOutcome(prediction.home, prediction.away)].push(entry);
    });

    return [
      { key: "H", title: "主胜", items: groups.H },
      { key: "D", title: "平局", items: groups.D },
      { key: "A", title: "客胜", items: groups.A },
      { key: "M", title: "未提交", items: groups.M },
    ].filter((group) => group.items.length > 0);
  }, [players, predictions, match, currentPlayerId]);

  return (
    <div>
      <div className="rounded-2xl bg-slate-950 p-4"><div className="text-sm font-bold text-slate-300">我的比分预测</div><div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3"><ScoreInput label={match.home} value={home} disabled={locked} onChange={setHome} /><div className="pt-7 text-xl font-black text-slate-500">:</div><ScoreInput label={match.away} value={away} disabled={locked} onChange={setAway} /></div><DarkButton disabled={locked} onClick={() => onSubmit(match.id, Number(home), Number(away))} className="mt-4 flex w-full items-center justify-center gap-2 px-4 py-3 font-black">{existing ? <CheckCircle2 className="h-5 w-5" /> : <Plus className="h-5 w-5" />}{existing ? "修改预测" : "提交预测"}</DarkButton>{locked && <div className="mt-3 text-center text-xs text-slate-500">比赛已锁定，不能再修改预测。</div>}</div>
      <div className="mt-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-black">朋友预测</h3>
          {!showAllPredictions && <Pill className="bg-slate-800 text-slate-400">开赛后公开</Pill>}
        </div>
        {showAllPredictions ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {groupedFriendPredictions.map((group) => (
              <div key={group.key} className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="font-black">{group.title}</div>
                  <Pill className="bg-slate-800 text-slate-300">{group.items.length} 人</Pill>
                </div>
                <div className="space-y-2">
                  {group.items.map(({ player, prediction, isMe, points }) => (
                    <div key={player.id} className="rounded-2xl bg-slate-800/60 px-3 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <button onClick={() => onOpenPlayerProfile?.(player.id)} className="min-w-0 text-left">
                          <div className="flex items-center gap-2">
                            <span className="truncate font-bold hover:text-cyan-200">
                              {getPlayerDisplayId(player)}
                              {prediction ? ` ${prediction.home}:${prediction.away}` : ""}
                            </span>
                            {isMe && <span className="text-xs text-emerald-200">我</span>}
                          </div>
                          <div className="mt-1 text-xs text-slate-500">{prediction ? "已提交" : "未提交"}</div>
                        </button>
                        {prediction ? <div className="text-sm font-black text-slate-200">{prediction.home}:{prediction.away}</div> : <div className="text-sm text-slate-500">--</div>}
                      </div>
                      {prediction && match.status === "settled" && <div className="mt-2 text-xs text-slate-500">{explainPoints(prediction, match)} · +{points}</div>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-slate-950 px-4 py-5 text-center text-sm text-slate-500">朋友预测会在开赛后按主胜、平局、客胜和未提交自动分组公开。</div>
        )}
      </div>
    </div>
  );
}

function ScoreInput({ label, value, disabled, onChange }) {
  return <div><div className="mb-2 truncate text-center text-sm text-slate-400">{label}</div><input type="number" min="0" value={value} disabled={disabled} onChange={(e) => onChange(Math.max(0, Number(e.target.value)))} className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-4 text-center text-3xl font-black outline-none disabled:opacity-50" /></div>;
}

function FunPredictionPanel({ currentPlayer, players, funPredictions, onSave, locked, firstKickoff, funResults }) {
  const existing = funPredictions[currentPlayer?.id] || {};
  const [champion, setChampion] = useState(teamName(existing.champion) || "");
  const [goldenBoot, setGoldenBoot] = useState(existing.goldenBoot || "");
  const [firstRedCardTeam, setFirstRedCardTeam] = useState(teamName(existing.firstRedCardTeam) || "");
  const [totalGoals, setTotalGoals] = useState(existing.totalGoals ?? "");
  React.useEffect(() => { const next = funPredictions[currentPlayer?.id] || {}; setChampion(teamName(next.champion)); setGoldenBoot(next.goldenBoot || ""); setFirstRedCardTeam(teamName(next.firstRedCardTeam)); setTotalGoals(next.totalGoals ?? ""); }, [currentPlayer?.id, funPredictions]);
  const canSubmitFunPrediction = !locked && champion.trim() && goldenBoot.trim() && firstRedCardTeam.trim() && String(totalGoals).trim() && Number.isFinite(Number(totalGoals));
  const titleAwards = useMemo(() => {
    const resultTotalGoals = Number(funResults.totalGoals);
    const validGoalPredictions = players.map((player) => ({ ...player, prediction: funPredictions[player.id] })).filter((player) => player.prediction && Number.isFinite(Number(player.prediction.totalGoals)) && Number.isFinite(resultTotalGoals));
    const closestGoalDiff = validGoalPredictions.length ? Math.min(...validGoalPredictions.map((player) => Math.abs(Number(player.prediction.totalGoals) - resultTotalGoals))) : null;
    return players.map((player) => {
      const prediction = funPredictions[player.id];
      const titles = [];
      if (prediction && funResults.champion && isSameDisplayValue(prediction.champion, funResults.champion)) titles.push("世界杯导演");
      if (prediction && funResults.goldenBoot && isSameDisplayValue(prediction.goldenBoot, funResults.goldenBoot)) titles.push("金靴伯乐");
      if (prediction && funResults.firstRedCardTeam && isSameDisplayValue(prediction.firstRedCardTeam, funResults.firstRedCardTeam)) titles.push("我闻到了火药味");
      if (prediction && closestGoalDiff !== null && Number.isFinite(resultTotalGoals) && Math.abs(Number(prediction.totalGoals) - resultTotalGoals) === closestGoalDiff) titles.push("进球神算子");
      return { ...player, titles };
    });
  }, [players, funPredictions, funResults]);
  return (
    <section className="mt-6 space-y-5"><Card><div className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><div className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300"><Flame className="h-3.5 w-3.5" /> 荣誉玩法 · 不额外加分</div><h2 className="text-3xl font-black tracking-tight">趣味预测栏</h2><p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">冠军、金靴、首张红牌球队和本届总进球数预测，必须在第一场世界杯比赛开始前提交并锁定。赢家没有额外积分奖励，只获得趣味称号。</p></div><div className="rounded-2xl border border-slate-700 bg-slate-800 p-4 text-slate-100 shadow-xl"><div className="text-xs font-bold text-slate-400">锁定时间</div><div className="mt-1 text-lg font-black">{formatDateTime(firstKickoff)}</div></div></div></Card><div className="grid gap-5 lg:grid-cols-[420px_1fr]"><Card><div className="mb-4 flex items-center justify-between gap-3"><div><h3 className="text-xl font-black">我的趣味预测</h3><p className="text-sm text-slate-400">第一场开赛前可修改。</p></div>{locked ? <Pill className="bg-amber-500/15 text-amber-200">已锁定</Pill> : <Pill className="bg-sky-500/15 text-sky-200">可提交</Pill>}</div><div className="space-y-4"><FunInput label="冠军预测 · 称号：世界杯导演" value={champion} disabled={locked} onChange={setChampion} placeholder="例如：巴西 / 阿根廷 / 法国" /><FunInput label="金靴预测 · 称号：金靴伯乐" value={goldenBoot} disabled={locked} onChange={setGoldenBoot} placeholder="例如：姆巴佩 / 哈兰德 / 梅西" /><FunInput label="首张红牌球队 · 称号：我闻到了火药味" value={firstRedCardTeam} disabled={locked} onChange={setFirstRedCardTeam} placeholder="例如：乌拉圭 / 阿根廷 / 塞尔维亚" /><div><label className="mb-2 block text-sm font-bold text-slate-300">本届总进球数预测 · 称号：进球神算子</label><input type="number" min="0" value={totalGoals} disabled={locked} onChange={(e) => setTotalGoals(e.target.value)} placeholder="例如：180" className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none placeholder:text-slate-500 disabled:opacity-50" /><div className="mt-2 grid gap-2 text-xs text-slate-500 sm:grid-cols-2">{WORLD_CUP_GOAL_REFERENCES.map((item) => <div key={item.edition} className="rounded-xl bg-slate-950 px-3 py-2">{item.edition}：<span className="font-black text-slate-200">{item.goals} 球</span></div>)}</div></div><DarkButton disabled={!canSubmitFunPrediction} onClick={() => onSave(champion, goldenBoot, firstRedCardTeam, totalGoals)} className="flex w-full items-center justify-center gap-2 px-4 py-3 font-black"><CheckCircle2 className="h-5 w-5" />{existing.submittedAt ? "更新趣味预测" : "提交趣味预测"}</DarkButton><div className="rounded-2xl bg-slate-950 p-3 text-xs leading-relaxed text-slate-500">当前规则：趣味预测不改变排行榜积分；第一场比赛开始后统一锁定并公开所有人的选择。</div></div></Card><Card><div className="mb-4 flex items-center justify-between gap-3"><div><h3 className="text-xl font-black">朋友趣味预测</h3><p className="text-sm text-slate-400">锁定前隐藏他人选择，避免互相抄答案。</p></div><Pill className="bg-slate-800 text-slate-300">{Object.keys(funPredictions).length}/{players.length} 已提交</Pill></div><div className="grid gap-3 md:grid-cols-2">{players.map((player) => <FunPredictionPlayerCard key={player.id} player={player} prediction={funPredictions[player.id]} isMe={player.id === currentPlayer?.id} canShow={locked || player.id === currentPlayer?.id} awards={titleAwards.find((item) => item.id === player.id)?.titles || []} />)}</div></Card></div></section>
  );
}

function FunInput({ label, value, disabled, onChange, placeholder }) {
  return <div><label className="mb-2 block text-sm font-bold text-slate-300">{label}</label><input value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none placeholder:text-slate-500 disabled:opacity-50" /></div>;
}

function FunPredictionPlayerCard({ player, prediction, isMe, canShow, awards }) {
  return <div className="rounded-2xl border border-slate-700 bg-slate-950 p-4"><div className="mb-3 flex items-center justify-between gap-3"><div className="flex items-center gap-3"><UserBadge player={player} /><div><div className="font-black">{player.name} {isMe && <span className="text-xs text-emerald-200">我</span>}</div><div className="text-xs text-slate-500">{prediction ? "已提交" : "未提交"}</div></div></div>{prediction ? <CheckCircle2 className="h-5 w-5 text-emerald-200" /> : <XCircle className="h-5 w-5 text-slate-600" />}</div>{canShow ? <div className="space-y-2 text-sm"><InfoRow label="冠军" value={prediction ? teamName(prediction.champion) : "--"} /><InfoRow label="金靴" value={prediction?.goldenBoot || "--"} /><InfoRow label="首张红牌" value={prediction ? teamName(prediction.firstRedCardTeam) : "--"} /><InfoRow label="总进球数" value={prediction?.totalGoals ?? "--"} />{awards.length > 0 && <div className="flex flex-wrap gap-2 pt-1">{awards.map((award) => <Pill key={award} className="bg-yellow-500/15 text-yellow-200">{award}</Pill>)}</div>}</div> : <div className="rounded-xl bg-slate-900 px-3 py-5 text-center text-sm text-slate-500">第一场开赛后公开</div>}</div>;
}

function InfoRow({ label, value }) {
  return <div className="flex items-center justify-between rounded-xl bg-slate-900 px-3 py-2"><span className="text-slate-500">{label}</span><span className="font-black">{value}</span></div>;
}

function PredictionHistoryList({ items }) {
  return <div className="space-y-3">
    {items.length ? items.map(({ prediction, match, points }) => (
      <div key={prediction.id} className="rounded-2xl border border-slate-700 bg-slate-950 p-4">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Pill className="bg-slate-800 text-slate-300">#{match.no}</Pill>
          <Pill className="bg-indigo-500/15 text-indigo-200">{(STAGES[match.stage] || STAGES.GROUP).label}</Pill>
          {match.status === "settled" && <Pill className="bg-emerald-500/15 text-emerald-200">+{points}分</Pill>}
        </div>
        <div className="flex flex-wrap items-center gap-2 font-black"><TeamName name={match.home} logo={match.homeLogo} /><span className="text-slate-500">vs</span><TeamName name={match.away} logo={match.awayLogo} /></div>
        <div className="mt-1 text-sm text-slate-400">预测：{prediction.home}:{prediction.away} {match.status === "settled" ? `｜赛果：${match.homeScore}:${match.awayScore}｜${explainPoints(prediction, match)}` : "｜待结算"}</div>
        <div className="mt-1 text-xs text-slate-500">提交时间：{formatDateTime(prediction.submittedAt)}｜开球：{formatDateTime(match.kickoff)}</div>
      </div>
    )) : <div className="rounded-2xl bg-slate-950 p-5 text-center text-sm text-slate-500">暂无竞猜记录</div>}
  </div>;
}

function FunResultsCard({ funResults, onSetFunResults }) {
  const [draftResults, setDraftResults] = useState(funResults);

  React.useEffect(() => {
    setDraftResults(funResults);
  }, [funResults]);

  function settleFunResults() {
    onSetFunResults({
      champion: draftResults.champion.trim(),
      goldenBoot: draftResults.goldenBoot.trim(),
      firstRedCardTeam: draftResults.firstRedCardTeam.trim(),
      totalGoals: String(draftResults.totalGoals).trim(),
    });
  }

  return (
    <Card>
      <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <h3 className="text-xl font-black">赛后趣味称号结算</h3>
          <p className="text-sm text-slate-400">管理员填写最终结果后，点击结算按钮才会更新趣味预测页里的称号。</p>
        </div>
        <Pill className="bg-slate-800 text-slate-300">管理员结算</Pill>
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        {[["champion", "实际冠军"], ["goldenBoot", "实际金靴"], ["firstRedCardTeam", "首张红牌球队"], ["totalGoals", "实际总进球数"]].map(([key, placeholder]) => (
          <input
            key={key}
            type={key === "totalGoals" ? "number" : "text"}
            min="0"
            value={draftResults[key]}
            onChange={(e) => setDraftResults((prev) => ({ ...prev, [key]: e.target.value }))}
            placeholder={placeholder}
            className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none placeholder:text-slate-500"
          />
        ))}
      </div>
      <button onClick={settleFunResults} className="mt-4 w-full rounded-2xl bg-emerald-700 px-4 py-3 text-sm font-black text-emerald-50 transition hover:bg-emerald-600 md:w-auto">
        结算称号
      </button>
    </Card>
  );
}

function PlayerProfilePanel({ player, currentPlayerId, players, rankings, predictions, matches, streakRankings, predictionStyleRankings, reverseLightPlayer, funPredictions, funResults, achievementCollections, onUpdateProfile, onBack, onOpenAchievements, onOpenFullHistory }) {
  const rankingIndex = rankings.findIndex((item) => item.id === player.id) + 1;
  const ranking = rankings.find((item) => item.id === player.id) || player;
  const isOwnProfile = player.id === currentPlayerId;
  const [avatarEditorOpen, setAvatarEditorOpen] = useState(false);
  const [draftUsername, setDraftUsername] = useState(player.name || "");
  const [draftAvatarEmoji, setDraftAvatarEmoji] = useState(player.avatarEmoji || DEFAULT_AVATAR_EMOJI);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const playerPredictions = predictions.filter((prediction) => prediction.playerId === player.id);
  const maxStreak = streakRankings.find((item) => item.id === player.id)?.maxStreak || 0;
  const drawPredictions = playerPredictions.filter((prediction) => prediction.home === prediction.away).length;
  const attackPredictions = playerPredictions.filter((prediction) => prediction.home + prediction.away >= 4).length;
  const commonScore = getMostCommonPrediction(playerPredictions);
  const favoriteStyle = drawPredictions === 0 && attackPredictions === 0 ? "暂无明显风格" : drawPredictions >= attackPredictions ? `更喜欢预测平局（${drawPredictions}次）` : `更喜欢大比分（${attackPredictions}次）`;
  const titles = getPlayerTitles(player, funPredictions, funResults, predictionStyleRankings, streakRankings, reverseLightPlayer);
  const playerAchievementStats = (achievementCollections?.byPlayerId?.[player.id] || []).map((item) => ({
    achievement: item.achievement,
    currentPlayerProgress: item.progress,
    roomAchievedCount: achievementCollections?.roomCounts?.[item.achievement.id] || 0,
    roomTotalPlayers: players.length,
  }));
  const playerUnlockedAchievements = playerAchievementStats.filter((item) => item.currentPlayerProgress.achieved);
  const recentUnlockedAchievements = [...playerUnlockedAchievements]
    .sort((a, b) => new Date(b.currentPlayerProgress.achievedAt || 0).getTime() - new Date(a.currentPlayerProgress.achievedAt || 0).getTime())
    .slice(0, 5);
  const history = playerPredictions.map((prediction) => {
    const match = matches.find((item) => item.id === prediction.matchId);
    return { prediction, match, points: calculatePoints(prediction, match) };
  }).filter((item) => item.match).sort((a, b) => new Date(b.match.kickoff).getTime() - new Date(a.match.kickoff).getTime());
  const recentHistory = history.slice(0, 5);
  const cleanDraftUsername = draftUsername.trim();
  const profileChanged = cleanDraftUsername !== (player.name || "").trim() || draftAvatarEmoji !== (player.avatarEmoji || DEFAULT_AVATAR_EMOJI);

  React.useEffect(() => {
    setDraftUsername(player.name || "");
    setDraftAvatarEmoji(player.avatarEmoji || DEFAULT_AVATAR_EMOJI);
    setAvatarEditorOpen(false);
  }, [player.id, player.name, player.avatarEmoji]);

  async function saveProfile() {
    if (!cleanDraftUsername) return;
    setSavingAvatar(true);
    const ok = await onUpdateProfile?.({
      username: cleanDraftUsername,
      avatarEmoji: draftAvatarEmoji,
    });
    setSavingAvatar(false);
    if (ok) setAvatarEditorOpen(false);
  }

  return (
    <section className="mt-6 space-y-5">
      <Card>
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="flex items-start gap-4">
            <div>
              {isOwnProfile ? (
                <button type="button" onClick={() => setAvatarEditorOpen((open) => !open)} className="rounded-xl outline-none ring-cyan-300 transition hover:scale-105 focus-visible:ring-2" aria-label="修改头像">
                  <UserBadge player={player} size="h-16 w-16" text="text-xl" />
                </button>
              ) : (
                <UserBadge player={player} size="h-16 w-16" text="text-xl" />
              )}
            </div>
            <div>
              <h2 className="text-3xl font-black">{player.name} 的个人主页</h2>
              <p className="mt-1 text-sm text-slate-400">查看个人竞猜表现、称号和历史记录。</p>
              {isOwnProfile && <p className="mt-2 text-xs text-slate-500">点击头像可以编辑你的昵称和 emoji 头像。</p>}
            </div>
          </div>
          <DarkButton onClick={onBack} className="px-4 py-3 text-sm font-black">返回竞猜排行榜</DarkButton>
        </div>
        {isOwnProfile && avatarEditorOpen && (
          <div className="mt-5 rounded-2xl border border-slate-700 bg-slate-950 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h3 className="font-black">编辑个人资料</h3>
                <p className="text-xs text-slate-500">修改昵称或头像后点击保存，排行榜和朋友预测里会同步更新。</p>
              </div>
              <Pill className="bg-slate-800 text-slate-300">{draftAvatarEmoji}</Pill>
            </div>
            <label className="mb-4 block">
              <span className="mb-2 block text-sm font-bold text-slate-300">个人昵称</span>
              <div className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3">
                <User className="h-4 w-4 text-slate-500" />
                <input value={draftUsername} onChange={(event) => setDraftUsername(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-500" placeholder="例如 Oscar" />
              </div>
              {!cleanDraftUsername && <div className="mt-2 text-xs text-rose-300">昵称不能为空。</div>}
            </label>
            <div className="mb-2 text-sm font-bold text-slate-300">选择 emoji 头像</div>
            <EmojiPicker value={draftAvatarEmoji} onChange={setDraftAvatarEmoji} disabled={savingAvatar} />
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <button disabled={savingAvatar || !cleanDraftUsername || !profileChanged} onClick={saveProfile} className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-black text-emerald-50 transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-40">{savingAvatar ? "保存中..." : "保存资料"}</button>
              <DarkButton disabled={savingAvatar} onClick={() => { setDraftUsername(player.name || ""); setDraftAvatarEmoji(player.avatarEmoji || DEFAULT_AVATAR_EMOJI); setAvatarEditorOpen(false); }} className="px-4 py-2 text-sm font-black">取消</DarkButton>
            </div>
          </div>
        )}
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard icon={Crown} label="总积分" value={`${ranking.total || 0}分`} sub={`当前排名 #${rankingIndex || "-"}`} />
        <StatCard icon={Medal} label="完全比分" value={`${ranking.exactCount || 0}次`} sub="完全猜中比分" />
        <StatCard icon={CheckCircle2} label="命中胜平负" value={`${ranking.outcomeCount || 0}次`} sub="包含完全比分" />
        <StatCard icon={Flame} label="最高连胜" value={`${maxStreak}场`} sub="连续命中胜平负" />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card>
          <h3 className="mb-4 text-xl font-black">预测风格</h3>
          <div className="space-y-3 text-sm">
            <InfoRow label="最常预测比分" value={commonScore} />
            <InfoRow label="预测平局次数" value={`${drawPredictions}次`} />
            <InfoRow label="大比分预测次数" value={`${attackPredictions}次`} />
            <InfoRow label="偏好判断" value={favoriteStyle} />
          </div>
        </Card>
        <Card className="lg:col-span-2">
          <h3 className="mb-4 text-xl font-black">目前获得的称号</h3>
          {titles.length ? <div className="flex flex-wrap gap-2">{titles.map((title) => <Pill key={title} className="bg-yellow-500/15 text-yellow-200">{title}</Pill>)}</div> : <div className="rounded-2xl bg-slate-950 p-5 text-center text-sm text-slate-500">暂未获得称号</div>}
        </Card>
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <button type="button" onClick={() => onOpenAchievements?.()} className="text-left"><h3 className="text-xl font-black transition hover:text-cyan-200">成就信息</h3></button>
            <p className="text-sm text-slate-400">点击查看完整成就墙和全部成就进度。</p>
          </div>
          <Pill className="bg-slate-800 text-slate-300">{playerUnlockedAchievements.length}/{ACHIEVEMENT_DEFINITIONS.length}</Pill>
        </div>
        <div className="space-y-4">
          <CompactAchievementSection title="最近获得成就" items={recentUnlockedAchievements} emptyText="该玩家暂未获得成就" />
        </div>
      </Card>

      <Card>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <button type="button" onClick={() => onOpenFullHistory?.(player.id)} className="text-left"><h3 className="text-xl font-black transition hover:text-cyan-200">用户历史竞猜记录</h3></button>
            <p className="text-sm text-slate-400">只展示最近 5 条竞猜记录。</p>
          </div>
          <Pill className="bg-slate-800 text-slate-300">{history.length} 条</Pill>
        </div>
        <div className="space-y-3">
          {recentHistory.length ? recentHistory.map(({ prediction, match, points }) => (
            <div key={prediction.id} className="rounded-2xl border border-slate-700 bg-slate-950 p-4">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Pill className="bg-slate-800 text-slate-300">#{match.no}</Pill>
                <Pill className="bg-indigo-500/15 text-indigo-200">{(STAGES[match.stage] || STAGES.GROUP).label}</Pill>
                {match.status === "settled" && <Pill className="bg-emerald-500/15 text-emerald-200">+{points}分</Pill>}
              </div>
              <div className="flex flex-wrap items-center gap-2 font-black"><TeamName name={match.home} logo={match.homeLogo} /><span className="text-slate-500">vs</span><TeamName name={match.away} logo={match.awayLogo} /></div>
              <div className="mt-1 text-sm text-slate-400">预测：{prediction.home}:{prediction.away} {match.status === "settled" ? `｜赛果：${match.homeScore}:${match.awayScore}｜${explainPoints(prediction, match)}` : "｜待结算"}</div>
              <div className="mt-1 text-xs text-slate-500">提交时间：{formatDateTime(prediction.submittedAt)}｜开球：{formatDateTime(match.kickoff)}</div>
            </div>
          )) : <div className="rounded-2xl bg-slate-950 p-5 text-center text-sm text-slate-500">暂无竞猜记录</div>}
        </div>
      </Card>
    </section>
  );
}

function AchievementsPanel({ players, currentPlayerId, achievementCollections }) {
  const currentPlayer = players.find((player) => player.id === currentPlayerId) || players[0];
  const [rarityFilter, setRarityFilter] = useState("全部");
  const achievementStats = achievementCollections?.currentPlayerItems || [];
  const unlocked = achievementStats.filter((item) => item.currentPlayerProgress.achieved);
  const locked = achievementStats.filter((item) => !item.currentPlayerProgress.achieved);
  const hiddenLocked = locked.filter((item) => item.achievement.hidden);
  const upcoming = locked
    .filter((item) => !item.achievement.hidden)
    .sort((a, b) => (b.currentPlayerProgress.current / b.currentPlayerProgress.target) - (a.currentPlayerProgress.current / a.currentPlayerProgress.target));
  const filteredItems = achievementStats.filter((item) => rarityFilter === "全部" || item.achievement.rarity === rarityFilter);
  const filteredUnlocked = filteredItems.filter((item) => item.currentPlayerProgress.achieved);
  const filteredUpcoming = filteredItems.filter((item) => !item.currentPlayerProgress.achieved && !item.achievement.hidden);
  const filteredHidden = filteredItems.filter((item) => !item.currentPlayerProgress.achieved && item.achievement.hidden);

  return (
    <section className="mt-6 space-y-5">
      <Card>
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300"><Crown className="h-3.5 w-3.5" /> 成就墙 · 我的成就</div>
            <h2 className="text-3xl font-black tracking-tight">成就墙</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-400">这里只显示当前玩家自己的成就状态。隐藏成就未解锁前会以占位卡片展示，解锁后统一切换为钻石风格。</p>
          </div>
          <div className="rounded-2xl border border-slate-700 bg-slate-800 p-4 text-slate-100 shadow-xl">
            <div className="text-xs font-bold text-slate-400">我的成就</div>
            <div className="mt-1 text-3xl font-black">{unlocked.length}/{achievementCollections?.totalAchievements || ACHIEVEMENT_DEFINITIONS.length}</div>
            <div className="mt-2 text-xs text-slate-400">未解锁隐藏成就 {hiddenLocked.length} 个</div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h3 className="text-xl font-black">成就筛选</h3>
            <p className="text-sm text-slate-400">按稀有度筛选，同时保留已获得、即将达成和隐藏占位三种状态。</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[ "全部", ...ACHIEVEMENT_RARITIES ].map((rarity) => (
              <button key={rarity} type="button" onClick={() => setRarityFilter(rarity)} className={`rounded-full px-3 py-1.5 text-xs font-black transition ${rarityFilter === rarity ? "bg-cyan-600 text-cyan-50" : "bg-slate-900 text-slate-300 hover:bg-slate-800"}`}>{rarity}</button>
            ))}
          </div>
        </div>
      </Card>

      <AchievementSection title="已获得成就" subtitle={`${currentPlayer?.name || "当前玩家"} 已经点亮的成就`} items={filteredUnlocked} emptyText="当前筛选下暂无已获得成就" />
      <AchievementSection title="即将达成" subtitle="显示当前筛选下最接近解锁的公开成就" items={filteredUpcoming.sort((a, b) => (b.currentPlayerProgress.current / b.currentPlayerProgress.target) - (a.currentPlayerProgress.current / a.currentPlayerProgress.target))} emptyText="当前筛选下暂无公开未解锁成就" />
      <AchievementSection title="隐藏成就" subtitle="未解锁前只展示占位卡片，解锁后会切换为钻石风格" items={filteredHidden} emptyText="当前筛选下暂无隐藏成就" />
    </section>
  );
}

function AchievementSection({ title, subtitle, items, emptyText }) {
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-black">{title}</h3>
          <p className="text-sm text-slate-400">{subtitle}</p>
        </div>
        <Pill className="bg-slate-800 text-slate-300">{items.length} 个</Pill>
      </div>
      {items.length ? <div className="grid gap-4 xl:grid-cols-2">{items.map((item) => <AchievementCard key={`${title}-${item.achievement.id}`} {...item} />)}</div> : <div className="rounded-2xl border border-slate-700 bg-slate-950 p-5 text-center text-sm text-slate-500">{emptyText}</div>}
    </Card>
  );
}

function CompactAchievementSection({ title, items, emptyText }) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h4 className="font-black">{title}</h4>
        <Pill className="bg-slate-800 text-slate-300">{items.length} 个</Pill>
      </div>
      {items.length ? <div className="grid gap-3 md:grid-cols-2">{items.map((item) => <AchievementCard key={`${title}-${item.achievement.id}`} {...item} compact />)}</div> : <div className="rounded-2xl border border-slate-700 bg-slate-950 p-4 text-center text-sm text-slate-500">{emptyText}</div>}
    </div>
  );
}

function AchievementCard({ achievement, roomAchievedCount, roomTotalPlayers, currentPlayerProgress, compact = false }) {
  const item = { achievement, currentPlayerProgress };
  const theme = getAchievementTheme(item);
  const achievedCount = roomAchievedCount ?? 0;
  const totalPlayers = roomTotalPlayers ?? 0;
  const achieved = currentPlayerProgress.achieved;
  const hiddenLocked = achievement.hidden && !achieved;
  const title = hiddenLocked ? "？？？" : achievement.name;
  const description = hiddenLocked ? "隐藏成就将在解锁后揭晓具体条件。" : achievement.description;
  return (
    <div className={`relative rounded-2xl border p-4 transition ${theme.card} ${achieved ? "" : "opacity-80"} ${compact ? "" : "min-h-[232px]"}`}>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Pill className={getAchievementBadgeClass(item)}>{achievement.hidden && achieved ? "钻石隐藏" : achievement.rarity}</Pill>
            <Pill className="bg-slate-800 text-slate-300">房间内 {achievedCount}/{totalPlayers} 人获得</Pill>
            {achieved ? <Pill className="bg-emerald-500/15 text-emerald-200">已获得</Pill> : <Pill className="bg-slate-800 text-slate-400">未获得</Pill>}
          </div>
          <h4 className={`${compact ? "text-base" : "text-lg"} font-black ${theme.title}`}>{title}</h4>
          <p className="mt-1 text-sm text-slate-300/90">{description}</p>
        </div>
      </div>
      <div className="mt-4 grid gap-2 rounded-2xl bg-slate-900/80 px-3 py-3 text-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-slate-500">获得时间</span>
          <span className={achieved ? `font-black ${theme.accent}` : "font-black text-slate-500"}>{formatAchievementTime(currentPlayerProgress.achievedAt)}</span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-slate-500">获得进度</span>
          <span className={achieved ? `font-black ${theme.accent}` : "font-black text-slate-300"}>{currentPlayerProgress.current}/{currentPlayerProgress.target}</span>
        </div>
      </div>
    </div>
  );
}

function RankingPanel({ players, rankingTrend, predictionStyleRankings, streakRankings, reverseLightPlayer, dailyBestPlayers, rankings, currentPlayerId, settledCount, onOpenPlayerProfile }) {
  return <section className="mt-6 space-y-5"><RankTrendChart players={players} rankingTrend={rankingTrend} /><PredictionStyleRankingsPanel predictionStyleRankings={predictionStyleRankings} /><FunRankingsPanel streakRankings={streakRankings} reverseLightPlayer={reverseLightPlayer} dailyBestPlayers={dailyBestPlayers} /><ScoreRankingTable rankings={rankings} currentPlayerId={currentPlayerId} settledCount={settledCount} onOpenPlayerProfile={onOpenPlayerProfile} /></section>;
}

function ScoreRankingTable({ rankings, currentPlayerId, settledCount, onOpenPlayerProfile }) {
  return <Card><div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-end"><div><h2 className="text-xl font-black md:text-2xl">竞猜积分排行榜</h2><p className="text-sm text-slate-400">排序：总积分 ＞ 命中比分 ＞ 命中结果 ＞ 参与场次 ＞ 加入时间。点击玩家可查看个人主页。</p></div><Pill className="bg-slate-800 text-slate-100">已结算 {settledCount} 场</Pill></div><div className="overflow-x-auto rounded-2xl border border-slate-700"><table className="w-full min-w-[640px] text-left text-xs md:text-sm"><thead className="bg-slate-800 text-slate-400"><tr><th className="px-3 py-3 md:px-4">排名</th><th className="px-3 py-3 md:px-4">玩家</th><th className="px-3 py-3 md:px-4">总积分</th><th className="px-3 py-3 md:px-4">完全比分</th><th className="px-3 py-3 md:px-4">命中结果</th><th className="px-3 py-3 md:px-4">参与场次</th></tr></thead><tbody>{rankings.map((player, index) => <tr key={player.id} className="border-t border-slate-700 bg-slate-950/60"><td className="px-3 py-3 text-base font-black md:px-4 md:py-4 md:text-lg">#{index + 1}</td><td className="px-3 py-3 md:px-4 md:py-4"><button onClick={() => onOpenPlayerProfile?.(player.id)} className="flex min-w-[180px] items-center gap-2 text-left md:gap-3"><UserBadge player={player} size="h-8 w-8 md:h-10 md:w-10" text="text-xs md:text-sm" /><div className="min-w-0"><div className="truncate text-sm font-black hover:text-cyan-200 md:text-base">{player.name}</div>{player.id === currentPlayerId && <div className="text-[11px] text-emerald-200 md:text-xs">当前玩家</div>}</div></button></td><td className="px-3 py-3 text-lg font-black md:px-4 md:py-4 md:text-2xl">{player.total}</td><td className="px-3 py-3 md:px-4 md:py-4">{player.exactCount}</td><td className="px-3 py-3 md:px-4 md:py-4">{player.outcomeCount}</td><td className="px-3 py-3 md:px-4 md:py-4">{player.played}</td></tr>)}</tbody></table></div></Card>;
}

function MiniRankingCard({ title, subtitle, badge, players, valueLabel }) {
  const leader = players?.[0];
  return (
    <Card className="h-full overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 shadow-[0_18px_60px_rgba(15,23,42,0.28)]">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-[1.65rem] font-black leading-tight tracking-tight text-slate-50">{title}</h3>
          <p className="mt-2 max-w-[22ch] text-sm leading-6 text-slate-400">{subtitle}</p>
        </div>
        <Pill className="shrink-0 bg-slate-800/90 px-3 py-1.5 text-center text-xs font-bold text-slate-200 shadow-inner shadow-slate-950/50">{badge}</Pill>
      </div>
      {leader && leader.value > 0 ? (
        <div className="space-y-3">
          <div className="rounded-[28px] border border-slate-700/80 bg-gradient-to-b from-slate-950 to-[#061126] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
            <div className="text-center text-xs tracking-[0.2em] text-slate-500">当前第 1 名</div>
            <div className="mt-3 rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-4 shadow-inner shadow-black/20">
              <UserNameOnly player={leader} mono wrap className="mx-auto max-w-[20ch] text-center text-lg leading-6 md:text-[1.35rem] md:leading-7" />
            </div>
            <div className="mt-3 rounded-2xl bg-slate-900/90 px-3 py-2 text-center text-sm text-slate-400">
              {valueLabel} <span className="font-black text-slate-100">{leader.value}</span> 次
            </div>
          </div>
          <div className="space-y-2">
            {players.slice(0, 5).map((player, index) => (
              <div key={player.id} className="flex items-center gap-3 rounded-2xl border border-slate-800/80 bg-slate-800/65 px-3 py-3 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
                <span className="shrink-0 rounded-xl bg-slate-900 px-2 py-1 font-bold text-slate-300">#{index + 1}</span>
                <UserNameOnly player={player} mono wrap className="flex-1 text-sm leading-5 text-slate-100" />
                <span className="shrink-0 rounded-xl bg-slate-950 px-2.5 py-1 font-black text-slate-100">{player.value}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-slate-800/60 p-5 text-center text-slate-500">暂无有效数据</div>
      )}
    </Card>
  );
}

function PredictionStyleRankingsPanel({ predictionStyleRankings }) {
  return <div><div className="mb-4 flex items-center justify-between gap-3"><div><h2 className="text-2xl font-black">预测风格榜</h2><p className="text-sm text-slate-400">这些榜单不改变积分，只记录玩家的竞猜风格和名场面。</p></div><Pill className="bg-slate-800 text-slate-100">趣味统计</Pill></div><div className="grid gap-5 md:grid-cols-2"><MiniRankingCard title="精准狙击榜" subtitle="完全猜中比分次数最多。" badge="精准狙击手" players={predictionStyleRankings.exactSnipers} valueLabel="完全比分" /><MiniRankingCard title="稳健大师榜" subtitle="猜中胜平负次数最多。" badge="稳健大师" players={predictionStyleRankings.steadyMasters} valueLabel="命中结果" /><MiniRankingCard title="保守大师榜" subtitle="预测打平比分次数最多。" badge="保守大师" players={predictionStyleRankings.conservativeMasters} valueLabel="预测平局" /><MiniRankingCard title="进攻狂魔榜" subtitle="预测单场总进球 ≥ 4 次数最多。" badge="进攻狂魔" players={predictionStyleRankings.attackingMadmen} valueLabel="大比分预测" /></div></div>;
}

function FunRankingsPanel({ streakRankings, reverseLightPlayer, dailyBestPlayers }) {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <Card>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-xl font-black">最高连胜排名</h3>
            <p className="text-sm text-slate-400">连续猜中胜平负即计入连胜。</p>
          </div>
          <Pill className="shrink-0 bg-yellow-500/15 text-yellow-200">大预言家</Pill>
        </div>
        <div className="space-y-3">
          {streakRankings.slice(0, 5).map((player, index) => (
            <div key={player.id} className="flex items-center gap-3 rounded-2xl border border-slate-800/80 bg-slate-800/60 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="shrink-0 font-bold text-slate-300">#{index + 1}</span>
                  <UserNameOnly player={player} mono wrap className="text-base leading-5" />
                </div>
                {index === 0 && <div className="mt-1 text-xs text-yellow-200">称号：大预言家</div>}
              </div>
              <div className="shrink-0 text-2xl font-black">{player.maxStreak}</div>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-xl font-black">反向明灯榜</h3>
            <p className="text-sm text-slate-400">当前总分最低的玩家。</p>
          </div>
          <Pill className="shrink-0 bg-rose-500/15 text-rose-200">毒奶之王</Pill>
        </div>
        {reverseLightPlayer ? (
          <div className="rounded-3xl border border-rose-300/20 bg-gradient-to-br from-rose-500/10 to-fuchsia-500/10 p-5 shadow-[0_18px_60px_rgba(88,28,135,0.18)]">
            <div className="rounded-2xl bg-slate-950/50 px-4 py-4">
              <UserNameOnly player={reverseLightPlayer} mono wrap className="mx-auto max-w-[20ch] text-center text-lg leading-6 md:text-[1.5rem] md:leading-8" />
            </div>
            <div className="mt-3 text-center text-sm text-rose-100">称号：毒奶之王</div>
            <div className="mt-4 rounded-2xl bg-slate-950 p-3 text-center text-sm text-slate-400">当前总分 {reverseLightPlayer.total} 分 · 参与 {reverseLightPlayer.played} 场</div>
          </div>
        ) : (
          <div className="rounded-2xl bg-slate-800/60 p-5 text-center text-slate-500">暂无数据</div>
        )}
      </Card>
      <Card>
        <div className="mb-4">
          <h3 className="text-xl font-black">每日最佳玩家</h3>
          <p className="text-sm text-slate-400">仅显示最近 3 个比赛日的得分最高玩家。</p>
        </div>
        <div className="max-h-[420px] space-y-3 overflow-auto pr-1">
          {dailyBestPlayers.length ? dailyBestPlayers.map((day) => (
            <div key={day.date} className="rounded-2xl bg-slate-800/60 p-3">
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="font-black">{day.date}</div>
                <Pill className="bg-slate-900 text-slate-300">{day.matchCount}场</Pill>
              </div>
              {day.winners.length ? (
                <div className="space-y-2">
                  {day.winners.slice(0, 5).map((player) => (
                    <div key={player.id} className="flex items-center gap-3 rounded-xl bg-slate-950 px-3 py-2.5">
                      <UserNameOnly player={player} mono wrap className="flex-1 text-sm leading-5" />
                      <span className="shrink-0 text-lg font-black">{day.topScore}分</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl bg-slate-950 px-3 py-2 text-sm text-slate-500">当日暂无得分</div>
              )}
            </div>
          )) : <div className="rounded-2xl bg-slate-800/60 p-5 text-center text-slate-500">结算比赛后自动记录每日最佳。</div>}
        </div>
      </Card>
    </div>
  );
}

function RankTrendChart({ players, rankingTrend }) {
  if (!rankingTrend.length) return <Card><div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><h2 className="text-2xl font-black">排名变化趋势</h2><p className="mt-1 text-sm text-slate-400">还没有已结算比赛，结算后这里会自动生成积分折线图。</p></div><Pill className="bg-slate-800 text-slate-300">等待结算</Pill></div></Card>;
  const lineColors = ["#fbbf24", "#60a5fa", "#34d399", "#fb7185", "#a78bfa", "#f97316", "#22d3ee", "#e879f9"];
  return <Card><div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-end"><div><h2 className="text-2xl font-black">排名变化趋势</h2><p className="text-sm text-slate-400">每结算一场比赛后自动刷新。纵轴显示玩家累计积分。</p></div><Pill className="bg-slate-800 text-slate-100">实时更新</Pill></div><div className="h-80 rounded-2xl border border-slate-700 bg-slate-950 p-3"><ResponsiveContainer width="100%" height="100%"><LineChart data={rankingTrend} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}><CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" /><XAxis dataKey="label" stroke="rgba(203,213,225,0.7)" tick={{ fill: "rgba(203,213,225,0.7)", fontSize: 12 }} /><YAxis allowDecimals={false} domain={[0, "auto"]} stroke="rgba(203,213,225,0.7)" tick={{ fill: "rgba(203,213,225,0.7)", fontSize: 12 }} tickFormatter={(value) => `${value}分`} /><Tooltip contentStyle={{ background: "rgba(15,23,42,0.96)", border: "1px solid rgba(148,163,184,0.35)", borderRadius: 16, color: "white" }} labelStyle={{ color: "white", fontWeight: 800 }} formatter={(value, name) => [`${value}分`, name]} labelFormatter={(label, payload) => { const item = payload?.[0]?.payload; return item?.match ? `${label} · ${item.match}` : label; }} /><Legend wrapperStyle={{ color: "rgba(203,213,225,0.8)", fontSize: 12 }} />{players.map((player, index) => <Line key={player.id} type="monotone" dataKey={player.id} name={player.name} stroke={lineColors[index % lineColors.length]} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} connectNulls />)}</LineChart></ResponsiveContainer></div></Card>;
}

function AdminPanel({ matches, players, predictions, updateMatchResult, clearMatchResult, toggleLock, funResults, onSetFunResults }) {
  const [adminQuery, setAdminQuery] = useState("");
  const [adminFilter, setAdminFilter] = useState("ALL");
  const normalizedQuery = adminQuery.trim().toLowerCase();
  const settledCount = matches.filter(isSettledMatch).length;
  const closedCount = matches.filter((match) => match.status === "closed").length;
  const filteredMatches = matches.filter((match) => {
    const text = `${match.no}${match.home}${match.away}${match.homeRaw || ""}${match.awayRaw || ""}${match.group}${match.stadium}${match.city}`.toLowerCase();
    const matchesQuery = !normalizedQuery || text.includes(normalizedQuery);
    const matchesFilter = adminFilter === "ALL" || match.status === adminFilter || (adminFilter === "GROUP" && match.stage === "GROUP");
    return matchesQuery && matchesFilter;
  });

  return (
    <section className="mt-6 space-y-5">
      <FunResultsCard funResults={funResults} onSetFunResults={onSetFunResults} />
      <Card>
        <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <h2 className="text-2xl font-black">比赛管理</h2>
            <p className="mt-1 text-sm text-slate-400">官方 API 负责赛程和队伍信息；管理员只维护锁定状态和最终比分。结算一次会同步竞猜得分和世界杯积分榜数据。</p>
          </div>
          <div className="grid gap-2 text-sm sm:grid-cols-3">
            <Pill className="bg-slate-800 text-slate-300">总场次 {matches.length}</Pill>
            <Pill className="bg-amber-500/15 text-amber-200">已锁定 {closedCount}</Pill>
            <Pill className="bg-emerald-500/15 text-emerald-200">已结算 {settledCount}</Pill>
          </div>
        </div>
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative min-w-0 lg:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input value={adminQuery} onChange={(event) => setAdminQuery(event.target.value)} placeholder="搜索场次 / 球队 / 城市" className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-sm outline-none placeholder:text-slate-500" />
          </div>
          <select value={adminFilter} onChange={(event) => setAdminFilter(event.target.value)} className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none">
            <option value="ALL">全部比赛</option>
            <option value="open">未锁定</option>
            <option value="closed">已锁定</option>
            <option value="settled">已结算</option>
            <option value="GROUP">只看小组赛</option>
          </select>
        </div>
        <div className="space-y-3">
          {filteredMatches.length ? filteredMatches.map((match) => (
            <AdminMatchRow key={match.id} match={match} players={players} predictions={predictions} onResult={updateMatchResult} onClear={clearMatchResult} onToggleLock={toggleLock} />
          )) : <div className="rounded-2xl border border-slate-700 bg-slate-950 p-6 text-center text-sm text-slate-500">没有符合条件的比赛</div>}
        </div>
      </Card>
    </section>
  );
}

function AdminMatchRow({ match, players, predictions, onResult, onClear, onToggleLock }) {
  const [homeScore, setHomeScore] = useState(match.homeScore ?? "");
  const [awayScore, setAwayScore] = useState(match.awayScore ?? "");
  const [expanded, setExpanded] = useState(false);
  React.useEffect(() => { setHomeScore(match.homeScore ?? ""); setAwayScore(match.awayScore ?? ""); }, [match.homeScore, match.awayScore]);
  const canToggle = match.status !== "settled";
  const stage = STAGES[match.stage] || STAGES.GROUP;
  const canSave = Number.isFinite(Number(homeScore)) && Number.isFinite(Number(awayScore)) && homeScore !== "" && awayScore !== "";
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-950 p-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap gap-2">
            <Pill className="bg-slate-800 text-slate-300">#{match.no}</Pill>
            <Pill className="bg-indigo-500/15 text-indigo-200">{stage.label} x{stage.multiplier}</Pill>
            <MatchStatus match={match} />
          </div>
          <div className="flex flex-wrap items-center gap-2 font-black"><TeamName name={match.home} logo={match.homeLogo} /><span className="text-slate-500">vs</span><TeamName name={match.away} logo={match.awayLogo} /></div>
          <div className="mt-1 text-xs text-slate-500">{formatDateTime(match.kickoff)} · {match.city}</div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input type="number" min="0" value={homeScore} onChange={(event) => setHomeScore(event.target.value)} className="w-16 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-center font-black outline-none" />
          <span className="text-slate-500">:</span>
          <input type="number" min="0" value={awayScore} onChange={(event) => setAwayScore(event.target.value)} className="w-16 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-center font-black outline-none" />
          <button disabled={!canSave} onClick={() => onResult(match.id, Number(homeScore), Number(awayScore))} className="rounded-xl bg-emerald-700 px-3 py-2 text-sm font-black text-emerald-50 transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-40">结算</button>
          <DarkButton disabled={!canToggle} onClick={() => onToggleLock(match.id)} className="px-3 py-2 text-sm font-black">{match.status === "open" ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}</DarkButton>
          <DarkButton disabled={!isSettledMatch(match)} onClick={() => onClear(match.id)} className="px-3 py-2 text-sm font-black">清除</DarkButton>
          {isSettledMatch(match) && <DarkButton onClick={() => setExpanded((open) => !open)} className="px-3 py-2 text-sm font-black">{expanded ? "收起得分" : "查看得分"}</DarkButton>}
        </div>
      </div>
      {expanded && isSettledMatch(match) && (
        <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {players.map((player) => {
            const pred = predictions.find((item) => item.playerId === player.id && item.matchId === match.id);
            return (
              <div key={player.id} className="flex items-center justify-between rounded-xl bg-slate-900 px-3 py-2 text-sm">
                <span className="font-bold">{player.name}</span>
                <span className="text-slate-500">{pred ? `${pred.home}:${pred.away}` : "未竞猜"}</span>
                <span className="font-black">+{calculatePoints(pred, match)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function RulesPanel() {
  return <section className="mt-6 space-y-5"><Card><h2 className="text-2xl font-black">正式规则确认版</h2><p className="mt-2 text-sm leading-relaxed text-slate-400">本系统只计算90分钟常规时间比分，包含伤停补时，不包含加时赛和点球大战。开赛前可以反复修改，开赛后自动锁定。</p></Card><div className="grid gap-5 lg:grid-cols-2"><Card><h3 className="mb-4 text-xl font-black">基础得分</h3><div className="space-y-3">{[["完全猜中比分", "4分"], ["猜中胜平负，并且猜中净胜球", "2分"], ["猜中胜平负，但比分不完全正确", "1分"], ["完全猜错", "0分"]].map(([label, value]) => <div key={label} className="flex items-center justify-between rounded-2xl bg-slate-800/60 p-4"><span>{label}</span><span className="text-2xl font-black">{value}</span></div>)}</div></Card><Card><h3 className="mb-4 text-xl font-black">淘汰赛倍率</h3><div className="space-y-3">{Object.entries(STAGES).map(([key, value]) => <div key={key} className="flex items-center justify-between rounded-2xl bg-slate-800/60 p-4"><span>{value.label}</span><span className="text-2xl font-black">x{value.multiplier}</span></div>)}</div></Card></div><Card><h3 className="mb-4 text-xl font-black">各阶段最高得分</h3><div className="overflow-hidden rounded-2xl border border-slate-700"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-800 text-slate-400"><tr><th className="px-4 py-3">阶段</th><th className="px-4 py-3">倍率</th><th className="px-4 py-3">完全比分</th><th className="px-4 py-3">胜平负+净胜球</th><th className="px-4 py-3">只中胜平负</th><th className="px-4 py-3">猜错</th></tr></thead><tbody>{Object.entries(STAGES).map(([key, value]) => <tr key={key} className="border-t border-slate-700 bg-slate-950/60"><td className="px-4 py-4 font-black">{value.label}</td><td className="px-4 py-4">x{value.multiplier}</td><td className="px-4 py-4">{4 * value.multiplier}分</td><td className="px-4 py-4">{2 * value.multiplier}分</td><td className="px-4 py-4">{1 * value.multiplier}分</td><td className="px-4 py-4">0分</td></tr>)}</tbody></table></div></Card></section>;
}

function AllHistoryPanel({ player, predictions, matches, onBack }) {
  const history = predictions
    .filter((prediction) => prediction.playerId === player.id)
    .map((prediction) => {
      const match = matches.find((item) => item.id === prediction.matchId);
      return { prediction, match, points: calculatePoints(prediction, match) };
    })
    .filter((item) => item.match && isSettledMatch(item.match))
    .sort((a, b) => new Date(b.match.kickoff).getTime() - new Date(a.match.kickoff).getTime());

  return (
    <section className="mt-6 space-y-5">
      <Card>
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="text-3xl font-black">{player.name} 的所有历史竞猜记录</h2>
            <p className="mt-2 text-sm text-slate-400">这里展示该用户的全部竞猜记录，按比赛时间倒序排列。</p>
          </div>
          <DarkButton onClick={onBack} className="px-4 py-3 text-sm font-black">返回个人主页</DarkButton>
        </div>
      </Card>
      <Card>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-black">全部历史竞猜记录</h3>
            <p className="text-sm text-slate-400">共 {history.length} 条。</p>
          </div>
          <Pill className="bg-slate-800 text-slate-300">{history.length} 条</Pill>
        </div>
        <PredictionHistoryList items={history} />
      </Card>
    </section>
  );
}
