import { describe, expect, test, vi } from "vitest";
import { createProfileRecord } from "../lib/profileRecords";

describe("createProfileRecord", () => {
  test("throws when sign-up profile persistence fails", async () => {
    const insert = vi.fn().mockResolvedValue({ error: { code: "42501", message: "row-level security" } });
    const from = vi.fn(() => ({ insert }));
    const supabase = { from };

    await expect(createProfileRecord({
      supabase,
      userId: "user-1",
      email: "test@example.com",
      username: "Tester",
      avatarEmoji: ":)",
    })).rejects.toMatchObject({
      code: "42501",
    });

    expect(from).toHaveBeenCalledWith("profiles");
    expect(insert).toHaveBeenCalled();
  });
});
