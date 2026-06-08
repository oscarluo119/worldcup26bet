# Hide Camp Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hide all camp-vs-camp UI and admin assignment UI globally while keeping existing database fields, RPCs, and summary logic intact.

**Architecture:** Remove the visible entry points in `src/App.jsx` instead of deleting the underlying camp data model. Add a small regression test that checks the file no longer mounts the camp battle tab, player profile camp section, or admin camp assignment card.

**Tech Stack:** React 18, Vite 6, Vitest

---

### Task 1: Add Regression Test Coverage

**Files:**
- Modify: `package.json`
- Create: `src/__tests__/camp-visibility.test.js`

- [ ] **Step 1: Write the failing test**

```js
import { describe, expect, test } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const appSource = readFileSync(resolve(process.cwd(), "src/App.jsx"), "utf8");

describe("camp UI visibility", () => {
  test("does not expose the camp battle tab", () => {
    expect(appSource).not.toContain('{ id: "campBattle"');
  });

  test("does not mount the camp battle panel", () => {
    expect(appSource).not.toContain('activeTab === "campBattle"');
  });

  test("does not render the player profile camp contribution card", () => {
    expect(appSource).not.toContain("阵营贡献");
  });

  test("does not render the admin camp assignment card", () => {
    expect(appSource).not.toContain("<AdminCampAssignmentCard");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/camp-visibility.test.js`
Expected: FAIL because `src/App.jsx` still contains camp tab and camp UI strings.

- [ ] **Step 3: Add the test script**

```json
"scripts": {
  "dev": "vite --host 0.0.0.0",
  "build": "vite build",
  "preview": "vite preview --host 0.0.0.0",
  "check:worldcup-api": "node scripts/check-worldcup-api.mjs",
  "test": "vitest run"
}
```

- [ ] **Step 4: Run test again through the script**

Run: `npm test -- src/__tests__/camp-visibility.test.js`
Expected: FAIL with the same camp UI assertions.

### Task 2: Remove Camp UI Entry Points

**Files:**
- Modify: `src/App.jsx`
- Test: `src/__tests__/camp-visibility.test.js`

- [ ] **Step 1: Remove the navigation entry and mounted panel**

```jsx
const tabs = [
  { id: "home", label: "首页", icon: Home },
  { id: "schedule", label: "赛程竞猜", icon: CalendarDays },
  { id: "completeSchedule", label: "完整赛程", icon: CalendarDays },
  { id: "worldCupStandings", label: "世界杯排名", icon: Medal },
  { id: "ranking", label: "竞猜排行榜", icon: Trophy },
  { id: "fun", label: "趣味预测", icon: Flame },
  { id: "achievements", label: "成就墙", icon: Crown },
  { id: "rules", label: "规则", icon: ShieldCheck },
  { id: "playerProfile", label: "个人主页", icon: Users },
  { id: "admin", label: "管理", icon: Settings, adminOnly: true },
];
```

```jsx
{activeTab === "ranking" && <RankingPanel ... />}
{isAdmin && activeTab === "admin" && <AdminPanel ... />}
{activeTab === "rules" && <RulesPanel />}
```

- [ ] **Step 2: Remove the player profile camp contribution block**

```jsx
<div className="grid gap-5 lg:grid-cols-3">
  <Card>
    <h3 className="mb-4 text-xl font-black">预测风格</h3>
    ...
  </Card>
  <Card className="lg:col-span-2">
    <h3 className="mb-4 text-xl font-black">目前获得的称号</h3>
    ...
  </Card>
</div>
```

- [ ] **Step 3: Remove the admin camp assignment card from the admin page**

```jsx
return (
  <section className="mt-6 space-y-5">
    <FunResultsCard funResults={funResults} onSetFunResults={onSetFunResults} />
    <Card>
      ...
    </Card>
  </section>
);
```

- [ ] **Step 4: Run the targeted test to verify it passes**

Run: `npm test -- src/__tests__/camp-visibility.test.js`
Expected: PASS

### Task 3: Verify the App Still Builds

**Files:**
- Modify: `src/App.jsx` (only if build surfaces dead references)

- [ ] **Step 1: Run the production build**

Run: `npm run build`
Expected: Vite build completes successfully.

- [ ] **Step 2: Fix any dead references left by the UI removal**

```jsx
// Remove unused props or variables only if the build or parser requires it.
```

- [ ] **Step 3: Re-run build and the targeted test**

Run: `npm test -- src/__tests__/camp-visibility.test.js`
Expected: PASS

Run: `npm run build`
Expected: PASS
