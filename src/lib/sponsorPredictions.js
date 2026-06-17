import { getTeamProfileByName } from "./teamProfiles";

export const FIRST_GOAL_TIME_EVENT_ID = "first_goal_time";
export const ASIA_ROUND2_POINTS_EVENT_ID = "asia_round2_points";
export const ASIA_ROUND2_GOALS_EVENT_ID = "asia_round2_goals";
export const ASIA_ROUND2_GROUP_ID = "asia_round2";
export const ASIA_ROUND2_DEADLINE_AT = "2026-06-18T16:00:00.000Z";

export const SPONSOR_PREDICTION_GROUPS = [
  {
    id: ASIA_ROUND2_GROUP_ID,
    sponsorName: "月半洛夫维奇",
    title: "亚洲球队（含澳大利亚）第二轮总表现预测",
    awardTitle: "亚洲之巅",
    description: "预测亚洲球队（含澳大利亚）在小组赛第2场的总积分和总进球数。两题分别按接近程度排名积分，总分最高者获得称号。",
    helperText: "官方答案会随比赛结算自动统计更新；两题分别排序积分后相加。",
    historical: false,
    collapseByDefault: false,
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
        helperText: "统计亚洲球队（含澳大利亚）各自第2场小组赛拿到的积分总和。",
      },
      {
        id: ASIA_ROUND2_GOALS_EVENT_ID,
        label: "第二轮总进球",
        titleName: "亚洲之巅",
        placeholder: "例如：6",
        valueType: "integer",
        helperText: "统计亚洲球队（含澳大利亚）各自第2场小组赛打进的总进球数。",
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
  return `${Math.max(0, Math.floor(Number(value)))}`;
}

export function getSponsorPredictionDeadlineLabel(event, firstKickoff) {
  const resolvedEvent = event?.id ? (SPONSOR_PREDICTION_EVENT_BY_ID[event.id] || event) : event;
  if (resolvedEvent?.lockMode === "fixed_deadline") return "北京时间 2026/06/19 00:00";
  if (!firstKickoff) return "--";
  return firstKickoff;
}

export function isSponsorPredictionLocked(event, { now = new Date(), firstKickoff = null } = {}) {
  const resolvedEvent = event?.id ? (SPONSOR_PREDICTION_EVENT_BY_ID[event.id] || event) : event;
  const current = new Date(now);
  if (resolvedEvent?.lockMode === "fixed_deadline") {
    return current >= new Date(resolvedEvent.deadlineAt || ASIA_ROUND2_DEADLINE_AT);
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

export function getAutomaticSponsorPredictionResults({ matches }) {
  const asiaStats = calculateAsiaRound2Stats(matches);
  const pointsValue = asiaStats.completedTeams ? asiaStats.totalPoints : undefined;
  const goalsValue = asiaStats.completedTeams ? asiaStats.totalGoals : undefined;
  return {
    [ASIA_ROUND2_POINTS_EVENT_ID]: {
      resolvedMatchId: "auto-afc-round2-points",
      actualValue: pointsValue,
      actualTotalSeconds: pointsValue,
      sponsorName: "月半洛夫维奇",
      resolvedAt: asiaStats.completedTeams ? new Date().toISOString() : "",
    },
    [ASIA_ROUND2_GOALS_EVENT_ID]: {
      resolvedMatchId: "auto-afc-round2-goals",
      actualValue: goalsValue,
      actualTotalSeconds: goalsValue,
      sponsorName: "月半洛夫维奇",
      resolvedAt: asiaStats.completedTeams ? new Date().toISOString() : "",
    },
  };
}

export function getResolvedSponsorPredictionResults({ matches, sponsorPredictionResults }) {
  return {
    ...(sponsorPredictionResults || {}),
    ...getAutomaticSponsorPredictionResults({ matches }),
  };
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
