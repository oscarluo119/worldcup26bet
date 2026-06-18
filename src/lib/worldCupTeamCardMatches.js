function getWorldCupResultKey(match) {
  return match?.resultId || Number(match?.fixtureId) || Number(match?.id) || match?.no;
}

function isSettledWorldCupResult(result) {
  return Boolean(result && Number.isFinite(result.homeScore) && Number.isFinite(result.awayScore));
}

function isSettledMatch(match) {
  return Boolean(match && match.status === "settled" && Number.isFinite(match.homeScore) && Number.isFinite(match.awayScore));
}

function buildFallbackMatchMap(matches = []) {
  return new Map(
    (matches || []).map((match) => [String(match?.id || match?.no || ""), match]),
  );
}

export function buildWorldCupTeamCardMatches(schedule = [], results = {}, fallbackMatches = []) {
  const fallbackMatchMap = buildFallbackMatchMap(fallbackMatches);

  return (schedule || []).map((match) => {
    const result = results[getWorldCupResultKey(match)];

    if (!isSettledWorldCupResult(result)) {
      const fallbackMatch = fallbackMatchMap.get(String(match?.id || match?.no || ""));
      return isSettledMatch(fallbackMatch) ? { ...match, ...fallbackMatch } : match;
    }

    return {
      ...match,
      status: "settled",
      homeScore: result.homeScore,
      awayScore: result.awayScore,
    };
  });
}
