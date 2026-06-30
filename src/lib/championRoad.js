import { CHAMPION_ROAD_BEST_THIRD_MAPPING } from "./championRoadBestThirdMapping";

const MATCH_ROWS = [
  [73, "R32", "32强赛", "2026-06-29T03:00:00+08:00", "A组第二", "B组第二"],
  [74, "R32", "32强赛", "2026-06-30T04:30:00+08:00", "E组第一", "最佳小组第三（A/B/C/D/F）"],
  [75, "R32", "32强赛", "2026-06-30T09:00:00+08:00", "F组第一", "C组第二"],
  [76, "R32", "32强赛", "2026-06-30T01:00:00+08:00", "C组第一", "F组第二"],
  [77, "R32", "32强赛", "2026-07-01T05:00:00+08:00", "I组第一", "最佳小组第三（C/D/F/G/H）"],
  [78, "R32", "32强赛", "2026-07-01T01:00:00+08:00", "E组第二", "I组第二"],
  [79, "R32", "32强赛", "2026-07-01T09:00:00+08:00", "A组第一", "最佳小组第三（C/E/F/H/I）"],
  [80, "R32", "32强赛", "2026-07-02T00:00:00+08:00", "L组第一", "最佳小组第三（E/H/I/J/K）"],
  [81, "R32", "32强赛", "2026-07-02T08:00:00+08:00", "D组第一", "最佳小组第三（B/E/F/I/J）"],
  [82, "R32", "32强赛", "2026-07-02T04:00:00+08:00", "G组第一", "最佳小组第三（A/E/H/I/J）"],
  [83, "R32", "32强赛", "2026-07-03T07:00:00+08:00", "K组第二", "L组第二"],
  [84, "R32", "32强赛", "2026-07-03T03:00:00+08:00", "H组第一", "J组第二"],
  [85, "R32", "32强赛", "2026-07-03T11:00:00+08:00", "B组第一", "最佳小组第三（E/F/G/I/J）"],
  [86, "R32", "32强赛", "2026-07-04T06:00:00+08:00", "J组第一", "H组第二"],
  [87, "R32", "32强赛", "2026-07-04T09:30:00+08:00", "K组第一", "最佳小组第三（D/E/I/J/L）"],
  [88, "R32", "32强赛", "2026-07-04T02:00:00+08:00", "D组第二", "G组第二"],
  [89, "R16", "16强赛", "2026-07-05T05:00:00+08:00", "第74场胜者", "第77场胜者"],
  [90, "R16", "16强赛", "2026-07-05T01:00:00+08:00", "第73场胜者", "第75场胜者"],
  [91, "R16", "16强赛", "2026-07-06T04:00:00+08:00", "第76场胜者", "第78场胜者"],
  [92, "R16", "16强赛", "2026-07-06T08:00:00+08:00", "第79场胜者", "第80场胜者"],
  [93, "R16", "16强赛", "2026-07-07T03:00:00+08:00", "第83场胜者", "第84场胜者"],
  [94, "R16", "16强赛", "2026-07-07T08:00:00+08:00", "第81场胜者", "第82场胜者"],
  [95, "R16", "16强赛", "2026-07-08T00:00:00+08:00", "第86场胜者", "第88场胜者"],
  [96, "R16", "16强赛", "2026-07-08T04:00:00+08:00", "第85场胜者", "第87场胜者"],
  [97, "QF", "8强赛", "2026-07-10T04:00:00+08:00", "第89场胜者", "第90场胜者"],
  [98, "QF", "8强赛", "2026-07-11T03:00:00+08:00", "第93场胜者", "第94场胜者"],
  [99, "QF", "8强赛", "2026-07-12T05:00:00+08:00", "第91场胜者", "第92场胜者"],
  [100, "QF", "8强赛", "2026-07-12T09:00:00+08:00", "第95场胜者", "第96场胜者"],
  [101, "SF", "4强赛", "2026-07-15T03:00:00+08:00", "第97场胜者", "第98场胜者"],
  [102, "SF", "4强赛", "2026-07-16T03:00:00+08:00", "第99场胜者", "第100场胜者"],
  [103, "THIRD", "三四名决赛", "2026-07-19T05:00:00+08:00", "第101场负者", "第102场负者"],
  [104, "FINAL", "决赛", "2026-07-20T03:00:00+08:00", "第101场胜者", "第102场胜者"],
];

