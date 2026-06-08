export function matchesAdminAccountQuery(player, query) {
  const normalizedQuery = String(query || "").trim().toLowerCase();
  if (!normalizedQuery) return true;

  return [player?.displayName, player?.name, player?.email]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(normalizedQuery));
}

export function getCurrentAdmins(players) {
  return players.filter((player) => Boolean(player?.isAdmin));
}

export function getAdminCandidates(players, query) {
  return players.filter((player) => !player?.isAdmin && matchesAdminAccountQuery(player, query));
}
