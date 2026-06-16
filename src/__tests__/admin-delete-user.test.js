import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";
import { getDeletableUsers, matchesDeleteUserQuery } from "../lib/adminDeleteUsers";

const players = [
  { id: "1", name: "Oscar", displayName: "Oscar Luo", email: "oscarluo119@gmail.com", isAdmin: true },
  { id: "2", name: "Alice", displayName: "Alice Chen", email: "alice@example.com", isAdmin: false },
  { id: "3", name: "Bob", displayName: "", email: "bob@example.com", isAdmin: false },
];

const appSource = readFileSync(resolve(process.cwd(), "src/App.jsx"), "utf8");

describe("admin delete user helpers", () => {
  test("matches delete candidates by display name or email case-insensitively", () => {
    expect(matchesDeleteUserQuery(players[1], "alice")).toBe(true);
    expect(matchesDeleteUserQuery(players[1], "EXAMPLE.COM")).toBe(true);
    expect(matchesDeleteUserQuery(players[1], "oscar")).toBe(false);
  });

  test("excludes the current user from deletable candidates", () => {
    expect(getDeletableUsers(players, "", "1").map((player) => player.id)).toEqual(["2", "3"]);
  });

  test("renders delete-user UI in chinese and invokes the edge function", () => {
    expect(appSource).toContain('supabase.functions.invoke("admin-delete-user"');
    expect(appSource).toContain("删除用户");
    expect(appSource).toContain("账号及关联数据将被永久删除");
    expect(appSource).not.toContain("Delete User");
  });
});
