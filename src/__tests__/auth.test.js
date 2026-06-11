import { describe, expect, test } from "vitest";
import { normalizeAuthError } from "../lib/auth";

describe("normalizeAuthError", () => {
  test("turns register email rate limits into a login-oriented hint", () => {
    expect(normalizeAuthError({ message: "email rate limit exceeded" }, "register")).toEqual({
      message: "这个邮箱刚刚触发了注册邮件频率限制。如果你已经注册过，请直接登录；否则请稍后再试。",
      nextMode: "login",
    });
  });

  test("turns already registered errors into a login hint", () => {
    expect(normalizeAuthError({ message: "User already registered" }, "register")).toEqual({
      message: "这个邮箱已经注册过了，请直接登录。",
      nextMode: "login",
    });
  });

  test("keeps invalid credential errors actionable", () => {
    expect(normalizeAuthError({ message: "Invalid login credentials" }, "login")).toEqual({
      message: "邮箱或密码不正确，请检查后重试。",
      nextMode: "login",
    });
  });
});
