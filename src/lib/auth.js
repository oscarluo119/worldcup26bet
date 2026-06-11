import { normalizeUserFacingError } from "./userFacingError";

export function normalizeAuthError(error, mode = "login") {
  const normalized = normalizeUserFacingError(error, mode === "register" ? "auth_register" : "auth_login");
  const message = String(error?.message || "").trim().toLowerCase();

  if (mode === "register" && message.includes("email rate limit exceeded")) {
    return {
      ...normalized,
      message: "这个邮箱刚刚触发了注册邮件频率限制。如果你已经注册过，请直接登录；否则请稍后再试。",
      nextMode: "login",
    };
  }

  if (mode === "register" && message.includes("user already registered")) {
    return {
      ...normalized,
      message: "这个邮箱已经注册过了，请直接登录。",
      nextMode: "login",
    };
  }

  return {
    ...normalized,
    nextMode: mode,
  };
}
