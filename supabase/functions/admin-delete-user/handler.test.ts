import { describe, expect, test, vi } from "vitest";
import { DeleteUserError, deleteUserAsAdmin } from "./handler";

describe("deleteUserAsAdmin", () => {
  test("rejects non-admin callers", async () => {
    await expect(deleteUserAsAdmin({
      getActorProfile: vi.fn().mockResolvedValue({ id: "actor-1", is_admin: false }),
      getTargetProfile: vi.fn(),
      countAdmins: vi.fn(),
      deleteAuthUser: vi.fn(),
    }, {
      actorUserId: "actor-1",
      targetUserId: "target-1",
    })).rejects.toMatchObject({
      code: "admin_required",
      status: 403,
    } satisfies Partial<DeleteUserError>);
  });

  test("rejects deleting yourself", async () => {
    await expect(deleteUserAsAdmin({
      getActorProfile: vi.fn().mockResolvedValue({ id: "actor-1", is_admin: true }),
      getTargetProfile: vi.fn(),
      countAdmins: vi.fn(),
      deleteAuthUser: vi.fn(),
    }, {
      actorUserId: "actor-1",
      targetUserId: "actor-1",
    })).rejects.toMatchObject({
      code: "cannot_delete_self",
      status: 400,
    } satisfies Partial<DeleteUserError>);
  });

  test("rejects deleting the last remaining admin", async () => {
    const deleteAuthUser = vi.fn();

    await expect(deleteUserAsAdmin({
      getActorProfile: vi.fn().mockResolvedValue({ id: "actor-1", is_admin: true }),
      getTargetProfile: vi.fn().mockResolvedValue({ id: "target-1", is_admin: true }),
      countAdmins: vi.fn().mockResolvedValue(1),
      deleteAuthUser,
    }, {
      actorUserId: "actor-1",
      targetUserId: "target-1",
    })).rejects.toMatchObject({
      code: "last_admin_protected",
      status: 400,
    } satisfies Partial<DeleteUserError>);

    expect(deleteAuthUser).not.toHaveBeenCalled();
  });

  test("rejects missing target users", async () => {
    await expect(deleteUserAsAdmin({
      getActorProfile: vi.fn().mockResolvedValue({ id: "actor-1", is_admin: true }),
      getTargetProfile: vi.fn().mockResolvedValue(null),
      countAdmins: vi.fn(),
      deleteAuthUser: vi.fn(),
    }, {
      actorUserId: "actor-1",
      targetUserId: "target-404",
    })).rejects.toMatchObject({
      code: "user_not_found",
      status: 404,
    } satisfies Partial<DeleteUserError>);
  });

  test("deletes a normal user when the caller is an admin", async () => {
    const deleteAuthUser = vi.fn().mockResolvedValue(undefined);

    await expect(deleteUserAsAdmin({
      getActorProfile: vi.fn().mockResolvedValue({ id: "actor-1", is_admin: true }),
      getTargetProfile: vi.fn().mockResolvedValue({ id: "target-1", is_admin: false }),
      countAdmins: vi.fn(),
      deleteAuthUser,
    }, {
      actorUserId: "actor-1",
      targetUserId: "target-1",
    })).resolves.toEqual({
      success: true,
      deletedUserId: "target-1",
    });

    expect(deleteAuthUser).toHaveBeenCalledWith("target-1");
  });
});