export const CHAMPION_ROAD_MATCHES = MATCH_ROWS.map(([matchNo, round, roundLabel, kickoff, homeLabel, awayLabel]) => ({
  matchNo,
  round,
  roundLabel,
  kickoff,
  homeLabel,
  awayLabel,
  homeSourceId: slotLabelToSourceId(homeLabel),
  awaySourceId: slotLabelToSourceId(awayLabel),
}));

export const CHAMPION_ROAD_SCORING = {
  round16: 1,
  quarterfinals: 2,
  semifinals: 4,
  champion: 8,
  runnerUp: 4,
  thirdPlace: 4,
  fourthPlace: 2,
};

export const CHAMPION_ROAD_DISPLAY_LANES = {
  left32: [74, 77, 73, 75, 76, 78, 79, 80],
  left16: [89, 90, 91, 92],
  left8: [97, 99],
  left4: [101],
  final: [104],
  thirdPlace: [103],
  right4: [102],
  right8: [98, 100],
  right16: [93, 94, 95, 96],
  right32: [83, 84, 81, 82, 86, 88, 85, 87],
};

const CHAMPION_ROAD_KNOCKOUT_GROUPS = new Set(["32强赛", "16强赛", "四分之一决赛", "半决赛", "三四名决赛", "决赛"]);
const CHAMPION_ROAD_KNOCKOUT_STAGES = new Set(["R32", "R16", "QF", "SF", "THIRD", "FINAL"]);

const CHAMPION_ROAD_DESKTOP_BASE_WIDTH = 1560;
const CHAMPION_ROAD_DESKTOP_BASE_HEIGHT = 930;
const CHAMPION_ROAD_DESKTOP_MIN_SCALE = 0.6;
const CHAMPION_ROAD_GROUP_LETTERS = "ABCDEFGHIJKL".split("");
const CHAMPION_ROAD_BEST_THIRD_SLOT_ORDER = ["1A", "1B", "1D", "1E", "1G", "1I", "1K", "1L"];
const CHAMPION_ROAD_BEST_THIRD_SLOT_TO_COLUMN = {
  "C/E/F/H/I": "1A",
  "E/F/G/I/J": "1B",
  "B/E/F/I/J": "1D",
  "A/B/C/D/F": "1E",
  "A/E/H/I/J": "1G",
  "C/D/F/G/H": "1I",
  "D/E/I/J/L": "1K",
  "E/H/I/J/K": "1L",
};

export function getChampionRoadDesktopScale({
  availableWidth = CHAMPION_ROAD_DESKTOP_BASE_WIDTH,
  availableHeight = CHAMPION_ROAD_DESKTOP_BASE_HEIGHT,
  contentWidth = CHAMPION_ROAD_DESKTOP_BASE_WIDTH,
  contentHeight = CHAMPION_ROAD_DESKTOP_BASE_HEIGHT,
} = {}) {
  const width = Number(availableWidth);
  const height = Number(availableHeight);
  const naturalWidth = Number(contentWidth);
  const naturalHeight = Number(contentHeight);
  if ((!Number.isFinite(width) || width <= 0) && (!Number.isFinite(height) || height <= 0) && (!Number.isFinite(naturalWidth) || naturalWidth <= 0) && (!Number.isFinite(naturalHeight) || naturalHeight <= 0)) return 1;
  const widthBaseline = !Number.isFinite(naturalWidth) || naturalWidth <= 0 ? CHAMPION_ROAD_DESKTOP_BASE_WIDTH : naturalWidth;
  const widthScale = !Number.isFinite(width) || width <= 0 ? 1 : width / widthBaseline;
  const heightBaseline = !Number.isFinite(naturalHeight) || naturalHeight <= 0 ? CHAMPION_ROAD_DESKTOP_BASE_HEIGHT : naturalHeight;
  const heightScale = !Number.isFinite(height) || height <= 0 ? 1 : height / heightBaseline;
  return Math.max(CHAMPION_ROAD_DESKTOP_MIN_SCALE, Math.min(1, widthScale, heightScale));
}

