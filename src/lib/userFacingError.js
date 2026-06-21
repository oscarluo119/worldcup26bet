function toLowerMessage(error) {
  return String(error?.message || error?.error_description || error?.details || "").trim().toLowerCase();
}

function getErrorCode(error) {
  return String(error?.code || error?.status || "").trim().toLowerCase();
}

function getContextFallback(context) {
  const fallbacks = {
    auth_login: "登录失败，请稍后重试。",
    auth_register: "注册失败，请稍后重试。",
    data_load: "数据加载失败，请稍后重试。",
    data_refresh: "实时数据刷新失败，请稍后重试。",
    prediction_save: "竞猜提交失败，请稍后重试。",
    match_result_save: "比赛结果保存失败，请稍后重试。",
    match_result_clear: "比赛结果清除失败，请稍后重试。",
    match_lock_save: "比赛锁定状态更新失败，请稍后重试。",
    fun_prediction_save: "趣味预测提交失败，请稍后重试。",
    fun_results_save: "趣味预测答案保存失败，请稍后重试。",
    sponsor_prediction_save: "冠名预测提交失败，请稍后重试。",
    sponsor_prediction_result_save: "冠名预测答案保存失败，请稍后重试。",
    profile_save: "个人资料更新失败，请稍后重试。",
    user_camp_save: "阵营分配更新失败，请稍后重试。",
    user_admin_save: "管理员权限更新失败，请稍后重试。",
    user_delete: "删除用户失败，请稍后重试。",
    general: "操作失败，请稍后重试。",
  };

  return fallbacks[context] || fallbacks.general;
}

function buildResult(message, { rawMessage, code = "unknown_error", category = "unknown" } = {}) {
  return {
    message,
    rawMessage: rawMessage || "",
    code,
    category,
  };
}

