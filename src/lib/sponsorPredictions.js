import { getTeamProfileByName } from "./teamProfiles";

export const FIRST_GOAL_TIME_EVENT_ID = "first_goal_time";
export const ASIA_ROUND2_POINTS_EVENT_ID = "asia_round2_points";
export const ASIA_ROUND2_GOALS_EVENT_ID = "asia_round2_goals";
export const ASIA_ROUND2_GROUP_ID = "asia_round2";
export const ASIA_ROUND2_DEADLINE_AT = "2026-06-18T16:00:00.000Z";

export const CUT_LINE_MASTER_GROUP_ID = "cut_line_master";
export const CUT_LINE_MASTER_POINTS_EVENT_ID = "cut_line_master_points";
export const CUT_LINE_MASTER_GOAL_DIFFERENCE_EVENT_ID = "cut_line_master_goal_difference";
export const CUT_LINE_MASTER_GOALS_EVENT_ID = "cut_line_master_goals";
export const CUT_LINE_MASTER_DEADLINE_AT = "2026-06-24T19:00:00.000Z";

const ASIA_SPONSOR_NAME = "月半洛夫维奇";
const CUT_LINE_MASTER_SPONSOR_NAME = "卡线大师";
const GROUP_LETTERS = "ABCDEFGHIJKL".split("");

export const SPONSOR_PREDICTION_GROUPS = [
  {
    id: CUT_LINE_MASTER_GROUP_ID,
    sponsorName: CUT_LINE_MASTER_SPONSOR_NAME,
    title: "第三名卡线队预测",
    awardTitle: "卡线大师",
    description: "预测 12 个小组第三里第 8 名那支队，也就是最后一张第三名晋级门票的边缘球队，最终会拿到多少积分、净胜球和进球数。",
    helperText: "按误差依次比较：先看积分误差，再看净胜球误差，最后看进球误差；误差完全相同则并列获得称号。",
    historical: false,
    collapseByDefault: false,
    lockMode: "fixed_deadline",
    deadlineAt: CUT_LINE_MASTER_DEADLINE_AT,
    resultMode: "auto_cut_line_master",
    events: [
      {
        id: CUT_LINE_MASTER_POINTS_EVENT_ID,
        label: "卡线队积分",
        titleName: "卡线大师",
        placeholder: "例如：5",
        valueType: "integer",
        helperText: "预测这支最边缘第三名球队最终拿到的积分。",
      },
      {
        id: CUT_LINE_MASTER_GOAL_DIFFERENCE_EVENT_ID,
        label: "卡线队净胜球",
        titleName: "卡线大师",
        placeholder: "例如：-1",
        valueType: "signed_integer",
        helperText: "预测这支最边缘第三名球队最终的净胜球。",
      },
      {
        id: CUT_LINE_MASTER_GOALS_EVENT_ID,
        label: "卡线队进球数",
        titleName: "卡线大师",
        placeholder: "例如：3",
        valueType: "integer",
        helperText: "预测这支最边缘第三名球队最终的总进球数。",
      },
    ],
  },
  {
    id: ASIA_ROUND2_GROUP_ID,
    sponsorName: ASIA_SPONSOR_NAME,
    title: "亚洲球队（含澳大利亚）第二轮总表现预测",
    awardTitle: "亚洲之巅",
    description: "预测亚洲球队（含澳大利亚）在小组赛第 2 场的总积分和总进球数。两题分别按接近程度排名积分，总分最高者获得称号。",
    helperText: "官方答案会随比赛结算自动统计更新；两题分别排序积分后相加。",
    historical: true,
    collapseByDefault: true,
    lockMode: "fixed_deadline",
    deadlineAt: ASIA_ROUND2_DEADLINE_AT,
    resultMode: "auto_afc_round2",
    events: [
      {
        id: ASIA_ROUND2_POINTS_EVENT_ID,
        label: "第二轮总积分",
        titleName: "亚洲之巅",
        placeholder: "例如：8",
        valueType: "integer",
        helperText: "统计亚洲球队（含澳大利亚）各自第 2 场小组赛拿到的积分总和。",
      },
      {
        id: ASIA_ROUND2_GOALS_EVENT_ID,
        label: "第二轮总进球",
        titleName: "亚洲之巅",
        placeholder: "例如：7",
        valueType: "integer",
        helperText: "统计亚洲球队（含澳大利亚）各自第 2 场小组赛打进的总进球数。",
      },
    ],
  },
  {
    id: FIRST_GOAL_TIME_EVENT_ID,
    sponsorName: "墨鱼",
    title: "世界杯首球时间预测",
    awardTitle: "足球研究所所长",
    description: "预测本届世界杯第一个进球发生在比赛计时的第几分第几秒；若首场 0:0，则自动顺延到下一场有进球的比赛。",
    helperText: "按比赛计时填写，精确到秒；伤停补时按累计时间计算，例如 47:15。",
    historical: true,
    collapseByDefault: true,
    lockMode: "first_kickoff",
    resultMode: "manual",
    events: [
      {
        id: FIRST_GOAL_TIME_EVENT_ID,
        label: "预测首球比赛时间",
        titleName: "足球研究所所长",
        valueType: "clock",
        helperText: "按累计比赛时间填写，例如 12分34秒；如果进入伤停补时，45+2:15 请换算为 47分15秒。",
      },
    ],
  },
];

