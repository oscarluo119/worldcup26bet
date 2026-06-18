const STAGE_MULTIPLIERS = {
  GROUP: 1,
  R32: 2,
  R16: 2,
  QF: 4,
  SF: 8,
  THIRD: 8,
  FINAL: 16,
};

function isSettledMatch(match) {
  return Boolean(match && match.status === "settled" && Number.isFinite(match.homeScore) && Number.isFinite(match.awayScore));
}

function getOutcome(home, away) {
  if (home > away) return "H";
  if (home < away) return "A";
  return "D";
}

function calculateBasePoints(prediction, match) {
  if (!prediction || !isSettledMatch(match)) return 0;
  if (prediction.home === match.homeScore && prediction.away === match.awayScore) return 4;
  if (getOutcome(match.homeScore, match.awayScore) !== getOutcome(prediction.home, prediction.away)) return 0;
  return match.homeScore - match.awayScore === prediction.home - prediction.away ? 2 : 1;
}

function calculatePoints(prediction, match) {
  if (!match) return 0;
  return calculateBasePoints(prediction, match) * (STAGE_MULTIPLIERS[match.stage] || 1);
}

function formatPointsLabel(points) {
  if (!Number.isFinite(points)) return "未提交";
  return points > 0 ? `+${points}` : String(points);
}

function formatAverageLabel(points) {
  if (!Number.isFinite(points)) return "暂无均分";
  return points.toFixed(1).replace(/\.0$/, "");
}

function formatPredictionLabel(prediction) {
  return prediction ? `${prediction.home}:${prediction.away}` : "未提交";
}

function formatResultLabel(match) {
  return isSettledMatch(match) ? `${match.homeScore}:${match.awayScore}` : "待结算";
}

export function buildScheduleMatchSummary({ match, currentPrediction, predictions = [] }) {
  const hasSettledResult = isSettledMatch(match);
  const submittedPredictions = (predictions || []).filter((prediction) => prediction?.matchId === match?.id);
  const submittedPredictionCount = submittedPredictions.length;

  if (!hasSettledResult) {
    return {
      hasSettledResult,
      myPredictionLabel: formatPredictionLabel(currentPrediction),
      myPoints: null,
      averagePoints: null,
      submittedPredictionCount,
      resultLabel: formatResultLabel(match),
      myPointsLabel: "待结算",
      averagePointsLabel: "待结算",
    };
  }

  const myPoints = currentPrediction ? calculatePoints(currentPrediction, match) : null;
  const totalPoints = submittedPredictions.reduce((sum, prediction) => sum + calculatePoints(prediction, match), 0);
  const averagePoints = submittedPredictionCount ? totalPoints / submittedPredictionCount : null;

  return {
    hasSettledResult,
    myPredictionLabel: formatPredictionLabel(currentPrediction),
    myPoints,
    averagePoints,
    submittedPredictionCount,
    resultLabel: formatResultLabel(match),
    myPointsLabel: currentPrediction ? formatPointsLabel(myPoints) : "未提交",
    averagePointsLabel: formatAverageLabel(averagePoints),
  };
}