export function normalizeUserFacingError(error, context = "general") {
  const rawMessage = String(error?.message || error?.error_description || error?.details || "").trim();
  const message = toLowerMessage(error);
  const code = getErrorCode(error);

  if (!rawMessage && error instanceof TypeError) {
    return buildResult("网络连接异常，请检查网络后重试。", {
      rawMessage,
      code: "network_error",
      category: "network",
    });
  }

  if (
    code === "prediction_locked"
    || message.includes("prediction_locked")
  ) {
    return buildResult("比赛已锁定，不能再修改预测。", {
      rawMessage,
      code: "prediction_locked",
      category: "validation",
    });
  }

  if (
    code === "session_missing"
    || message.includes("session_missing")
  ) {
    return buildResult("登录状态已失效，请重新登录后再试。", {
      rawMessage,
      code: "session_missing",
      category: "auth",
    });
  }

  if (
    code === "invalid_prediction_input"
    || message.includes("invalid_prediction_input")
  ) {
    return buildResult("提交的比分格式不正确，请检查后重试。", {
      rawMessage,
      code: "invalid_prediction_input",
      category: "validation",
    });
  }

  if (
    code === "profile_not_ready"
    || message.includes("profile_not_ready")
  ) {
    return buildResult("账号资料还没初始化完成，请重新登录后再试。", {
      rawMessage,
      code: "profile_not_ready",
      category: "data",
    });
  }

  if (
    error instanceof TypeError
    || message.includes("failed to fetch")
    || message.includes("networkerror")
    || message.includes("load failed")
    || message.includes("network request failed")
  ) {
    return buildResult("网络连接异常，请检查网络后重试。", {
      rawMessage,
      code: "network_error",
      category: "network",
    });
  }

  if (message.includes("email not confirmed")) {
    return buildResult("这个邮箱还没有完成验证，请先去邮箱完成验证后再登录。", {
      rawMessage,
      code: "email_not_confirmed",
      category: "auth",
    });
  }

  if (message.includes("invalid login credentials")) {
    return buildResult("邮箱或密码不正确，请检查后重试。", {
      rawMessage,
      code: "invalid_login_credentials",
      category: "auth",
    });
  }

  if (message.includes("email rate limit exceeded")) {
    return buildResult("这个邮箱刚刚触发了邮件发送频率限制，请稍后再试。", {
      rawMessage,
      code: "email_rate_limit",
      category: "auth",
    });
  }

  if (message.includes("user already registered")) {
    return buildResult("这个邮箱已经注册过了，请直接登录。", {
      rawMessage,
      code: "user_already_registered",
      category: "auth",
    });
  }

  if (
    message.includes("password should be at least")
    || message.includes("weak password")
    || message.includes("password is too weak")
  ) {
    return buildResult("密码强度不够，请使用至少 6 位并更安全的密码。", {
      rawMessage,
      code: "weak_password",
      category: "auth",
    });
  }

  if (
    message.includes("unable to validate email address")
    || message.includes("invalid email")
    || message.includes("email address is invalid")
  ) {
    return buildResult("邮箱格式看起来不正确，请检查后再试。", {
      rawMessage,
      code: "invalid_email",
      category: "auth",
    });
  }

  if (
    message.includes("jwt expired")
    || message.includes("refresh token not found")
    || message.includes("invalid refresh token")
    || message.includes("session not found")
  ) {
    return buildResult("登录状态已失效，请重新登录后再试。", {
      rawMessage,
      code: "session_expired",
      category: "auth",
    });
  }

  if (
    code === "cannot_delete_self"
    || message.includes("cannot_delete_self")
  ) {
    return buildResult("不能删除你当前登录的管理员账号。", {
      rawMessage,
      code: "cannot_delete_self",
      category: "permission",
    });
  }

  if (
    code === "last_admin_protected"
    || message.includes("last_admin_protected")
  ) {
    return buildResult("系统至少要保留一位管理员，暂时不能删除该账号。", {
      rawMessage,
      code: "last_admin_protected",
      category: "permission",
    });
  }

  if (
    code === "user_not_found"
    || message.includes("user_not_found")
  ) {
    return buildResult("没有找到要删除的用户，请刷新后重试。", {
      rawMessage,
      code: "user_not_found",
      category: "data",
    });
  }

  if (
    message.includes("admin access required")
    || message.includes("permission denied")
    || message.includes("row-level security")
    || message.includes("not authorized")
    || message.includes("forbidden")
    || code === "admin_required"
    || code === "42501"
  ) {
    return buildResult("你当前没有执行这项操作的权限。", {
      rawMessage,
      code: code === "admin_required" ? "admin_required" : "permission_denied",
      category: "permission",
    });
  }

  if (
    message.includes("duplicate key")
    || message.includes("already exists")
    || code === "23505"
  ) {
    return buildResult("这条数据已经存在了，请刷新后再试。", {
      rawMessage,
      code: "duplicate_data",
      category: "conflict",
    });
  }

  if (
    (context === "prediction_save" && code === "23503")
    || (context === "prediction_save" && message.includes("violates foreign key constraint"))
  ) {
    return buildResult("账号资料还没初始化完成，请重新登录后再试。", {
      rawMessage,
      code: "profile_not_ready",
      category: "data",
    });
  }

  if (
    message.includes("violates foreign key constraint")
    || code === "23503"
  ) {
    return buildResult("关联数据不存在或已变化，请刷新后再试。", {
      rawMessage,
      code: "reference_error",
      category: "data",
    });
  }

  if (
    message.includes("violates check constraint")
    || code === "23514"
    || code === "22p02"
  ) {
    return buildResult("提交的数据格式不正确，请检查后再试。", {
      rawMessage,
      code: "invalid_data",
      category: "data",
    });
  }

  if (
    message.includes("no rows found")
    || code === "pgrst116"
  ) {
    return buildResult("没有找到对应的数据，请刷新页面后再试。", {
      rawMessage,
      code: "not_found",
      category: "data",
    });
  }

  return buildResult(getContextFallback(context), {
    rawMessage,
    code: code || "unknown_error",
    category: "unknown",
  });
}