export const SPONSOR_PREDICTION_EVENTS = SPONSOR_PREDICTION_GROUPS.flatMap((group) => (
  group.events.map((event) => ({
    ...event,
    sponsorName: group.sponsorName,
    title: group.title,
    titleName: event.titleName || group.awardTitle,
    description: group.description,
    groupId: group.id,
    groupTitle: group.title,
    awardTitle: group.awardTitle,
    lockMode: group.lockMode,
    deadlineAt: group.deadlineAt || "",
    historical: group.historical,
    collapseByDefault: group.collapseByDefault,
    resultMode: group.resultMode,
  }))
));

export const SPONSOR_PREDICTION_EVENT_BY_ID = Object.fromEntries(
  SPONSOR_PREDICTION_EVENTS.map((event) => [event.id, event]),
);

export const SPONSOR_PREDICTION_GROUP_BY_ID = Object.fromEntries(
  SPONSOR_PREDICTION_GROUPS.map((group) => [group.id, group]),
);

export function mapSponsorPredictions(rows) {
  return (rows || []).reduce((acc, row) => {
    if (!acc[row.event_id]) acc[row.event_id] = {};
    acc[row.event_id][row.user_id] = {
      predictedValue: row.predicted_total_seconds,
      predictedTotalSeconds: row.predicted_total_seconds,
      submittedAt: row.submitted_at,
    };
    return acc;
  }, {});
}

export function mapSponsorPredictionResults(rows) {
  return (rows || []).reduce((acc, row) => {
    acc[row.event_id] = {
      resolvedMatchId: row.resolved_match_id || "",
      actualValue: row.actual_total_seconds,
      actualTotalSeconds: row.actual_total_seconds,
      sponsorName: row.sponsor_name || "",
      resolvedAt: row.resolved_at || "",
    };
    return acc;
  }, {});
}

export function splitSponsorPredictionClock(totalSeconds) {
  const normalized = Number.isFinite(Number(totalSeconds)) ? Math.max(0, Math.floor(Number(totalSeconds))) : 0;
  return {
    minutes: String(Math.floor(normalized / 60)),
    seconds: String(normalized % 60).padStart(2, "0"),
  };
}

export function formatSponsorPredictionClock(totalSeconds) {
  if (!Number.isFinite(Number(totalSeconds))) return "--";
  const normalized = Math.max(0, Math.floor(Number(totalSeconds)));
  const minutes = Math.floor(normalized / 60);
  const seconds = normalized % 60;
  return `${minutes}分${String(seconds).padStart(2, "0")}秒`;
}

