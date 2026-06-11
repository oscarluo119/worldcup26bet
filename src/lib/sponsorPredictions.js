export const FIRST_GOAL_TIME_EVENT_ID = "first_goal_time";

export const SPONSOR_PREDICTION_EVENTS = [
  {
    id: FIRST_GOAL_TIME_EVENT_ID,
    sponsorName: "墨鱼",
    title: "世界杯首球时间预测",
    titleName: "足球研究所所长",
    description: "预测本届世界杯第一个进球发生在比赛计时的第几分第几秒，若第一场 0:0，则自动顺延到下一场有首球的比赛。",
    helperText: "按比赛计时填写，精确到秒；伤停补时按累计时间计算，例如 47:15。",
  },
];

export const SPONSOR_PREDICTION_EVENT_BY_ID = Object.fromEntries(
  SPONSOR_PREDICTION_EVENTS.map((event) => [event.id, event]),
);

export function mapSponsorPredictions(rows) {
  return (rows || []).reduce((acc, row) => {
    if (!acc[row.event_id]) acc[row.event_id] = {};
    acc[row.event_id][row.user_id] = {
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
      actualTotalSeconds: row.actual_total_seconds,
      sponsorName: row.sponsor_name || "",
      resolvedAt: row.resolved_at || "",
    };
    return acc;
  }, {});
}

export function getFirstGoalResolvedMatch(matches) {
  return [...(matches || [])]
    .filter((match) => match?.status === "settled" && Number.isFinite(match?.homeScore) && Number.isFinite(match?.awayScore))
    .sort((left, right) => new Date(left.kickoff).getTime() - new Date(right.kickoff).getTime())
    .find((match) => Number(match.homeScore) + Number(match.awayScore) > 0) || null;
}

export function getSponsorPredictionWinners({
  eventId,
  players,
  predictionsByUserId,
  result,
}) {
  if (!eventId || !Number.isFinite(Number(result?.actualTotalSeconds))) return [];

  const actualTotalSeconds = Number(result.actualTotalSeconds);
  const candidates = (players || [])
    .map((player) => ({
      ...player,
      prediction: predictionsByUserId?.[player.id] || null,
    }))
    .filter((player) => Number.isFinite(Number(player.prediction?.predictedTotalSeconds)))
    .map((player) => ({
      ...player,
      diffSeconds: Math.abs(Number(player.prediction.predictedTotalSeconds) - actualTotalSeconds),
    }));

  if (!candidates.length) return [];
  const closestDiff = Math.min(...candidates.map((player) => player.diffSeconds));
  return candidates.filter((player) => player.diffSeconds === closestDiff);
}

export function getPlayerSponsorTitles({
  playerId,
  players,
  sponsorPredictions,
  sponsorPredictionResults,
}) {
  return SPONSOR_PREDICTION_EVENTS
    .filter((event) => {
      const winners = getSponsorPredictionWinners({
        eventId: event.id,
        players,
        predictionsByUserId: sponsorPredictions?.[event.id] || {},
        result: sponsorPredictionResults?.[event.id] || null,
      });
      return winners.some((player) => player.id === playerId);
    })
    .map((event) => event.titleName);
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
