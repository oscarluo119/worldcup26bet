import { describe, expect, test } from "vitest";
import { normalizeAuthError } from "../lib/auth";

describe("normalizeAuthError", () => {
  test("turns register email rate limits into a login-oriented hint", () => {
    expect(normalizeAuthError({ message: "email rate limit exceeded" }, "register")).toMatchObject({
      message: "这个邮箱刚刚触发了注册邮件频率限制。如果你已经注册过，请直接登录；否则请稍后再试。",
      nextMode: "login",
      code: "email_rate_limit",
      category: "auth",
    });
  });

  test("turns already registered errors into a login hint", () => {
    expect(normalizeAuthError({ message: "User already registered" }, "register")).toMatchObject({
      message: "这个邮箱已经注册过了，请直接登录。",
      nextMode: "login",
      code: "user_already_registered",
      category: "auth",
    });
  });

  test("keeps invalid credential errors actionable", () => {
    expect(normalizeAuthError({ message: "Invalid login credentials" }, "login")).toMatchObject({
      message: "邮箱或密码不正确，请检查后重试。",
      nextMode: "login",
      code: "invalid_login_credentials",
      category: "auth",
    });
  });

  test("translates email confirmation errors", () => {
    expect(normalizeAuthError({ message: "Email not confirmed" }, "login")).toMatchObject({
      message: "这个邮箱还没有完成验证，请先去邮箱完成验证后再登录。",
      nextMode: "login",
      code: "email_not_confirmed",
      category: "auth",
    });
  });

  test("translates weak password errors", () => {
    expect(normalizeAuthError({ message: "Password should be at least 6 characters" }, "register")).toMatchObject({
      message: "密码强度不够，请使用至少 6 位并更安全的密码。",
      nextMode: "register",
      code: "weak_password",
      category: "auth",
    });
  });
});