export function formatSponsorPredictionValue(event, value) {
  if (!Number.isFinite(Number(value))) return "--";
  if (event?.valueType === "clock") return formatSponsorPredictionClock(value);
  return `${Math.trunc(Number(value))}`;
}

export function getSponsorPredictionDeadlineLabel(event, firstKickoff) {
  const resolvedEvent = event?.id ? (SPONSOR_PREDICTION_EVENT_BY_ID[event.id] || event) : event;
  if (resolvedEvent?.id === CUT_LINE_MASTER_POINTS_EVENT_ID || resolvedEvent?.groupId === CUT_LINE_MASTER_GROUP_ID) {
    return "北京时间 2026/06/25 03:00";
  }
  if (resolvedEvent?.lockMode === "fixed_deadline") return "北京时间 2026/06/19 00:00";
  if (!firstKickoff) return "--";
  return firstKickoff;
}

export function isSponsorPredictionLocked(event, { now = new Date(), firstKickoff = null } = {}) {
  const resolvedEvent = event?.id ? (SPONSOR_PREDICTION_EVENT_BY_ID[event.id] || event) : event;
  const current = new Date(now);
  if (resolvedEvent?.lockMode === "fixed_deadline") {
    const fallbackDeadline = resolvedEvent?.groupId === CUT_LINE_MASTER_GROUP_ID || resolvedEvent?.id?.startsWith(CUT_LINE_MASTER_GROUP_ID)
      ? CUT_LINE_MASTER_DEADLINE_AT
      : ASIA_ROUND2_DEADLINE_AT;
    return current >= new Date(resolvedEvent.deadlineAt || fallbackDeadline);
  }
  if (!firstKickoff) return false;
  return current >= new Date(firstKickoff);
}

export function getFirstGoalResolvedMatch(matches) {
  return [...(matches || [])]
    .filter((match) => match?.status === "settled" && Number.isFinite(match?.homeScore) && Number.isFinite(match?.awayScore))
    .sort((left, right) => new Date(left.kickoff).getTime() - new Date(right.kickoff).getTime())
    .find((match) => Number(match.homeScore) + Number(match.awayScore) > 0) || null;
}

function getPredictionNumericValue(prediction) {
  if (!prediction) return null;
  if (Number.isFinite(Number(prediction.predictedValue))) return Number(prediction.predictedValue);
  if (Number.isFinite(Number(prediction.predictedTotalSeconds))) return Number(prediction.predictedTotalSeconds);
  return null;
}

function getResultNumericValue(result) {
  if (!result) return null;
  if (Number.isFinite(Number(result.actualValue))) return Number(result.actualValue);
  if (Number.isFinite(Number(result.actualTotalSeconds))) return Number(result.actualTotalSeconds);
  return null;
}

export function getSponsorPredictionWinners({
  eventId,
  players,
  predictionsByUserId,
  result,
}) {
  if (!eventId) return [];
  const actualValue = getResultNumericValue(result);
  if (!Number.isFinite(actualValue)) return [];

  const candidates = (players || [])
    .map((player) => ({
      ...player,
      prediction: predictionsByUserId?.[player.id] || null,
    }))
    .map((player) => {
      const predictedValue = getPredictionNumericValue(player.prediction);
      if (!Number.isFinite(predictedValue)) return null;
      return {
        ...player,
        predictedValue,
        diff: Math.abs(predictedValue - actualValue),
      };
    })
    .filter(Boolean);

  if (!candidates.length) return [];
  const closestDiff = Math.min(...candidates.map((player) => player.diff));
  return candidates
    .filter((player) => player.diff === closestDiff)
    .map((player) => ({
      ...player,
      diffSeconds: player.diff,
    }));
}

function getAfcTeamNameSet() {
  return new Set(
    ["韩国", "卡塔尔", "澳大利亚", "日本", "沙特阿拉伯", "伊朗", "伊拉克", "约旦", "乌兹别克斯坦"],
  );
}

