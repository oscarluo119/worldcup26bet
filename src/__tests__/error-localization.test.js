import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

const appSource = readFileSync(resolve(process.cwd(), "src/App.jsx"), "utf8");

describe("user-facing error localization wiring", () => {
  test("routes visible App error surfaces through localization helpers", () => {
    expect(appSource).not.toContain('openSnackbar(error.message, "error")');
    expect(appSource).not.toContain("setDataError(error.message);");
    expect(appSource).toContain('showUserError(error, "prediction_save")');
    expect(appSource).toContain('showUserError(error, "profile_save")');
    expect(appSource).toContain('getUserErrorMessage(error, "data_load")');
    expect(appSource).toContain('getUserErrorMessage(error, "data_refresh")');
  });
});
