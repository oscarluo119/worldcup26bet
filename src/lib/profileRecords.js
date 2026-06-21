export async function createProfileRecord({
  supabase,
  userId,
  email,
  username,
  avatarEmoji,
}) {
  const { error } = await supabase.from("profiles").insert({
    id: userId,
    email,
    username,
    avatar_emoji: avatarEmoji,
  });

  if (error) throw error;
}

export async function ensureProfileRecord({
  supabase,
  user,
  getDisplayName,
  defaultAvatarEmoji,
}) {
  const email = user.email || "";
  const { data: existing, error: selectError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (selectError) throw selectError;
  if (existing) return;

  await createProfileRecord({
    supabase,
    userId: user.id,
    email,
    username: getDisplayName(user),
    avatarEmoji: user.user_metadata?.avatar_emoji || defaultAvatarEmoji,
  });
}
