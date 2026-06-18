import { getTeamProfileByName } from "./teamProfiles";

const STAGE_LABELS = {
  GROUP: "小组赛",
  ROUND32: "32强赛",
  ROUND16: "16强赛",
  QUARTER: "8强赛",
  SEMI: "半决赛",
  THIRD: "三四名决赛",
  FINAL: "决赛",
};

function isSettledMatch(match) {
  return Boolean(match && match.status === "settled" && Number.isFinite(match.homeScore) && Number.isFinite(match.awayScore));
}

function buildTargetAliases(profileOrName) {
  const profile = typeof profileOrName === "string" ? getTeamProfileByName(profileOrName) : profileOrName;
  const values = [
    profile?.key,
    profile?.displayNameZh,
    profile?.teamName,
    profile?.countryCode,
    typeof profileOrName === "string" ? profileOrName : null,
  ].filter(Boolean);

  return new Set(values.map((value) => String(value).trim().toLowerCase()));
}

function isTargetTeam(value, targetAliases) {
  if (!value) return false;
  const rawValue = String(value).trim().toLowerCase();
  if (targetAliases.has(rawValue)) return true;

  const profile = getTeamProfileByName(value);
  return Boolean(
    profile &&
    [profile.key, profile.displayNameZh, profile.teamName, profile.countryCode]
      .filter(Boolean)
      .some((item) => targetAliases.has(String(item).trim().toLowerCase())),
  );
}

function getStageLabel(match) {
  return match?.group || STAGE_LABELS[match?.stage] || "本届赛事";
}

function getResultLabel(teamScore, opponentScore) {
  if (teamScore > opponentScore) return "胜";
  if (teamScore < opponentScore) return "负";
  return "平";
}

export function buildTeamTournamentRecord(profileOrName, matches = []) {
  const targetAliases = buildTargetAliases(profileOrName);
  const settledMatches = (matches || [])
    .filter(isSettledMatch)
    .map((match) => {
      const isHome = isTargetTeam(match.home, targetAliases);
      const isAway = isTargetTeam(match.away, targetAliases);
      if (!isHome && !isAway) return null;

      const teamScore = Number(isHome ? match.homeScore : match.awayScore);
      const opponentScore = Number(isHome ? match.awayScore : match.homeScore);

      return {
        id: match.id,
        kickoff: match.kickoff,
        opponent: isHome ? match.away : match.home,
        stageLabel: getStageLabel(match),
        scoreline: `${teamScore} : ${opponentScore}`,
        result: getResultLabel(teamScore, opponentScore),
        teamScore,
        opponentScore,
      };
    })
    .filter(Boolean)
    .sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime());

  const summary = settledMatches.reduce((acc, match) => {
    acc.played += 1;
    acc.goalsFor += match.teamScore;
    acc.goalsAgainst += match.opponentScore;
    if (match.result === "胜") acc.won += 1;
    else if (match.result === "负") acc.lost += 1;
    else acc.drawn += 1;
    return acc;
  }, {
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
  });

  return {
    ...summary,
    summary: `${summary.won}胜${summary.drawn}平${summary.lost}负`,
    goalsSummary: `进${summary.goalsFor}失${summary.goalsAgainst}`,
    matchResults: settledMatches.map(({ teamScore, opponentScore, ...rest }) => rest),
  };
}
