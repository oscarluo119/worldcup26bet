import React, { useMemo, useState } from "react";
import { useRef } from "react";
import { toPng } from "html-to-image";
import {
  ArrowDown,
  ArrowUp,
  Award,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Crown,
  Download,
  Eye,
  ExternalLink,
  Flame,
  Home,
  KeyRound,
  Loader2,
  Lock,
  LogOut,
  Mail,
  Medal,
  MoonStar,
  Newspaper,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  SunMedium,
  Target,
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
import { createProfileRecord, ensureProfileRecord } from "./lib/profileRecords";
import { savePredictionWithRecovery } from "./lib/predictionSubmission";
import {
  ACHIEVEMENT_DEFINITIONS,
  ACHIEVEMENT_RARITIES,
  buildAchievementCollections,
  getAchievementBadgeClass,
  getAchievementTheme,
} from "./achievements";
import brandTrophyImage from "./assets/brand-trophy.png";
import { TeamProfileTrigger, TeamRadarComparison } from "./components/teamProfileCard";
import { getAdminCandidates, getCurrentAdmins } from "./lib/adminAccounts";
import { getDeletableUsers } from "./lib/adminDeleteUsers";
import { normalizeAuthError } from "./lib/auth";
import { getFlagRenderData } from "./lib/flags";
import { buildMatchInsights } from "./lib/matchInsights";
import { fetchMatchOdds } from "./lib/matchOdds";
import { buildMatchPredictionGroups, buildPredictionExportFileName } from "./lib/matchPredictionGroups";
import { buildScheduleMatchSummary } from "./lib/scheduleMatchSummary";
import { buildWorldCupTeamCardMatches } from "./lib/worldCupTeamCardMatches";
import {
  ASIA_ROUND2_GOALS_EVENT_ID,
  ASIA_ROUND2_GROUP_ID,
  ASIA_ROUND2_POINTS_EVENT_ID,
  FIRST_GOAL_TIME_EVENT_ID,
  SPONSOR_PREDICTION_GROUPS,
  SPONSOR_PREDICTION_EVENTS,
  SPONSOR_PREDICTION_EVENT_BY_ID,
  calculateAsiaRound2Stats,
  formatSponsorPredictionValue,
  getAutomaticSponsorPredictionResults,
  getGroupPredictionWinners,
  formatSponsorPredictionClock,
  getFirstGoalResolvedMatch,
  getPlayerSponsorTitles,
  getResolvedSponsorPredictionResults,
  getSponsorPredictionDeadlineLabel,
  getSponsorPredictionGroupStandings,
  getSponsorPredictionWinners,
  getVisiblePredictionPlayers,
  isSponsorPredictionLocked,
  mapSponsorPredictionResults,
  mapSponsorPredictions,
  splitSponsorPredictionClock,
} from "./lib/sponsorPredictions";
import { DEFAULT_WORLD_CUP_NEWS_IMAGE, FALLBACK_WORLD_CUP_NEWS, fetchWorldCupNews, isFallbackWorldCupNews } from "./lib/worldcupNews";
import { normalizeUserFacingError } from "./lib/userFacingError";

const WORLD_CUP_NEWS_CACHE_KEY = "worldcup-news-cache-v2";

function readCachedWorldCupNews() {
  if (typeof window === "undefined") return [];
  const cached = window.localStorage.getItem(WORLD_CUP_NEWS_CACHE_KEY);
  if (!cached) return [];
  try {
    const items = JSON.parse(cached);
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

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
  [31, "D组", "土耳其", "巴拉圭", "2026-06-20T11:00:00+08:00", "旧金山湾区体育场（李维斯体育场）", "圣克拉拉"],
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
const emptySponsorPredictionResults = {};
const emptySponsorPredictions = {};
const FAVORITE_TEAM_OPTIONS = [
  { teamKey: "FRA", teamName: "France", displayNameZh: "法国", flagEmoji: "🇫🇷", countryCode: "fr" },
  { teamKey: "ESP", teamName: "Spain", displayNameZh: "西班牙", flagEmoji: "🇪🇸", countryCode: "es" },
  { teamKey: "ARG", teamName: "Argentina", displayNameZh: "阿根廷", flagEmoji: "🇦🇷", countryCode: "ar" },
  { teamKey: "ENG", teamName: "England", displayNameZh: "英格兰", flagEmoji: "🇬🇧", countryCode: "gb-eng" },
  { teamKey: "POR", teamName: "Portugal", displayNameZh: "葡萄牙", flagEmoji: "🇵🇹", countryCode: "pt" },
  { teamKey: "BRA", teamName: "Brazil", displayNameZh: "巴西", flagEmoji: "🇧🇷", countryCode: "br" },
  { teamKey: "NED", teamName: "Netherlands", displayNameZh: "荷兰", flagEmoji: "🇳🇱", countryCode: "nl" },
  { teamKey: "MAR", teamName: "Morocco", displayNameZh: "摩洛哥", flagEmoji: "🇲🇦", countryCode: "ma" },
  { teamKey: "BEL", teamName: "Belgium", displayNameZh: "比利时", flagEmoji: "🇧🇪", countryCode: "be" },
  { teamKey: "GER", teamName: "Germany", displayNameZh: "德国", flagEmoji: "🇩🇪", countryCode: "de" },
  { teamKey: "CRO", teamName: "Croatia", displayNameZh: "克罗地亚", flagEmoji: "🇭🇷", countryCode: "hr" },
  { teamKey: "COL", teamName: "Colombia", displayNameZh: "哥伦比亚", flagEmoji: "🇨🇴", countryCode: "co" },
  { teamKey: "SEN", teamName: "Senegal", displayNameZh: "塞内加尔", flagEmoji: "🇸🇳", countryCode: "sn" },
  { teamKey: "MEX", teamName: "Mexico", displayNameZh: "墨西哥", flagEmoji: "🇲🇽", countryCode: "mx" },
  { teamKey: "USA", teamName: "USA", displayNameZh: "美国", flagEmoji: "🇺🇸", countryCode: "us" },
];
const DEFAULT_AVATAR_EMOJI = FAVORITE_TEAM_OPTIONS[0].flagEmoji;
const FAVORITE_TEAM_BY_EMOJI = FAVORITE_TEAM_OPTIONS.reduce((acc, item) => {
  acc[item.flagEmoji] = item;
  return acc;
}, {});
const CAMP_CONFIG = {
  A: {
    id: "A",
    shortLabel: "A阵营",
    name: "红方",
    accent: "text-rose-100",
    pill: "bg-rose-500/15 text-rose-200",
    card: "md3-card-tone-camp-red",
    panel: "from-rose-500/18 via-rose-500/8 to-transparent",
    glow: "shadow-[0_18px_50px_rgba(244,63,94,0.12)]",
  },
  B: {
    id: "B",
    shortLabel: "B阵营",
    name: "蓝方",
    accent: "text-sky-100",
    pill: "bg-sky-500/15 text-sky-200",
    card: "md3-card-tone-camp-blue",
    panel: "from-sky-500/18 via-sky-500/8 to-transparent",
    glow: "shadow-[0_18px_50px_rgba(14,165,233,0.12)]",
  },
};
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

function mapProfile(row) {
  return {
    id: row.id,
    name: row.username || row.email || "未命名用户",
    email: row.email || "",
    avatarEmoji: row.avatar_emoji || DEFAULT_AVATAR_EMOJI,
    campId: row.camp_id || null,
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

function mapLiveMatchStates(rows) {
  return rows.reduce((acc, row) => {
    const matchKey = String(row.match_id || "");
    const fixtureKey = String(row.fixture_id || "");
    const value = {
      matchId: matchKey,
      fixtureId: fixtureKey,
      displayHomeScore: row.display_home_score,
      displayAwayScore: row.display_away_score,
      matchPhase: row.match_phase || "pre_match",
      matchClock: row.match_clock || "",
      regHomeScore: row.reg_home_score,
      regAwayScore: row.reg_away_score,
      regulationFinalAvailable: Boolean(row.regulation_final_available),
      trackingUntil: row.tracking_until,
      updatedAt: row.updated_at,
      lastSyncedAt: row.last_synced_at,
    };
    if (matchKey) acc[matchKey] = value;
    if (fixtureKey) acc[fixtureKey] = value;
    return acc;
  }, {});
}

function attachLiveMatchStates(matches, liveMatchStates) {
  return matches.map((match) => {
    const liveState = liveMatchStates[match.id] || liveMatchStates[String(match.fixtureId || "")] || liveMatchStates[String(match.resultId || "")] || null;
    return liveState ? { ...match, liveState } : { ...match, liveState: null };
  });
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
  { id: "allFeatures", label: "全部功能", icon: Plus },
  { id: "completeSchedule", label: "完整赛程", icon: CalendarDays },
  { id: "worldCupStandings", label: "世界杯排名", icon: Medal },
  { id: "ranking", label: "竞猜排行榜", icon: Trophy },
  { id: "sponsorPredictions", label: "冠名预测", icon: Trophy },
  { id: "fun", label: "趣味预测", icon: Flame },
  { id: "achievements", label: "成就墙", icon: Crown },
  { id: "rules", label: "规则", icon: ShieldCheck },
  { id: "playerProfile", label: "个人主页", icon: Users },
  { id: "admin", label: "管理", icon: Settings, adminOnly: true },
];

const DESKTOP_PRIMARY_NAV_IDS = ["home", "schedule", "ranking", "achievements", "playerProfile"];
const MOBILE_PRIMARY_NAV_IDS = ["home", "schedule", "ranking", "achievements", "allFeatures"];
const THEME_OPTIONS = [
  { id: "system", label: "跟随系统", icon: Sparkles },
  { id: "light", label: "浅色", icon: SunMedium },
  { id: "dark", label: "深色", icon: MoonStar },
];

function getThemeClass(themeMode) {
  if (themeMode === "light") return "";
  if (themeMode === "dark") return "theme-dark";
  if (typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches) return "theme-dark";
  return "";
}

function teamName(name) {
  return translateDisplayText(name);
}

function getWorldCupResultKey(match) {
  return match?.resultId || Number(match?.fixtureId) || Number(match?.id) || match?.no;
}

function TeamLogo({ logo, name, size = "h-4 w-6" }) {
  const flag = getFlagRenderData({
    teamName: name,
    fallbackEmoji: TEAM_FLAGS[name] || "",
    alt: `${name} flag`,
  });
  if (flag.type === "image") return <img src={flag.src} alt={flag.alt} className={`${size} object-cover`} loading="lazy" />;
  if (flag.type === "emoji") return <span className={`inline-flex ${size} items-center justify-center text-xs`}>{flag.emoji}</span>;
  return <span className={`inline-flex ${size} items-center justify-center text-xs text-slate-400`}>?</span>;
}

function TeamName({ name, logo, className = "", interactiveProfile = false, teamCardMatches = [] }) {
  const displayName = translateDisplayText(name);
  const content = (
    <span className={`inline-flex min-w-0 items-center gap-2 ${className}`}>
      <TeamLogo logo={logo} name={displayName} />
      <span className="truncate">{displayName}</span>
    </span>
  );
  if (!interactiveProfile) return content;
  return <TeamProfileTrigger name={displayName} matches={teamCardMatches}>{content}</TeamProfileTrigger>;
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

function getCampMeta(campId) {
  return CAMP_CONFIG[campId] || null;
}

function getCampDisplayName(campId) {
  const meta = getCampMeta(campId);
  return meta ? `${meta.shortLabel} · ${meta.name}` : "未分组";
}

function buildRankingStats(player, playerPredictions, matchesById) {
  const settledPredictions = playerPredictions.filter((prediction) => isSettledMatch(matchesById[prediction.matchId]));
  const total = settledPredictions.reduce((sum, prediction) => sum + calculatePoints(prediction, matchesById[prediction.matchId]), 0);
  const exactCount = settledPredictions.filter((prediction) => calculateBasePoints(prediction, matchesById[prediction.matchId]) === 4).length;
  const netGoalOnlyCount = settledPredictions.filter((prediction) => calculateBasePoints(prediction, matchesById[prediction.matchId]) === 2).length;
  const outcomeOnlyCount = settledPredictions.filter((prediction) => calculateBasePoints(prediction, matchesById[prediction.matchId]) === 1).length;
  const outcomeCount = settledPredictions.filter((prediction) => calculateBasePoints(prediction, matchesById[prediction.matchId]) > 0).length;
  return {
    ...player,
    total,
    exactCount,
    netGoalOnlyCount,
    outcomeOnlyCount,
    outcomeCount,
    played: playerPredictions.length,
  };
}

function comparePlayers(left, right) {
  return right.total - left.total
    || right.exactCount - left.exactCount
    || right.netGoalOnlyCount - left.netGoalOnlyCount
    || right.outcomeOnlyCount - left.outcomeOnlyCount
    || right.played - left.played
    || new Date(left.joinedAt).getTime() - new Date(right.joinedAt).getTime();
}

function pickCampWinner(leftValue, rightValue, reverse = false) {
  if (leftValue === rightValue) return null;
  if (reverse) return leftValue < rightValue ? "A" : "B";
  return leftValue > rightValue ? "A" : "B";
}

function formatCampDiff(value) {
  return Number.isFinite(value) ? Math.abs(value).toFixed(1).replace(/\.0$/, "") : "0";
}

function buildCampBattleSummary(rankings, matches, predictions) {
  const campIds = ["A", "B"];
  const rankingMap = Object.fromEntries(rankings.map((player) => [player.id, player]));
  const grouped = Object.fromEntries(campIds.map((campId) => [campId, rankings.filter((player) => player.campId === campId).sort(comparePlayers)]));
  const camps = Object.fromEntries(campIds.map((campId) => {
    const members = grouped[campId];
    const total = members.reduce((sum, player) => sum + player.total, 0);
    const exactTotal = members.reduce((sum, player) => sum + player.exactCount, 0);
    const outcomeTotal = members.reduce((sum, player) => sum + player.outcomeCount, 0);
    const playedTotal = members.reduce((sum, player) => sum + player.played, 0);
    const memberCount = members.length;
    return [campId, {
      campId,
      meta: getCampMeta(campId),
      members,
      memberCount,
      total,
      average: memberCount ? total / memberCount : 0,
      exactTotal,
      outcomeTotal,
      playedTotal,
      playedAverage: memberCount ? playedTotal / memberCount : 0,
      highest: members[0]?.total ?? null,
      lowest: members.at(-1)?.total ?? null,
      topPlayer: members[0] || null,
      bottomPlayer: members.at(-1) || null,
    }];
  }));

  const settledMatches = matches.filter(isSettledMatch).sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime());
  const predictionsByMatchId = predictions.reduce((acc, prediction) => {
    if (!acc[prediction.matchId]) acc[prediction.matchId] = [];
    acc[prediction.matchId].push(prediction);
    return acc;
  }, {});

  const recentMatchBattles = settledMatches.slice(-3).reverse().map((match) => {
    const matchPredictions = predictionsByMatchId[match.id] || [];
    const perCamp = { A: 0, B: 0 };
    let mvp = null;
    matchPredictions.forEach((prediction) => {
      const player = rankingMap[prediction.playerId];
      if (!player?.campId || !(player.campId in perCamp)) return;
      const points = calculatePoints(prediction, match);
      perCamp[player.campId] += points;
      if (!mvp || points > mvp.points || (points === mvp.points && comparePlayers(player, mvp.player) < 0)) {
        mvp = { player, points };
      }
    });
    return {
      key: `match-${match.id}`,
      label: `第${match.no}场`,
      sublabel: `${teamName(match.home)} ${match.homeScore}:${match.awayScore} ${teamName(match.away)}`,
      leftValue: perCamp.A,
      rightValue: perCamp.B,
      winner: pickCampWinner(perCamp.A, perCamp.B),
      mvp,
      dateKey: formatBeijingDateKey(match.kickoff),
    };
  });

  const settledDateKeys = [...new Set(settledMatches.map((match) => formatBeijingDateKey(match.kickoff)))];
  const recentDayBattles = settledDateKeys.slice(-3).reverse().map((dateKey) => {
    const matchesOnDate = settledMatches.filter((match) => formatBeijingDateKey(match.kickoff) === dateKey);
    const perCamp = { A: 0, B: 0 };
    matchesOnDate.forEach((match) => {
      const matchPredictions = predictionsByMatchId[match.id] || [];
      matchPredictions.forEach((prediction) => {
        const player = rankingMap[prediction.playerId];
        if (!player?.campId || !(player.campId in perCamp)) return;
        perCamp[player.campId] += calculatePoints(prediction, match);
      });
    });
    return {
      key: `day-${dateKey}`,
      label: dateKey,
      sublabel: `${matchesOnDate.length} 场已结算`,
      leftValue: perCamp.A,
      rightValue: perCamp.B,
      winner: pickCampWinner(perCamp.A, perCamp.B),
    };
  });

  const metricDuels = [
    { id: "average", title: "平均分胜利", description: "人数不均衡时最公平的主指标。", leftValue: camps.A.average, rightValue: camps.B.average, winner: pickCampWinner(camps.A.average, camps.B.average), formatter: (value) => `${value.toFixed(1).replace(/\.0$/, "")}分` },
    { id: "highest", title: "王牌对决", description: "比较双方阵营头号选手。", leftValue: camps.A.highest ?? 0, rightValue: camps.B.highest ?? 0, winner: pickCampWinner(camps.A.highest ?? -1, camps.B.highest ?? -1), formatter: (value) => `${value}分` },
    { id: "lowest", title: "深度对决", description: "谁的阵营下限更稳。", leftValue: camps.A.lowest ?? 0, rightValue: camps.B.lowest ?? 0, winner: pickCampWinner(camps.A.lowest ?? -1, camps.B.lowest ?? -1), formatter: (value) => `${value}分` },
    { id: "exact", title: "精准火力", description: "完全命中比分总次数。", leftValue: camps.A.exactTotal, rightValue: camps.B.exactTotal, winner: pickCampWinner(camps.A.exactTotal, camps.B.exactTotal), formatter: (value) => `${value}次` },
    { id: "outcome", title: "稳定军团", description: "命中胜平负总次数。", leftValue: camps.A.outcomeTotal, rightValue: camps.B.outcomeTotal, winner: pickCampWinner(camps.A.outcomeTotal, camps.B.outcomeTotal), formatter: (value) => `${value}次` },
    { id: "playedAverage", title: "出勤之王", description: "比较阵营人均参与场次。", leftValue: camps.A.playedAverage, rightValue: camps.B.playedAverage, winner: pickCampWinner(camps.A.playedAverage, camps.B.playedAverage), formatter: (value) => `${value.toFixed(1).replace(/\.0$/, "")}场` },
  ];

  const leaderCampId = pickCampWinner(camps.A.average, camps.B.average)
    || pickCampWinner(camps.A.total, camps.B.total)
    || pickCampWinner(camps.A.exactTotal, camps.B.exactTotal)
    || pickCampWinner(camps.A.outcomeTotal, camps.B.outcomeTotal);

  return {
    camps,
    leaderCampId,
    availableCampCount: campIds.filter((campId) => camps[campId].memberCount > 0).length,
    averageGap: Math.abs(camps.A.average - camps.B.average),
    metricDuels,
    recentMatchBattles,
    recentDayBattles,
    latestMatchBattle: recentMatchBattles[0] || null,
    latestDayBattle: recentDayBattles[0] || null,
    lowestAverageCampId: pickCampWinner(camps.A.average, camps.B.average, true),
  };
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

function getMatchDisplayScores(match) {
  if (Number.isFinite(match?.liveState?.displayHomeScore) && Number.isFinite(match?.liveState?.displayAwayScore)) {
    return {
      home: match.liveState.displayHomeScore,
      away: match.liveState.displayAwayScore,
    };
  }
  if (Number.isFinite(match?.homeScore) && Number.isFinite(match?.awayScore)) {
    return {
      home: match.homeScore,
      away: match.awayScore,
    };
  }
  return { home: null, away: null };
}

function getLivePhaseLabel(match) {
  const phase = match?.liveState?.matchPhase;
  if (!phase) return null;
  if (phase === "pre_match") return "即将开赛";
  if (phase === "first_half" || phase === "second_half") return "比赛中";
  if (phase === "half_time") return "中场";
  if (phase === "full_time_break") return "常规时间结束";
  if (phase === "extra_time") return "加时中";
  if (phase === "penalties") return "点球中";
  if (phase === "finished") return "已结束";
  return "比赛中";
}

function getLivePhasePillClass(match) {
  const phase = match?.liveState?.matchPhase;
  if (phase === "finished") return "bg-emerald-500/15 text-emerald-200";
  if (phase === "half_time" || phase === "full_time_break") return "bg-amber-500/15 text-amber-200";
  if (phase === "extra_time" || phase === "penalties") return "bg-rose-500/15 text-rose-200";
  if (phase === "first_half" || phase === "second_half") return "bg-cyan-500/15 text-cyan-200";
  return "bg-slate-800 text-slate-300";
}

function hasLiveClock(match) {
  return Boolean(match?.liveState?.matchClock && ["first_half", "second_half", "extra_time", "penalties"].includes(match?.liveState?.matchPhase));
}

function isRegulationSettledWhileLiveContinues(match) {
  return Boolean(
    match?.liveState?.regulationFinalAvailable &&
    ["full_time_break", "extra_time", "penalties"].includes(match?.liveState?.matchPhase),
  );
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

function getPlayerTitles(player, sponsorPredictions, sponsorPredictionResults, players, matches, funPredictions, funResults, predictionStyleRankings, streakRankings, reverseLightPlayer) {
  const titles = [];
  const prediction = funPredictions[player.id];
  const resultTotalGoals = Number(funResults.totalGoals);
  const allGoalPredictions = Object.values(funPredictions).filter((item) => Number.isFinite(Number(item.totalGoals)) && Number.isFinite(resultTotalGoals));
  const closestGoalDiff = allGoalPredictions.length ? Math.min(...allGoalPredictions.map((item) => Math.abs(Number(item.totalGoals) - resultTotalGoals))) : null;

  const sponsorTitles = getPlayerSponsorTitles({
    playerId: player.id,
    players,
    sponsorPredictions,
    sponsorPredictionResults,
    matches,
  });
  if (sponsorTitles.includes("足球研究所所长")) titles.push("足球研究所所长");
  sponsorTitles.filter((title) => title !== "足球研究所所长").forEach((title) => titles.push(title));

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

function computeDateStreak(predictions) {
  const uniqueDates = [...new Set((predictions || []).map((item) => formatBeijingDateKey(item.submittedAt)))].sort();
  let best = 0;
  let current = 0;
  let previous = null;
  let achievedAt = null;

  uniqueDates.forEach((date) => {
    if (!previous) {
      current = 1;
    } else {
      const diff = (new Date(`${date}T00:00:00+08:00`).getTime() - new Date(`${previous}T00:00:00+08:00`).getTime()) / 86400000;
      current = diff === 1 ? current + 1 : 1;
    }

    if (current > best) {
      best = current;
      achievedAt = predictions.find((item) => formatBeijingDateKey(item.submittedAt) === date)?.submittedAt || null;
    }

    previous = date;
  });

  return { count: best, achievedAt };
}

function getQualificationLabel(index) {
  if (index < 2) return { label: "直接出线区", className: "bg-emerald-500/15 text-emerald-200" };
  if (index === 2) return { label: "小组第三竞争区", className: "bg-amber-500/15 text-amber-200" };
  return { label: "待追赶", className: "" };
}

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const CARD_TONE = {
  default: "md3-outline-card",
  tonal: "md3-tonal-card",
  highlight: "md3-card-tone-highlight",
  success: "md3-card-tone-success",
  warning: "md3-card-tone-warning",
  danger: "md3-card-tone-danger",
  campRed: "md3-card-tone-camp-red",
  campBlue: "md3-card-tone-camp-blue",
};

function ThemeToggle({ themeMode, onChange, compact = false }) {
  return (
    <div className={cn("flex items-center gap-1 rounded-full border p-1", compact ? "w-auto" : "w-full md:w-auto")} style={{ borderColor: "color-mix(in srgb, var(--md-sys-color-outline-variant) 68%, transparent)", background: "color-mix(in srgb, var(--md-sys-color-surface-container-high) 88%, transparent)" }}>
      {THEME_OPTIONS.map((option) => {
        const Icon = option.icon;
        const active = themeMode === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={cn("md3-button border-0 px-3 py-2 text-xs sm:text-sm", active ? "md3-button-tonal" : "md3-button-text")}
            aria-pressed={active}
            title={option.label}
          >
            <Icon className="h-4 w-4" />
            {!compact && <span>{option.label}</span>}
          </button>
        );
      })}
    </div>
  );
}

function Pill({ children, className = "", ...props }) {
  return <span className={`md3-chip ${className}`} {...props}>{children}</span>;
}

function Card({ children, className = "" }) {
  return <div className={`md3-card ${className}`}>{children}</div>;
}

function M3Button({ children, tone = "filled", className = "", ...props }) {
  const toneClass = {
    filled: "md3-button-filled",
    tonal: "md3-button-tonal",
    outline: "md3-button-outline",
    text: "md3-button-text",
    error: "md3-button-error",
  }[tone] || "md3-button-filled";

  return <button className={`md3-button ${toneClass} ${className}`} {...props}>{children}</button>;
}

function DarkButton({ children, className = "", tone = "outline", ...props }) {
  return <M3Button tone={tone} className={className} {...props}>{children}</M3Button>;
}

function M3SegmentedControl({ options, value, onChange, size = "default" }) {
  return (
    <div className="inline-flex flex-wrap gap-2 rounded-full">
      {options.map((option) => {
        const active = option.value === value;
        const disabled = option.disabled;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => !disabled && onChange(option.value)}
            disabled={disabled}
            className={cn("md3-button min-h-0", active ? "md3-button-tonal" : "md3-button-outline", size === "sm" ? "px-3 py-2 text-xs" : "px-4 py-2.5 text-sm", disabled && "opacity-50")}
          >
            {option.icon ? <option.icon className="h-4 w-4" /> : null}
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function M3Progress({ value, max, className = "" }) {
  const safeMax = Math.max(1, max || 1);
  const width = `${Math.max(0, Math.min(100, (value / safeMax) * 100))}%`;
  return <div className={`md3-progress ${className}`}><span style={{ width }} /></div>;
}

function EmptyState({ icon: Icon = Trophy, title, description, actionLabel, onAction }) {
  return (
    <div className="md3-outline-card md3-card flex flex-col items-center justify-center gap-3 px-5 py-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-[22px]" style={{ background: "color-mix(in srgb, var(--md-sys-color-primary-container) 75%, transparent)", color: "var(--md-sys-color-on-primary-container)" }}>
        <Icon className="h-7 w-7" />
      </div>
      <div>
        <div className="text-lg font-black">{title}</div>
        <p className="mt-1 text-sm md3-subtle">{description}</p>
      </div>
      {actionLabel && onAction ? <M3Button tone="tonal" onClick={onAction}>{actionLabel}</M3Button> : null}
    </div>
  );
}

function Snackbar({ open, message, tone = "info", onClose }) {
  React.useEffect(() => {
    if (!open) return undefined;
    const timer = window.setTimeout(() => onClose?.(), 2600);
    return () => window.clearTimeout(timer);
  }, [open, onClose]);

  if (!open || !message) return null;
  const Icon = tone === "error" ? XCircle : CheckCircle2;
  return (
    <div className="md3-snackbar">
      <Icon className="h-5 w-5" style={{ color: tone === "error" ? "var(--md-sys-color-error)" : "var(--md-sys-color-primary)" }} />
      <div className="flex-1">{message}</div>
      <button type="button" onClick={onClose} className="text-xs font-bold md3-subtle">关闭</button>
    </div>
  );
}

function ConfirmDialog({ open, title, description, confirmLabel = "确认", tone = "filled", onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="md3-dialog-backdrop" role="dialog" aria-modal="true">
      <div className="md3-dialog">
        <div className="mb-2 text-2xl font-black">{title}</div>
        <p className="text-sm leading-6 md3-subtle">{description}</p>
        <div className="mt-6 flex justify-end gap-3">
          <M3Button tone="text" onClick={onCancel}>取消</M3Button>
          <M3Button tone={tone} onClick={onConfirm}>{confirmLabel}</M3Button>
        </div>
      </div>
    </div>
  );
}

function HeroBanner() {
  return (
    <section className="md3-hero">
      <div className="relative z-10 max-w-3xl">
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">欢迎来到2026美加墨世界杯</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-50/86 sm:text-base">本次竞猜由月半洛夫维奇独家赞助。</p>
      </div>
    </section>
  );
}

function SideNav({ tabs: visibleTabs, activeTab, currentPlayerId, setActiveTab, setSelectedProfilePlayerId, currentPlayer, signOut, isAdmin, dataError }) {
  const desktopMainTabs = visibleTabs.filter((tab) => DESKTOP_PRIMARY_NAV_IDS.includes(tab.id));
  const mobileMainTabs = visibleTabs.filter((tab) => MOBILE_PRIMARY_NAV_IDS.includes(tab.id));
  const extraTabs = visibleTabs.filter((tab) => !DESKTOP_PRIMARY_NAV_IDS.includes(tab.id) && !MOBILE_PRIMARY_NAV_IDS.includes(tab.id) && tab.id !== "admin");
  const adminTabs = visibleTabs.filter((tab) => tab.id === "admin");

  function activateTab(tabId) {
    if (tabId === "playerProfile") setSelectedProfilePlayerId(currentPlayerId);
    setActiveTab(tabId);
  }

  function renderTab(tab, mobile = false) {
    const Icon = tab.icon;
    const active = activeTab === tab.id;
    return (
      <button
        key={tab.id}
        type="button"
        onClick={() => activateTab(tab.id)}
        className={cn(
          "group flex items-center gap-3 rounded-[22px] px-4 py-3 text-left transition",
          mobile ? "min-w-0 flex-1 flex-col gap-1.5 rounded-[18px] px-1.5 py-2 text-center text-[12px] font-semibold" : "w-full text-sm font-semibold",
          active ? "md3-filled-card" : "md3-outline-card",
        )}
      >
        <span className={cn("flex items-center justify-center rounded-full", mobile ? "h-9 w-9" : "h-10 w-10")} style={{ background: active ? "color-mix(in srgb, var(--md-sys-color-primary-container) 92%, transparent)" : "color-mix(in srgb, var(--md-sys-color-surface-container-highest) 90%, transparent)", color: active ? "var(--md-sys-color-on-primary-container)" : "var(--md-sys-color-on-surface-variant)" }}>
          <Icon className={cn("h-4 w-4", mobile && "h-[18px] w-[18px]")} />
        </span>
        <span className={cn("min-w-0", mobile ? "max-w-full truncate leading-tight" : "flex-1")}>{tab.label}</span>
      </button>
    );
  }

  return (
    <>
      <aside className="md3-nav-drawer">
        <div className="md3-card md3-surface sticky top-5 flex max-h-[calc(100vh-40px)] flex-col overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-[24px]" style={{ background: "linear-gradient(135deg, var(--md-sys-color-secondary), var(--md-sys-color-primary))", color: "white" }}>
              <img src={brandTrophyImage} alt="World Cup trophy" className="h-12 w-12 object-contain" />
            </div>
            <div>
              <div className="text-lg font-black">来来来聪明的小孩</div>
              <div className="text-xs md3-subtle">world cup 2026</div>
            </div>
          </div>
          <div className="mt-5 rounded-[24px] border p-4" style={{ borderColor: "color-mix(in srgb, var(--md-sys-color-outline-variant) 64%, transparent)", background: "color-mix(in srgb, var(--md-sys-color-surface-container-low) 84%, transparent)" }}>
            <div className="flex items-center gap-3">
              <UserBadge player={currentPlayer} size="h-12 w-12" text="text-lg" />
              <div className="min-w-0">
                <div className="truncate font-black">{currentPlayer?.name}</div>
                <div className="truncate text-xs md3-subtle">{currentPlayer?.email}</div>
              </div>
            </div>
            {isAdmin ? <Pill className="mt-3">{`管理员模式`}</Pill> : null}
            <M3Button tone="outline" onClick={signOut} className="mt-4 w-full justify-center">
              <LogOut className="h-4 w-4" />
              退出登录
            </M3Button>
            {dataError ? <div className="mt-3 rounded-[18px] border px-3 py-2 text-xs" style={{ borderColor: "color-mix(in srgb, var(--md-sys-color-error) 35%, transparent)", background: "color-mix(in srgb, var(--md-sys-color-error-container) 84%, transparent)", color: "var(--md-sys-color-on-error-container)" }}>{dataError}</div> : null}
          </div>
          <nav className="mt-5 flex-1 overflow-auto pr-1">
            <div className="space-y-2">{desktopMainTabs.map((tab) => renderTab(tab))}</div>
            {extraTabs.length ? <div className="mt-5 border-t pt-4" style={{ borderColor: "color-mix(in srgb, var(--md-sys-color-outline-variant) 58%, transparent)" }}><div className="mb-3 px-2 text-xs font-bold uppercase tracking-[0.18em] md3-subtle">扩展内容</div><div className="space-y-2">{extraTabs.map((tab) => renderTab(tab))}</div></div> : null}
            {adminTabs.length ? <div className="mt-5 border-t pt-4" style={{ borderColor: "color-mix(in srgb, var(--md-sys-color-outline-variant) 58%, transparent)" }}><div className="mb-3 px-2 text-xs font-bold uppercase tracking-[0.18em] md3-subtle">管理入口</div><div className="space-y-2">{adminTabs.map((tab) => renderTab(tab))}</div></div> : null}
          </nav>
        </div>
      </aside>
      <nav className="md3-bottom-nav">
        {mobileMainTabs.map((tab) => renderTab(tab, true))}
      </nav>
    </>
  );
}

function AvatarBadge({ children, size = "h-10 w-10", text = "text-xl" }) {
  return <div className={`flex ${size} items-center justify-center rounded-[20px] border ${text}`} style={{ borderColor: "color-mix(in srgb, var(--md-sys-color-outline-variant) 64%, transparent)", background: "color-mix(in srgb, var(--md-sys-color-surface-container-highest) 88%, transparent)", color: "var(--md-sys-color-on-surface)" }}>{children}</div>;
}

function FlagIcon({ team, className = "", alt = "" }) {
  const flag = getFlagRenderData({
    teamName: team?.displayNameZh || team?.teamName || "",
    countryCode: team?.countryCode || "",
    fallbackEmoji: team?.flagEmoji || "",
    alt: alt || team?.displayNameZh || team?.teamName || "",
  });
  if (flag.type === "image") return <img src={flag.src} alt={flag.alt} className={className} loading="lazy" />;
  if (flag.type === "emoji") return <span className={cn("emoji-glyph", className)}>{flag.emoji}</span>;
  return <span className={cn("emoji-glyph", className)}>🏳️</span>;
}

function UserBadge({ player, size = "h-10 w-10", text = "text-sm" }) {
  const label = (player?.name || player?.email || "").trim().slice(0, 1).toUpperCase();
  const favoriteTeam = FAVORITE_TEAM_BY_EMOJI[player?.avatarEmoji];
  return (
    <div className={`flex ${size} shrink-0 items-center justify-center rounded-[20px] border ${text} font-black`} style={{ borderColor: "color-mix(in srgb, var(--md-sys-color-outline-variant) 64%, transparent)", background: "linear-gradient(135deg, color-mix(in srgb, var(--md-sys-color-primary-container) 88%, transparent), color-mix(in srgb, var(--md-sys-color-tertiary-container) 55%, transparent))", color: "var(--md-sys-color-on-primary-container)" }}>
      {favoriteTeam ? <FlagIcon team={favoriteTeam} alt={favoriteTeam.displayNameZh} className="h-[1.2em] w-[1.6em] object-cover" /> : player?.avatarEmoji ? <span className="emoji-glyph leading-none">{player.avatarEmoji}</span> : label || <User className="h-4 w-4" />}
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
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
      {FAVORITE_TEAM_OPTIONS.map((team) => {
        const selected = value === team.flagEmoji;
        return (
          <button
            key={team.teamKey}
            type="button"
            disabled={disabled}
            onClick={() => onChange(team.flagEmoji)}
            className={`flex min-h-[68px] w-full flex-col items-center justify-center rounded-xl border px-2 py-2 text-center transition disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-[74px] ${selected ? "border-emerald-300 bg-emerald-500/15 shadow-lg shadow-emerald-950/30" : "border-slate-700 bg-slate-950 hover:bg-emerald-950/45"}`}
            aria-label={`选择 ${team.displayNameZh} 作为支持球队头像`}
            title={team.displayNameZh}
          >
            <FlagIcon team={team} alt={team.displayNameZh} className="h-6 w-9 object-cover sm:h-7 sm:w-10" />
            <span className="mt-1.5 text-[11px] font-bold leading-tight text-slate-200 sm:mt-2 sm:text-xs">{team.displayNameZh}</span>
          </button>
        );
      })}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, className = "", compact = false }) {
  return (
    <Card className={cn("md3-filled-card relative overflow-hidden", compact && "!p-3.5 sm:!p-5", className)}>
      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-70" style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--md-sys-color-secondary) 32%, transparent), transparent 65%)" }} />
      <div className={cn("relative flex items-center gap-3", compact && "items-start")}>
        <div className={cn("rounded-[20px] p-3", compact && "rounded-[16px] p-2.5")} style={{ background: "color-mix(in srgb, var(--md-sys-color-primary-container) 88%, transparent)", color: "var(--md-sys-color-on-primary-container)" }}><Icon className={cn("h-5 w-5", compact && "h-4 w-4")} /></div>
        <div>
          <div className={cn("text-sm md3-subtle", compact && "text-xs")}>{label}</div>
          <div className={cn("text-2xl font-black tracking-tight", compact && "text-[1.35rem] leading-6 sm:text-2xl")}>{value}</div>
          {sub && <div className={cn("mt-1 text-xs md3-subtle", compact && "mt-0.5 text-[11px] leading-4")}>{sub}</div>}
        </div>
      </div>
    </Card>
  );
}

function LoadingScreen({ message = "正在加载..." }) {
  return (
    <div className="md3-app flex min-h-screen items-center justify-center px-4">
      <div className="md3-card flex items-center gap-3 px-5 py-4">
        <Loader2 className="h-5 w-5 animate-spin" style={{ color: "var(--md-sys-color-primary)" }} />
        <span className="text-sm font-bold">{message}</span>
      </div>
    </div>
  );
}

function SupabaseSetupScreen() {
  return (
    <div className="md3-app flex min-h-screen items-center justify-center px-4">
      <Card className="max-w-xl">
        <div className="mb-3 flex items-center gap-3">
          <ShieldCheck className="h-6 w-6" style={{ color: "var(--md-sys-color-primary)" }} />
          <h1 className="text-2xl font-black">需要配置 Supabase</h1>
        </div>
        <p className="text-sm leading-relaxed md3-subtle">
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
        if (data.user && data.session) {
          await createProfileRecord({
            supabase,
            userId: data.user.id,
            email: data.user.email || cleanEmail,
            username: cleanUsername,
            avatarEmoji,
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
      const normalizedAuthError = normalizeAuthError(authError, mode);
      setError(normalizedAuthError.message);
      if (normalizedAuthError.nextMode && normalizedAuthError.nextMode !== mode) {
        setMode(normalizedAuthError.nextMode);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="md3-app flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-4 text-center sm:mb-6">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-[24px] sm:mb-4 sm:h-16 sm:w-16 sm:rounded-[28px]" style={{ background: "linear-gradient(135deg, var(--md-sys-color-secondary), var(--md-sys-color-primary))", color: "white", boxShadow: "var(--md-shadow-2)" }}>
            <img src={brandTrophyImage} alt="World Cup trophy" className="h-12 w-12 object-contain sm:h-14 sm:w-14" />
          </div>
          <h1 className="text-[2rem] font-black leading-tight sm:text-3xl">来来来聪明的小孩</h1>
        </div>
        <Card className="px-4 py-4 sm:px-5 sm:py-5">
          <M3SegmentedControl
            options={[
              { value: "login", label: "登录" },
              { value: "register", label: "注册" },
            ]}
            value={mode}
            onChange={setMode}
          />
          <form onSubmit={submitAuth} className="space-y-4">
            {isRegister && (
              <label className="block">
                <span className="md3-label">用户名</span>
                <div className="flex items-center gap-2 rounded-[18px] px-4 py-3 md3-field">
                  <User className="h-4 w-4 md3-subtle" />
                  <input value={username} onChange={(event) => setUsername(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="例如 Oscar" />
                </div>
              </label>
            )}
            {isRegister && (
              <div>
                <div className="md3-label">选择看好的夺冠国家球队</div>
                <p className="mb-2 text-xs leading-5 text-slate-500">这会作为你的头像显示。</p>
                <EmojiPicker value={avatarEmoji} onChange={setAvatarEmoji} disabled={loading} />
              </div>
            )}
            <label className="block">
              <span className="md3-label">邮箱</span>
              <div className="flex items-center gap-2 rounded-[18px] px-4 py-3 md3-field">
                <Mail className="h-4 w-4 md3-subtle" />
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="you@example.com" />
              </div>
            </label>
            <label className="block">
              <span className="md3-label">密码</span>
              <div className="flex items-center gap-2 rounded-[18px] px-4 py-3 md3-field">
                <KeyRound className="h-4 w-4 md3-subtle" />
                <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="至少 6 位密码" />
              </div>
            </label>
            {error && <div className="rounded-[18px] border px-4 py-3 text-sm" style={{ borderColor: "color-mix(in srgb, var(--md-sys-color-error) 32%, transparent)", background: "color-mix(in srgb, var(--md-sys-color-error-container) 82%, transparent)", color: "var(--md-sys-color-on-error-container)" }}>{error}</div>}
            {message && <div className="rounded-[18px] border px-4 py-3 text-sm" style={{ borderColor: "color-mix(in srgb, var(--md-sys-color-primary) 24%, transparent)", background: "color-mix(in srgb, var(--md-sys-color-primary-container) 84%, transparent)", color: "var(--md-sys-color-on-primary-container)" }}>{message}</div>}
            <M3Button disabled={loading} className="w-full justify-center">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isRegister ? "注册并进入" : "登录竞猜"}
            </M3Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

function MatchStatus({ match }) {
  const liveLabel = getLivePhaseLabel(match);
  if (liveLabel) return <Pill className={getLivePhasePillClass(match)}>{liveLabel}</Pill>;
  if (match.status === "settled") return <Pill className="bg-emerald-500/15 text-emerald-200">已结算</Pill>;
  if (isMatchLocked(match)) return <Pill className="bg-amber-500/15 text-amber-200">已锁定</Pill>;
  return <Pill style={{ background: "var(--md-sys-color-tertiary-container)", color: "var(--md-sys-color-on-tertiary-container)" }}>可竞猜</Pill>;
}

function MatchCountdown({ match, now }) {
  if (hasLiveClock(match)) return <Pill className="bg-cyan-500/15 text-cyan-200">比赛中：{match.liveState.matchClock}</Pill>;
  if (match?.liveState?.matchPhase === "half_time") return <Pill className="bg-amber-500/15 text-amber-200">中场</Pill>;
  if (match?.liveState?.matchPhase === "full_time_break") return <Pill className="bg-amber-500/15 text-amber-200">常规时间已结束</Pill>;
  if (match?.liveState?.matchPhase === "extra_time") return <Pill className="bg-rose-500/15 text-rose-200">加时赛进行中</Pill>;
  if (match?.liveState?.matchPhase === "penalties") return <Pill className="bg-rose-500/15 text-rose-200">点球大战进行中</Pill>;
  if (match?.liveState?.matchPhase === "finished") return <Pill className="bg-emerald-500/15 text-emerald-200">比赛已结束</Pill>;
  if (match.status === "settled") return <Pill className="bg-emerald-500/15 text-emerald-200">已结束</Pill>;
  if (isMatchLocked(match, now)) return <Pill className="bg-amber-500/15 text-amber-200">已锁定</Pill>;
  return <Pill style={{ background: "var(--md-sys-color-secondary-container)", color: "var(--md-sys-color-on-secondary-container)" }}>距离锁定：{formatCountdown(match.kickoff, now)}</Pill>;
}

function MatchScore({ match }) {
  const score = getMatchDisplayScores(match);
  if (!Number.isFinite(score.home) || !Number.isFinite(score.away)) return <span className="md3-subtle">vs</span>;
  return <span className="rounded-[16px] border px-3 py-1 text-base font-black" style={{ borderColor: "color-mix(in srgb, var(--md-sys-color-outline-variant) 64%, transparent)", background: "color-mix(in srgb, var(--md-sys-color-surface-container-highest) 86%, transparent)" }}>{score.home} : {score.away}</span>;
}

function RegulationSettlementNotice({ match, className = "" }) {
  if (!isRegulationSettledWhileLiveContinues(match)) return null;
  return <div className={`rounded-[18px] border px-3 py-2 text-xs ${className}`} style={{ borderColor: "color-mix(in srgb, var(--md-sys-color-secondary) 24%, transparent)", background: "color-mix(in srgb, var(--md-sys-color-secondary-container) 58%, transparent)", color: "var(--md-sys-color-on-secondary-container)" }}>竞猜已按常规时间结算，实时比分仅供观赛。</div>;
}

function WorldCupNewsPreviewDialog({ item, onClose }) {
  if (!item) return null;
  return (
    <div className="md3-dialog-backdrop" role="dialog" aria-modal="true">
      <div className="md3-dialog max-w-2xl">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Pill className="bg-emerald-500/15 text-emerald-200">世界杯新闻</Pill>
          <Pill>{item.source === "hupu" ? "虎扑" : "懂球帝"}</Pill>
        </div>
        <div className="text-2xl font-black leading-8">{item.title}</div>
        <div className="mt-2 text-xs md3-subtle">{formatDateTime(item.publishedAt || item.fetchedAt)}</div>
        <NewsThumbnail item={item} className="mt-4 max-h-64 w-full rounded-[24px] object-cover" />
        {item.summary ? <p className="mt-4 text-sm leading-7 md3-subtle">{item.summary}</p> : null}
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <M3Button tone="text" onClick={onClose}>关闭</M3Button>
          <a href={item.url} target="_blank" rel="noreferrer" className="inline-flex">
            <M3Button tone="filled">
              <span className="inline-flex items-center gap-2">
                查看原文
                <ExternalLink className="h-4 w-4" />
              </span>
            </M3Button>
          </a>
        </div>
      </div>
    </div>
  );
}

function NewsThumbnail({ item, className = "", fixedHeightClassName = "h-32" }) {
  const [src, setSrc] = useState(item?.thumbnailUrl || DEFAULT_WORLD_CUP_NEWS_IMAGE);

  React.useEffect(() => {
    setSrc(item?.thumbnailUrl || DEFAULT_WORLD_CUP_NEWS_IMAGE);
  }, [item?.thumbnailUrl, item?.id]);

  return (
    <img
      src={src || DEFAULT_WORLD_CUP_NEWS_IMAGE}
      alt={item?.title || "世界杯新闻配图"}
      className={`${fixedHeightClassName} w-full object-cover ${className}`.trim()}
      loading="lazy"
      onError={() => setSrc(DEFAULT_WORLD_CUP_NEWS_IMAGE)}
    />
  );
}

function WorldCupNewsMarquee({ items, loading, onOpenNews }) {
  const scrollRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const list = items.length > 1 ? [...items, ...items] : items;

  React.useEffect(() => {
    const node = scrollRef.current;
    if (!node || paused || items.length <= 1) return undefined;

    const timer = window.setInterval(() => {
      if (!node) return;
      const next = node.scrollLeft + 1;
      const loopPoint = node.scrollWidth / 2;
      node.scrollLeft = next >= loopPoint ? 0 : next;
    }, 24);

    return () => window.clearInterval(timer);
  }, [items.length, paused]);

  return (
    <Card className="md3-filled-card !p-3.5 sm:!p-5">
      <div className="mb-3 flex items-center justify-between gap-3 sm:mb-4">
        <div>
          <h2 className="md3-section-title text-[1.15rem] sm:text-[1.5rem]">世界杯新闻</h2>
        </div>
        <Pill>{items.length} 条</Pill>
      </div>

      {loading && !items.length ? (
        <EmptyState icon={Newspaper} title="正在刷新世界杯新闻" description="稍等一下，新闻流正在更新。" />
      ) : !items.length ? (
        <EmptyState icon={Newspaper} title="暂时没有可展示的世界杯新闻" description="新闻抓取恢复后，这里会自动出现最新资讯。" />
      ) : (
        <div
          ref={scrollRef}
          className="overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="flex min-w-max gap-3 pr-3">
            {list.map((item, index) => (
              <button
                key={`${item.id}-${index}`}
                type="button"
                onClick={() => onOpenNews(item)}
                className="group w-[18rem] shrink-0 overflow-hidden rounded-[24px] border text-left transition hover:-translate-y-0.5"
                style={{
                  borderColor: "color-mix(in srgb, var(--md-sys-color-outline-variant) 60%, transparent)",
                  background: "color-mix(in srgb, var(--md-sys-color-surface-container-highest) 82%, transparent)",
                }}
              >
                <NewsThumbnail item={item} />
                <div className="p-4">
                  <div className="mb-2 flex items-center gap-2 text-[11px]">
                    <Pill className="bg-emerald-500/15 text-emerald-200">{item.source === "hupu" ? "虎扑" : "懂球帝"}</Pill>
                    <span className="md3-subtle">{formatDateOnly(item.publishedAt || item.fetchedAt)}</span>
                  </div>
                  <div className="line-clamp-2 text-sm font-black leading-6 text-slate-100 group-hover:text-[color:var(--md-sys-color-primary)]">{item.title}</div>
                  {item.summary ? <div className="mt-2 line-clamp-2 text-xs leading-5 md3-subtle">{item.summary}</div> : null}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

export default function WorldCupPredictionMVP() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState("");
  const [themeMode, setThemeMode] = useState(() => {
    if (typeof window === "undefined") return "dark";
    return window.localStorage.getItem("worldcup-theme-mode") || "dark";
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: "", tone: "info" });
  const [dialog, setDialog] = useState({ open: false, title: "", description: "", confirmLabel: "确认", tone: "filled", onConfirm: null });
  const [activeTab, setActiveTab] = useState("home");
  const [players, setPlayers] = useState(initialPlayers);
  const [currentPlayerId, setCurrentPlayerId] = useState("");
  const [completeSchedule, setCompleteSchedule] = useState(FALLBACK_COMPLETE_WORLD_CUP_SCHEDULE);
  const [scheduleSource, setScheduleSource] = useState("local");
  const [matches, setMatches] = useState(getFallbackMatches());
  const [predictions, setPredictions] = useState([]);
  const [funPredictions, setFunPredictions] = useState({});
  const [funResults, setFunResults] = useState(emptyFunResults);
  const [sponsorPredictions, setSponsorPredictions] = useState(emptySponsorPredictions);
  const [sponsorPredictionResults, setSponsorPredictionResults] = useState(emptySponsorPredictionResults);
  const [worldCupResults, setWorldCupResults] = useState({});
  const [worldCupNews, setWorldCupNews] = useState(() => readCachedWorldCupNews());
  const [newsLoading, setNewsLoading] = useState(() => readCachedWorldCupNews().length === 0);
  const [selectedNewsItem, setSelectedNewsItem] = useState(null);
  const [selectedMatchId, setSelectedMatchId] = useState("");
  const [selectedProfilePlayerId, setSelectedProfilePlayerId] = useState("");
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("ALL");
  const baseMatchesRef = useRef(getFallbackMatches());

  const currentTime = useCurrentTime();
  const fallbackPlayer = session?.user ? {
    id: session.user.id,
    name: getDisplayName(session.user),
    email: session.user.email || "",
    avatarEmoji: session.user.user_metadata?.avatar_emoji || DEFAULT_AVATAR_EMOJI,
    campId: null,
    isAdmin: false,
    joinedAt: session.user.created_at || new Date().toISOString(),
  } : null;
  const currentPlayer = players.find((p) => p.id === currentPlayerId) || fallbackPlayer || players[0];
  const profilePlayer = players.find((p) => p.id === selectedProfilePlayerId) || currentPlayer;
  const isAdmin = Boolean(currentPlayer?.isAdmin);
  const visibleDataError = dataError;
  const visibleTabs = tabs.filter((tab) => !tab.adminOnly || isAdmin);
  const firstKickoff = useMemo(() => matches.reduce((earliest, match) => {
    const kickoff = new Date(match.kickoff);
    return kickoff < earliest ? kickoff : earliest;
  }, new Date(matches[0]?.kickoff || Date.now())), [matches]);
  const funPredictionLocked = new Date() >= firstKickoff;
  const resolvedSponsorPredictionResults = useMemo(
    () => getResolvedSponsorPredictionResults({ matches, sponsorPredictionResults }),
    [matches, sponsorPredictionResults],
  );

  React.useEffect(() => {
    if (typeof window === "undefined") return undefined;
    window.localStorage.setItem("worldcup-theme-mode", themeMode);
    document.documentElement.classList.toggle("theme-dark", getThemeClass(themeMode) === "theme-dark");
    return undefined;
  }, [themeMode]);

  function openSnackbar(message, tone = "info") {
    setSnackbar({ open: true, message, tone });
  }

  function showUserError(error, context = "general") {
    const normalized = normalizeUserFacingError(error, context);
    setDataError(normalized.message);
    openSnackbar(normalized.message, "error");
    return normalized;
  }

  function getUserErrorMessage(error, context = "general") {
    return normalizeUserFacingError(error, context).message;
  }

  function closeSnackbar() {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }

  function openDialog(config) {
    setDialog({ open: true, confirmLabel: "确认", tone: "filled", ...config });
  }

  function closeDialog() {
    setDialog({ open: false, title: "", description: "", confirmLabel: "确认", tone: "filled", onConfirm: null });
  }

  React.useEffect(() => {
    let cancelled = false;

    async function loadWorldCupNews() {
      setNewsLoading(true);
      const cachedItems = readCachedWorldCupNews();
      try {
        const items = await fetchWorldCupNews({
          supabase,
          isSupabaseConfigured,
          supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
          supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        });
        if (cancelled) return;
        const nextItems = isFallbackWorldCupNews(items) && cachedItems.length ? cachedItems : items;
        setWorldCupNews(nextItems);
        if (typeof window !== "undefined" && !isFallbackWorldCupNews(nextItems)) {
          window.localStorage.setItem(WORLD_CUP_NEWS_CACHE_KEY, JSON.stringify(nextItems));
        }
      } catch {
        if (cancelled) return;
        if (cachedItems.length) {
          setWorldCupNews(cachedItems);
          return;
        }
        setWorldCupNews(FALLBACK_WORLD_CUP_NEWS);
      } finally {
        if (!cancelled) setNewsLoading(false);
      }
    }

    loadWorldCupNews();
    return () => {
      cancelled = true;
    };
  }, []);

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
    await ensureProfileRecord({
      supabase,
      user,
      getDisplayName,
      defaultAvatarEmoji: DEFAULT_AVATAR_EMOJI,
    });
  }

  async function loadSupabaseData(baseMatches) {
    const [
      profilesResult,
      predictionsResult,
      funPredictionsResult,
      sponsorPredictionsResult,
      matchOverridesResult,
      liveMatchStatesResult,
      worldCupResultsResult,
      funResultsResult,
      sponsorPredictionResultsResult,
    ] = await Promise.all([
      supabase.from("profiles").select("*").order("joined_at", { ascending: true }),
      supabase.from("predictions").select("*").order("submitted_at", { ascending: true }),
      supabase.from("fun_predictions").select("*"),
      supabase.from("sponsor_predictions").select("*"),
      supabase.from("match_overrides").select("*"),
      supabase.from("live_match_states").select("*"),
      supabase.from("world_cup_results").select("*"),
      supabase.from("fun_results").select("*").eq("id", "main").maybeSingle(),
      supabase.from("sponsor_prediction_results").select("*"),
    ]);

    const firstError = [
      profilesResult,
      predictionsResult,
      funPredictionsResult,
      sponsorPredictionsResult,
      matchOverridesResult,
      liveMatchStatesResult,
      worldCupResultsResult,
      funResultsResult,
      sponsorPredictionResultsResult,
    ].find((result) => result.error)?.error;
    if (firstError) throw firstError;

    const validMatchIds = new Set(baseMatches.map((match) => match.id));
    const liveMatchStates = mapLiveMatchStates(liveMatchStatesResult.data || []);
    const mergedMatches = mergeMatchOverrides(matchOverridesResult.data || [], baseMatches);
    const hydratedMatches = attachLiveMatchStates(mergedMatches, liveMatchStates);
    setPlayers((profilesResult.data || []).map(mapProfile));
    setPredictions((predictionsResult.data || []).map(mapPrediction).filter((prediction) => validMatchIds.has(prediction.matchId)));
    setFunPredictions(mapFunPredictions(funPredictionsResult.data || []));
    setSponsorPredictions(mapSponsorPredictions(sponsorPredictionsResult.data || []));
    setCompleteSchedule(hydratedMatches);
    setMatches(hydratedMatches);
    setWorldCupResults(mapWorldCupResults(worldCupResultsResult.data || []));
    setFunResults(mapFunResults(funResultsResult.data));
    setSponsorPredictionResults(mapSponsorPredictionResults(sponsorPredictionResultsResult.data || []));
  }

  async function refreshSupabaseData() {
    await loadSupabaseData(baseMatchesRef.current);
  }

  React.useEffect(() => {
    let cancelled = false;
    async function bootstrapData() {
      if (!session?.user) {
        baseMatchesRef.current = getFallbackMatches();
        setPlayers([]);
        setPredictions([]);
        setFunPredictions({});
        setSponsorPredictions(emptySponsorPredictions);
        setSponsorPredictionResults(emptySponsorPredictionResults);
        setCompleteSchedule(FALLBACK_COMPLETE_WORLD_CUP_SCHEDULE);
        setScheduleSource("local");
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
        const baseSchedule = FALLBACK_COMPLETE_WORLD_CUP_SCHEDULE;
        const baseMatches = getFallbackMatches();
        setScheduleSource("local");
        baseMatchesRef.current = baseMatches;
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
        if (!cancelled) setDataError(getUserErrorMessage(error, "data_load"));
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
    if (!session?.user || !isSupabaseConfigured) return undefined;

    let stopped = false;
    const timer = window.setInterval(async () => {
      try {
        await refreshSupabaseData();
      } catch (error) {
        if (!stopped) {
          setDataError((prev) => prev || getUserErrorMessage(error, "data_refresh"));
        }
      }
    }, 60000);

    return () => {
      stopped = true;
      window.clearInterval(timer);
    };
  }, [session?.user?.id]);

  React.useEffect(() => {
    if (!isAdmin && activeTab === "admin") setActiveTab("home");
  }, [isAdmin, activeTab]);

  const matchesById = useMemo(() => Object.fromEntries(matches.map((match) => [match.id, match])), [matches]);

  const rankings = useMemo(() => players
    .map((player) => {
      const playerPredictions = predictions.filter((prediction) => prediction.playerId === player.id);
      return buildRankingStats(player, playerPredictions, matchesById);
    })
    .sort(comparePlayers), [players, predictions, matchesById]);

  const rankingTrend = useMemo(() => {
    const settledMatches = matches.filter(isSettledMatch).sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime());
    const settledMatchesById = Object.fromEntries(settledMatches.map((match) => [match.id, match]));
    return settledMatches.map((currentMatch, index) => {
      const includedMatchIds = new Set(settledMatches.slice(0, index + 1).map((m) => m.id));
      const snapshot = players
        .map((player) => {
          const playerPredictions = predictions.filter((prediction) => prediction.playerId === player.id && includedMatchIds.has(prediction.matchId));
          return buildRankingStats(player, playerPredictions, settledMatchesById);
        })
        .sort(comparePlayers);
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

  const reverseLightPlayer = useMemo(() => [...rankings].sort((a, b) => a.total - b.total || a.exactCount - b.exactCount || a.netGoalOnlyCount - b.netGoalOnlyCount || a.outcomeOnlyCount - b.outcomeOnlyCount || b.played - a.played || new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime())[0], [rankings]);

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
  const scheduleVisibleMatches = useMemo(() => filterVisibleScheduleMatches(filteredMatches, currentTime, 1), [filteredMatches, currentTime]);
  const groupedMatches = groupByDate(scheduleVisibleMatches);
  const unPredictedCount = matches.filter((match) => !predictions.some((p) => p.playerId === currentPlayerId && p.matchId === match.id)).length;
  const settledCount = matches.filter(isSettledMatch).length;
  const worldCupStandings = useMemo(() => buildWorldCupStandings(completeSchedule, worldCupResults), [completeSchedule, worldCupResults]);
  const worldCupSettledCount = useMemo(() => Object.values(worldCupResults).filter(isWorldCupResultSettled).length, [worldCupResults]);
  const worldCupTeamCardMatches = useMemo(() => buildWorldCupTeamCardMatches(completeSchedule, worldCupResults, matches), [completeSchedule, worldCupResults, matches]);
  const campBattleSummary = useMemo(() => buildCampBattleSummary(rankings, matches, predictions), [rankings, matches, predictions]);
  const nextOpenMatch = useMemo(
    () => [...matches].filter((match) => !isMatchLocked(match, currentTime)).sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime())[0],
    [matches, currentTime],
  );
  React.useEffect(() => {
    setSelectedMatchId((prev) => {
      if (!scheduleVisibleMatches.length) return "";
      if (!prev) return prev;
      return scheduleVisibleMatches.some((match) => match.id === prev) ? prev : "";
    });
  }, [scheduleVisibleMatches]);

  async function upsertPrediction(matchId, home, away) {
    const match = matches.find((m) => m.id === matchId);
    const existed = predictions.some((p) => p.playerId === currentPlayerId && p.matchId === matchId);
    const result = await savePredictionWithRecovery({
      supabase,
      match,
      currentPlayerId,
      sessionUser: session?.user || null,
      home,
      away,
      now: currentTime,
      existed,
      ensureProfile,
      logger: (label, payload) => console.error(label, payload),
    });
    if (!result.ok) {
      const { error } = result;
      showUserError(error, "prediction_save");
      return;
    }
    const saved = mapPrediction(result.saved);
    setPredictions((prev) => {
      const existing = prev.find((p) => p.playerId === currentPlayerId && p.matchId === matchId);
      if (existing) return prev.map((p) => (p.id === existing.id ? saved : p));
      return [...prev, saved];
    });
    openSnackbar(existed ? "竞猜已更新" : "竞猜提交成功");
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
      showUserError(error, "match_result_save");
      return;
    }
    setMatches((prev) => prev.map((m) => m.id === matchId ? { ...m, homeScore: nextHome, awayScore: nextAway, status: "settled" } : m));
    setWorldCupResults((prev) => ({
      ...prev,
      [resultKey]: { homeScore: nextHome, awayScore: nextAway },
    }));
    openSnackbar("比赛已结算");
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
      showUserError(error, "match_result_clear");
      return;
    }
    setMatches((prev) => prev.map((m) => m.id === matchId ? { ...m, homeScore: null, awayScore: null, status: "open" } : m));
    setWorldCupResults((prev) => {
      const next = { ...prev };
      delete next[resultKey];
      return next;
    });
    openSnackbar("比赛结果已清除");
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
      showUserError(error, "match_lock_save");
      return;
    }
    setMatches((prev) => prev.map((m) => m.id === matchId ? { ...m, status: nextStatus } : m));
    openSnackbar(nextStatus === "closed" ? "比赛已锁定" : "比赛已重新开放");
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
      showUserError(error, "fun_prediction_save");
      return;
    }
    setFunPredictions((prev) => ({
      ...prev,
      [currentPlayerId]: { champion: cleanChampion, goldenBoot: cleanGoldenBoot, firstRedCardTeam: cleanFirstRedCardTeam, totalGoals: cleanTotalGoals, submittedAt },
    }));
    openSnackbar("趣味预测已保存");
  }

  async function saveSponsorPrediction(eventId, predictedValue, { silent = false } = {}) {
    const event = SPONSOR_PREDICTION_EVENT_BY_ID[eventId];
    if (!currentPlayerId || !event || isSponsorPredictionLocked(event, { firstKickoff })) return;
    const normalizedValue = Math.floor(Number(predictedValue));
    if (!Number.isFinite(normalizedValue) || normalizedValue < 0) return;

    const submittedAt = new Date().toISOString();
    const { error } = await supabase.from("sponsor_predictions").upsert({
      event_id: eventId,
      user_id: currentPlayerId,
      predicted_total_seconds: normalizedValue,
      submitted_at: submittedAt,
    }, { onConflict: "event_id,user_id" });
    if (error) {
      showUserError(error, "sponsor_prediction_save");
      return;
    }
    setSponsorPredictions((prev) => ({
      ...prev,
      [eventId]: {
        ...(prev[eventId] || {}),
        [currentPlayerId]: {
          predictedValue: normalizedValue,
          predictedTotalSeconds: normalizedValue,
          submittedAt,
        },
      },
    }));
    if (!silent) openSnackbar("冠名预测已保存");
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
      showUserError(error, "fun_results_save");
      return;
    }
    setFunResults(nextResults);
    openSnackbar("趣味预测答案已更新");
  }

  async function saveSponsorPredictionResult({ eventId, resolvedMatchId, actualTotalSeconds, sponsorName }) {
    if (!isAdmin || !eventId || !resolvedMatchId) return;
    const normalizedSeconds = Math.floor(Number(actualTotalSeconds));
    if (!Number.isFinite(normalizedSeconds) || normalizedSeconds < 0) return;

    const { error } = await supabase.rpc("admin_save_sponsor_prediction_result", {
      p_event_id: eventId,
      p_resolved_match_id: resolvedMatchId,
      p_actual_total_seconds: normalizedSeconds,
      p_sponsor_name: sponsorName || "",
    });
    if (error) {
      showUserError(error, "sponsor_prediction_result_save");
      return;
    }
    setSponsorPredictionResults((prev) => ({
      ...prev,
      [eventId]: {
        resolvedMatchId,
        actualValue: normalizedSeconds,
        actualTotalSeconds: normalizedSeconds,
        sponsorName: sponsorName || "",
        resolvedAt: new Date().toISOString(),
      },
    }));
    openSnackbar("冠名预测答案已更新");
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
      showUserError(error, "profile_save");
      return false;
    }
    const updatedPlayer = mapProfile(data);
    setPlayers((prev) => prev.map((player) => (player.id === updatedPlayer.id ? updatedPlayer : player)));
    openSnackbar("个人资料已更新");
    return true;
  }

  async function setUserCamp(userId, campId) {
    if (!isAdmin || !userId) return false;
    const { error } = await supabase.rpc("admin_set_user_camp", {
      p_user_id: userId,
      p_camp_id: campId || null,
    });
    if (error) {
      showUserError(error, "user_camp_save");
      return false;
    }
    setPlayers((prev) => prev.map((player) => (
      player.id === userId ? { ...player, campId: campId || null } : player
    )));
    openSnackbar("阵营分配已更新");
    return true;
  }

  async function setUserAdmin(userId, nextIsAdmin) {
    if (!isAdmin || !userId) return false;
    const { error } = await supabase.rpc("admin_set_user_admin", {
      p_user_id: userId,
      p_is_admin: nextIsAdmin,
    });
    if (error) {
      showUserError(error, "user_admin_save");
      return false;
    }
    await refreshSupabaseData();
    openSnackbar(nextIsAdmin ? "管理员已添加" : "管理员权限已取消");
    return true;
  }

  async function deleteUser(userId) {
    if (!isAdmin || !userId) return false;

    const { data, error } = await supabase.functions.invoke("admin-delete-user", {
      body: {
        targetUserId: userId,
      },
    });

    if (error) {
      let nextError = error;
      try {
        const detail = await error.context?.json?.();
        if (detail?.code || detail?.message) {
          nextError = {
            ...error,
            code: detail.code || error.code,
            message: detail.message || error.message,
          };
        }
      } catch {
        // Keep the original function error when no JSON payload is available.
      }

      showUserError(nextError, "user_delete");
      return false;
    }

    await refreshSupabaseData();
    openSnackbar(data?.deletedUserId ? "用户已删除" : "删除已完成");
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
    <div className={cn("md3-app", getThemeClass(themeMode))}>
      <div className="md3-shell">
        <SideNav
          tabs={visibleTabs}
          activeTab={activeTab}
          currentPlayerId={currentPlayerId}
          setActiveTab={setActiveTab}
          setSelectedProfilePlayerId={setSelectedProfilePlayerId}
          currentPlayer={currentPlayer}
          signOut={signOut}
          isAdmin={isAdmin}
          dataError={visibleDataError}
        />
        <main className="min-w-0 flex-1 space-y-5">
          {activeTab === "home" ? <HeroBanner /> : null}
          {activeTab === "home" && <HomePanel matches={matches} predictions={predictions} currentPlayerId={currentPlayerId} myStats={myStats} unPredictedCount={unPredictedCount} players={players} rankings={rankings} currentTime={currentTime} setSelectedMatchId={setSelectedMatchId} setActiveTab={setActiveTab} onOpenPlayerProfile={openPlayerProfile} achievementCollections={achievementCollections} worldCupNews={worldCupNews} newsLoading={newsLoading} onOpenNews={setSelectedNewsItem} />}
          {activeTab === "allFeatures" && <AllFeaturesPanel currentPlayerId={currentPlayerId} isAdmin={isAdmin} setActiveTab={setActiveTab} setSelectedProfilePlayerId={setSelectedProfilePlayerId} />}
          {activeTab === "completeSchedule" && <FullScheduleCalendar schedule={completeSchedule} source={scheduleSource} matches={matches} />}
          {activeTab === "worldCupStandings" && <WorldCupStandingsPanel standings={worldCupStandings} settledCount={worldCupSettledCount} matches={worldCupTeamCardMatches} />}
          {activeTab === "schedule" && <SchedulePanel predictions={predictions} currentPlayerId={currentPlayerId} query={query} setQuery={setQuery} stageFilter={stageFilter} setStageFilter={setStageFilter} groupedMatches={groupedMatches} selectedMatchId={selectedMatchId} setSelectedMatchId={setSelectedMatchId} upsertPrediction={upsertPrediction} players={players} currentTime={currentTime} onOpenPlayerProfile={openPlayerProfile} openSnackbar={openSnackbar} isAdmin={isAdmin} matches={matches} />}
          {activeTab === "playerProfile" && <PlayerProfilePanel player={profilePlayer} currentPlayerId={currentPlayerId} players={players} rankings={rankings} predictions={predictions} matches={matches} streakRankings={streakRankings} predictionStyleRankings={predictionStyleRankings} reverseLightPlayer={reverseLightPlayer} sponsorPredictions={sponsorPredictions} sponsorPredictionResults={resolvedSponsorPredictionResults} funPredictions={funPredictions} funResults={funResults} achievementCollections={achievementCollections} campBattleSummary={campBattleSummary} themeMode={themeMode} onChangeTheme={setThemeMode} onUpdateProfile={updateProfile} onBack={() => setActiveTab("ranking")} onOpenAchievements={() => setActiveTab("achievements")} onOpenFullHistory={(playerId) => { setSelectedProfilePlayerId(playerId); setActiveTab("allHistory"); }} />}
          {activeTab === "allHistory" && <AllHistoryPanel player={profilePlayer} predictions={predictions} matches={matches} onBack={() => setActiveTab("playerProfile")} />}
          {activeTab === "sponsorPredictions" && <SponsorPredictionPanel currentPlayer={currentPlayer} players={players} matches={matches} sponsorPredictions={sponsorPredictions} sponsorPredictionResults={resolvedSponsorPredictionResults} onSave={saveSponsorPrediction} firstKickoff={firstKickoff} />}
          {activeTab === "fun" && <FunPredictionPanel currentPlayer={currentPlayer} players={players} funPredictions={funPredictions} onSave={saveFunPrediction} locked={funPredictionLocked} firstKickoff={firstKickoff} funResults={funResults} />}
          {activeTab === "achievements" && <AchievementsPanel players={players} currentPlayerId={currentPlayerId} achievementCollections={achievementCollections} />}
          {activeTab === "ranking" && <RankingPanel players={players} rankingTrend={rankingTrend} predictionStyleRankings={predictionStyleRankings} streakRankings={streakRankings} reverseLightPlayer={reverseLightPlayer} dailyBestPlayers={dailyBestPlayers} rankings={rankings} currentPlayerId={currentPlayerId} settledCount={settledCount} onOpenPlayerProfile={openPlayerProfile} matches={matches} predictions={predictions} />}
          {isAdmin && activeTab === "admin" && <AdminPanel matches={matches} players={players} currentPlayerId={currentPlayerId} predictions={predictions} updateMatchResult={updateMatchResult} clearMatchResult={clearMatchResult} toggleLock={toggleLock} funResults={funResults} onSetFunResults={saveFunResults} sponsorPredictionResults={resolvedSponsorPredictionResults} onSetSponsorPredictionResult={saveSponsorPredictionResult} onSetUserCamp={setUserCamp} onSetUserAdmin={setUserAdmin} onDeleteUser={deleteUser} openDialog={openDialog} />}
          {activeTab === "rules" && <RulesPanel />}
        </main>
      </div>
      <Snackbar open={snackbar.open} message={snackbar.message} tone={snackbar.tone} onClose={closeSnackbar} />
      <ConfirmDialog
        open={dialog.open}
        title={dialog.title}
        description={dialog.description}
        confirmLabel={dialog.confirmLabel}
        tone={dialog.tone}
        onCancel={closeDialog}
        onConfirm={() => {
          dialog.onConfirm?.();
          closeDialog();
        }}
      />
      <WorldCupNewsPreviewDialog item={selectedNewsItem} onClose={() => setSelectedNewsItem(null)} />
    </div>
  );
}

function HomePanel({ matches, predictions, currentPlayerId, myStats, unPredictedCount, rankings, currentTime, setSelectedMatchId, setActiveTab, onOpenPlayerProfile, achievementCollections, worldCupNews, newsLoading, onOpenNews }) {
  const sortedMatches = [...matches].sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime());
  const todayMatches = sortedMatches.filter((match) => isSameBeijingDate(match.kickoff, currentTime));
  const soonLockMatches = sortedMatches.filter((match) => !isMatchLocked(match, currentTime)).slice(0, 4);
  const nextDeadline = soonLockMatches[0];
  const myAchievementItems = achievementCollections?.currentPlayerItems || [];
  const recentAchievements = [...myAchievementItems]
    .filter((item) => item.currentPlayerProgress.achieved)
    .sort((a, b) => new Date(b.currentPlayerProgress.achievedAt || 0).getTime() - new Date(a.currentPlayerProgress.achievedAt || 0).getTime())
    .slice(0, 3);
  const rankingIndex = rankings.findIndex((player) => player.id === currentPlayerId) + 1;
  const stageMeta = nextDeadline ? (STAGES[nextDeadline.stage] || STAGES.GROUP) : (STAGES.GROUP);
  const nextDeadlineValue = nextDeadline ? `${formatDateOnly(nextDeadline.kickoff).replace("星期", "周")} ${formatBeijingTime(nextDeadline.kickoff)}` : "--";
  const nextDeadlineOpponent = nextDeadline ? `${teamName(nextDeadline.home)} vs ${teamName(nextDeadline.away)}` : "当前暂无可竞猜比赛";

  function openMatch(matchId) {
    setSelectedMatchId(matchId);
    setActiveTab("schedule");
  }

  return (
    <section className="space-y-4 sm:space-y-5">
      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard icon={Trophy} label="我的排名" value={rankingIndex ? `#${rankingIndex}` : "--"} sub="主榜实时排名" compact />
        <StatCard icon={Award} label="我的积分" value={`${myStats?.total || 0}分`} sub={`完全比分 ${myStats?.exactCount || 0} 次`} compact />
        <StatCard icon={Target} label="待提交" value={`${unPredictedCount}场`} sub={`已竞猜 ${myStats?.played || 0} 场`} compact />
        <StatCard icon={Bell} label="下场截止" value={nextDeadline ? formatBeijingTime(nextDeadline.kickoff) : "--"} sub={nextDeadline ? formatDateOnly(nextDeadline.kickoff).replace("星期", "周") : "暂无开放比赛"} compact />
        <StatCard icon={Flame} label="赛事阶段" value={stageMeta.label} sub={`当前倍率 x${stageMeta.multiplier}`} compact className="sm:col-span-2 xl:col-span-1" />
      </div>

      <Card className="md3-tonal-card !p-3.5 sm:!p-5">
        <div className="mb-3 flex items-center justify-between gap-3 sm:mb-4">
          <div>
            <h2 className="md3-section-title text-[1.2rem] sm:text-[1.7rem]">下一场比赛竞猜入口</h2>
            <div className="mt-1 text-xs md3-subtle">{nextDeadlineOpponent}</div>
          </div>
          <M3Button tone="outline" className="px-3 py-2 text-xs sm:text-sm" onClick={() => setActiveTab("schedule")}>全部赛程</M3Button>
        </div>
        {nextDeadline ? (
          <MatchFeatureCard
            match={nextDeadline}
            pred={predictions.find((prediction) => prediction.playerId === currentPlayerId && prediction.matchId === nextDeadline.id)}
            now={currentTime}
            onClick={() => openMatch(nextDeadline.id)}
          />
        ) : (
          <EmptyState icon={CalendarDays} title="当前没有待提交的比赛" description="等新的赛程开放后，这里会自动出现最快截止的那一场。" actionLabel="查看积分榜" onAction={() => setActiveTab("ranking")} />
        )}
      </Card>

      <WorldCupNewsMarquee items={worldCupNews} loading={newsLoading} onOpenNews={onOpenNews} />

      <Card className="md3-filled-card !p-3.5 sm:!p-5">
        <div className="mb-3 flex items-center justify-between gap-3 sm:mb-4">
          <div>
            <h2 className="md3-section-title text-[1.15rem] sm:text-[1.5rem]">排行榜 Top 3</h2>
          </div>
          <M3Button tone="text" className="px-2.5 py-2 text-xs sm:text-sm" onClick={() => setActiveTab("ranking")}>完整榜单</M3Button>
        </div>
        <div className="space-y-2.5 md:hidden">
          {rankings.slice(0, 3).map((player, index) => (
            <CompactLeaderboardRow key={`compact-${player.id}`} player={player} place={index + 1} onClick={() => onOpenPlayerProfile(player.id)} />
          ))}
        </div>
        <div className="hidden gap-3 md:grid md:grid-cols-3">
          {rankings.slice(0, 3).map((player, index) => (
            <PodiumCard key={player.id} player={player} place={index + 1} onClick={() => onOpenPlayerProfile(player.id)} />
          ))}
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <HomeMatchSection title="今日比赛" matches={todayMatches} predictions={predictions} currentPlayerId={currentPlayerId} currentTime={currentTime} emptyText="今天暂无比赛" onOpenMatch={openMatch} />
        <Card className="!p-3.5 sm:!p-5">
          <div className="mb-3 flex items-center justify-between gap-3 sm:mb-4">
            <div>
              <h2 className="md3-section-title text-[1.15rem] sm:text-[1.5rem]">最近获得的成就</h2>
            </div>
            <M3Button tone="text" className="px-2.5 py-2 text-xs sm:text-sm" onClick={() => setActiveTab("achievements")}>成就墙</M3Button>
          </div>
          {recentAchievements.length ? (
            <div className="space-y-2.5 sm:space-y-3">
              {recentAchievements.map((item) => (
                <div key={item.achievement.id} className="md3-outline-card md3-card !p-3 sm:!p-4">
                  <div className="mb-1.5 flex items-center justify-between gap-3 sm:mb-2">
                    <div className="font-black">{item.achievement.name}</div>
                    <Pill className={getAchievementBadgeClass(item)}>{item.achievement.rarity}</Pill>
                  </div>
                  <div className="text-xs sm:text-sm md3-subtle">{item.achievement.description}</div>
                  <M3Progress value={item.currentPlayerProgress.current} max={item.currentPlayerProgress.target} className="mt-2.5 sm:mt-3" />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={Sparkles} title="还没有点亮成就" description="先去提交几场比赛，第一批成就会很快解锁。" actionLabel="去竞猜" onAction={() => setActiveTab("schedule")} />
          )}
        </Card>
      </div>

      <HomeMatchSection title="即将截止" matches={soonLockMatches} predictions={predictions} currentPlayerId={currentPlayerId} currentTime={currentTime} emptyText="暂无即将锁定的比赛" onOpenMatch={openMatch} />
    </section>
  );
}

function AllFeaturesPanel({ currentPlayerId, isAdmin, setActiveTab, setSelectedProfilePlayerId }) {
  const featureTabs = [
    { id: "home", label: "首页", icon: Home, description: "回到欢迎首页与下一场入口" },
    { id: "schedule", label: "赛程竞猜", icon: CalendarDays, description: "查看并提交每场比分预测" },
    { id: "ranking", label: "竞猜排行榜", icon: Trophy, description: "查看房间积分与称号排名" },
    { id: "achievements", label: "成就墙", icon: Crown, description: "浏览徽章、称号与收集进度" },
    { id: "playerProfile", label: "个人主页", icon: Users, description: "管理我的资料与历史表现" },
    { id: "completeSchedule", label: "完整赛程", icon: CalendarDays, description: "按时间查看完整世界杯赛程" },
    { id: "worldCupStandings", label: "世界杯排名", icon: Medal, description: "查看各组积分榜与晋级形势" },
    { id: "sponsorPredictions", label: "冠名预测", icon: Trophy, description: "参与首球时间等冠名称号玩法" },
    { id: "fun", label: "趣味预测", icon: Flame, description: "提交冠军、金靴和总进球趣味竞猜" },
    { id: "rules", label: "规则", icon: ShieldCheck, description: "查看积分、锁盘与结算规则" },
  ];

  if (isAdmin) {
    featureTabs.push({
      id: "admin",
      label: "管理入口",
      icon: Settings,
      description: "仅管理员可见的赛果与账号管理",
    });
  }

  function openFeature(tabId) {
    if (tabId === "playerProfile") setSelectedProfilePlayerId(currentPlayerId);
    setActiveTab(tabId);
  }

  return (
    <section className="mt-6 space-y-4 sm:space-y-5">
      <Card className="!p-3.5 sm:!p-5">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <Pill className="mb-2.5"><Plus className="h-3.5 w-3.5" /> APP 端功能总入口</Pill>
            <h2 className="text-[1.45rem] font-black tracking-tight sm:text-3xl">全部功能</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">把移动端的常用功能和扩展页面集中到一个入口里，减少来回找菜单的成本。</p>
          </div>
          <div className="md3-panel-strong px-3 py-3 text-slate-100 shadow-xl sm:p-4">
            <div className="text-[11px] font-bold md3-subtle">当前可用入口</div>
            <div className="mt-1 text-sm font-black sm:text-lg">{featureTabs.length} 个</div>
          </div>
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {featureTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => openFeature(tab.id)}
              className="md3-card md3-card-tone-highlight group flex min-h-[136px] flex-col items-start rounded-[26px] !p-4 text-left transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-[18px]" style={{ background: "color-mix(in srgb, var(--md-sys-color-primary-container) 90%, transparent)", color: "var(--md-sys-color-on-primary-container)" }}>
                <Icon className="h-5 w-5" />
              </span>
              <div className="mt-4 text-lg font-black">{tab.label}</div>
              <div className="mt-1 text-sm leading-6 text-slate-400">{tab.description}</div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function HomeMatchSection({ title, matches, predictions, currentPlayerId, currentTime, emptyText, onOpenMatch }) {
  return (
    <Card className="!p-3.5 sm:!p-5">
      <div className="mb-3 flex items-center justify-between gap-3 sm:mb-4">
        <div>
          <h2 className="md3-section-title text-[1.15rem] sm:text-[1.5rem]">{title}</h2>
        </div>
        <Pill>{matches.length} 场</Pill>
      </div>
      <div className="space-y-2.5 sm:space-y-3">
        {matches.length ? matches.map((match) => (
          <MatchListButton key={match.id} match={match} pred={predictions.find((p) => p.playerId === currentPlayerId && p.matchId === match.id)} active={false} now={currentTime} onClick={() => onOpenMatch(match.id)} />
        )) : <EmptyState icon={CalendarDays} title={emptyText} description="新的比赛信息出现后，这里会自动补上。" />}
      </div>
    </Card>
  );
}

function PodiumCard({ player, place, onClick }) {
  const podiumTheme = {
    1: { badge: "冠军", tone: "linear-gradient(135deg, rgba(240,207,99,0.35), rgba(159,122,16,0.1))", icon: Trophy, text: "text-amber-100" },
    2: { badge: "亚军", tone: "linear-gradient(135deg, rgba(210,218,230,0.32), rgba(122,140,163,0.1))", icon: Medal, text: "text-slate-100" },
    3: { badge: "季军", tone: "linear-gradient(135deg, rgba(211,144,96,0.32), rgba(115,66,31,0.08))", icon: Award, text: "text-orange-100" },
  }[place];
  const Icon = podiumTheme.icon;
  return (
    <button type="button" onClick={onClick} className="md3-card text-left">
      <div className="absolute inset-0 opacity-80" style={{ background: podiumTheme.tone }} />
      <div className="relative">
        <div className="mb-4 flex items-center justify-between gap-3">
          <Pill className="border-0 bg-black/10 text-current">{podiumTheme.badge}</Pill>
          <Icon className={cn("h-5 w-5", podiumTheme.text)} />
        </div>
        <div className="flex items-start gap-3">
          <UserBadge player={player} size="h-11 w-11" />
          <div className="min-w-0">
            <div className="break-all text-lg font-black leading-6">#{place} {player.name}</div>
            <div className="mt-1 text-xs leading-5 md3-subtle">完全比分 {player.exactCount} 次</div>
            <div className="text-xs leading-5 md3-subtle">命中结果 {player.outcomeCount} 次</div>
          </div>
        </div>
        <div className="mt-4 text-3xl font-black">{player.total}<span className="ml-1 text-base font-semibold md3-subtle">分</span></div>
      </div>
    </button>
  );
}

function CompactLeaderboardRow({ player, place, onClick }) {
  return (
    <button type="button" onClick={onClick} className="md3-panel-inset flex w-full items-center gap-3 rounded-[20px] px-3 py-2.5 text-left">
      <div className="flex h-9 w-9 items-center justify-center rounded-[14px] text-sm font-black" style={{ background: "color-mix(in srgb, var(--md-sys-color-secondary-container) 70%, transparent)", color: "var(--md-sys-color-on-secondary-container)" }}>
        #{place}
      </div>
      <UserBadge player={player} size="h-9 w-9" text="text-xs" />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-black">{player.name}</div>
        <div className="text-[11px] md3-subtle">比分 {player.exactCount} 次 · 结果 {player.outcomeCount} 次</div>
      </div>
      <div className="text-right">
        <div className="text-lg font-black">{player.total}</div>
        <div className="text-[11px] md3-subtle">总分</div>
      </div>
    </button>
  );
}

function MatchFeatureCard({ match, pred, now, onClick }) {
  return (
    <button type="button" onClick={onClick} className="md3-card w-full !p-3.5 text-left sm:!p-5">
      <div className="mb-2.5 flex flex-wrap gap-1.5 sm:mb-3 sm:gap-2">
        <Pill>第 {match.no} 场</Pill>
        <Pill>{(STAGES[match.stage] || STAGES.GROUP).label}</Pill>
        <MatchStatus match={match} />
        <MatchCountdown match={match} now={now} />
      </div>
      <div className="grid gap-3 sm:gap-4 md:grid-cols-[1fr_auto] md:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-[1.05rem] font-black leading-6 sm:text-2xl">
            <TeamName name={match.home} logo={match.homeLogo} />
            <span className="md3-subtle">vs</span>
            <TeamName name={match.away} logo={match.awayLogo} />
          </div>
          <div className="mt-1.5 text-xs sm:text-sm md3-subtle">{formatDateTime(match.kickoff)} · {match.city || match.group}</div>
        </div>
        <div className="rounded-[18px] px-3 py-2.5 md:self-start" style={{ background: "color-mix(in srgb, var(--md-sys-color-surface-container-highest) 88%, transparent)" }}>
          <div className="text-[11px] uppercase tracking-[0.18em] md3-subtle">我的提交</div>
          <div className="mt-1 text-base font-black sm:text-xl">{pred ? `${pred.home}:${pred.away}` : "未提交"}</div>
        </div>
      </div>
    </button>
  );
}

function MatchListButton({ match, pred, active, onClick, now = new Date(), matches = [], predictions = [] }) {
  const stage = STAGES[match.stage] || STAGES.GROUP;
  const summary = buildScheduleMatchSummary({
    match,
    currentPrediction: pred,
    predictions,
  });
  return (
    <button onClick={onClick} className={`relative z-20 md3-card w-full !p-3 text-left sm:!p-4 ${active ? "md3-filled-card" : "md3-outline-card"}`}>
      <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center md:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap gap-1.5 sm:gap-2">
            <Pill>第 {match.no} 场世界杯比赛</Pill>
            <Pill>{stage.label} x{stage.multiplier}</Pill>
            <MatchStatus match={match} />
            <MatchCountdown match={match} now={now} />
            {pred ? <Pill className="bg-emerald-500/15 text-emerald-200">已竞猜</Pill> : <Pill className="bg-rose-500/15 text-rose-200">未竞猜</Pill>}
            <Pill style={active ? { background: "var(--md-sys-color-primary-container)", color: "var(--md-sys-color-on-primary-container)" } : undefined}>{active ? "收起详情" : "展开竞猜"}</Pill>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[0.95rem] font-black leading-5 sm:text-lg"><TeamName name={match.home} logo={match.homeLogo} interactiveProfile teamCardMatches={matches} /><span className="md3-subtle">vs</span><TeamName name={match.away} logo={match.awayLogo} interactiveProfile teamCardMatches={matches} /></div>
          <div className="mt-1 text-[11px] sm:text-xs md3-subtle">{formatDateTime(match.kickoff)} · {match.group}</div>
        </div>
        <div className="rounded-[18px] px-3 py-2.5 text-left md:min-w-[216px] md:self-start md:text-right" style={{ background: "color-mix(in srgb, var(--md-sys-color-surface-container-highest) 88%, transparent)" }}>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-left md:text-right">
            <div>
              <div className="text-[10px] uppercase tracking-[0.16em] md3-subtle">比赛结果</div>
              <div className="mt-1 text-base font-black sm:text-xl">{summary.resultLabel}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.16em] md3-subtle">我的得分</div>
              <div className="mt-1 text-base font-black sm:text-xl">{summary.myPointsLabel}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.16em] md3-subtle">我的预测</div>
              <div className="mt-1 text-[11px] font-bold sm:text-xs">{summary.myPredictionLabel}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.16em] md3-subtle">平均得分</div>
              <div className="mt-1 text-[11px] font-bold sm:text-xs">{summary.averagePointsLabel}</div>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

function getPlayerDisplayId(player) {
  return (player?.name || player?.email || "未命名用户").trim() || "未命名用户";
}

function SchedulePanel({ predictions, currentPlayerId, query, setQuery, stageFilter, setStageFilter, groupedMatches, selectedMatchId, setSelectedMatchId, upsertPrediction, players, currentTime, onOpenPlayerProfile, openSnackbar, isAdmin, matches = [] }) {
  function handleMatchToggle(matchId) {
    setSelectedMatchId((prev) => (prev === matchId ? "" : matchId));
  }

  return (
    <section>
      <Card className="!p-3.5 sm:!p-5">
        <div className="mb-3 flex flex-col gap-3 md:mb-4 md:flex-row md:items-center md:justify-between">
          <div><h2 className="md3-section-title text-[1.45rem] sm:text-[1.7rem]">赛程与竞猜</h2></div>
          <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto"><div className="relative min-w-0 flex-1"><Search className="absolute left-3 top-3 h-4 w-4 md3-subtle" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜索球队/阶段" className="md3-field w-full pl-9 pr-3 text-sm" /></div><select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)} className="md3-select w-full px-3 py-2 text-sm sm:w-auto"><option value="ALL">全部</option>{Object.entries(STAGES).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}</select></div>
        </div>
        <div className="space-y-4 sm:space-y-6">
          {Object.entries(groupedMatches).length ? Object.entries(groupedMatches).map(([date, items]) => <div key={date}><div className="mb-2.5 flex items-center gap-2 text-sm font-black md3-subtle sm:mb-3"><CalendarDays className="h-4 w-4" /> {date}</div><div className="space-y-2.5 sm:space-y-3">{items.map((match) => {
            const pred = predictions.find((p) => p.playerId === currentPlayerId && p.matchId === match.id);
            const active = selectedMatchId === match.id;
            return (
              <div key={match.id} className={`overflow-visible rounded-[28px] transition ${active ? "md3-card md3-filled-card" : ""}`}>
                <MatchListButton match={match} pred={pred} active={active} now={currentTime} matches={matches} predictions={predictions} onClick={() => handleMatchToggle(match.id)} />
                {active && (
                  <div className="relative z-10 border-t px-3 pb-3 pt-3 sm:px-4 sm:pb-4 sm:pt-4 md3-divider">
                    <MatchPredictionDetail match={match} players={players} predictions={predictions} currentPlayerId={currentPlayerId} onSubmit={upsertPrediction} now={currentTime} onOpenPlayerProfile={onOpenPlayerProfile} isAdmin={isAdmin} />
                  </div>
                )}
              </div>
            );
          })}</div></div>) : <EmptyState icon={Search} title="没有匹配的比赛" description="当前筛选条件下没有可显示的比赛。更早历史比赛请到完整赛程页查看。" />}
        </div>
      </Card>
    </section>
  );
}

function WorldCupStandingsPanel({ standings, settledCount, matches = [] }) {
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
            <Pill className="mb-3"><Medal className="h-3.5 w-3.5" /> 世界杯排名 · 小组积分</Pill>
            <h2 className="text-[1.75rem] font-black tracking-tight sm:text-3xl">世界杯小组实时积分榜</h2>
          </div>
          <div className="md3-panel px-4 py-4 text-slate-100 shadow-xl"><div className="text-xs font-bold md3-subtle">已结算比赛</div><div className="mt-1 text-3xl font-black">{settledCount}</div></div>
        </div>
      </Card>

      <Card>
        <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <h3 className="text-xl font-black">出线形势说明</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <Pill className="bg-emerald-500/15 text-emerald-200">前二直接出线</Pill>
            <Pill className="bg-amber-500/15 text-amber-200">小组第三竞争</Pill>
            <Pill>第四名待追赶</Pill>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {bestThirdTeams.slice(0, 8).map((team, index) => (
            <div key={`${team.group}-${team.team}`} className="md3-card md3-card-tone-warning p-3">
              <div className="mb-1 text-xs font-black text-amber-200">小组第三竞争 #{index + 1}</div>
              <div className="font-black"><TeamName name={team.team} logo={team.logo} interactiveProfile teamCardMatches={matches} /></div>
              <div className="mt-1 text-xs text-slate-400">{team.group} · {team.points}分 · 净胜球 {team.goalDifference} · 进球 {team.goalsFor}</div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-5">
        {groupKeys.map((group) => <GroupStandingsCard key={group} group={group} table={sortStandingsTable(standings[group])} matches={matches} />)}
      </div>
    </section>
  );
}

function GroupStandingsCard({ group, table, matches = [] }) {
  return (
    <Card className="!p-3.5 sm:!p-5">
      <div className="mb-3 flex items-center justify-between gap-3 sm:mb-4">
        <div>
          <h3 className="text-xl font-black">{group}</h3>
        </div>
        <Pill>{table.reduce((sum, team) => sum + team.played, 0) / 2} 场已赛</Pill>
      </div>
      <div className="space-y-2.5 md:hidden">
        {table.map((team, index) => {
          const status = getQualificationLabel(index);
          return (
            <div key={`${group}-${team.team}-mobile`} className="md3-panel-inset p-3">
              <div className="flex items-center gap-3">
                <span className="rounded-full px-2 py-1 text-xs font-black" style={{ background: "color-mix(in srgb, var(--md-sys-color-surface-container-highest) 90%, transparent)" }}>#{index + 1}</span>
                <div className="min-w-0 flex-1">
                  <div className="font-black"><TeamName name={team.team} logo={team.logo} className="max-w-full" interactiveProfile teamCardMatches={matches} /></div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] md3-subtle">
                    <Pill className={status.className}>{status.label}</Pill>
                    <span>{team.played}赛</span>
                    <span>{team.won}/{team.drawn}/{team.lost}</span>
                    <span>净胜 {team.goalDifference}</span>
                    <span>进失 {team.goalsFor}/{team.goalsAgainst}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] md3-subtle">积分</div>
                  <div className="text-xl font-black text-emerald-200">{team.points}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="hidden md:block">
      <div className="md3-table-shell">
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead className="md3-table-head">
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
                <tr key={team.team} className="md3-table-row">
                  <td className="px-3 py-3 font-black">#{index + 1}</td>
                  <td className="px-3 py-3 font-black"><TeamName name={team.team} logo={team.logo} interactiveProfile teamCardMatches={matches} /></td>
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
      </div>
    </Card>
  );
}

function FullScheduleCalendar({ schedule, source, matches = [] }) {
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
            <Pill className="mb-3"><CalendarDays className="h-3.5 w-3.5" /> 完整赛程 · 北京时间</Pill>
            <h2 className="text-[1.75rem] font-black tracking-tight sm:text-3xl">完整赛程列表</h2>
            <Pill className="mt-3 bg-emerald-500/15 text-emerald-200">本地权威赛程</Pill>
          </div>
          <div className="md3-panel px-4 py-4 text-slate-100 shadow-xl"><div className="text-xs font-bold md3-subtle">比赛总数</div><div className="mt-1 text-3xl font-black">{schedule.length}</div></div>
        </div>
      </Card>
      <Card>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div><h3 className="text-xl font-black">快速浏览</h3></div>
          <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto"><div className="relative min-w-0 flex-1"><Search className="absolute left-3 top-2.5 h-4 w-4 md3-subtle" /><input value={scheduleQuery} onChange={(e) => setScheduleQuery(e.target.value)} placeholder="搜索球队 / 球馆 / 城市" className="md3-field w-full py-2 pl-9 pr-3 text-sm sm:w-64" /></div><select value={scheduleStage} onChange={(e) => setScheduleStage(e.target.value)} className="md3-select w-full px-3 py-2 text-sm sm:w-auto">{stageOptions.map((stage) => <option key={stage} value={stage}>{stage === "ALL" ? "全部小组/阶段" : stage}</option>)}</select></div>
        </div>
      </Card>
      <Card className={CARD_TONE.tonal}>
        <div className="mb-4 flex items-center justify-between gap-3"><div><h3 className="text-xl font-black">按日期列表</h3></div><Pill>{filteredSchedule.length} 场</Pill></div>
        <div className="space-y-4">
          {Object.entries(scheduleByDate).sort(([a], [b]) => a.localeCompare(b)).map(([dateKey, items]) => <div key={dateKey} className="md3-panel p-4"><div className="mb-3 flex items-center gap-2 text-sm font-black md3-subtle"><CalendarDays className="h-4 w-4" /> {formatBeijingDateTitle(items[0].kickoff)}</div><div className="grid gap-3 md:grid-cols-2">{items.map((match) => <ScheduleLargeCard key={match.id} match={match} matches={matches} />)}</div></div>)}
        </div>
      </Card>
    </section>
  );
}

function ScheduleLargeCard({ match, matches = [] }) {
  const now = useCurrentTime();
  return (
    <div className="md3-panel-inset p-3">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <Pill>#{match.no}</Pill>
        <Pill className="bg-emerald-500/15 text-emerald-200">{match.group}</Pill>
        <Pill>{formatBeijingTime(match.kickoff)} 北京时间</Pill>
        <MatchStatus match={match} />
        <MatchCountdown match={match} now={now} />
      </div>
      <div className="flex flex-wrap items-center gap-2 text-lg font-black">
        <TeamName name={match.home} logo={match.homeLogo} interactiveProfile teamCardMatches={matches} />
        <MatchScore match={match} />
        <TeamName name={match.away} logo={match.awayLogo} interactiveProfile teamCardMatches={matches} />
      </div>
      <RegulationSettlementNotice match={match} className="mt-3" />
      <div className="mt-2 text-sm text-slate-400">{match.stadium || match.location}</div>
      <div className="text-xs text-slate-500">{match.city}</div>
    </div>
  );
}

function MatchPredictionDetail({ match, players, predictions, currentPlayerId, onSubmit, now = new Date(), onOpenPlayerProfile, isAdmin = false }) {
  const existing = predictions.find((p) => p.playerId === currentPlayerId && p.matchId === match.id);
  const [home, setHome] = useState(existing?.home ?? 0);
  const [away, setAway] = useState(existing?.away ?? 0);
  const [isExporting, setIsExporting] = useState(false);
  const exportRef = useRef(null);
  React.useEffect(() => { const next = predictions.find((p) => p.playerId === currentPlayerId && p.matchId === match.id); setHome(next?.home ?? 0); setAway(next?.away ?? 0); }, [match.id, currentPlayerId, predictions]);
  const locked = isMatchLocked(match, now);
  const showAllPredictions = locked || match.status !== "open";
  const insights = useMemo(() => buildMatchInsights(match), [match]);
  const [oddsState, setOddsState] = useState(() => ({
    bookmakers: insights.bookmakers,
    probabilities: insights.probabilities,
    status: "idle",
  }));
  const { visibleGroups, missingCount } = useMemo(() => buildMatchPredictionGroups({
    players,
    predictions,
    match,
    currentPlayerId,
  }), [players, predictions, match, currentPlayerId]);

  React.useEffect(() => {
    let cancelled = false;

    setOddsState({
      bookmakers: insights.bookmakers,
      probabilities: insights.probabilities,
      status: "loading",
    });

    fetchMatchOdds({
      supabase,
      isSupabaseConfigured,
      match,
    }).then((payload) => {
      if (cancelled) return;
      const readyCount = payload.bookmakers.filter((item) => item.status === "ready").length;
      setOddsState({
        bookmakers: payload.bookmakers,
        probabilities: payload.probabilities,
        status: readyCount ? "ready" : "empty",
      });
    }).catch(() => {
      if (cancelled) return;
      setOddsState({
        bookmakers: insights.bookmakers,
        probabilities: null,
        status: "error",
      });
    });

    return () => {
      cancelled = true;
    };
  }, [insights.bookmakers, insights.probabilities, match.away, match.home, match.id, match.kickoff, match.no]);

  async function handleExportPredictionBoard() {
    if (!exportRef.current || isExporting) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(exportRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#0f2f22",
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = buildPredictionExportFileName(match);
      link.click();
    } catch (error) {
      console.error("Failed to export prediction board", error);
      window.alert("导出截图失败，请稍后重试。");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div>
      <div className="md3-outline-card md3-card p-4 sm:p-5">
        <div className="text-sm font-bold md3-subtle">我的比分预测</div>
        <div className="mt-3 flex flex-col gap-3 xl:flex-row xl:items-center">
          <CompactScoreField label={match.home} value={home} disabled={locked} onChange={setHome} />
          <div className="hidden text-2xl font-black md3-subtle xl:block">:</div>
          <CompactScoreField label={match.away} value={away} disabled={locked} onChange={setAway} />
          <M3Button disabled={locked} onClick={() => onSubmit(match.id, Number(home), Number(away))} className="flex items-center justify-center gap-2 px-5 py-3 font-black xl:ml-auto xl:min-w-[144px]">
            {existing ? <CheckCircle2 className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            {existing ? "修改预测" : "提交预测"}
          </M3Button>
        </div>
        {locked ? <div className="mt-3 text-xs md3-subtle">比赛已锁定，不能再修改预测。</div> : null}
      </div>
      <RegulationSettlementNotice match={match} className="mt-4" />
      <div className="mt-4 grid gap-4 xl:grid-cols-[1.02fr_1.18fr]">
        <MatchOddsCard oddsState={oddsState} />
        <MatchPreviewCard match={match} insights={insights} />
      </div>
      <div className="mt-5">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-black">朋友预测</h3>
            {showAllPredictions ? <Pill>{`未提交 ${missingCount} 人`}</Pill> : <Pill>开赛后公开</Pill>}
          </div>
          {showAllPredictions && isAdmin ? (
            <M3Button disabled={isExporting} onClick={handleExportPredictionBoard} className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-black">
              {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              导出截图
            </M3Button>
          ) : null}
        </div>
        {showAllPredictions ? (
          <>
            <PredictionOutcomeBoard groups={visibleGroups} />
            {isAdmin ? <PredictionExportCard ref={exportRef} match={match} groups={visibleGroups} /> : null}
          </>
        ) : (
          <EmptyState icon={Eye} title="预测将在开赛后公开" description="朋友预测会在开赛后按主胜、平局、客胜自动分组展示，未提交只显示人数。" />
        )}
      </div>
    </div>
  );
}

function CompactScoreField({ label, value, disabled, onChange }) {
  return (
    <div className="min-w-0 flex-1">
      <div className="mb-2 truncate text-xs font-bold md3-subtle">{label}</div>
      <input type="number" inputMode="numeric" pattern="[0-9]*" min="0" value={value} disabled={disabled} onChange={(e) => onChange(Math.max(0, Number(e.target.value)))} className="md3-field w-full px-4 py-3 text-center text-2xl font-black disabled:opacity-50" />
    </div>
  );
}

function MatchOddsCard({ oddsState }) {
  const readyCount = oddsState.bookmakers.filter((bookmaker) => bookmaker.status === "ready").length;

  return (
    <div className="md3-outline-card md3-card p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="font-black">主流赔率</h3>
        <Pill>{`${readyCount}/${oddsState.bookmakers.length} 已就绪`}</Pill>
      </div>
      <div className="space-y-2">
        <div className="grid grid-cols-[96px_repeat(3,minmax(0,1fr))] gap-2 px-1 text-[11px] font-bold uppercase tracking-[0.12em] md3-subtle">
          <span>公司</span>
          <span>主胜</span>
          <span>平</span>
          <span>客胜</span>
        </div>
        {oddsState.bookmakers.map((bookmaker) => (
          <div key={bookmaker.key} className={cn("grid grid-cols-[96px_repeat(3,minmax(0,1fr))] gap-2 rounded-[18px] border px-3 py-2.5 text-sm", bookmaker.status === "missing" ? "text-slate-500" : "text-slate-100")} style={{ borderColor: "color-mix(in srgb, var(--md-sys-color-outline-variant) 54%, transparent)", background: bookmaker.status === "missing" ? "color-mix(in srgb, var(--md-sys-color-surface-container-lowest) 72%, transparent)" : "color-mix(in srgb, var(--md-sys-color-surface-container-low) 82%, transparent)" }}>
            <span className="truncate font-bold">{bookmaker.label}</span>
            <span className="font-black tabular-nums">{Number.isFinite(bookmaker.homeOdds) ? bookmaker.homeOdds.toFixed(2) : "暂缺"}</span>
            <span className="font-black tabular-nums">{Number.isFinite(bookmaker.drawOdds) ? bookmaker.drawOdds.toFixed(2) : "暂缺"}</span>
            <span className="font-black tabular-nums">{Number.isFinite(bookmaker.awayOdds) ? bookmaker.awayOdds.toFixed(2) : "暂缺"}</span>
          </div>
        ))}
      </div>
      {oddsState.probabilities ? (
        <div className="mt-4 rounded-[20px] border px-4 py-4" style={{ borderColor: "color-mix(in srgb, var(--md-sys-color-outline-variant) 56%, transparent)", background: "color-mix(in srgb, var(--md-sys-color-surface-container-low) 82%, transparent)" }}>
          <div className="mb-3 flex items-center justify-between gap-3 text-xs">
            <span className="font-bold md3-subtle">去水综合概率</span>
            <span className="md3-subtle">样本 {oddsState.probabilities.sampleSize} 家</span>
          </div>
          <ProbabilityBar label="主胜" value={oddsState.probabilities.home} tone="home" />
          <ProbabilityBar label="平局" value={oddsState.probabilities.draw} tone="draw" />
          <ProbabilityBar label="客胜" value={oddsState.probabilities.away} tone="away" />
        </div>
      ) : (
        <div className="mt-4 rounded-[20px] border px-4 py-3 text-sm md3-subtle" style={{ borderColor: "color-mix(in srgb, var(--md-sys-color-outline-variant) 56%, transparent)", background: "color-mix(in srgb, var(--md-sys-color-surface-container-low) 82%, transparent)" }}>
          <div className="flex items-center gap-2">
            {oddsState.status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            <span>{oddsState.status === "loading" ? "正在抓取真实赔率" : "真实赔率暂不可用"}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function ProbabilityBar({ label, value, tone }) {
  const toneStyles = {
    home: "linear-gradient(90deg, rgba(16,185,129,0.85), rgba(134,239,172,0.95))",
    draw: "linear-gradient(90deg, rgba(56,189,248,0.82), rgba(125,211,252,0.95))",
    away: "linear-gradient(90deg, rgba(245,158,11,0.8), rgba(251,191,36,0.95))",
  };

  return (
    <div className="mb-3 last:mb-0">
      <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
        <span className="font-bold">{label}</span>
        <span className="font-black tabular-nums">{value}%</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-950/55">
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: toneStyles[tone] }} />
      </div>
    </div>
  );
}

function MatchPreviewCard({ match, insights }) {
  return (
    <div className="md3-outline-card md3-card p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="font-black">比赛前瞻</h3>
        <Pill>{match.group}</Pill>
      </div>
      <div className="flex justify-center">
        {insights.homeProfile || insights.awayProfile ? (
          <TeamRadarComparison homeProfile={insights.homeProfile} awayProfile={insights.awayProfile} className="w-full max-w-[32rem] !px-3 !py-3" />
        ) : (
          <div className="rounded-[20px] border px-4 py-8 text-sm md3-subtle" style={{ borderColor: "color-mix(in srgb, var(--md-sys-color-outline-variant) 56%, transparent)", background: "color-mix(in srgb, var(--md-sys-color-surface-container-low) 82%, transparent)" }}>
            六维图暂不可用
          </div>
        )}
      </div>
    </div>
  );
}

function PredictionOutcomeBoard({ groups }) {
  return (
    <div className="grid gap-3 xl:grid-cols-3">
      {groups.map((group) => (
        <div key={group.key} className="md3-outline-card md3-card p-3 sm:p-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <div className="font-black">{group.title}</div>
            <Pill>{group.items.length} 人</Pill>
          </div>
          <div className="divide-y divide-white/10">
            {group.items.map((entry) => (
              <PredictionEntryRow key={entry.player.id} entry={entry} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function PredictionEntryRow({ entry, exportMode = false }) {
  const { player, prediction, isMe } = entry;
  return (
    <div className={cn("flex items-center justify-between gap-3 py-2", exportMode ? "text-emerald-50" : "text-slate-100")}>
      <div className="min-w-0 flex items-center gap-2">
        <span className="truncate text-sm font-semibold">{getPlayerDisplayId(player)}</span>
        {isMe ? <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-bold", exportMode ? "bg-white/10 text-emerald-100" : "bg-emerald-500/15 text-emerald-200")}>我</span> : null}
      </div>
      <div className={cn("shrink-0 text-sm font-black tabular-nums", exportMode ? "text-emerald-50" : "text-slate-100")}>{prediction.home}:{prediction.away}</div>
    </div>
  );
}

const PredictionExportCard = React.forwardRef(function PredictionExportCard({ match, groups }, ref) {
  return (
    <div className="pointer-events-none fixed left-[-99999px] top-0 opacity-0">
      <div
        ref={ref}
        className="w-[1200px] rounded-[32px] px-8 py-8 text-emerald-50"
        style={{
          background: "linear-gradient(180deg, #153c2a 0%, #102c1f 100%)",
          boxShadow: "0 18px 50px rgba(0,0,0,0.35)",
        }}
      >
        <div className="rounded-[24px] border border-white/10 bg-white/5 px-6 py-5">
          <div className="text-xs uppercase tracking-[0.22em] text-emerald-100/70">世界杯竞猜 · 单场预测导出</div>
          <div className="mt-3 flex items-center gap-3 text-3xl font-black">
            <span>{teamName(match.home)}</span>
            <span className="text-emerald-100/70">vs</span>
            <span>{teamName(match.away)}</span>
          </div>
          <div className="mt-2 text-sm text-emerald-50/75">{formatDateTime(match.kickoff)}</div>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-4">
          {groups.map((group) => (
            <div key={`export-${group.key}`} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="text-lg font-black">{group.title}</div>
                <div className="rounded-full bg-white/10 px-3 py-1 text-sm font-semibold">{group.items.length} 人</div>
              </div>
              <div className="divide-y divide-white/10">
                {group.items.map((entry) => (
                  <PredictionEntryRow key={`export-entry-${group.key}-${entry.player.id}`} entry={entry} exportMode />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

function ScoreInput({ label, value, disabled, onChange }) {
  return <div><div className="mb-2 truncate text-center text-sm md3-subtle">{label}</div><input type="number" inputMode="numeric" pattern="[0-9]*" min="0" value={value} disabled={disabled} onChange={(e) => onChange(Math.max(0, Number(e.target.value)))} className="md3-field w-full px-4 py-4 text-center text-3xl font-black disabled:opacity-50" /></div>;
}

function SponsorPredictionPanel({ currentPlayer, players, matches, sponsorPredictions, sponsorPredictionResults, onSave, firstKickoff }) {
  const asiaStats = useMemo(() => calculateAsiaRound2Stats(matches), [matches]);

  return (
    <section className="mt-6 space-y-4 sm:space-y-5">
      <Card className="!p-3.5 sm:!p-5">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <Pill className="mb-2.5"><Trophy className="h-3.5 w-3.5" /> 冠名玩法 · 不额外加分</Pill>
            <h2 className="text-[1.45rem] font-black tracking-tight sm:text-3xl">冠名预测</h2>
            <p className="mt-2 text-sm text-slate-300">新的主玩法是“亚洲之巅”，历史玩法“足球研究所所长”已折叠收纳。</p>
          </div>
          <div className="md3-panel-strong grid gap-2 px-3 py-3 text-slate-100 shadow-xl sm:p-4">
            <div>
              <div className="text-[11px] font-bold md3-subtle">亚洲之巅截止时间</div>
              <div className="mt-1 text-sm font-black sm:text-lg">北京时间 2026/06/19 00:00</div>
            </div>
            <div>
              <div className="text-[11px] font-bold md3-subtle">当前自动统计</div>
              <div className="mt-1 text-sm font-black">总积分 {asiaStats.totalPoints} / 总进球 {asiaStats.totalGoals}</div>
            </div>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {SPONSOR_PREDICTION_GROUPS.map((group) => (
          <SponsorPredictionGroupCard
            key={group.id}
            group={group}
            currentPlayer={currentPlayer}
            players={players}
            matches={matches}
            sponsorPredictions={sponsorPredictions}
            sponsorPredictionResults={sponsorPredictionResults}
            onSave={onSave}
            firstKickoff={firstKickoff}
          />
        ))}
      </div>
    </section>
  );
}

function SponsorPredictionGroupCard({
  group,
  currentPlayer,
  players,
  matches,
  sponsorPredictions,
  sponsorPredictionResults,
  onSave,
  firstKickoff,
}) {
  const [expanded, setExpanded] = useState(!group.collapseByDefault);
  const [fieldValues, setFieldValues] = useState({});
  const locked = isSponsorPredictionLocked(group.events[0], { firstKickoff });
  const asiaStats = useMemo(() => (group.id === ASIA_ROUND2_GROUP_ID ? calculateAsiaRound2Stats(matches) : null), [group.id, matches]);
  const firstGoalMatch = useMemo(() => (group.id === FIRST_GOAL_TIME_EVENT_ID ? getFirstGoalResolvedMatch(matches) : null), [group.id, matches]);

  React.useEffect(() => {
    const nextValues = {};
    group.events.forEach((event) => {
      const existing = sponsorPredictions[event.id]?.[currentPlayer?.id];
      if (event.valueType === "clock") {
        const split = splitSponsorPredictionClock(existing?.predictedValue);
        nextValues[event.id] = {
          minutes: existing?.predictedValue === undefined ? "" : split.minutes,
          seconds: existing?.predictedValue === undefined ? "" : split.seconds,
        };
        return;
      }
      nextValues[event.id] = existing?.predictedValue ?? "";
    });
    setFieldValues(nextValues);
  }, [currentPlayer?.id, group.events, sponsorPredictions]);

  const standings = useMemo(() => (
    group.id === ASIA_ROUND2_GROUP_ID
      ? getSponsorPredictionGroupStandings({
        eventIds: group.events.map((event) => event.id),
        players,
        sponsorPredictions,
        sponsorPredictionResults,
      })
      : []
  ), [group.id, group.events, players, sponsorPredictions, sponsorPredictionResults]);
  const groupWinners = useMemo(() => getGroupPredictionWinners(standings), [standings]);

  const fieldMeta = group.events.map((event) => {
    const prediction = sponsorPredictions[event.id]?.[currentPlayer?.id] || null;
    const result = sponsorPredictionResults[event.id] || null;
    const predictionsByUserId = sponsorPredictions[event.id] || {};
    const winners = getSponsorPredictionWinners({
      eventId: event.id,
      players,
      predictionsByUserId,
      result,
    });
    const valueState = fieldValues[event.id];
    const numericValue = event.valueType === "clock"
      ? (
        String(valueState?.minutes || "").trim() !== ""
          && String(valueState?.seconds || "").trim() !== ""
          && Number.isInteger(Number(valueState.minutes))
          && Number(valueState.minutes) >= 0
          && Number.isInteger(Number(valueState.seconds))
          && Number(valueState.seconds) >= 0
          && Number(valueState.seconds) <= 59
            ? (Number(valueState.minutes) * 60) + Number(valueState.seconds)
            : null
      )
      : (
        String(valueState ?? "").trim() !== "" && Number.isFinite(Number(valueState)) && Number(valueState) >= 0
          ? Math.floor(Number(valueState))
          : null
      );

    return {
      event,
      prediction,
      result,
      predictionsByUserId,
      winners,
      numericValue,
      visiblePlayers: getVisiblePredictionPlayers({
        players,
        predictionsByUserId,
        showAll: locked,
        currentPlayerId: currentPlayer?.id,
      }),
    };
  });

  const canSubmit = !locked && fieldMeta.every((item) => Number.isFinite(item.numericValue));

  async function handleSubmit() {
    const validItems = fieldMeta.filter((item) => Number.isFinite(item.numericValue));
    if (validItems.length !== fieldMeta.length) return;
    for (let index = 0; index < validItems.length; index += 1) {
      const item = validItems[index];
      await onSave(item.event.id, item.numericValue, { silent: index < validItems.length - 1 });
    }
  }

  return (
    <Card className="!p-3.5 sm:!p-5">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
          <div>
            <div className="mb-2 flex flex-wrap gap-2">
              <Pill className={group.historical ? "bg-amber-500/15 text-amber-200" : ""}>
                {group.historical ? "已结束" : "当前主玩法"}
              </Pill>
              <Pill>{group.awardTitle}</Pill>
            </div>
            <h3 className="text-xl font-black sm:text-2xl">{group.title}</h3>
            <p className="mt-1 text-sm text-slate-400">{group.description}</p>
          </div>
          <div className="flex items-center gap-2">
            {locked ? <Pill className="bg-amber-500/15 text-amber-200">已锁定</Pill> : <Pill className="bg-emerald-500/15 text-emerald-200">可提交</Pill>}
            {group.collapseByDefault ? <DarkButton onClick={() => setExpanded((value) => !value)} className="px-3 py-2 text-sm font-black">{expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</DarkButton> : null}
          </div>
        </div>

        {!expanded ? (
          <div className="md3-panel-inset flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
            <span>历史玩法已归档，点击右上角可查看详情。</span>
            <span className="text-slate-400">称号奖励：{group.awardTitle}</span>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-[390px_1fr]">
            <Card className={`${CARD_TONE.tonal} !p-3.5 sm:!p-5`}>
              <div className="space-y-3 sm:space-y-4">
                <div className="rounded-[18px] border px-3 py-3" style={{ borderColor: "color-mix(in srgb, var(--md-sys-color-outline-variant) 56%, transparent)", background: "color-mix(in srgb, var(--md-sys-color-surface-container-low) 84%, transparent)" }}>
                  <div className="text-sm font-black">称号奖励：{group.awardTitle}</div>
                  <div className="mt-1 text-xs leading-relaxed text-slate-400">{group.helperText}</div>
                </div>
                <div className="md3-panel-inset px-3 py-3 text-xs leading-6 text-slate-400">
                  <div>截止时间：{getSponsorPredictionDeadlineLabel(group.events[0], firstKickoff instanceof Date ? formatDateTime(firstKickoff) : firstKickoff)}</div>
                  {group.id === ASIA_ROUND2_GROUP_ID ? <div>官方答案将随比赛结算自动更新</div> : <div>揭幕战开赛后统一锁定并公开所有人的选择</div>}
                </div>
                {fieldMeta.map((item) => (
                  <SponsorPredictionInputCard
                    key={item.event.id}
                    item={item}
                    valueState={fieldValues[item.event.id]}
                    locked={locked}
                    onChange={(nextValue) => setFieldValues((prev) => ({ ...prev, [item.event.id]: nextValue }))}
                  />
                ))}
                <DarkButton disabled={!canSubmit} onClick={handleSubmit} className="flex w-full items-center justify-center gap-2 px-4 py-2.5 text-sm font-black sm:py-3">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
                  {fieldMeta.some((item) => item.prediction?.submittedAt) ? "更新冠名预测" : "提交冠名预测"}
                </DarkButton>
              </div>
            </Card>

            <Card className={`${CARD_TONE.default} !p-3.5 sm:!p-5`}>
              <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-center">
                <div>
                  <h4 className="text-lg font-black sm:text-xl">{group.id === ASIA_ROUND2_GROUP_ID ? "亚洲之巅实时榜" : "朋友的冠名预测"}</h4>
                  <p className="mt-1 text-xs text-slate-400">
                    {group.id === ASIA_ROUND2_GROUP_ID
                      ? `当前自动统计：总积分 ${asiaStats.totalPoints} / 总进球 ${asiaStats.totalGoals}`
                      : (fieldMeta[0]?.result?.actualValue !== undefined
                        ? `官方首球时间：${formatSponsorPredictionClock(fieldMeta[0].result.actualValue)}`
                        : "等待管理员录入官方首球时间后结算称号")}
                  </p>
                </div>
                <Pill>{group.id === ASIA_ROUND2_GROUP_ID ? `已完成第2场：${asiaStats.completedTeams} / ${asiaStats.totalTeams}` : `${Object.keys(fieldMeta[0]?.predictionsByUserId || {}).length}/${players.length} 已提交`}</Pill>
              </div>

              {group.id === ASIA_ROUND2_GROUP_ID ? (
                <div className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-[18px] border px-4 py-3" style={{ borderColor: "color-mix(in srgb, var(--md-sys-color-secondary) 24%, transparent)", background: "color-mix(in srgb, var(--md-sys-color-secondary-container) 60%, transparent)" }}>
                      <div className="text-sm font-black text-slate-100">当前总分领先者：亚洲之巅</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {groupWinners.length ? groupWinners.map((entry) => <Pill key={entry.id} className="bg-yellow-500/15 text-yellow-200">{entry.name} · {entry.totalScore} 分</Pill>) : <span className="text-xs text-slate-400">等待有效预测与自动统计结果</span>}
                      </div>
                    </div>
                    <div className="rounded-[18px] border px-4 py-3" style={{ borderColor: "color-mix(in srgb, var(--md-sys-color-outline-variant) 56%, transparent)", background: "color-mix(in srgb, var(--md-sys-color-surface-container-low) 84%, transparent)" }}>
                      <div className="text-sm font-black">已纳入统计的球队</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {asiaStats.includedMatches.length ? asiaStats.includedMatches.map((match) => <Pill key={match.id}>{match.teamSide === "home" ? match.home : match.away}</Pill>) : <span className="text-xs text-slate-400">还没有亚洲球队完成第2场小组赛</span>}
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-2.5 sm:gap-3 md:grid-cols-2">
                    {fieldMeta.map((item) => (
                      <div key={item.event.id} className="md3-card md3-card-tone-highlight !p-3 sm:!p-4">
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <div className="font-black">{item.event.label}</div>
                          <Pill>{item.visiblePlayers.length}/{players.length} 已提交</Pill>
                        </div>
                        <div className="space-y-1.5 text-xs sm:text-sm">
                          <InfoRow label="当前答案" value={formatSponsorPredictionValue(item.event, item.result?.actualValue)} />
                          <InfoRow label="我的预测" value={formatSponsorPredictionValue(item.event, item.prediction?.predictedValue)} />
                          <div className="flex flex-wrap gap-2 pt-1">
                            {item.winners.length ? item.winners.map((winner) => <Pill key={winner.id} className="bg-emerald-500/15 text-emerald-200">{winner.name} · 误差 {winner.diff}</Pill>) : <span className="text-slate-500">等待结算中</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {fieldMeta[0]?.winners.length > 0 ? (
                    <div className="rounded-[20px] border px-4 py-3" style={{ borderColor: "color-mix(in srgb, var(--md-sys-color-secondary) 24%, transparent)", background: "color-mix(in srgb, var(--md-sys-color-secondary-container) 60%, transparent)" }}>
                      <div className="text-sm font-black text-slate-100">当前称号得主：{group.awardTitle}</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {fieldMeta[0].winners.map((player) => <Pill key={player.id} className="bg-yellow-500/15 text-yellow-200">{player.name} · 相差 {player.diff} 秒</Pill>)}
                      </div>
                    </div>
                  ) : null}
                  {firstGoalMatch ? <div className="md3-panel-inset px-4 py-3 text-xs text-slate-400">当前锁定的首球比赛：#{firstGoalMatch.no} · {teamName(firstGoalMatch.home)} vs {teamName(firstGoalMatch.away)}</div> : null}
                  <div className="grid gap-2.5 sm:gap-3 md:grid-cols-2">
                    {fieldMeta[0].visiblePlayers.map((player) => (
                      <SponsorPredictionPlayerCard
                        key={player.id}
                        player={player}
                        prediction={fieldMeta[0].predictionsByUserId[player.id]}
                        isMe={player.id === currentPlayer?.id}
                        canShow={locked || player.id === currentPlayer?.id}
                        isWinner={fieldMeta[0].winners.some((winner) => winner.id === player.id)}
                        event={fieldMeta[0].event}
                        titleName={group.awardTitle}
                      />
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </Card>
  );
}

function SponsorPredictionInputCard({ item, valueState, locked, onChange }) {
  return (
    <div>
      <label className="md3-label">{item.event.label}</label>
      {item.event.valueType === "clock" ? (
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <input value={valueState?.minutes || ""} disabled={locked} onChange={(event) => onChange({ ...valueState, minutes: event.target.value.replace(/[^\d]/g, "") })} placeholder="分" className="md3-field py-2.5 text-center text-sm disabled:opacity-50" />
          <span className="text-sm font-black text-slate-300">:</span>
          <input value={valueState?.seconds || ""} disabled={locked} onChange={(event) => onChange({ ...valueState, seconds: event.target.value.replace(/[^\d]/g, "") })} placeholder="秒" className="md3-field py-2.5 text-center text-sm disabled:opacity-50" />
        </div>
      ) : (
        <input value={valueState ?? ""} disabled={locked} onChange={(event) => onChange(event.target.value.replace(/[^\d]/g, ""))} placeholder={item.event.placeholder} className="md3-field py-2.5 text-center text-base font-black disabled:opacity-50" />
      )}
      <div className="mt-2 text-[11px] leading-relaxed text-slate-500 sm:text-xs">{item.event.helperText}</div>
    </div>
  );
}

function SponsorPredictionPlayerCard({ player, prediction, isMe, canShow, isWinner, event, titleName }) {
  return <div className="md3-card md3-card-tone-highlight !p-3 sm:!p-4"><div className="mb-2.5 flex items-center justify-between gap-3 sm:mb-3"><div className="flex min-w-0 items-center gap-3"><UserBadge player={player} size="h-9 w-9 sm:h-10 sm:w-10" /><div className="min-w-0"><div className="truncate font-black">{player.name} {isMe && <span className="text-xs text-emerald-200">我</span>}</div><div className="text-[11px] text-slate-500 sm:text-xs">{prediction ? "已提交" : "未提交"}</div></div></div>{prediction ? <CheckCircle2 className="h-4 w-4 text-emerald-200 sm:h-5 sm:w-5" /> : <XCircle className="h-4 w-4 text-slate-600 sm:h-5 sm:w-5" />}</div>{canShow ? <div className="space-y-1.5 text-xs sm:space-y-2 sm:text-sm"><InfoRow label={event.label} value={prediction ? formatSponsorPredictionValue(event, prediction.predictedValue ?? prediction.predictedTotalSeconds) : "--"} />{prediction?.submittedAt ? <InfoRow label="提交时间" value={formatDateTime(prediction.submittedAt)} /> : null}{isWinner ? <div className="flex flex-wrap gap-1.5 pt-1"><Pill className="bg-yellow-500/15 text-yellow-200">{titleName}</Pill></div> : null}</div> : <div className="md3-panel-inset px-3 py-4 text-center text-xs text-slate-500 sm:text-sm">揭幕战开赛后公开</div>}</div>;
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
  const visiblePlayers = getVisiblePredictionPlayers({
    players,
    predictionsByUserId: funPredictions,
    showAll: locked,
    currentPlayerId: currentPlayer?.id,
  });
  return (
    <section className="mt-6 space-y-4 sm:space-y-5"><Card className="!p-3.5 sm:!p-5"><div className="flex flex-col justify-between gap-3 md:flex-row md:items-end"><div><Pill className="mb-2.5"><Flame className="h-3.5 w-3.5" /> 荣誉玩法 · 不额外加分</Pill><h2 className="text-[1.45rem] font-black tracking-tight sm:text-3xl">趣味预测栏</h2></div><div className="md3-panel-strong px-3 py-3 text-slate-100 shadow-xl sm:p-4"><div className="text-[11px] font-bold md3-subtle">锁定时间</div><div className="mt-1 text-sm font-black sm:text-lg">{formatDateTime(firstKickoff)}</div></div></div></Card><div className="grid gap-4 lg:grid-cols-[380px_1fr]"><Card className={`${CARD_TONE.tonal} !p-3.5 sm:!p-5`}><div className="mb-3 flex items-center justify-between gap-3 sm:mb-4"><div><h3 className="text-lg font-black sm:text-xl">我的趣味预测</h3></div>{locked ? <Pill className="bg-amber-500/15 text-amber-200">已锁定</Pill> : <Pill className="bg-emerald-500/15 text-emerald-200">可提交</Pill>}</div><div className="space-y-3 sm:space-y-4"><FunInput label="冠军预测 · 称号：世界杯导演" value={champion} disabled={locked} onChange={setChampion} placeholder="例如：巴西 / 阿根廷 / 法国" /><FunInput label="金靴预测 · 称号：金靴伯乐" value={goldenBoot} disabled={locked} onChange={setGoldenBoot} placeholder="例如：姆巴佩 / 哈兰德 / 梅西" /><FunInput label="首张红牌球队 · 称号：我闻到了火药味" value={firstRedCardTeam} disabled={locked} onChange={setFirstRedCardTeam} placeholder="例如：乌拉圭 / 阿根廷 / 塞尔维亚" /><div><label className="md3-label">本届总进球数预测 · 称号：进球神算子</label><input type="number" min="0" value={totalGoals} disabled={locked} onChange={(e) => setTotalGoals(e.target.value)} placeholder="例如：180" className="md3-field py-2.5 text-sm disabled:opacity-50" /><div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-slate-500 sm:text-xs">{WORLD_CUP_GOAL_REFERENCES.map((item) => <div key={item.edition} className="md3-panel-inset px-3 py-2">{item.edition}：<span className="font-black text-slate-200">{item.goals} 球</span></div>)}</div></div><DarkButton disabled={!canSubmitFunPrediction} onClick={() => onSave(champion, goldenBoot, firstRedCardTeam, totalGoals)} className="flex w-full items-center justify-center gap-2 px-4 py-2.5 text-sm font-black sm:py-3"><CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />{existing.submittedAt ? "更新趣味预测" : "提交趣味预测"}</DarkButton><div className="md3-panel-inset p-3 text-[11px] leading-relaxed text-slate-500 sm:text-xs">当前规则：趣味预测不改变排行榜积分；第一场比赛开始后统一锁定并公开所有人的选择。</div></div></Card><Card className={`${CARD_TONE.default} !p-3.5 sm:!p-5`}><div className="mb-3 flex items-center justify-between gap-3 sm:mb-4"><div><h3 className="text-lg font-black sm:text-xl">朋友趣味预测</h3></div><Pill>{Object.keys(funPredictions).length}/{players.length} 已提交</Pill></div><div className="grid gap-2.5 sm:gap-3 md:grid-cols-2">{visiblePlayers.map((player) => <FunPredictionPlayerCard key={player.id} player={player} prediction={funPredictions[player.id]} isMe={player.id === currentPlayer?.id} canShow={locked || player.id === currentPlayer?.id} awards={titleAwards.find((item) => item.id === player.id)?.titles || []} />)}</div></Card></div></section>
  );
}

function FunInput({ label, value, disabled, onChange, placeholder }) {
  return <div><label className="md3-label">{label}</label><input value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="md3-field text-sm disabled:opacity-50" /></div>;
}

function FunPredictionPlayerCard({ player, prediction, isMe, canShow, awards }) {
  return <div className="md3-card md3-card-tone-highlight !p-3 sm:!p-4"><div className="mb-2.5 flex items-center justify-between gap-3 sm:mb-3"><div className="flex min-w-0 items-center gap-3"><UserBadge player={player} size="h-9 w-9 sm:h-10 sm:w-10" /><div className="min-w-0"><div className="truncate font-black">{player.name} {isMe && <span className="text-xs text-emerald-200">我</span>}</div><div className="text-[11px] text-slate-500 sm:text-xs">{prediction ? "已提交" : "未提交"}</div></div></div>{prediction ? <CheckCircle2 className="h-4 w-4 text-emerald-200 sm:h-5 sm:w-5" /> : <XCircle className="h-4 w-4 text-slate-600 sm:h-5 sm:w-5" />}</div>{canShow ? <div className="space-y-1.5 text-xs sm:space-y-2 sm:text-sm"><InfoRow label="冠军" value={prediction ? teamName(prediction.champion) : "--"} /><InfoRow label="金靴" value={prediction?.goldenBoot || "--"} /><InfoRow label="首张红牌" value={prediction ? teamName(prediction.firstRedCardTeam) : "--"} /><InfoRow label="总进球数" value={prediction?.totalGoals ?? "--"} />{awards.length > 0 && <div className="flex flex-wrap gap-1.5 pt-1">{awards.map((award) => <Pill key={award} className="bg-yellow-500/15 text-yellow-200">{award}</Pill>)}</div>}</div> : <div className="md3-panel-inset px-3 py-4 text-center text-xs text-slate-500 sm:text-sm">第一场开赛后公开</div>}</div>;
}

function InfoRow({ label, value }) {
  return <div className="md3-panel-inset flex items-center justify-between gap-2 px-3 py-2"><span className="text-slate-500">{label}</span><span className="truncate text-right font-black">{value}</span></div>;
}

function PredictionHistoryList({ items }) {
  return <div className="space-y-3">
    {items.length ? items.map(({ prediction, match, points, summary }) => (
      <div key={prediction.id} className="md3-panel p-4">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Pill>#{match.no}</Pill>
          <Pill className="bg-emerald-500/15 text-emerald-200">{(STAGES[match.stage] || STAGES.GROUP).label}</Pill>
        </div>
        <div className="flex flex-wrap items-center gap-2 font-black"><TeamName name={match.home} logo={match.homeLogo} /><span className="text-slate-500">vs</span><TeamName name={match.away} logo={match.awayLogo} /></div>
        <div className="mt-1 text-sm text-slate-400">预测：{prediction.home}:{prediction.away} {match.status === "settled" ? `｜赛果：${match.homeScore}:${match.awayScore}｜${explainPoints(prediction, match)}` : "｜待结算"}</div>
        <div className="mt-3 flex flex-wrap gap-2">
          <div className="w-full sm:w-[15rem]">
            <InfoRow label="我的得分" value={summary.myPointsLabel} />
          </div>
          <div className="w-full sm:w-[15rem]">
            <InfoRow label="平均得分" value={summary.averagePointsLabel} />
          </div>
        </div>
        <div className="mt-1 text-xs text-slate-500">提交时间：{formatDateTime(prediction.submittedAt)}｜开球：{formatDateTime(match.kickoff)}</div>
      </div>
    )) : <div className="md3-panel-inset p-5 text-center text-sm text-slate-500">暂无竞猜记录</div>}
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
        <Pill>管理员结算</Pill>
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
            className="md3-field text-sm"
          />
        ))}
      </div>
      <button onClick={settleFunResults} className="mt-4 w-full rounded-2xl bg-emerald-700 px-4 py-3 text-sm font-black text-emerald-50 transition hover:bg-emerald-600 md:w-auto">
        结算称号
      </button>
    </Card>
  );
}

function PlayerProfilePanel({ player, currentPlayerId, players, rankings, predictions, matches, streakRankings, predictionStyleRankings, reverseLightPlayer, sponsorPredictions, sponsorPredictionResults, funPredictions, funResults, achievementCollections, campBattleSummary, themeMode, onChangeTheme, onUpdateProfile, onBack, onOpenAchievements, onOpenFullHistory }) {
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
  const titles = getPlayerTitles(player, sponsorPredictions, sponsorPredictionResults, players, matches, funPredictions, funResults, predictionStyleRankings, streakRankings, reverseLightPlayer);
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
    return {
      prediction,
      match,
      points: calculatePoints(prediction, match),
      summary: buildScheduleMatchSummary({
        match,
        currentPrediction: prediction,
        predictions,
      }),
    };
  }).filter((item) => item.match && isSettledMatch(item.match)).sort((a, b) => new Date(b.match.kickoff).getTime() - new Date(a.match.kickoff).getTime());
  const recentHistory = history.slice(0, 5);
  const cleanDraftUsername = draftUsername.trim();
  const profileChanged = cleanDraftUsername !== (player.name || "").trim() || draftAvatarEmoji !== (player.avatarEmoji || DEFAULT_AVATAR_EMOJI);
  const playerCamp = getCampMeta(player.campId);
  const campStats = player.campId ? campBattleSummary?.camps?.[player.campId] : null;
  const campRank = campStats?.members?.findIndex((member) => member.id === player.id) ?? -1;
  const exactCampRank = campStats?.members ? [...campStats.members].sort((a, b) => b.exactCount - a.exactCount || comparePlayers(a, b)).findIndex((member) => member.id === player.id) : -1;

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
    <section className="mt-6 space-y-4 sm:space-y-5">
      <Card className="!p-3.5 sm:!p-5">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div className="flex items-start gap-3 sm:gap-4">
            <div>
              {isOwnProfile ? (
                <button type="button" onClick={() => setAvatarEditorOpen((open) => !open)} className="rounded-xl outline-none ring-emerald-300 transition hover:scale-105 focus-visible:ring-2" aria-label="修改头像">
                  <UserBadge player={player} size="h-14 w-14 sm:h-16 sm:w-16" text="text-lg sm:text-xl" />
                </button>
              ) : (
                <UserBadge player={player} size="h-14 w-14 sm:h-16 sm:w-16" text="text-lg sm:text-xl" />
              )}
            </div>
            <div>
              <h2 className="text-[1.45rem] font-black sm:text-3xl">{player.name} 的个人主页</h2>
              {isOwnProfile && <p className="mt-1.5 text-[11px] text-slate-500 sm:mt-2 sm:text-xs">点击头像可以编辑你的昵称和支持球队头像。</p>}
            </div>
          </div>
          <DarkButton onClick={onBack} className="px-4 py-2.5 text-sm font-black sm:py-3">返回竞猜排行榜</DarkButton>
        </div>
        {isOwnProfile && avatarEditorOpen && (
          <div className="md3-panel mt-4 p-3.5 sm:mt-5 sm:p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h3 className="font-black">编辑个人资料</h3>
                <p className="text-xs text-slate-500">修改昵称或头像后点击保存，排行榜和朋友预测里会同步更新。</p>
              </div>
              <Pill>{draftAvatarEmoji}</Pill>
            </div>
            <label className="mb-4 block">
              <span className="md3-label">个人昵称</span>
              <div className="md3-panel-inset flex items-center gap-2 px-4 py-3">
                <User className="h-4 w-4 text-slate-500" />
                <input value={draftUsername} onChange={(event) => setDraftUsername(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-500" placeholder="例如 Oscar" />
              </div>
              {!cleanDraftUsername && <div className="mt-2 text-xs text-rose-300">昵称不能为空。</div>}
            </label>
            <div className="md3-label mb-2">选择看好的夺冠国家球队</div>
            <p className="mb-3 text-xs text-slate-500">你选择的国家球队会作为头像展示在排行榜和预测列表里。</p>
            <EmojiPicker value={draftAvatarEmoji} onChange={setDraftAvatarEmoji} disabled={savingAvatar} />
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <button disabled={savingAvatar || !cleanDraftUsername || !profileChanged} onClick={saveProfile} className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-black text-emerald-50 transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-40">{savingAvatar ? "保存中..." : "保存资料"}</button>
              <DarkButton disabled={savingAvatar} onClick={() => { setDraftUsername(player.name || ""); setDraftAvatarEmoji(player.avatarEmoji || DEFAULT_AVATAR_EMOJI); setAvatarEditorOpen(false); }} className="px-4 py-2 text-sm font-black">取消</DarkButton>
            </div>
          </div>
        )}
        {isOwnProfile && (
          <div className="md3-panel mt-4 p-3.5 sm:mt-5 sm:p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h3 className="font-black">外观设置</h3>
                <p className="text-xs text-slate-500">默认是深色模式，颜色偏好会保存在当前浏览器。</p>
              </div>
              <Pill>颜色模式</Pill>
            </div>
            <ThemeToggle themeMode={themeMode} onChange={onChangeTheme} />
          </div>
        )}
      </Card>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <StatCard icon={Crown} label="总积分" value={`${ranking.total || 0}分`} sub={`当前排名 #${rankingIndex || "-"}`} compact />
        <StatCard icon={Medal} label="完全比分" value={`${ranking.exactCount || 0}次`} sub="完全猜中比分" compact />
        <StatCard icon={CheckCircle2} label="命中胜平负" value={`${ranking.outcomeCount || 0}次`} sub="包含完全比分" compact />
        <StatCard icon={Flame} label="最高连胜" value={`${maxStreak}场`} sub="连续命中胜平负" compact />
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
          {titles.length ? <div className="flex flex-wrap gap-2">{titles.map((title) => <Pill key={title} className="bg-yellow-500/15 text-yellow-200">{title}</Pill>)}</div> : <div className="md3-panel-inset p-5 text-center text-sm text-slate-500">暂未获得称号</div>}
        </Card>
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <button type="button" onClick={() => onOpenAchievements?.()} className="text-left"><h3 className="text-xl font-black transition hover:text-emerald-200">成就信息</h3></button>
          </div>
          <Pill>{playerUnlockedAchievements.length}/{ACHIEVEMENT_DEFINITIONS.length}</Pill>
        </div>
        <div className="space-y-4">
          <CompactAchievementSection title="最近获得成就" items={recentUnlockedAchievements} emptyText="该玩家暂未获得成就" />
        </div>
      </Card>

      <Card>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <button type="button" onClick={() => onOpenFullHistory?.(player.id)} className="text-left"><h3 className="text-xl font-black transition hover:text-emerald-200">用户历史竞猜记录</h3></button>
          </div>
          <Pill>{history.length} 条</Pill>
        </div>
        <PredictionHistoryList items={recentHistory} />
      </Card>
    </section>
  );
}

function AchievementsPanel({ players, currentPlayerId, achievementCollections }) {
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
    <section className="space-y-5">
      <Card>
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold" style={{ background: "color-mix(in srgb, var(--md-sys-color-primary-container) 82%, transparent)", color: "var(--md-sys-color-on-primary-container)" }}><Crown className="h-3.5 w-3.5" /> 成就墙 · 我的成就</div>
            <h2 className="text-3xl font-black tracking-tight">成就墙</h2>
          </div>
          <div className="rounded-[24px] border p-4 shadow-xl" style={{ borderColor: "color-mix(in srgb, var(--md-sys-color-outline-variant) 64%, transparent)", background: "color-mix(in srgb, var(--md-sys-color-surface-container-highest) 85%, transparent)" }}>
            <div className="text-xs font-bold md3-subtle">我的成就</div>
            <div className="mt-1 text-3xl font-black">{unlocked.length}/{achievementCollections?.totalAchievements || ACHIEVEMENT_DEFINITIONS.length}</div>
            <div className="mt-2 text-xs md3-subtle">未解锁隐藏成就 {hiddenLocked.length} 个</div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h3 className="text-xl font-black">成就筛选</h3>
          </div>
          <M3SegmentedControl options={[ "全部", ...ACHIEVEMENT_RARITIES ].map((rarity) => ({ value: rarity, label: rarity }))} value={rarityFilter} onChange={setRarityFilter} size="sm" />
        </div>
      </Card>

      <AchievementSection title="已获得成就" items={filteredUnlocked} emptyText="当前筛选下暂无已获得成就" />
      <AchievementSection title="即将达成" items={filteredUpcoming.sort((a, b) => (b.currentPlayerProgress.current / b.currentPlayerProgress.target) - (a.currentPlayerProgress.current / a.currentPlayerProgress.target))} emptyText="当前筛选下暂无公开未解锁成就" />
      <AchievementSection title="隐藏成就" items={filteredHidden} emptyText="当前筛选下暂无隐藏成就" />
    </section>
  );
}

function AchievementSection({ title, subtitle, items, emptyText }) {
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-black">{title}</h3>
          {subtitle ? <p className="text-sm text-slate-400">{subtitle}</p> : null}
        </div>
        <Pill className="bg-slate-800 text-slate-300">{items.length} 个</Pill>
      </div>
      {items.length ? <div className="grid gap-4 xl:grid-cols-2">{items.map((item) => <AchievementCard key={`${title}-${item.achievement.id}`} {...item} />)}</div> : <EmptyState icon={Star} title={emptyText} description="换个筛选或者继续竞猜，成就会慢慢点亮。" />}
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
      {items.length ? <div className="grid gap-3 md:grid-cols-2">{items.map((item) => <AchievementCard key={`${title}-${item.achievement.id}`} {...item} compact />)}</div> : <EmptyState icon={Star} title={emptyText} description="成就获得后会出现在这里。" />}
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
      <div className="mt-4 grid gap-2 rounded-[20px] px-3 py-3 text-sm" style={{ background: "color-mix(in srgb, var(--md-sys-color-surface-container-highest) 82%, transparent)" }}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="md3-subtle">获得时间</span>
          <span className={achieved ? `font-black ${theme.accent}` : "font-black md3-subtle"}>{formatAchievementTime(currentPlayerProgress.achievedAt)}</span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="md3-subtle">获得进度</span>
          <span className={achieved ? `font-black ${theme.accent}` : "font-black"}>{currentPlayerProgress.current}/{currentPlayerProgress.target}</span>
        </div>
        <M3Progress value={currentPlayerProgress.current} max={currentPlayerProgress.target} />
      </div>
    </div>
  );
}

function RankingPanel({ players, rankingTrend, predictionStyleRankings, streakRankings, reverseLightPlayer, dailyBestPlayers, rankings, currentPlayerId, settledCount, onOpenPlayerProfile, matches, predictions }) {
  const [rankingFilter, setRankingFilter] = useState("ALL");
  const matchesById = useMemo(() => Object.fromEntries(matches.map((match) => [match.id, match])), [matches]);
  const rankingFilters = [
    { value: "ALL", label: "总榜" },
    { value: "GROUP", label: "小组赛" },
    { value: "KNOCKOUT", label: "淘汰赛" },
    { value: "WEEK", label: "本周" },
    { value: "FRIENDS", label: "好友榜" },
  ];

  const filteredRankings = useMemo(() => {
    if (rankingFilter === "ALL" || rankingFilter === "FRIENDS") return rankings;
    const now = Date.now();
    return players.map((player) => {
      const playerPredictions = predictions.filter((prediction) => prediction.playerId === player.id).filter((prediction) => {
        const match = matches.find((item) => item.id === prediction.matchId);
        if (!match || !isSettledMatch(match)) return false;
        if (rankingFilter === "GROUP") return match.stage === "GROUP";
        if (rankingFilter === "KNOCKOUT") return match.stage !== "GROUP";
        if (rankingFilter === "WEEK") return now - new Date(match.kickoff).getTime() <= 7 * 24 * 60 * 60 * 1000;
        return true;
      });
      return buildRankingStats(player, playerPredictions, matchesById);
    }).sort(comparePlayers);
  }, [rankingFilter, players, predictions, matchesById]);

  return (
    <section className="space-y-5">
      <Card className="md3-filled-card">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 className="md3-section-title text-[1.9rem]">竞猜积分榜</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <Pill>已结算 {settledCount} 场</Pill>
            <Pill>{players.length} 位玩家</Pill>
          </div>
        </div>
      </Card>

      <Card>
        <div className="mb-4 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h3 className="md3-section-title text-[1.5rem]">榜单筛选</h3>
          </div>
          <M3SegmentedControl options={rankingFilters} value={rankingFilter} onChange={setRankingFilter} />
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {filteredRankings.slice(0, 3).map((player, index) => (
            <PodiumCard key={`${rankingFilter}-${player.id}`} player={player} place={index + 1} onClick={() => onOpenPlayerProfile(player.id)} />
          ))}
        </div>
      </Card>

      <RankTrendChart players={players} rankingTrend={rankingTrend} />
      <PredictionStyleRankingsPanel predictionStyleRankings={predictionStyleRankings} />
      <FunRankingsPanel streakRankings={streakRankings} reverseLightPlayer={reverseLightPlayer} dailyBestPlayers={dailyBestPlayers} />
      <ScoreRankingTable rankings={filteredRankings} currentPlayerId={currentPlayerId} settledCount={settledCount} onOpenPlayerProfile={onOpenPlayerProfile} />
    </section>
  );
}

function ScoreRankingTable({ rankings, currentPlayerId, settledCount, onOpenPlayerProfile }) {
  return (
    <Card className="!p-3.5 sm:!p-5">
      <div className="mb-4 flex flex-col justify-between gap-3 md:mb-5 md:flex-row md:items-end">
        <div>
          <h2 className="md3-section-title text-[1.3rem] sm:text-[1.6rem]">完整排名列表</h2>
        </div>
        <Pill>已结算 {settledCount} 场</Pill>
      </div>
      <div className="space-y-2.5 md:hidden">
        {rankings.map((player, index) => {
          const isCurrent = player.id === currentPlayerId;
          return (
            <button key={`compact-${player.id}`} type="button" onClick={() => onOpenPlayerProfile?.(player.id)} className={cn("md3-panel-inset flex w-full items-center gap-3 rounded-[22px] px-3 py-2.5 text-left", isCurrent && "ring-1 ring-[color:var(--md-sys-color-primary)]")}>
              <div className="flex h-9 w-9 items-center justify-center rounded-[14px] text-sm font-black" style={{ background: index < 3 ? "color-mix(in srgb, var(--md-sys-color-secondary-container) 72%, transparent)" : "color-mix(in srgb, var(--md-sys-color-surface-container-highest) 88%, transparent)", color: index < 3 ? "var(--md-sys-color-on-secondary-container)" : "var(--md-sys-color-on-surface)" }}>
                #{index + 1}
              </div>
              <UserBadge player={player} size="h-9 w-9" text="text-xs" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-black">{player.name}</div>
                <div className="text-[11px] md3-subtle">比分 {player.exactCount} 次 · 净胜球 {player.netGoalOnlyCount} 次</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-black text-[color:var(--md-sys-color-primary)]">{player.total}</div>
                <div className="text-[11px] md3-subtle">仅中胜负 {player.outcomeOnlyCount}</div>
              </div>
            </button>
          );
        })}
      </div>
      <div className="hidden space-y-3 md:block">
        {rankings.map((player, index) => {
          const isCurrent = player.id === currentPlayerId;
          return (
            <button key={player.id} type="button" onClick={() => onOpenPlayerProfile?.(player.id)} className={cn("md3-card w-full text-left", isCurrent && "md3-filled-card")}>
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="flex items-center gap-3 md:w-[280px]">
                  <div className="flex h-11 w-11 items-center justify-center rounded-[18px] font-black" style={{ background: index < 3 ? "color-mix(in srgb, var(--md-sys-color-secondary-container) 72%, transparent)" : "color-mix(in srgb, var(--md-sys-color-surface-container-highest) 88%, transparent)", color: index < 3 ? "var(--md-sys-color-on-secondary-container)" : "var(--md-sys-color-on-surface)" }}>
                    #{index + 1}
                  </div>
                  <UserBadge player={player} size="h-11 w-11" text="text-sm" />
                  <div className="min-w-0">
                    <div className="truncate text-base font-black">{player.name}</div>
                    <div className="text-xs md3-subtle">{isCurrent ? "当前用户" : "点击查看个人主页"}</div>
                  </div>
                </div>
                <div className="grid flex-1 gap-3 sm:grid-cols-4">
                  <RankingMetric label="总积分" value={`${player.total} 分`} accent />
                  <RankingMetric label="完全比分" value={`${player.exactCount} 次`} />
                  <RankingMetric label="胜负+净胜球" value={`${player.netGoalOnlyCount} 次`} />
                  <RankingMetric label="仅中胜负" value={`${player.outcomeOnlyCount} 次`} />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}

function RankingMetric({ label, value, accent = false, trend = null }) {
  return (
    <div className="rounded-[20px] px-4 py-3" style={{ background: "color-mix(in srgb, var(--md-sys-color-surface-container-highest) 85%, transparent)" }}>
      <div className="text-xs uppercase tracking-[0.16em] md3-subtle">{label}</div>
      <div className={cn("mt-2 flex items-center gap-2 text-lg font-black", accent && "text-[color:var(--md-sys-color-primary)]")}>
        {trend !== null ? (trend > 0 ? <ArrowUp className="h-4 w-4 text-emerald-500" /> : trend < 0 ? <ArrowDown className="h-4 w-4 text-rose-500" /> : <Target className="h-4 w-4 md3-subtle" />) : null}
        <span>{value}</span>
      </div>
    </div>
  );
}

function MiniRankingCard({ title, badge, players, valueLabel }) {
  const leader = players?.[0];
  return (
    <Card className="h-full overflow-hidden bg-[linear-gradient(160deg,rgba(10,25,17,0.98),rgba(13,33,22,0.96),rgba(17,42,29,0.94))] shadow-[0_18px_60px_rgba(6,78,59,0.24)]">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-[1.65rem] font-black leading-tight tracking-tight text-slate-50">{title}</h3>
        </div>
        <Pill className="shrink-0 border border-emerald-800/40 bg-emerald-950/70 px-3 py-1.5 text-center text-xs font-bold text-emerald-100 shadow-inner shadow-emerald-950/40">{badge}</Pill>
      </div>
      {leader && leader.value > 0 ? (
        <div className="space-y-3">
          <div className="rounded-[28px] border border-emerald-900/45 bg-[linear-gradient(180deg,rgba(8,22,15,0.98),rgba(11,36,24,0.96))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
            <div className="text-center text-xs tracking-[0.2em] text-slate-500">当前第 1 名</div>
            <div className="mt-3 rounded-2xl border border-emerald-900/35 bg-emerald-950/55 px-4 py-4 shadow-inner shadow-black/20">
              <UserNameOnly player={leader} mono wrap className="mx-auto max-w-[20ch] text-center text-lg leading-6 md:text-[1.35rem] md:leading-7" />
            </div>
            <div className="mt-3 rounded-2xl bg-emerald-950/70 px-3 py-2 text-center text-sm text-emerald-100/75">
              {valueLabel} <span className="font-black text-emerald-50">{leader.value}</span> 次
            </div>
          </div>
          <div className="space-y-2">
            {players.slice(0, 5).map((player, index) => (
              <div key={player.id} className="flex items-center gap-3 rounded-2xl border border-emerald-900/30 bg-emerald-950/45 px-3 py-3 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
                <span className="shrink-0 rounded-xl bg-emerald-950/80 px-2 py-1 font-bold text-emerald-100/70">#{index + 1}</span>
                <UserNameOnly player={player} mono wrap className="flex-1 text-sm leading-5 text-slate-100" />
                <span className="shrink-0 rounded-xl bg-emerald-950 px-2.5 py-1 font-black text-emerald-50">{player.value}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-emerald-950/45 p-5 text-center text-slate-500">暂无有效数据</div>
      )}
    </Card>
  );
}

function PredictionStyleRankingsPanel({ predictionStyleRankings }) {
  return <div><div className="mb-4 flex items-center justify-between gap-3"><div><h2 className="text-2xl font-black">预测风格榜</h2></div><Pill className="bg-emerald-500/15 text-emerald-200">趣味统计</Pill></div><div className="grid gap-5 md:grid-cols-2"><MiniRankingCard title="精准狙击榜" badge="精准狙击手" players={predictionStyleRankings.exactSnipers} valueLabel="完全比分" /><MiniRankingCard title="稳健大师榜" badge="稳健大师" players={predictionStyleRankings.steadyMasters} valueLabel="命中结果" /><MiniRankingCard title="保守大师榜" badge="保守大师" players={predictionStyleRankings.conservativeMasters} valueLabel="预测平局" /><MiniRankingCard title="进攻狂魔榜" badge="进攻狂魔" players={predictionStyleRankings.attackingMadmen} valueLabel="大比分预测" /></div></div>;
}

function FunRankingsPanel({ streakRankings, reverseLightPlayer, dailyBestPlayers }) {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <Card>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-xl font-black">最高连胜排名</h3>
          </div>
          <Pill className="shrink-0 bg-yellow-500/15 text-yellow-200">大预言家</Pill>
        </div>
        <div className="space-y-3">
          {streakRankings.slice(0, 5).map((player, index) => (
            <div key={player.id} className="flex items-center gap-3 rounded-2xl border border-emerald-900/30 bg-emerald-950/45 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="shrink-0 font-bold text-emerald-100/70">#{index + 1}</span>
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
          </div>
          <Pill className="shrink-0 bg-rose-500/15 text-rose-200">毒奶之王</Pill>
        </div>
        {reverseLightPlayer ? (
          <div className="rounded-3xl border border-rose-300/20 bg-gradient-to-br from-rose-500/10 to-fuchsia-500/10 p-5 shadow-[0_18px_60px_rgba(88,28,135,0.18)]">
            <div className="rounded-2xl bg-emerald-950/45 px-4 py-4">
              <UserNameOnly player={reverseLightPlayer} mono wrap className="mx-auto max-w-[20ch] text-center text-lg leading-6 md:text-[1.5rem] md:leading-8" />
            </div>
            <div className="mt-3 text-center text-sm text-rose-100">称号：毒奶之王</div>
            <div className="mt-4 rounded-2xl bg-emerald-950/70 p-3 text-center text-sm text-slate-400">当前总分 {reverseLightPlayer.total} 分 · 参与 {reverseLightPlayer.played} 场</div>
          </div>
        ) : (
          <div className="rounded-2xl bg-emerald-950/45 p-5 text-center text-slate-500">暂无数据</div>
        )}
      </Card>
      <Card>
        <div className="mb-4">
          <h3 className="text-xl font-black">每日最佳玩家</h3>
        </div>
        <div className="max-h-[420px] space-y-3 overflow-auto pr-1">
          {dailyBestPlayers.length ? dailyBestPlayers.map((day) => (
            <div key={day.date} className="rounded-2xl border border-emerald-900/25 bg-emerald-950/40 p-3">
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="font-black">{day.date}</div>
                <Pill className="bg-emerald-950/80 text-emerald-100/75">{day.matchCount}场</Pill>
              </div>
              {day.winners.length ? (
                <div className="space-y-2">
                  {day.winners.slice(0, 5).map((player) => (
                    <div key={player.id} className="flex items-center gap-3 rounded-xl bg-emerald-950/70 px-3 py-2.5">
                      <UserNameOnly player={player} mono wrap className="flex-1 text-sm leading-5" />
                      <span className="shrink-0 text-lg font-black">{day.topScore}分</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl bg-emerald-950/70 px-3 py-2 text-sm text-slate-500">当日暂无得分</div>
              )}
            </div>
          )) : <div className="rounded-2xl bg-emerald-950/45 p-5 text-center text-slate-500">结算比赛后自动记录每日最佳。</div>}
        </div>
      </Card>
    </div>
  );
}

function RankTrendChart({ players, rankingTrend }) {
  if (!rankingTrend.length) return <Card><div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><h2 className="text-2xl font-black">排名变化趋势</h2></div><Pill className="bg-emerald-950/70 text-emerald-100/75">等待结算</Pill></div></Card>;
  const lineColors = ["#fbbf24", "#60a5fa", "#34d399", "#fb7185", "#a78bfa", "#f97316", "#22d3ee", "#e879f9"];
  return <Card><div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-end"><div><h2 className="text-2xl font-black">排名变化趋势</h2></div><Pill className="bg-emerald-500/15 text-emerald-200">实时更新</Pill></div><div className="h-80 rounded-2xl border border-emerald-900/35 bg-emerald-950/45 p-3"><ResponsiveContainer width="100%" height="100%"><LineChart data={rankingTrend} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}><CartesianGrid strokeDasharray="3 3" stroke="rgba(110,231,183,0.14)" /><XAxis dataKey="label" stroke="rgba(203,213,225,0.7)" tick={{ fill: "rgba(203,213,225,0.7)", fontSize: 12 }} /><YAxis allowDecimals={false} domain={[0, "auto"]} stroke="rgba(203,213,225,0.7)" tick={{ fill: "rgba(203,213,225,0.7)", fontSize: 12 }} tickFormatter={(value) => `${value}分`} /><Tooltip contentStyle={{ background: "rgba(7,20,14,0.96)", border: "1px solid rgba(52,211,153,0.22)", borderRadius: 16, color: "white" }} labelStyle={{ color: "white", fontWeight: 800 }} formatter={(value, name) => [`${value}分`, name]} labelFormatter={(label, payload) => { const item = payload?.[0]?.payload; return item?.match ? `${label} · ${item.match}` : label; }} /><Legend wrapperStyle={{ color: "rgba(203,213,225,0.8)", fontSize: 12 }} />{players.map((player, index) => <Line key={player.id} type="monotone" dataKey={player.id} name={player.name} stroke={lineColors[index % lineColors.length]} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} connectNulls />)}</LineChart></ResponsiveContainer></div></Card>;
}

function CampBadge({ campId, className = "" }) {
  const meta = getCampMeta(campId);
  return <Pill className={`${meta ? meta.pill : ""} ${className}`}>{getCampDisplayName(campId)}</Pill>;
}

function CampBattlePanel({ campBattleSummary, settledCount }) {
  const leftCamp = campBattleSummary.camps.A;
  const rightCamp = campBattleSummary.camps.B;
  const leaderMeta = getCampMeta(campBattleSummary.leaderCampId);

  return (
    <section className="mt-6 space-y-4 sm:space-y-5">
      <Card className="!p-3.5 sm:!p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-[1.45rem] font-black sm:text-3xl">阵营对抗赛</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <Pill>已结算 {settledCount} 场</Pill>
            <Pill className={leaderMeta ? leaderMeta.pill : ""}>{leaderMeta ? `${leaderMeta.name} 暂时领先` : "暂未分出领先方"}</Pill>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-[1.2fr_1fr] xl:gap-5">
        <Card className={`bg-gradient-to-br !p-3.5 sm:!p-5 ${leftCamp.meta.panel} ${leftCamp.meta.glow}`}>
          <div className="mb-3 flex items-center justify-between gap-3 sm:mb-4">
            <div>
              <h3 className="text-base font-black sm:text-2xl">{leftCamp.meta.name}</h3>
              <p className="text-[11px] text-slate-400 sm:text-sm">{leftCamp.memberCount} 人参战</p>
            </div>
            <CampBadge campId="A" />
          </div>
          <div className="grid gap-2 sm:grid-cols-3 sm:gap-3">
            <StatTile label="阵营总分" value={`${leftCamp.total}分`} />
            <StatTile label="阵营平均分" value={`${leftCamp.average.toFixed(1).replace(/\.0$/, "")}分`} />
            <StatTile label="人均参与" value={`${leftCamp.playedAverage.toFixed(1).replace(/\.0$/, "")}场`} />
          </div>
        </Card>
        <Card className={`bg-gradient-to-br !p-3.5 sm:!p-5 ${rightCamp.meta.panel} ${rightCamp.meta.glow}`}>
          <div className="mb-3 flex items-center justify-between gap-3 sm:mb-4">
            <div>
              <h3 className="text-base font-black sm:text-2xl">{rightCamp.meta.name}</h3>
              <p className="text-[11px] text-slate-400 sm:text-sm">{rightCamp.memberCount} 人参战</p>
            </div>
            <CampBadge campId="B" />
          </div>
          <div className="grid gap-2 sm:grid-cols-3 sm:gap-3">
            <StatTile label="阵营总分" value={`${rightCamp.total}分`} />
            <StatTile label="阵营平均分" value={`${rightCamp.average.toFixed(1).replace(/\.0$/, "")}分`} />
            <StatTile label="人均参与" value={`${rightCamp.playedAverage.toFixed(1).replace(/\.0$/, "")}场`} />
          </div>
        </Card>
      </div>

      <Card>
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h3 className="text-2xl font-black">核心对抗记分板</h3>
          </div>
          <Pill>6 项对抗</Pill>
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          {campBattleSummary.metricDuels.map((duel) => <CampDuelCard key={duel.id} duel={duel} />)}
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-2">
        <CampMembersCard camp={leftCamp} />
        <CampMembersCard camp={rightCamp} />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-2xl font-black">趣味荣誉区</h3>
            </div>
            <Pill>荣誉玩法</Pill>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <HonorCard title="头号选手" value={leftCamp.topPlayer ? `${leftCamp.topPlayer.name} / ${leftCamp.topPlayer.total}分` : "待组队"} badge={leftCamp.meta.name} badgeClass={leftCamp.meta.pill} />
            <HonorCard title="头号选手" value={rightCamp.topPlayer ? `${rightCamp.topPlayer.name} / ${rightCamp.topPlayer.total}分` : "待组队"} badge={rightCamp.meta.name} badgeClass={rightCamp.meta.pill} />
            <HonorCard title="拖分王" value={leftCamp.bottomPlayer ? `${leftCamp.bottomPlayer.name} / ${leftCamp.bottomPlayer.total}分` : "待组队"} badge={leftCamp.meta.name} badgeClass={leftCamp.meta.pill} />
            <HonorCard title="拖分王" value={rightCamp.bottomPlayer ? `${rightCamp.bottomPlayer.name} / ${rightCamp.bottomPlayer.total}分` : "待组队"} badge={rightCamp.meta.name} badgeClass={rightCamp.meta.pill} />
            <HonorCard title="MVP归属" value={campBattleSummary.latestMatchBattle?.mvp ? `${campBattleSummary.latestMatchBattle.mvp.player.name} · ${campBattleSummary.latestMatchBattle.mvp.points}分` : "最近暂无单场MVP"} badge={campBattleSummary.latestMatchBattle?.mvp?.player?.campId ? getCampMeta(campBattleSummary.latestMatchBattle.mvp.player.campId)?.name : "等待结算"} badgeClass={campBattleSummary.latestMatchBattle?.mvp?.player?.campId ? getCampMeta(campBattleSummary.latestMatchBattle.mvp.player.campId)?.pill : ""} />
            <HonorCard title="毒奶阵营" value={campBattleSummary.lowestAverageCampId ? `${getCampMeta(campBattleSummary.lowestAverageCampId)?.name} 当前平均分更低` : "双方暂时打平"} badge="轻松调侃" badgeClass="bg-fuchsia-500/15 text-fuchsia-200" />
          </div>
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-2xl font-black">最近战况</h3>
            </div>
            <Pill>即时刷新</Pill>
          </div>
          <div className="space-y-4">
            <BattleFeed title="最近 3 场" battles={campBattleSummary.recentMatchBattles} />
            <BattleFeed title="最近 3 个比赛日" battles={campBattleSummary.recentDayBattles} />
          </div>
        </Card>
      </div>
    </section>
  );
}

function StatTile({ label, value }) {
  return <div className="md3-panel-inset p-3 sm:p-4"><div className="text-[11px] text-slate-400 sm:text-sm">{label}</div><div className="mt-1.5 text-lg font-black sm:mt-2 sm:text-2xl">{value}</div></div>;
}

function CampDuelCard({ duel }) {
  const winnerMeta = getCampMeta(duel.winner);
  return (
    <div className="md3-panel p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h4 className="font-black">{duel.title}</h4>
        </div>
        <Pill className={winnerMeta ? winnerMeta.pill : ""}>{winnerMeta ? `${winnerMeta.name} 领先` : "双方打平"}</Pill>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="md3-panel-inset px-4 py-4 text-center">
          <div className="text-xs text-slate-500">{CAMP_CONFIG.A.name}</div>
          <div className="mt-2 text-2xl font-black text-rose-100">{duel.formatter(duel.leftValue)}</div>
        </div>
        <div className="text-sm font-bold text-slate-500">VS</div>
        <div className="md3-panel-inset px-4 py-4 text-center">
          <div className="text-xs text-slate-500">{CAMP_CONFIG.B.name}</div>
          <div className="mt-2 text-2xl font-black text-sky-100">{duel.formatter(duel.rightValue)}</div>
        </div>
      </div>
    </div>
  );
}

function CampMembersCard({ camp }) {
  return (
    <Card className={`${camp.meta.card} ${camp.meta.glow}`}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-2xl font-black">{camp.meta.name} 成员榜</h3>
        </div>
        <CampBadge campId={camp.campId} />
      </div>
          {camp.members.length ? (
        <div className="space-y-3">
          {camp.members.map((member, index) => (
            <div key={member.id} className="md3-panel-inset grid grid-cols-[auto_1fr_auto] items-center gap-3 px-3 py-3">
              <span className="rounded-xl bg-black/10 px-2 py-1 text-xs font-bold text-slate-300">#{index + 1}</span>
              <div className="min-w-0">
                <UserNameOnly player={member} className="text-sm" />
                <div className="text-xs text-slate-500">完全比分 {member.exactCount} 次 · 命中结果 {member.outcomeCount} 次</div>
              </div>
              <div className="text-right">
                <div className="text-xl font-black">{member.total}</div>
                <div className="text-xs text-slate-500">{member.played} 场</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="md3-panel-inset p-5 text-center text-sm text-slate-500">这个阵营暂时还没有成员。</div>
      )}
    </Card>
  );
}

function HonorCard({ title, value, badge, badgeClass }) {
  return <div className="md3-panel-inset p-4"><div className="mb-2 flex items-center justify-between gap-3"><div className="font-black">{title}</div><Pill className={badgeClass}>{badge}</Pill></div><div className="text-sm leading-6 text-slate-300">{value}</div></div>;
}

function BattleFeed({ title, battles }) {
  return (
    <div>
      <div className="mb-3 text-sm font-bold text-slate-300">{title}</div>
      <div className="space-y-2">
        {battles.length ? battles.map((battle) => {
          const winnerMeta = getCampMeta(battle.winner);
          return (
            <div key={battle.key} className="md3-panel-inset px-4 py-3">
              <div className="mb-1 flex items-center justify-between gap-3">
                <div className="font-black">{battle.label}</div>
                <Pill className={winnerMeta ? winnerMeta.pill : ""}>{winnerMeta ? `${winnerMeta.name} 胜` : "双方战平"}</Pill>
              </div>
              <div className="text-sm text-slate-400">{battle.sublabel}</div>
              <div className="mt-2 text-sm text-slate-300">{CAMP_CONFIG.A.name} {battle.leftValue} : {battle.rightValue} {CAMP_CONFIG.B.name}</div>
            </div>
          );
        }) : <div className="md3-panel-inset p-4 text-center text-sm text-slate-500">暂无可展示的战报。</div>}
      </div>
    </div>
  );
}

function AdminCampAssignmentCard({ players, onSetUserCamp }) {
  const [query, setQuery] = useState("");
  const [savingUserId, setSavingUserId] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const visiblePlayers = players.filter((player) => {
    const text = `${player.name}${player.email}${getCampDisplayName(player.campId)}`.toLowerCase();
    return !normalizedQuery || text.includes(normalizedQuery);
  });

  async function handleChange(userId, campId) {
    setSavingUserId(userId);
    await onSetUserCamp?.(userId, campId || null);
    setSavingUserId("");
  }

  return (
    <Card>
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-black">阵营分配</h2>
          <p className="mt-1 text-sm text-slate-400">管理员手动把玩家分到红方、蓝方或暂不分组，阵营赛会自动独立统计。</p>
        </div>
        <Pill className="bg-slate-800 text-slate-300">当前 {players.length} 名玩家</Pill>
      </div>
      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索玩家 / 邮箱 / 阵营" className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-sm outline-none placeholder:text-slate-500" />
      </div>
      <div className="space-y-3">
        {visiblePlayers.length ? visiblePlayers.map((player) => (
          <div key={player.id} className="flex flex-col gap-3 rounded-2xl border border-slate-700 bg-slate-950/70 p-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3">
                <UserBadge player={player} />
                <div className="min-w-0">
                  <UserNameOnly player={player} className="text-sm" />
                  <div className="truncate text-xs text-slate-500">{player.email}</div>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <CampBadge campId={player.campId} />
              <select value={player.campId || ""} disabled={savingUserId === player.id} onChange={(event) => handleChange(player.id, event.target.value)} className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none disabled:opacity-50">
                <option value="">未分组</option>
                <option value="A">A阵营 / 红方</option>
                <option value="B">B阵营 / 蓝方</option>
              </select>
            </div>
          </div>
        )) : <div className="rounded-2xl bg-slate-950 p-5 text-center text-sm text-slate-500">没有符合条件的玩家。</div>}
      </div>
    </Card>
  );
}

function AdminAccountManagementCard({ players, onSetUserAdmin }) {
  const [query, setQuery] = useState("");
  const [savingUserId, setSavingUserId] = useState("");
  const currentAdmins = getCurrentAdmins(players);
  const adminCandidates = getAdminCandidates(players, query).slice(0, 12);

  async function handlePromote(userId) {
    setSavingUserId(userId);
    await onSetUserAdmin?.(userId, true);
    setSavingUserId("");
  }

  async function handleRevoke(player) {
    const label = player.name || player.email || "该用户";
    const confirmed = window.confirm(`确认取消 ${label} 的管理员权限吗？`);
    if (!confirmed) return;
    setSavingUserId(player.id);
    await onSetUserAdmin?.(player.id, false);
    setSavingUserId("");
  }

  return (
    <Card>
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-black">管理员账号</h2>
          <p className="mt-1 text-sm text-slate-400">在后台直接授予或取消管理员权限，系统会自动阻止移除最后一个管理员。</p>
        </div>
        <Pill className="bg-slate-800 text-slate-300">当前 {currentAdmins.length} 位管理员</Pill>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-3xl border border-slate-700 bg-slate-950/70 p-4">
          <div className="mb-3 text-sm font-bold text-white">当前管理员</div>
          <div className="space-y-3">
            {currentAdmins.length ? currentAdmins.map((player) => (
              <div key={player.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-700 px-3 py-3">
                <div className="min-w-0">
                  <div className="truncate font-semibold text-white">{player.name || "未命名用户"}</div>
                  <div className="truncate text-xs text-slate-400">{player.email || "未填写邮箱"}</div>
                </div>
                <button
                  type="button"
                  className="rounded-full border border-rose-400/30 px-3 py-1 text-xs font-semibold text-rose-200 disabled:opacity-50"
                  disabled={savingUserId === player.id}
                  onClick={() => handleRevoke(player)}
                >
                  取消权限
                </button>
              </div>
            )) : <div className="rounded-2xl bg-slate-900 px-4 py-5 text-center text-sm text-slate-500">当前还没有可显示的管理员账号。</div>}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-700 bg-slate-950/70 p-4">
          <div className="mb-3 text-sm font-bold text-white">添加管理员</div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索邮箱或昵称" className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-sm outline-none placeholder:text-slate-500" />
          </div>
          <div className="mt-3 space-y-3">
            {adminCandidates.length ? adminCandidates.map((player) => (
              <div key={player.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-700 px-3 py-3">
                <div className="min-w-0">
                  <div className="truncate font-semibold text-white">{player.name || "未命名用户"}</div>
                  <div className="truncate text-xs text-slate-400">{player.email || "未填写邮箱"}</div>
                </div>
                <button
                  type="button"
                  className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white disabled:opacity-50"
                  disabled={savingUserId === player.id}
                  onClick={() => handlePromote(player.id)}
                >
                  设为管理员
                </button>
              </div>
            )) : <div className="rounded-2xl bg-slate-900 px-4 py-5 text-center text-sm text-slate-500">没有匹配的普通用户，先让对方完成注册登录。</div>}
          </div>
        </div>
      </div>
    </Card>
  );
}

function AdminDeleteUserCard({ players, currentPlayerId, onDeleteUser }) {
  const [query, setQuery] = useState("");
  const [deletingUserId, setDeletingUserId] = useState("");
  const deletableUsers = getDeletableUsers(players, query, currentPlayerId).slice(0, 12);

  async function handleDelete(player) {
    const label = player.name || player.email || "该用户";
    const confirmed = window.confirm(`确认删除 ${label} 吗？账号及关联数据将被永久删除。`);
    if (!confirmed) return;
    setDeletingUserId(player.id);
    await onDeleteUser?.(player.id);
    setDeletingUserId("");
  }

  return (
    <Card>
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-black">删除用户</h2>
          <p className="mt-1 text-sm text-slate-400">仅管理员可永久删除账号。删除后，账号及关联数据将被永久删除，无法恢复。</p>
        </div>
        <Pill className="bg-rose-500/15 text-rose-200">高风险操作</Pill>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索邮箱或昵称" className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-sm outline-none placeholder:text-slate-500" />
      </div>
      <div className="mt-3 space-y-3">
        {deletableUsers.length ? deletableUsers.map((player) => (
          <div key={player.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-700 px-3 py-3">
            <div className="min-w-0">
              <div className="truncate font-semibold text-white">{player.name || "未命名用户"}</div>
              <div className="truncate text-xs text-slate-400">{player.email || "未填写邮箱"}</div>
            </div>
            <button
              type="button"
              className="rounded-full border border-rose-400/30 px-3 py-1 text-xs font-semibold text-rose-200 disabled:opacity-50"
              disabled={deletingUserId === player.id}
              onClick={() => handleDelete(player)}
            >
              删除用户
            </button>
          </div>
        )) : <div className="rounded-2xl bg-slate-900 px-4 py-5 text-center text-sm text-slate-500">没有匹配的可删除用户。</div>}
      </div>
    </Card>
  );
}

function SponsorPredictionResultsCard({ matches, sponsorPredictionResults, onSetSponsorPredictionResult }) {
  const event = SPONSOR_PREDICTION_EVENT_BY_ID[FIRST_GOAL_TIME_EVENT_ID];
  const resolvedMatch = useMemo(() => getFirstGoalResolvedMatch(matches), [matches]);
  const existing = sponsorPredictionResults[event.id] || {};
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");
  const [sponsorName, setSponsorName] = useState(event.sponsorName);

  React.useEffect(() => {
    const next = splitSponsorPredictionClock(existing.actualTotalSeconds);
    setMinutes(existing.actualTotalSeconds === undefined ? "" : next.minutes);
    setSeconds(existing.actualTotalSeconds === undefined ? "" : next.seconds);
    setSponsorName(existing.sponsorName || event.sponsorName);
  }, [existing.actualTotalSeconds, existing.sponsorName, event.sponsorName]);

  const minuteValue = Number(minutes);
  const secondValue = Number(seconds);
  const canSave = Boolean(
    resolvedMatch
    && String(minutes).trim() !== ""
    && String(seconds).trim() !== ""
    && Number.isInteger(minuteValue)
    && minuteValue >= 0
    && Number.isInteger(secondValue)
    && secondValue >= 0
    && secondValue <= 59,
  );

  return (
    <Card>
      <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <h3 className="text-xl font-black">足球研究所所长结算</h3>
          <p className="text-sm text-slate-400">系统会自动识别哪一场产生了世界杯首球；管理员只需录入官方比赛时间。</p>
        </div>
        <Pill>管理员结算</Pill>
      </div>
      <div className="mb-4 rounded-[20px] border px-4 py-3" style={{ borderColor: "color-mix(in srgb, var(--md-sys-color-outline-variant) 56%, transparent)", background: "color-mix(in srgb, var(--md-sys-color-surface-container-low) 84%, transparent)" }}>
        <div className="text-sm font-black">自动识别到的首球比赛</div>
        <div className="mt-1 text-sm text-slate-300">{resolvedMatch ? `#${resolvedMatch.no} · ${teamName(resolvedMatch.home)} vs ${teamName(resolvedMatch.away)}` : "尚未出现已结算且有进球的比赛"}</div>
        {existing.actualTotalSeconds !== undefined ? <div className="mt-2 text-xs text-emerald-200">当前已录入官方首球时间：{formatSponsorPredictionClock(existing.actualTotalSeconds)}</div> : null}
      </div>
      <div className="grid gap-3 md:grid-cols-[1.3fr_1fr_1fr]">
        <input value={sponsorName} onChange={(event) => setSponsorName(event.target.value)} placeholder="冠名人名称" className="md3-field text-sm" />
        <input value={minutes} onChange={(event) => setMinutes(event.target.value.replace(/[^\d]/g, ""))} placeholder="首球分钟" className="md3-field text-sm" />
        <input value={seconds} onChange={(event) => setSeconds(event.target.value.replace(/[^\d]/g, ""))} placeholder="首球秒数" className="md3-field text-sm" />
      </div>
      <button disabled={!canSave} onClick={() => onSetSponsorPredictionResult?.({ eventId: event.id, resolvedMatchId: resolvedMatch.id, actualTotalSeconds: (minuteValue * 60) + secondValue, sponsorName: sponsorName.trim() || event.sponsorName })} className="mt-4 w-full rounded-2xl bg-emerald-700 px-4 py-3 text-sm font-black text-emerald-50 transition hover:bg-emerald-600 disabled:opacity-50 md:w-auto">
        结算冠名称号
      </button>
    </Card>
  );
}

function AsiaRound2StatusCard({ matches, sponsorPredictionResults }) {
  const stats = useMemo(() => calculateAsiaRound2Stats(matches), [matches]);
  const autoResults = useMemo(() => getAutomaticSponsorPredictionResults({ matches, sponsorPredictionResults }), [matches, sponsorPredictionResults]);

  return (
    <Card>
      <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <h3 className="text-xl font-black">亚洲之巅 · 自动统计状态</h3>
          <p className="text-sm text-slate-400">该玩法答案由系统自动计算，无需手动录入。</p>
        </div>
        <Pill className="bg-emerald-500/15 text-emerald-200">自动计算中</Pill>
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        <div className="md3-panel-inset px-4 py-3"><div className="text-xs text-slate-500">当前总积分</div><div className="mt-1 text-2xl font-black">{autoResults[ASIA_ROUND2_POINTS_EVENT_ID]?.actualValue ?? 0}</div></div>
        <div className="md3-panel-inset px-4 py-3"><div className="text-xs text-slate-500">当前总进球</div><div className="mt-1 text-2xl font-black">{autoResults[ASIA_ROUND2_GOALS_EVENT_ID]?.actualValue ?? 0}</div></div>
        <div className="md3-panel-inset px-4 py-3"><div className="text-xs text-slate-500">已完成球队数</div><div className="mt-1 text-2xl font-black">{stats.completedTeams} / {stats.totalTeams}</div></div>
        <div className="md3-panel-inset px-4 py-3"><div className="text-xs text-slate-500">统计状态</div><div className="mt-1 text-lg font-black">{stats.isComplete ? "已全部完成" : "自动计算中"}</div></div>
      </div>
      <div className="mt-4 rounded-[20px] border px-4 py-3" style={{ borderColor: "color-mix(in srgb, var(--md-sys-color-outline-variant) 56%, transparent)", background: "color-mix(in srgb, var(--md-sys-color-surface-container-low) 84%, transparent)" }}>
        <div className="text-sm font-black">已纳入统计的球队</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {stats.includedMatches.length ? stats.includedMatches.map((match) => <Pill key={match.id}>{match.teamSide === "home" ? match.home : match.away}</Pill>) : <span className="text-xs text-slate-500">还没有亚洲球队完成第2场小组赛</span>}
        </div>
        <p className="mt-3 text-xs text-slate-500">截止时间：北京时间 2026/06/19 00:00。答案会随亚洲球队第2场小组赛结算实时刷新。</p>
      </div>
    </Card>
  );
}

function AdminPanel({ matches, players, currentPlayerId, predictions, updateMatchResult, clearMatchResult, toggleLock, funResults, onSetFunResults, sponsorPredictionResults, onSetSponsorPredictionResult, onSetUserCamp, onSetUserAdmin, onDeleteUser, openDialog }) {
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
      <AsiaRound2StatusCard matches={matches} sponsorPredictionResults={sponsorPredictionResults} />
      <SponsorPredictionResultsCard matches={matches} sponsorPredictionResults={sponsorPredictionResults} onSetSponsorPredictionResult={onSetSponsorPredictionResult} />
      <FunResultsCard funResults={funResults} onSetFunResults={onSetFunResults} />
      <AdminAccountManagementCard players={players} onSetUserAdmin={onSetUserAdmin} />
      <AdminDeleteUserCard players={players} currentPlayerId={currentPlayerId} onDeleteUser={onDeleteUser} />
      <Card>
        <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <h2 className="text-2xl font-black">比赛管理</h2>
            <p className="mt-1 text-sm text-slate-400">官方 API 负责赛程、实时比分与常规时间自动结算；管理员仍可手动维护锁定状态和比分，但在比赛活跃同步窗口内，官方实时源会覆盖人工结果。</p>
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
            <AdminMatchRow key={match.id} match={match} players={players} predictions={predictions} onResult={updateMatchResult} onClear={clearMatchResult} onToggleLock={toggleLock} openDialog={openDialog} />
          )) : <div className="rounded-2xl border border-slate-700 bg-slate-950 p-6 text-center text-sm text-slate-500">没有符合条件的比赛</div>}
        </div>
      </Card>
    </section>
  );
}

function AdminMatchRow({ match, players, predictions, onResult, onClear, onToggleLock, openDialog }) {
  const [homeScore, setHomeScore] = useState(match.homeScore ?? "");
  const [awayScore, setAwayScore] = useState(match.awayScore ?? "");
  const [expanded, setExpanded] = useState(false);
  React.useEffect(() => { setHomeScore(match.homeScore ?? ""); setAwayScore(match.awayScore ?? ""); }, [match.homeScore, match.awayScore]);
  const canToggle = match.status !== "settled";
  const stage = STAGES[match.stage] || STAGES.GROUP;
  const canSave = Number.isFinite(Number(homeScore)) && Number.isFinite(Number(awayScore)) && homeScore !== "" && awayScore !== "";
  return (
    <div className="md3-panel p-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap gap-2">
            <Pill>#{match.no}</Pill>
            <Pill className="bg-emerald-500/15 text-emerald-200">{stage.label} x{stage.multiplier}</Pill>
            <MatchStatus match={match} />
          </div>
          <div className="flex flex-wrap items-center gap-2 font-black"><TeamName name={match.home} logo={match.homeLogo} /><span className="text-slate-500">vs</span><TeamName name={match.away} logo={match.awayLogo} /></div>
          <div className="mt-1 text-xs text-slate-500">{formatDateTime(match.kickoff)} · {match.city}</div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input type="number" min="0" value={homeScore} onChange={(event) => setHomeScore(event.target.value)} className="md3-field w-16 px-3 py-2 text-center font-black" />
          <span className="text-slate-500">:</span>
          <input type="number" min="0" value={awayScore} onChange={(event) => setAwayScore(event.target.value)} className="md3-field w-16 px-3 py-2 text-center font-black" />
          <M3Button disabled={!canSave} onClick={() => onResult(match.id, Number(homeScore), Number(awayScore))} className="px-3 py-2 text-sm font-black">结算</M3Button>
          <DarkButton disabled={!canToggle} onClick={() => openDialog?.({ title: match.status === "open" ? "锁定比赛？" : "重新开放比赛？", description: `${teamName(match.home)} vs ${teamName(match.away)} 将${match.status === "open" ? "被锁定，无法继续提交竞猜。" : "重新允许提交竞猜。"} `, confirmLabel: match.status === "open" ? "确认锁定" : "确认开放", onConfirm: () => onToggleLock(match.id) })} className="px-3 py-2 text-sm font-black">{match.status === "open" ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}</DarkButton>
          <DarkButton disabled={!isSettledMatch(match)} onClick={() => openDialog?.({ title: "清除比赛结果？", description: "这会移除当前比赛的已结算比分，并影响相关排行榜与成就展示。", confirmLabel: "确认清除", tone: "error", onConfirm: () => onClear(match.id) })} className="px-3 py-2 text-sm font-black">清除</DarkButton>
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
  const sections = [
    {
      id: "base",
      icon: ShieldCheck,
      title: "基础竞猜规则",
      description: "只计算 90 分钟常规时间比分，包含伤停补时，不包含加时赛和点球大战。",
      content: (
        <div className="grid gap-3 md:grid-cols-2">
          {[
            ["开赛前可反复修改", "比赛开球前，你可以多次更新预测。"],
            ["开赛后自动锁定", "到点后不再允许修改，避免赛中补票。"],
            ["赛果仅认常规时间", "加时赛和点球大战不进入积分结算。"],
            ["朋友预测赛后公开", "未开赛前隐藏他人预测，开赛后统一公开。"],
          ].map(([label, value]) => (
            <div key={label} className="md3-outline-card md3-card px-4 py-4">
              <div className="font-black">{label}</div>
              <div className="mt-1 text-sm md3-subtle">{value}</div>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "points",
      icon: Trophy,
      title: "积分规则",
      description: "主榜所有排名都基于以下基础得分，再乘以赛程阶段倍率。",
      content: (
        <div className="space-y-3">
          {[["完全猜中比分", "4分"], ["猜中胜平负，并且猜中净胜球", "2分"], ["猜中胜平负，但比分不完全正确", "1分"], ["完全猜错", "0分"]].map(([label, value]) => (
            <div key={label} className="md3-outline-card md3-card flex items-center justify-between px-4 py-4">
              <span>{label}</span>
              <span className="text-2xl font-black">{value}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "knockout",
      icon: Target,
      title: "淘汰赛倍率",
      description: "越到后期的关键比赛，命中带来的积分收益越高。",
      content: (
        <div className="grid gap-3 md:grid-cols-2">
          {Object.entries(STAGES).map(([key, value]) => (
            <div key={key} className="md3-outline-card md3-card flex items-center justify-between px-4 py-4">
              <span>{value.label}</span>
              <span className="text-2xl font-black">x{value.multiplier}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "achievement",
      icon: Crown,
      title: "成就规则",
      description: "成就不会改变主榜积分，但会记录参与度、精准度和特殊表现。",
      content: (
        <div className="md3-outline-card md3-card px-4 py-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <div className="font-black">公开成就</div>
              <div className="mt-1 text-sm md3-subtle">会显示具体条件与进度，例如参与场次、命中胜负、命中比分等。</div>
            </div>
            <div>
              <div className="font-black">隐藏成就</div>
              <div className="mt-1 text-sm md3-subtle">未解锁前只显示占位信息，解锁后展示真实名称、稀有度与时间。</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "deadline",
      icon: Bell,
      title: "截止时间说明",
      description: "所有截止逻辑都以比赛开球时间和系统锁定状态为准。",
      content: (
        <div>
          <div className="space-y-3 md:hidden">
            {Object.entries(STAGES).map(([key, value]) => (
              <div key={`${key}-mobile`} className="md3-panel-inset p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-black">{value.label}</div>
                  <Pill>x{value.multiplier}</Pill>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div className="md3-panel px-3 py-2">完全比分：<span className="font-black">{4 * value.multiplier}分</span></div>
                  <div className="md3-panel px-3 py-2">净胜+胜负：<span className="font-black">{2 * value.multiplier}分</span></div>
                  <div className="md3-panel px-3 py-2">只中胜负：<span className="font-black">{1 * value.multiplier}分</span></div>
                  <div className="md3-panel px-3 py-2">猜错：<span className="font-black">0分</span></div>
                </div>
              </div>
            ))}
          </div>
          <div className="hidden md:block overflow-x-auto rounded-[24px] border md3-divider">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead style={{ background: "color-mix(in srgb, var(--md-sys-color-surface-container-highest) 88%, transparent)" }}>
                <tr>
                  <th className="px-4 py-3">阶段</th>
                  <th className="px-4 py-3">倍率</th>
                  <th className="px-4 py-3">完全比分</th>
                  <th className="px-4 py-3">胜平负+净胜球</th>
                  <th className="px-4 py-3">只中胜平负</th>
                  <th className="px-4 py-3">猜错</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(STAGES).map(([key, value]) => (
                  <tr key={key} className="border-t md3-divider">
                    <td className="px-4 py-4 font-black">{value.label}</td>
                    <td className="px-4 py-4">x{value.multiplier}</td>
                    <td className="px-4 py-4">{4 * value.multiplier}分</td>
                    <td className="px-4 py-4">{2 * value.multiplier}分</td>
                    <td className="px-4 py-4">{1 * value.multiplier}分</td>
                    <td className="px-4 py-4">0分</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section className="space-y-5">
      <Card className="md3-filled-card">
        <h2 className="md3-section-title text-[1.9rem]">规则说明</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 md3-subtle">把规则拆成更容易阅读的模块，避免长段文本堆叠。所有业务规则保持不变，只优化呈现方式与理解效率。</p>
      </Card>
      <div className="space-y-4">
        {sections.map((section, index) => <RuleAccordion key={section.id} defaultOpen={index === 0} {...section} />)}
      </div>
    </section>
  );
}

function RuleAccordion({ icon: Icon, title, description, content, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card>
      <button type="button" onClick={() => setOpen((value) => !value)} className="flex w-full items-start justify-between gap-4 text-left">
        <div className="flex gap-3">
          <div className="mt-1 flex h-11 w-11 items-center justify-center rounded-[18px]" style={{ background: "color-mix(in srgb, var(--md-sys-color-primary-container) 82%, transparent)", color: "var(--md-sys-color-on-primary-container)" }}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-black">{title}</div>
            <p className="mt-1 text-sm md3-subtle">{description}</p>
          </div>
        </div>
        {open ? <ChevronUp className="h-5 w-5 md3-subtle" /> : <ChevronDown className="h-5 w-5 md3-subtle" />}
      </button>
      {open ? <div className="mt-5">{content}</div> : null}
    </Card>
  );
}

function AllHistoryPanel({ player, predictions, matches, onBack }) {
  const history = predictions
    .filter((prediction) => prediction.playerId === player.id)
    .map((prediction) => {
      const match = matches.find((item) => item.id === prediction.matchId);
      return {
        prediction,
        match,
        points: calculatePoints(prediction, match),
        summary: buildScheduleMatchSummary({
          match,
          currentPrediction: prediction,
          predictions,
        }),
      };
    })
    .filter((item) => item.match && isSettledMatch(item.match))
    .sort((a, b) => new Date(b.match.kickoff).getTime() - new Date(a.match.kickoff).getTime());

  return (
    <section className="mt-6 space-y-5">
      <Card>
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="text-3xl font-black">{player.name} 的所有历史竞猜记录</h2>
          </div>
          <DarkButton onClick={onBack} className="px-4 py-3 text-sm font-black">返回个人主页</DarkButton>
        </div>
      </Card>
      <Card>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-black">全部历史竞猜记录</h3>
          </div>
          <Pill className="bg-slate-800 text-slate-300">{history.length} 条</Pill>
        </div>
        <PredictionHistoryList items={history} />
      </Card>
    </section>
  );
}
