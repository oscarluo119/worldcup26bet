const GROUP_TITLES = {
  H: "主胜",
  D: "平局",
  A: "客胜",
};

function getOutcome(home, away) {
  if (home > away) return "H";
  if (home < away) return "A";
  return "D";
}

function calculatePoints(prediction, match) {
  if (!prediction || match.status !== "settled") return 0;
  const predictedHome = Number(prediction.home);
  const predictedAway = Number(prediction.away);
  const actualHome = Number(match.homeScore);
  const actualAway = Number(match.awayScore);
  if ([predictedHome, predictedAway, actualHome, actualAway].some((value) => !Number.isFinite(value))) return 0;
  if (predictedHome === actualHome && predictedAway === actualAway) return 4;
  const predictedOutcome = getOutcome(predictedHome, predictedAway);
  const actualOutcome = getOutcome(actualHome, actualAway);
  if (predictedOutcome !== actualOutcome) return 0;
  const predictedDiff = predictedHome - predictedAway;
  const actualDiff = actualHome - actualAway;
  if (predictedDiff === actualDiff) return 2;
  return 1;
}

export function buildMatchPredictionGroups({ players, predictions, match, currentPlayerId }) {
  const predictionsByPlayerId = new Map();
  predictions.forEach((prediction) => {
    if (prediction.matchId === match.id) {
      predictionsByPlayerId.set(prediction.playerId, prediction);
    }
  });

  const grouped = {
    H: [],
    D: [],
    A: [],
    M: [],
  };

  players.forEach((player) => {
    const prediction = predictionsByPlayerId.get(player.id);
    const entry = {
      player,
      prediction,
      isMe: player.id === currentPlayerId,
      points: calculatePoints(prediction, match),
    };

    if (!prediction) {
      grouped.M.push(entry);
      return;
    }

    grouped[getOutcome(prediction.home, prediction.away)].push(entry);
  });

  return {
    visibleGroups: ["H", "D", "A"].map((key) => ({
      key,
      title: GROUP_TITLES[key],
      items: grouped[key],
    })).filter((group) => group.items.length > 0),
    missingCount: grouped.M.length,
  };
}

export function buildPredictionExportFileName(match) {
  const matchNo = String(match.no ?? "0").padStart(3, "0");
  return `match-${matchNo}-${match.home}-vs-${match.away}-predictions.png`;
}