function isAfcTeam(name) {
  const profile = getTeamProfileByName(name);
  if (profile?.confederation === "AFC") return true;
  return getAfcTeamNameSet().has(String(name || "").trim());
}

function getMatchPoints(match, teamSide) {
  const teamScore = Number(teamSide === "home" ? match.homeScore : match.awayScore);
  const opponentScore = Number(teamSide === "home" ? match.awayScore : match.homeScore);
  if (teamScore > opponentScore) return 3;
  if (teamScore === opponentScore) return 1;
  return 0;
}

export function calculateAsiaRound2Stats(matches) {
  const settledGroupMatches = [...(matches || [])]
    .filter((match) => match?.stage === "GROUP" && match?.status === "settled")
    .filter((match) => Number.isFinite(match?.homeScore) && Number.isFinite(match?.awayScore))
    .sort((left, right) => new Date(left.kickoff).getTime() - new Date(right.kickoff).getTime());

  const afcTeams = Array.from(
    new Set(
      settledGroupMatches.flatMap((match) => [match.home, match.away]).filter((team) => isAfcTeam(team)),
    ),
  );
  const knownAfcTeams = Array.from(getAfcTeamNameSet());
  const totalTeams = Math.max(afcTeams.length, knownAfcTeams.length);

  const teamMatches = new Map();
  settledGroupMatches.forEach((match) => {
    if (isAfcTeam(match.home)) {
      if (!teamMatches.has(match.home)) teamMatches.set(match.home, []);
      teamMatches.get(match.home).push({ ...match, teamSide: "home" });
    }
    if (isAfcTeam(match.away)) {
      if (!teamMatches.has(match.away)) teamMatches.set(match.away, []);
      teamMatches.get(match.away).push({ ...match, teamSide: "away" });
    }
  });

  const includedMatches = [];
  teamMatches.forEach((matchesForTeam) => {
    if (matchesForTeam.length >= 2) includedMatches.push(matchesForTeam[1]);
  });

  return {
    totalPoints: includedMatches.reduce((sum, match) => sum + getMatchPoints(match, match.teamSide), 0),
    totalGoals: includedMatches.reduce((sum, match) => sum + Number(match[match.teamSide === "home" ? "homeScore" : "awayScore"]), 0),
    completedTeams: includedMatches.length,
    totalTeams,
    isComplete: includedMatches.length >= totalTeams,
    includedMatches,
  };
}

function normalizeGroupKey(group) {
  const text = String(group || "").trim();
  if (/^[A-L]组$/.test(text)) return text;
  if (/^[A-L]$/.test(text)) return `${text}组`;
  return text;
}

function sortThirdPlaceTeams(teams) {
  return [...teams].sort((a, b) =>
    b.points - a.points ||
    b.goalDifference - a.goalDifference ||
    b.goalsFor - a.goalsFor ||
    String(a.team || "").localeCompare(String(b.team || ""), "zh-CN")
  );
}

function createEmptyStanding(group, team) {
  return {
    group,
    team,
    played: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
  };
}

