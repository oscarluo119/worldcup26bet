import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";
import { getAdminCandidates, getCurrentAdmins, matchesAdminAccountQuery } from "../lib/adminAccounts";

const players = [
  { id: "1", name: "Oscar", displayName: "Oscar Luo", email: "oscarluo119@gmail.com", isAdmin: true },
  { id: "2", name: "Alice", displayName: "Alice Chen", email: "alice@example.com", isAdmin: false },
  { id: "3", name: "Bob", displayName: "", email: "bob@example.com", isAdmin: false },
];
const appSource = readFileSync(resolve(process.cwd(), "src/App.jsx"), "utf8");

describe("admin account helpers", () => {
  test("returns only admin profiles for current admin list", () => {
    expect(getCurrentAdmins(players).map((player) => player.id)).toEqual(["1"]);
  });

  test("matches candidates by display name or email case-insensitively", () => {
    expect(matchesAdminAccountQuery(players[1], "alice")).toBe(true);
    expect(matchesAdminAccountQuery(players[1], "EXAMPLE.COM")).toBe(true);
    expect(matchesAdminAccountQuery(players[1], "oscar")).toBe(false);
  });

  test("excludes existing admins from admin candidates", () => {
    expect(getAdminCandidates(players, "").map((player) => player.id)).toEqual(["2", "3"]);
  });

  test("renders admin account UI in Chinese without temporary English copy", () => {
    expect(appSource).toContain("管理员账号");
    expect(appSource).toContain("当前管理员");
    expect(appSource).toContain("添加管理员");
    expect(appSource).not.toContain("Admin Accounts");
    expect(appSource).not.toContain("Current Admins");
    expect(appSource).not.toContain("Add Admin");
  });
});
