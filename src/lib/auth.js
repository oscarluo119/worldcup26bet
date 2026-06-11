export function normalizeAuthError(error, mode = "login") {
  const rawMessage = String(error?.message || "").trim();
  const message = rawMessage.toLowerCase();

  if (mode === "register" && message.includes("email rate limit exceeded")) {
    return {
      message: "这个邮箱刚刚触发了注册邮件频率限制。如果你已经注册过，请直接登录；否则请稍后再试。",
      nextMode: "login",
    };
  }

  if (mode === "register" && message.includes("user already registered")) {
    return {
      message: "这个邮箱已经注册过了，请直接登录。",
      nextMode: "login",
    };
  }

  if (message.includes("invalid login credentials")) {
    return {
      message: "邮箱或密码不正确，请检查后重试。",
      nextMode: mode,
    };
  }

  if (message.includes("email not confirmed")) {
    return {
      message: "这个邮箱还没有完成验证，请先去邮箱完成验证后再登录。",
      nextMode: mode,
    };
  }

  return {
    message: rawMessage || "操作失败，请稍后再试",
    nextMode: mode,
  };
}