const MATCH_BY_NO = Object.fromEntries(CHAMPION_ROAD_MATCHES.map((match) => [match.matchNo, match]));
const MATCH_SEQUENCE = CHAMPION_ROAD_MATCHES.map((match) => match.matchNo);

function sortStandingsTable(table = []) {
  return [...table].sort((a, b) =>
    b.points - a.points
    || b.goalDifference - a.goalDifference
    || b.goalsFor - a.goalsFor
    || a.team.localeCompare(b.team, "zh-CN")
  );
}

function createEmptyTeamStanding(group, team) {
  return { group, team, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0 };
}

export function buildChampionRoadStandings(schedule = [], results = {}) {
  const groupMatches = schedule.filter((match) => /^[A-L]组$/.test(String(match.group || "")));
  const tableMap = new Map();

  groupMatches.forEach((match) => {
    [match.home, match.away].forEach((team) => {
      const key = `${match.group}-${team}`;
      if (!tableMap.has(key)) tableMap.set(key, createEmptyTeamStanding(match.group, team));
    });
  });

  groupMatches.forEach((match) => {
    const result = results[match.no];
    if (!isSettledResult(result)) return;

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

export function getChampionRoadLockAt(matches = CHAMPION_ROAD_MATCHES) {
  return [...matches].sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime())[0]?.kickoff || null;
}

export function isChampionRoadLocked(matches = CHAMPION_ROAD_MATCHES, now = new Date()) {
  const lockAt = getChampionRoadLockAt(matches);
  if (!lockAt) return false;
  return new Date(now).getTime() >= new Date(lockAt).getTime();
}

export function resolveChampionRoadSlot(label, { standings = {}, results = {} } = {}) {
  const normalizedLabel = String(label || "").trim();
  const sourceId = slotLabelToSourceId(normalizedLabel);
  const placeholderName = normalizedLabel.replace("\u6700\u4F73\u5C0F\u7EC4\u7B2C\u4E09", "\u6700\u4F73\u7B2C\u4E09");

  const groupMatch = normalizedLabel.match(/^([A-L])\u7EC4\u7B2C(\u4E00|\u4E8C|\u4E09|\u7B2C\u4E00|\u7B2C\u4E8C|\u7B2C\u4E09)$/);
  if (groupMatch) {
    const groupKey = findStandingsGroupKey(standings, groupMatch[1]);
    const rank = parseGroupRank(groupMatch[2]);
    const table = sortStandingsTable(standings[groupKey] || []);
    const resolved = isGroupStandingsLocked(table) && table[rank - 1];
    return {
      sourceId,
      sourceType: "group_rank",
      resolved: Boolean(resolved),
      teamName: resolved?.team || "",
      placeholderName,
    };
  }

  if (normalizedLabel.startsWith("\u6700\u4F73\u5C0F\u7EC4\u7B2C\u4E09")) {
    const resolvedBestThirdTeam = resolveBestThirdTeam(sourceId, standings);
    return {
      sourceId,
      sourceType: "best_third",
      resolved: Boolean(resolvedBestThirdTeam),
      teamName: resolvedBestThirdTeam?.team || "",
      placeholderName,
    };
  }

  const winnerMatch = normalizedLabel.match(/^\u7B2C(\d+)\u573A\u80DC\u8005$/);
  if (winnerMatch) {
    const matchNo = Number(winnerMatch[1]);
    const target = resolveActualTarget(matchNo, results);
    const teamName = resolveMatchOutcomeName(matchNo, "winner", standings, results) || resolveTeamNameBySourceId(target, standings, results);
    return {
      sourceId,
      sourceType: "match_winner",
      resolved: Boolean(target),
      teamName: teamName || "",
      placeholderName,
    };
  }

  const loserMatch = normalizedLabel.match(/^\u7B2C(\d+)\u573A\u8D1F\u8005$/);
  if (loserMatch) {
    const matchNo = Number(loserMatch[1]);
    const target = resolveActualLoserTarget(matchNo, results);
    const teamName = resolveMatchOutcomeName(matchNo, "loser", standings, results) || resolveTeamNameBySourceId(target, standings, results);
    return {
      sourceId,
      sourceType: "match_loser",
      resolved: Boolean(target),
      teamName: teamName || "",
      placeholderName,
    };
  }

  return {
    sourceId,
    sourceType: "unknown",
    resolved: false,
    teamName: "",
    placeholderName,
  };
}

export function resolveChampionRoadDisplayLabel(label, { standings = {}, results = {} } = {}) {
  const normalizedLabel = String(label || "").trim();
  if (!normalizedLabel) {
    return {
      sourceId: "",
      sourceType: "empty",
      resolved: false,
      teamName: "",
      placeholderName: "席位待定",
    };
  }

  const slot = resolveChampionRoadSlot(normalizedLabel, { standings, results });
  if (slot.resolved || slot.sourceType !== "unknown") return slot;

  return {
    sourceId: normalizedLabel,
    sourceType: "team",
    resolved: true,
    teamName: normalizedLabel,
    placeholderName: normalizedLabel,
  };
}

export function resolveChampionRoadScheduleMatch(match, { standings = {}, results = {} } = {}) {
  const homeLabel = String(match?.home ?? match?.homeLabel ?? "").trim();
  const awayLabel = String(match?.away ?? match?.awayLabel ?? "").trim();

  const homeDisplay = isChampionRoadKnockoutMatch(match)
    ? resolveChampionRoadDisplayLabel(homeLabel, { standings, results })
    : createResolvedTeamDisplay(homeLabel);
  const awayDisplay = isChampionRoadKnockoutMatch(match)
    ? resolveChampionRoadDisplayLabel(awayLabel, { standings, results })
    : createResolvedTeamDisplay(awayLabel);

  const resolvedHomeName = homeDisplay.resolved && homeDisplay.teamName ? homeDisplay.teamName : (homeDisplay.placeholderName || homeLabel);
  const resolvedAwayName = awayDisplay.resolved && awayDisplay.teamName ? awayDisplay.teamName : (awayDisplay.placeholderName || awayLabel);

  return {
    resolvedHomeName,
    resolvedAwayName,
    homeResolved: Boolean(homeDisplay.resolved && homeDisplay.teamName),
    awayResolved: Boolean(awayDisplay.resolved && awayDisplay.teamName),
    homeDisplay,
    awayDisplay,
    searchAliases: Array.from(new Set([
      homeLabel,
      awayLabel,
      homeDisplay.teamName,
      awayDisplay.teamName,
      homeDisplay.placeholderName,
      awayDisplay.placeholderName,
    ].filter(Boolean))),
  };
}

export function normalizeChampionRoadPicks({ picks = {} } = {}) {
  const normalized = {};

  MATCH_SEQUENCE.forEach((matchNo) => {
    const pick = picks[matchNo];
    if (!pick?.pickTarget) return;
    const entrants = getCurrentEntrantTargets(matchNo, normalized);
    if (entrants.includes(pick.pickTarget)) {
      normalized[matchNo] = {
        matchNo,
        pickSlot: pick.pickSlot === "away" ? "away" : "home",
        pickTarget: pick.pickTarget,
      };
    }
  });

  return normalized;
}

export function validateChampionRoadSubmission({ picks = {} } = {}) {
  const normalized = normalizeChampionRoadPicks({ picks });
  const missingMatchNos = MATCH_SEQUENCE.filter((matchNo) => !normalized[matchNo]?.pickTarget);
  return {
    valid: missingMatchNos.length === 0,
    missingMatchNos,
    picks: normalized,
  };
}

export function scoreChampionRoadEntry(entry = {}, results = {}) {
  const actualWinners = Object.fromEntries(MATCH_SEQUENCE.map((matchNo) => [matchNo, resolveActualTarget(matchNo, results)]));

  const round16Hits = countRoundHits(entry, actualWinners, 73, 88);
  const quarterfinalHits = countRoundHits(entry, actualWinners, 89, 96);
  const semifinalHits = countRoundHits(entry, actualWinners, 97, 100);

  const predictedPlacements = getPredictedPlacements(entry);
  const actualPlacements = getActualPlacements(results);
  const placementScore = scorePlacements(predictedPlacements, actualPlacements);

  return {
    total:
      round16Hits * CHAMPION_ROAD_SCORING.round16
      + quarterfinalHits * CHAMPION_ROAD_SCORING.quarterfinals
      + semifinalHits * CHAMPION_ROAD_SCORING.semifinals
      + placementScore.points,
    breakdown: {
      round16: { hits: round16Hits, points: round16Hits * CHAMPION_ROAD_SCORING.round16, maxPoints: 16 },
      quarterfinals: { hits: quarterfinalHits, points: quarterfinalHits * CHAMPION_ROAD_SCORING.quarterfinals, maxPoints: 16 },
      semifinals: { hits: semifinalHits, points: semifinalHits * CHAMPION_ROAD_SCORING.semifinals, maxPoints: 16 },
      placements: { hits: placementScore.hits, points: placementScore.points, maxPoints: 18 },
    },
    tiebreak: {
      champion: predictedPlacements.champion && predictedPlacements.champion === actualPlacements.champion ? 1 : 0,
      finalists: countMatches([predictedPlacements.champion, predictedPlacements.runnerUp], [actualPlacements.champion, actualPlacements.runnerUp]),
      semifinalists: semifinalHits,
      quarterfinalists: quarterfinalHits,
      round16: round16Hits,
    },
  };
}

export function rankChampionRoadEntries(entries = []) {
  const sorted = [...entries].sort((a, b) =>
    (b.score?.total || 0) - (a.score?.total || 0)
    || (b.score?.tiebreak?.champion || 0) - (a.score?.tiebreak?.champion || 0)
    || (b.score?.tiebreak?.finalists || 0) - (a.score?.tiebreak?.finalists || 0)
    || (b.score?.tiebreak?.semifinalists || 0) - (a.score?.tiebreak?.semifinalists || 0)
    || (b.score?.tiebreak?.quarterfinalists || 0) - (a.score?.tiebreak?.quarterfinalists || 0)
    || (b.score?.tiebreak?.round16 || 0) - (a.score?.tiebreak?.round16 || 0)
    || String(a.playerName || "").localeCompare(String(b.playerName || ""), "zh-CN")
  );

  let previousKey = "";
  let previousRank = 0;
  return sorted.map((entry, index) => {
    const key = [
      entry.score?.total || 0,
      entry.score?.tiebreak?.champion || 0,
      entry.score?.tiebreak?.finalists || 0,
      entry.score?.tiebreak?.semifinalists || 0,
      entry.score?.tiebreak?.quarterfinalists || 0,
      entry.score?.tiebreak?.round16 || 0,
    ].join(":");
    const rank = key === previousKey ? previousRank : index + 1;
    previousKey = key;
    previousRank = rank;
    return { ...entry, rank };
  });
}

export function slotLabelToSourceId(label) {
  const normalizedLabel = String(label || "").trim();
  const groupMatch = normalizedLabel.match(/^([A-L])\u7EC4\u7B2C(\u4E00|\u4E8C|\u4E09|\u7B2C\u4E00|\u7B2C\u4E8C|\u7B2C\u4E09)$/);
  if (groupMatch) return `group:${groupMatch[1]}:${parseGroupRank(groupMatch[2])}`;

  const bestThirdMatch = normalizedLabel.match(/^\u6700\u4F73\u5C0F\u7EC4\u7B2C\u4E09\uFF08(.+)\uFF09$/);
  if (bestThirdMatch) return `bestThird:${bestThirdMatch[1]}`;

  const winnerMatch = normalizedLabel.match(/^\u7B2C(\d+)\u573A\u80DC\u8005$/);
  if (winnerMatch) return `winner:${winnerMatch[1]}`;

  const loserMatch = normalizedLabel.match(/^\u7B2C(\d+)\u573A\u8D1F\u8005$/);
  if (loserMatch) return `loser:${loserMatch[1]}`;

  return normalizedLabel;
}

function isSettledResult(result) {
  return Number.isFinite(result?.homeScore) && Number.isFinite(result?.awayScore);
}

function parseGroupRank(rankLabel) {
  if (rankLabel === "\u4E00" || rankLabel === "\u7B2C\u4E00") return 1;
  if (rankLabel === "\u4E8C" || rankLabel === "\u7B2C\u4E8C") return 2;
  return 3;
}

function createResolvedTeamDisplay(teamName) {
  return {
    sourceId: teamName,
    sourceType: "team",
    resolved: Boolean(teamName),
    teamName,
    placeholderName: teamName || "席位待定",
  };
}

function isChampionRoadKnockoutMatch(match) {
  const matchNo = Number(match?.no ?? match?.matchNo);
  const group = String(match?.group || match?.roundLabel || "");
  const stage = String(match?.stage || match?.round || "");
  return (Number.isFinite(matchNo) && matchNo >= 73 && matchNo <= 104)
    || CHAMPION_ROAD_KNOCKOUT_GROUPS.has(group)
    || CHAMPION_ROAD_KNOCKOUT_STAGES.has(stage);
}

function isGroupStandingsLocked(table = []) {
  return table.length >= 4 && table.every((team) => team.played >= 3);
}

function findStandingsGroupKey(standings = {}, groupLetter = "") {
  const prefix = String(groupLetter || "").trim().toUpperCase();
  if (!prefix) return "";
  return Object.keys(standings).find((key) => String(key || "").trim().toUpperCase().startsWith(prefix)) || "";
}

function sortThirdPlaceTeams(teams = []) {
  return [...teams].sort((a, b) =>
    b.points - a.points
    || b.goalDifference - a.goalDifference
    || b.goalsFor - a.goalsFor
    || String(a.team || "").localeCompare(String(b.team || ""), "zh-CN")
  );
}

function getLockedThirdPlaceTeams(standings = {}) {
  const thirdTeams = [];

  for (const group of CHAMPION_ROAD_GROUP_LETTERS) {
    const groupKey = findStandingsGroupKey(standings, group);
    const table = sortStandingsTable(standings[groupKey] || []);
    if (!isGroupStandingsLocked(table)) return [];
    const thirdTeam = table[2];
    if (!thirdTeam?.team) return [];
    thirdTeams.push({ ...thirdTeam, groupLetter: group });
  }

  return thirdTeams;
}

function resolveBestThirdTeam(sourceId, standings = {}) {
  if (!sourceId.startsWith("bestThird:")) return null;

  const rankedThirdTeams = sortThirdPlaceTeams(getLockedThirdPlaceTeams(standings));
  if (rankedThirdTeams.length !== CHAMPION_ROAD_GROUP_LETTERS.length) return null;

  const qualifierKey = rankedThirdTeams
    .slice(0, CHAMPION_ROAD_BEST_THIRD_SLOT_ORDER.length)
    .map((team) => team.groupLetter)
    .sort()
    .join("");
  const mappedGroups = CHAMPION_ROAD_BEST_THIRD_MAPPING[qualifierKey];
  if (!Array.isArray(mappedGroups) || mappedGroups.length !== CHAMPION_ROAD_BEST_THIRD_SLOT_ORDER.length) return null;

  const slotKey = sourceId.slice("bestThird:".length);
  const slotColumn = CHAMPION_ROAD_BEST_THIRD_SLOT_TO_COLUMN[slotKey];
  if (!slotColumn) return null;

  const slotIndex = CHAMPION_ROAD_BEST_THIRD_SLOT_ORDER.indexOf(slotColumn);
  if (slotIndex < 0) return null;

  const targetGroup = mappedGroups[slotIndex];
  if (!targetGroup) return null;

  return rankedThirdTeams.find((team) => team.groupLetter === targetGroup) || null;
}

function getCurrentEntrantTargets(matchNo, picks) {
  const match = MATCH_BY_NO[matchNo];
  if (!match) return [];
  return [
    resolvePredictionSourceTarget(match.homeSourceId, picks),
    resolvePredictionSourceTarget(match.awaySourceId, picks),
  ].filter(Boolean);
}

function resolvePredictionSourceTarget(sourceId, picks) {
  if (sourceId.startsWith("winner:")) {
    const upstreamMatchNo = Number(sourceId.split(":")[1]);
    return picks[upstreamMatchNo]?.pickTarget || "";
  }
  if (sourceId.startsWith("loser:")) {
    const upstreamMatchNo = Number(sourceId.split(":")[1]);
    const upstreamMatch = MATCH_BY_NO[upstreamMatchNo];
    const winnerTarget = picks[upstreamMatchNo]?.pickTarget || "";
    const entrants = upstreamMatch ? getCurrentEntrantTargets(upstreamMatchNo, picks) : [];
    return entrants.find((target) => target && target !== winnerTarget) || "";
  }
  return sourceId;
}

function resolveActualTarget(matchNo, results) {
  const match = MATCH_BY_NO[matchNo];
  const result = results[matchNo];
  if (!match || !isSettledResult(result)) return "";
  const homeTarget = resolveActualEntrantTarget(match.homeSourceId, results);
  const awayTarget = resolveActualEntrantTarget(match.awaySourceId, results);
  if (result.homeScore === result.awayScore) {
    if (result.advancingSide === "home") return homeTarget;
    if (result.advancingSide === "away") return awayTarget;
    return "";
  }
  return result.homeScore > result.awayScore ? homeTarget : awayTarget;
}

function resolveActualLoserTarget(matchNo, results) {
  const match = MATCH_BY_NO[matchNo];
  const result = results[matchNo];
  if (!match || !isSettledResult(result)) return "";
  const homeTarget = resolveActualEntrantTarget(match.homeSourceId, results);
  const awayTarget = resolveActualEntrantTarget(match.awaySourceId, results);
  if (result.homeScore === result.awayScore) {
    if (result.advancingSide === "home") return awayTarget;
    if (result.advancingSide === "away") return homeTarget;
    return "";
  }
  return result.homeScore > result.awayScore ? awayTarget : homeTarget;
}

function resolveActualEntrantTarget(sourceId, results) {
  if (sourceId.startsWith("winner:")) return resolveActualTarget(Number(sourceId.split(":")[1]), results);
  if (sourceId.startsWith("loser:")) return resolveActualLoserTarget(Number(sourceId.split(":")[1]), results);
  return sourceId;
}

function resolveActualTeamName(matchNo, type, standings, results) {
  const match = MATCH_BY_NO[matchNo];
  if (!match) return "";
  const target = type === "loser" ? resolveActualLoserTarget(matchNo, results) : resolveActualTarget(matchNo, results);
  if (!target) return "";
  return resolveTeamNameBySourceId(target, standings, results);
}

function resolveMatchOutcomeName(matchNo, type, standings, results) {
  const match = MATCH_BY_NO[matchNo];
  const result = results[matchNo];
  if (!match || !isSettledResult(result)) return "";
  let selectedLabel = "";
  if (result.homeScore === result.awayScore) {
    if (result.advancingSide === "home") {
      selectedLabel = type === "loser" ? match.awayLabel : match.homeLabel;
    } else if (result.advancingSide === "away") {
      selectedLabel = type === "loser" ? match.homeLabel : match.awayLabel;
    } else {
      return "";
    }
  } else {
    selectedLabel = type === "loser"
      ? (result.homeScore > result.awayScore ? match.awayLabel : match.homeLabel)
      : (result.homeScore > result.awayScore ? match.homeLabel : match.awayLabel);
  }
  return resolveChampionRoadSlot(selectedLabel, { standings, results }).teamName || "";
}

function resolveTeamNameBySourceId(sourceId, standings, results) {
  if (sourceId.startsWith("group:")) {
    const [, group, rankText] = sourceId.split(":");
    const groupKey = findStandingsGroupKey(standings, group);
    const table = sortStandingsTable(standings[groupKey] || []);
    const team = table[Number(rankText) - 1];
    return isGroupStandingsLocked(table) ? team?.team || "" : "";
  }
  if (sourceId.startsWith("bestThird:")) return resolveBestThirdTeam(sourceId, standings)?.team || "";
  if (sourceId.startsWith("winner:")) return resolveActualTeamName(Number(sourceId.split(":")[1]), "winner", standings, results);
  if (sourceId.startsWith("loser:")) return resolveActualTeamName(Number(sourceId.split(":")[1]), "loser", standings, results);
  return "";
}

function countRoundHits(entry, actualWinners, start, end) {
  let hits = 0;
  for (let matchNo = start; matchNo <= end; matchNo += 1) {
    if (entry[matchNo]?.pickTarget && entry[matchNo].pickTarget === actualWinners[matchNo]) hits += 1;
  }
  return hits;
}

function getPredictedPlacements(entry) {
  const finalMatch = MATCH_BY_NO[104];
  const thirdMatch = MATCH_BY_NO[103];
  const champion = entry[104]?.pickTarget || "";
  const finalEntrants = finalMatch ? getCurrentEntrantTargets(104, entry) : [];
  const runnerUp = finalEntrants.find((target) => target && target !== champion) || "";
  const thirdPlace = entry[103]?.pickTarget || "";
  const thirdEntrants = thirdMatch ? getCurrentEntrantTargets(103, entry) : [];
  const fourthPlace = thirdEntrants.find((target) => target && target !== thirdPlace) || "";
  return { champion, runnerUp, thirdPlace, fourthPlace };
}

function getActualPlacements(results) {
  const champion = resolveActualTarget(104, results);
  const runnerUp = resolveActualLoserTarget(104, results);
  const thirdPlace = resolveActualTarget(103, results);
  const fourthPlace = resolveActualLoserTarget(103, results);
  return { champion, runnerUp, thirdPlace, fourthPlace };
}

function scorePlacements(predicted, actual) {
  let hits = 0;
  let points = 0;
  if (predicted.champion && predicted.champion === actual.champion) {
    hits += 1;
    points += CHAMPION_ROAD_SCORING.champion;
  }
  if (predicted.runnerUp && predicted.runnerUp === actual.runnerUp) {
    hits += 1;
    points += CHAMPION_ROAD_SCORING.runnerUp;
  }
  if (predicted.thirdPlace && predicted.thirdPlace === actual.thirdPlace) {
    hits += 1;
    points += CHAMPION_ROAD_SCORING.thirdPlace;
  }
  if (predicted.fourthPlace && predicted.fourthPlace === actual.fourthPlace) {
    hits += 1;
    points += CHAMPION_ROAD_SCORING.fourthPlace;
  }
  return { hits, points };
}

function countMatches(left, right) {
  return left.filter((value) => value && right.includes(value)).length;
}