function buildWorldCupStandingsFromMatches(matches) {
  const settledGroupMatches = [...(matches || [])]
    .filter((match) => match?.stage === "GROUP")
    .map((match) => ({
      ...match,
      group: normalizeGroupKey(match.group),
    }))
    .filter((match) => /^[A-L]组$/.test(match.group));

  const tableMap = new Map();
  settledGroupMatches.forEach((match) => {
    [match.home, match.away].forEach((team) => {
      const key = `${match.group}-${team}`;
      if (!tableMap.has(key)) tableMap.set(key, createEmptyStanding(match.group, team));
    });
  });

  settledGroupMatches
    .filter((match) => match?.status === "settled")
    .filter((match) => Number.isFinite(match?.homeScore) && Number.isFinite(match?.awayScore))
    .forEach((match) => {
      const homeKey = `${match.group}-${match.home}`;
      const awayKey = `${match.group}-${match.away}`;
      const homeTeam = tableMap.get(homeKey);
      const awayTeam = tableMap.get(awayKey);
      if (!homeTeam || !awayTeam) return;

      homeTeam.played += 1;
      awayTeam.played += 1;
      homeTeam.goalsFor += Number(match.homeScore);
      homeTeam.goalsAgainst += Number(match.awayScore);
      awayTeam.goalsFor += Number(match.awayScore);
      awayTeam.goalsAgainst += Number(match.homeScore);
      if (Number(match.homeScore) > Number(match.awayScore)) {
        homeTeam.points += 3;
      } else if (Number(match.homeScore) < Number(match.awayScore)) {
        awayTeam.points += 3;
      } else {
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

export function calculateCutLineMasterStats(standings) {
  const normalizedStandings = standings || {};
  const bestThirdTeams = GROUP_LETTERS
    .map((letter) => normalizedStandings[`${letter}组`])
    .map((table) => Array.isArray(table) && table.length >= 3 ? sortThirdPlaceTeams(table)[2] : null)
    .filter(Boolean)
    .map((team) => ({
      ...team,
      group: normalizeGroupKey(team.group),
    }));

  const rankedThirdTeams = sortThirdPlaceTeams(bestThirdTeams);
  const cutLineTeam = rankedThirdTeams[7] || rankedThirdTeams[rankedThirdTeams.length - 1] || null;

  return {
    team: cutLineTeam?.team || "",
    group: cutLineTeam?.group || "",
    points: cutLineTeam?.points,
    goalDifference: cutLineTeam?.goalDifference,
    goalsFor: cutLineTeam?.goalsFor,
    completedGroups: bestThirdTeams.length,
    totalGroups: GROUP_LETTERS.length,
    isComplete: bestThirdTeams.length >= GROUP_LETTERS.length,
    rankedThirdTeams,
  };
}

export function calculateCutLineMasterStatsFromMatches(matches) {
  return calculateCutLineMasterStats(buildWorldCupStandingsFromMatches(matches));
}

export function getAutomaticSponsorPredictionResults({ matches }) {
  const asiaStats = calculateAsiaRound2Stats(matches);
  const cutLineStats = calculateCutLineMasterStatsFromMatches(matches);
  const pointsValue = asiaStats.completedTeams ? asiaStats.totalPoints : undefined;
  const goalsValue = asiaStats.completedTeams ? asiaStats.totalGoals : undefined;
  const cutLinePoints = Number.isFinite(cutLineStats.points) ? cutLineStats.points : undefined;
  const cutLineGoalDifference = Number.isFinite(cutLineStats.goalDifference) ? cutLineStats.goalDifference : undefined;
  const cutLineGoals = Number.isFinite(cutLineStats.goalsFor) ? cutLineStats.goalsFor : undefined;

  return {
    [CUT_LINE_MASTER_POINTS_EVENT_ID]: {
      resolvedMatchId: "auto-cut-line-master-points",
      actualValue: cutLinePoints,
      actualTotalSeconds: cutLinePoints,
      sponsorName: CUT_LINE_MASTER_SPONSOR_NAME,
      resolvedAt: cutLineStats.completedGroups ? new Date().toISOString() : "",
    },
    [CUT_LINE_MASTER_GOAL_DIFFERENCE_EVENT_ID]: {
      resolvedMatchId: "auto-cut-line-master-goal-difference",
      actualValue: cutLineGoalDifference,
      actualTotalSeconds: cutLineGoalDifference,
      sponsorName: CUT_LINE_MASTER_SPONSOR_NAME,
      resolvedAt: cutLineStats.completedGroups ? new Date().toISOString() : "",
    },
    [CUT_LINE_MASTER_GOALS_EVENT_ID]: {
      resolvedMatchId: "auto-cut-line-master-goals",
      actualValue: cutLineGoals,
      actualTotalSeconds: cutLineGoals,
      sponsorName: CUT_LINE_MASTER_SPONSOR_NAME,
      resolvedAt: cutLineStats.completedGroups ? new Date().toISOString() : "",
    },
    [ASIA_ROUND2_POINTS_EVENT_ID]: {
      resolvedMatchId: "auto-afc-round2-points",
      actualValue: pointsValue,
      actualTotalSeconds: pointsValue,
      sponsorName: ASIA_SPONSOR_NAME,
      resolvedAt: asiaStats.completedTeams ? new Date().toISOString() : "",
    },
    [ASIA_ROUND2_GOALS_EVENT_ID]: {
      resolvedMatchId: "auto-afc-round2-goals",
      actualValue: goalsValue,
      actualTotalSeconds: goalsValue,
      sponsorName: ASIA_SPONSOR_NAME,
      resolvedAt: asiaStats.completedTeams ? new Date().toISOString() : "",
    },
  };
}

export function getResolvedSponsorPredictionResults({ matches, sponsorPredictionResults }) {
  const mergedResults = {
    ...(sponsorPredictionResults || {}),
  };
  const automaticResults = getAutomaticSponsorPredictionResults({ matches });

  Object.entries(automaticResults).forEach(([eventId, result]) => {
    if (Number.isFinite(result?.actualValue) || Number.isFinite(result?.actualTotalSeconds)) {
      mergedResults[eventId] = result;
    }
  });

  return mergedResults;
}

function buildRankedScores(players, predictionsByUserId, result) {
  const actualValue = getResultNumericValue(result);
  if (!Number.isFinite(actualValue)) return [];

  const scoredPlayers = (players || [])
    .map((player) => {
      const prediction = predictionsByUserId?.[player.id] || null;
      const predictedValue = getPredictionNumericValue(prediction);
      if (!Number.isFinite(predictedValue)) return null;
      return {
        id: player.id,
        name: player.name,
        predictedValue,
        diff: Math.abs(predictedValue - actualValue),
      };
    })
    .filter(Boolean)
    .sort((left, right) => left.diff - right.diff || left.name.localeCompare(right.name));

  if (!scoredPlayers.length) return [];
  let currentRank = 1;
  return scoredPlayers.map((player, index) => {
    if (index > 0 && player.diff !== scoredPlayers[index - 1].diff) currentRank = index + 1;
    return {
      ...player,
      rank: currentRank,
      score: scoredPlayers.length - currentRank + 1,
    };
  });
}

export function getSponsorPredictionGroupStandings({
  eventIds,
  players,
  sponsorPredictions,
  sponsorPredictionResults,
}) {
  const totals = new Map();

  (eventIds || []).forEach((eventId) => {
    const rankedScores = buildRankedScores(
      players,
      sponsorPredictions?.[eventId] || {},
      sponsorPredictionResults?.[eventId] || null,
    );

    rankedScores.forEach((entry) => {
      if (!totals.has(entry.id)) {
        totals.set(entry.id, {
          id: entry.id,
          name: entry.name,
          totalScore: 0,
          eventScores: {},
        });
      }
      const current = totals.get(entry.id);
      current.totalScore += entry.score;
      current.eventScores[eventId] = entry;
    });
  });

  return [...totals.values()].sort((left, right) => right.totalScore - left.totalScore || left.name.localeCompare(right.name));
}

export function getGroupPredictionWinners(standings) {
  if (!standings?.length) return [];
  const topScore = standings[0].totalScore;
  return standings.filter((entry) => entry.totalScore === topScore);
}

function buildCutLineMasterCandidate(player, sponsorPredictions, sponsorPredictionResults) {
  const pointsPrediction = getPredictionNumericValue(sponsorPredictions?.[CUT_LINE_MASTER_POINTS_EVENT_ID]?.[player.id]);
  const goalDifferencePrediction = getPredictionNumericValue(sponsorPredictions?.[CUT_LINE_MASTER_GOAL_DIFFERENCE_EVENT_ID]?.[player.id]);
  const goalsPrediction = getPredictionNumericValue(sponsorPredictions?.[CUT_LINE_MASTER_GOALS_EVENT_ID]?.[player.id]);
  const actualPoints = getResultNumericValue(sponsorPredictionResults?.[CUT_LINE_MASTER_POINTS_EVENT_ID]);
  const actualGoalDifference = getResultNumericValue(sponsorPredictionResults?.[CUT_LINE_MASTER_GOAL_DIFFERENCE_EVENT_ID]);
  const actualGoals = getResultNumericValue(sponsorPredictionResults?.[CUT_LINE_MASTER_GOALS_EVENT_ID]);

  if (![pointsPrediction, goalDifferencePrediction, goalsPrediction, actualPoints, actualGoalDifference, actualGoals].every((value) => Number.isFinite(value))) {
    return null;
  }

  return {
    id: player.id,
    name: player.name,
    pointsDiff: Math.abs(pointsPrediction - actualPoints),
    goalDifferenceDiff: Math.abs(goalDifferencePrediction - actualGoalDifference),
    goalsDiff: Math.abs(goalsPrediction - actualGoals),
  };
}

function compareCutLineMasterCandidates(left, right) {
  return left.pointsDiff - right.pointsDiff ||
    left.goalDifferenceDiff - right.goalDifferenceDiff ||
    left.goalsDiff - right.goalsDiff ||
    left.name.localeCompare(right.name, "zh-CN");
}

export function getCutLineMasterStandings({
  players,
  sponsorPredictions,
  sponsorPredictionResults,
}) {
  return (players || [])
    .map((player) => buildCutLineMasterCandidate(player, sponsorPredictions, sponsorPredictionResults))
    .filter(Boolean)
    .sort(compareCutLineMasterCandidates);
}

export function getCutLineMasterWinners({
  players,
  sponsorPredictions,
  sponsorPredictionResults,
}) {
  const standings = getCutLineMasterStandings({
    players,
    sponsorPredictions,
    sponsorPredictionResults,
  });
  if (!standings.length) return [];
  const best = standings[0];
  return standings.filter((entry) => (
    entry.pointsDiff === best.pointsDiff &&
    entry.goalDifferenceDiff === best.goalDifferenceDiff &&
    entry.goalsDiff === best.goalsDiff
  ));
}

export function getPlayerSponsorTitles({
  playerId,
  players,
  sponsorPredictions,
  sponsorPredictionResults,
  matches = [],
}) {
  const resolvedResults = getResolvedSponsorPredictionResults({ matches, sponsorPredictionResults });

  const eventTitles = SPONSOR_PREDICTION_EVENTS
    .filter((event) => event.groupId === FIRST_GOAL_TIME_EVENT_ID)
    .filter((event) => {
      const winners = getSponsorPredictionWinners({
        eventId: event.id,
        players,
        predictionsByUserId: sponsorPredictions?.[event.id] || {},
        result: resolvedResults?.[event.id] || null,
      });
      return winners.some((player) => player.id === playerId);
    })
    .map((event) => event.titleName);

  if (getCutLineMasterWinners({
    players,
    sponsorPredictions,
    sponsorPredictionResults: resolvedResults,
  }).some((entry) => entry.id === playerId)) {
    eventTitles.push("卡线大师");
  }

  const asiaStandings = getSponsorPredictionGroupStandings({
    eventIds: [ASIA_ROUND2_POINTS_EVENT_ID, ASIA_ROUND2_GOALS_EVENT_ID],
    players,
    sponsorPredictions,
    sponsorPredictionResults: resolvedResults,
  });
  if (getGroupPredictionWinners(asiaStandings).some((entry) => entry.id === playerId)) {
    eventTitles.push("亚洲之巅");
  }

  return [...new Set(eventTitles)];
}

export function getVisiblePredictionPlayers({
  players,
  predictionsByUserId,
  showAll,
  currentPlayerId,
}) {
  if (showAll) {
    return (players || []).filter((player) => Boolean(predictionsByUserId?.[player.id]));
  }

  return (players || []).filter((player) => player.id === currentPlayerId);
}
