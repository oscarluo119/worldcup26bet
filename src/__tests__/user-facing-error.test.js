import { describe, expect, test } from "vitest";
import { normalizeUserFacingError } from "../lib/userFacingError";

describe("normalizeUserFacingError", () => {
  test("translates network failures", () => {
    expect(normalizeUserFacingError(new TypeError("Failed to fetch"), "data_load")).toMatchObject({
      message: "网络连接异常，请检查网络后重试。",
      code: "network_error",
      category: "network",
    });
  });

  test("translates permission failures", () => {
    expect(normalizeUserFacingError({ message: "new row violates row-level security policy" }, "profile_save")).toMatchObject({
      message: "你当前没有执行这项操作的权限。",
      code: "permission_denied",
      category: "permission",
    });
  });

  test("translates duplicate data failures", () => {
    expect(normalizeUserFacingError({ message: "duplicate key value violates unique constraint", code: "23505" }, "prediction_save")).toMatchObject({
      message: "这条数据已经存在了，请刷新后再试。",
      code: "duplicate_data",
      category: "conflict",
    });
  });

  test("uses chinese context fallback for unknown errors", () => {
    expect(normalizeUserFacingError({ message: "some unrecognized backend error" }, "data_refresh")).toMatchObject({
      message: "实时数据刷新失败，请稍后重试。",
      category: "unknown",
    });
  });
});
