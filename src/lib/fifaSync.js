export const FIFA_WORLD_CUP_2026_SEASON_ID = "285023";
export const FIFA_MATCHES_URL = "https://api.fifa.com/api/v3/calendar/matches";
export const FIFA_REQUEST_HEADERS = {
  Accept: "application/json",
  "User-Agent": "Mozilla/5.0",
};

const FIFA_TO_LOCAL_TEAM_NAMES = {
  Algeria: "阿尔及利亚",
  Argentina: "阿根廷",
  Australia: "澳大利亚",
  Austria: "奥地利",
  Belgium: "比利时",
  "Bosnia and Herzegovina": "波黑",
  Brazil: "巴西",
  Canada: "加拿大",
  "Cape Verde": "佛得角",
  "Cabo Verde": "佛得角",
  Colombia: "哥伦比亚",
  Croatia: "克罗地亚",
  Curacao: "库拉索",
  "Curaçao": "库拉索",
  Czechia: "捷克",
  "Czech Republic": "捷克",
  "DR Congo": "刚果民主共和国",
  "Congo DR": "刚果民主共和国",
  "Côte d'Ivoire": "科特迪瓦",
  Ecuador: "厄瓜多尔",
  Egypt: "埃及",
  England: "英格兰",
  France: "法国",
  Germany: "德国",
  Ghana: "加纳",
  Haiti: "海地",
  Iran: "伊朗",
  "IR Iran": "伊朗",
  Iraq: "伊拉克",
  "Ivory Coast": "科特迪瓦",
  Japan: "日本",
  Jordan: "约旦",
  "Korea Republic": "韩国",
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
  "Türkiye": "土耳其",
  Uruguay: "乌拉圭",
  USA: "美国",
  Uzbekistan: "乌兹别克斯坦",
};

const LOCAL_PLACEHOLDER_PATTERNS = [
  "半决赛",
  "胜者",
  "负者",
  "第",
  "小组",
  "最佳",
];

function pickTeamName(team) {
  if (!team || typeof team !== "object") return "TBD";
  const localized = Array.isArray(team.TeamName) ? team.TeamName.find((entry) => entry?.Locale === "en-GB") || team.TeamName[0] : null;
  return localized?.Description || team.ShortClubName || team.Abbreviation || "TBD";
}

function toNumberOrNull(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value))) return Number(value);
  return null;
}

function isPlaceholderTeam(name) {
  const text = String(name || "");
  return LOCAL_PLACEHOLDER_PATTERNS.some((pattern) => text.includes(pattern));
}

function normalizeKickoff(value) {
  return new Date(value).toISOString();
}

export function translateFifaTeamName(name) {
  return FIFA_TO_LOCAL_TEAM_NAMES[name] || name || "待定";
}

export function inferFifaPhase(matchStatus, matchTime = "") {
  const status = Number(matchStatus);
  const clock = String(matchTime || "").trim().toUpperCase();

  if (status === 0) return "finished";
  if (status === 3) {
    if (clock === "HT") return "half_time";
    return /^([4-9]\d|\d{3,})/.test(clock) ? "second_half" : "first_half";
  }
  if (status === 12) return "lineups";
  if (status === 4) return "abandoned";
  if (status === 7) return "postponed";
  if (status === 8) return "cancelled";
  if (clock === "HT") return "half_time";
  return "pre_match";
}

export function shouldSettleFifaResult(match) {
  return match.phase === "finished" && match.homeScore !== null && match.awayScore !== null;
}

export function normalizeFifaMatch(match) {
  const homeName = pickTeamName(match.Home);
  const awayName = pickTeamName(match.Away);

  return {
    providerMatchId: String(match.IdMatch),
    matchNumber: toNumberOrNull(match.MatchNumber),
    kickoff: normalizeKickoff(match.Date),
    homeName,
    awayName,
    homeNameZh: translateFifaTeamName(homeName),
    awayNameZh: translateFifaTeamName(awayName),
    homeTeamId: match.Home?.IdTeam ? String(match.Home.IdTeam) : null,
    awayTeamId: match.Away?.IdTeam ? String(match.Away.IdTeam) : null,
    homeScore: toNumberOrNull(match.HomeTeamScore),
    awayScore: toNumberOrNull(match.AwayTeamScore),
    matchStatus: toNumberOrNull(match.MatchStatus),
    matchTime: String(match.MatchTime || ""),
    resultType: toNumberOrNull(match.ResultType),
    phase: inferFifaPhase(match.MatchStatus, match.MatchTime),
    raw: match,
  };
}

export function buildLocalScheduleFromRows(rows) {
  return rows.map(([no, group, home, away, kickoff, stadium, city]) => ({
    id: String(no),
    no: Number(no),
    group,
    home,
    away,
    kickoff: normalizeKickoff(kickoff),
    stadium,
    city,
  }));
}

export function extractScheduleRowsFromAppSource(source) {
  const match = source.match(/const scheduleRows = (\[[\s\S]*?\]);\s*const FALLBACK_COMPLETE_WORLD_CUP_SCHEDULE/u);
  if (!match) {
    throw new Error("Could not locate scheduleRows in App source");
  }

  return Function(`"use strict"; return (${match[1]});`)();
}

export function buildFifaMappingRows(localMatches, fifaMatches, nowIso = new Date().toISOString()) {
  const fifaByMatchNumber = new Map(
    fifaMatches
      .filter((match) => Number.isFinite(match.matchNumber))
      .map((match) => [match.matchNumber, match]),
  );

  return localMatches.map((localMatch) => {
    const fifaMatch = fifaByMatchNumber.get(localMatch.no);
    if (!fifaMatch) {
      return {
        match_id: localMatch.id,
        match_no: localMatch.no,
        provider: "fifa",
        provider_match_id: null,
        provider_home_team_id: null,
        provider_away_team_id: null,
        mapping_status: "needs_review",
        verification_notes: "No FIFA match found for local match number",
        last_verified_at: nowIso,
        updated_at: nowIso,
      };
    }

    const kickoffMatches = localMatch.kickoff === fifaMatch.kickoff;
    const localHasPlaceholder = isPlaceholderTeam(localMatch.home) || isPlaceholderTeam(localMatch.away);
    const teamNamesMatch = localHasPlaceholder
      ? true
      : localMatch.home === fifaMatch.homeNameZh && localMatch.away === fifaMatch.awayNameZh;

    const mappingStatus = kickoffMatches && teamNamesMatch ? "matched" : "needs_review";
    const notes = [];
    if (!kickoffMatches) notes.push(`Kickoff mismatch: local=${localMatch.kickoff} fifa=${fifaMatch.kickoff}`);
    if (!teamNamesMatch && !localHasPlaceholder) notes.push(`Team mismatch: local=${localMatch.home} vs ${localMatch.away}; fifa=${fifaMatch.homeNameZh} vs ${fifaMatch.awayNameZh}`);
    if (localHasPlaceholder) notes.push("Local knockout placeholders skipped team-name validation");

    return {
      match_id: localMatch.id,
      match_no: localMatch.no,
      provider: "fifa",
      provider_match_id: fifaMatch.providerMatchId,
      provider_home_team_id: fifaMatch.homeTeamId,
      provider_away_team_id: fifaMatch.awayTeamId,
      mapping_status: mappingStatus,
      verification_notes: notes.join("; ") || "Validated by match number, kickoff, and team names",
      last_verified_at: nowIso,
      updated_at: nowIso,
    };
  });
}
