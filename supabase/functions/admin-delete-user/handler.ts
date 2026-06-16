export class DeleteUserError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = "DeleteUserError";
    this.code = code;
    this.status = status;
  }
}

type ProfileRow = {
  id: string;
  is_admin: boolean | null;
};

type DeleteUserDeps = {
  getActorProfile: (userId: string) => Promise<ProfileRow | null>;
  getTargetProfile: (userId: string) => Promise<ProfileRow | null>;
  countAdmins: () => Promise<number>;
  deleteAuthUser: (userId: string) => Promise<void>;
};

type DeleteUserInput = {
  actorUserId: string;
  targetUserId: string;
};

export async function deleteUserAsAdmin(deps: DeleteUserDeps, input: DeleteUserInput) {
  const actorUserId = String(input?.actorUserId || "").trim();
  const targetUserId = String(input?.targetUserId || "").trim();

  if (!actorUserId) {
    throw new DeleteUserError("session_required", "session_required", 401);
  }

  if (!targetUserId) {
    throw new DeleteUserError("invalid_request", "invalid_request", 400);
  }

  const actorProfile = await deps.getActorProfile(actorUserId);
  if (!actorProfile || !actorProfile.is_admin) {
    throw new DeleteUserError("admin_required", "admin_required", 403);
  }

  if (actorUserId === targetUserId) {
    throw new DeleteUserError("cannot_delete_self", "cannot_delete_self", 400);
  }

  const targetProfile = await deps.getTargetProfile(targetUserId);
  if (!targetProfile) {
    throw new DeleteUserError("user_not_found", "user_not_found", 404);
  }

  if (targetProfile.is_admin) {
    const adminCount = await deps.countAdmins();
    if (adminCount <= 1) {
      throw new DeleteUserError("last_admin_protected", "last_admin_protected", 400);
    }
  }

  await deps.deleteAuthUser(targetUserId);

  return {
    success: true,
    deletedUserId: targetUserId,
  };
}
