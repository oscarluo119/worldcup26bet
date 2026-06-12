import { buildEmptyBookmakers } from "./matchOdds";
import { getTeamProfileByName } from "./teamProfiles";

export function buildMatchInsights(match) {
  const homeProfile = getTeamProfileByName(match?.home || "");
  const awayProfile = getTeamProfileByName(match?.away || "");

  return {
    previewPoints: [],
    bookmakers: buildEmptyBookmakers(),
    probabilities: null,
    homeProfile,
    awayProfile,
  };
}
