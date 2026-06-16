export function matchesDeleteUserQuery(player, query) {
  const normalizedQuery = String(query || "").trim().toLowerCase();
  if (!normalizedQuery) return true;

  return [player?.displayName, player?.name, player?.email]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(normalizedQuery));
}

export function getDeletableUsers(players, query, currentUserId) {
  return (players || []).filter((player) => (
    player?.id
    && player.id !== currentUserId
    && matchesDeleteUserQuery(player, query)
  ));
}
