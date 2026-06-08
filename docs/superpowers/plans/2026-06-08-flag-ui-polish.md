# Flag UI Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove dark framing and rounded corners from local flag rendering, and display flags in a consistent rectangular container.

**Architecture:** Keep the local flag mapping intact and only adjust rendering classes in `src/App.jsx`. Lock the styling change with a small source-level Vitest regression so the external look stays consistent.

**Tech Stack:** React 18, Vite 6, Vitest 4

---

### Task 1: Add a failing style regression test

**Files:**
- Modify: `src/__tests__/flags.test.js`

- [ ] **Step 1: Write the failing test**

```js
test("app removes dark framed flag treatments", () => {
  expect(appSource).not.toContain("rounded-full bg-slate-900 object-contain");
  expect(appSource).not.toContain("rounded-[3px] object-cover shadow-sm");
  expect(appSource).not.toContain("rounded-[4px] object-cover shadow-sm");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/__tests__/flags.test.js`
Expected: FAIL because the old dark/rounded flag classes are still present in `src/App.jsx`.

### Task 2: Switch to clean rectangular flag containers

**Files:**
- Modify: `src/App.jsx`
- Test: `src/__tests__/flags.test.js`

- [ ] **Step 1: Change `TeamLogo` to a rectangular transparent flag**

```jsx
function TeamLogo({ logo, name, size = "h-4 w-6" }) {
  ...
  if (flag.type === "image") return <img src={flag.src} alt={flag.alt} className={`${size} object-cover`} loading="lazy" />;
  if (flag.type === "emoji") return <span className={`inline-flex ${size} items-center justify-center text-xs`}>{flag.emoji}</span>;
  return <span className={`inline-flex ${size} items-center justify-center text-xs text-slate-400`}>?</span>;
}
```

- [ ] **Step 2: Remove rounded corners and shadow from `FlagIcon` usages**

```jsx
{favoriteTeam ? <FlagIcon team={favoriteTeam} alt={favoriteTeam.displayNameZh} className="h-[1.2em] w-[1.6em] object-cover" /> : ...}
```

```jsx
<FlagIcon team={team} alt={team.displayNameZh} className="h-6 w-9 object-cover sm:h-7 sm:w-10" />
```

- [ ] **Step 3: Run the targeted test to verify it passes**

Run: `npm test -- src/__tests__/flags.test.js`
Expected: PASS

### Task 3: Verify build output

**Files:**
- Modify: `src/App.jsx` only if verification surfaces additional layout issues

- [ ] **Step 1: Run the current test suite**

Run: `npm test`
Expected: PASS

- [ ] **Step 2: Run the production build**

Run: `npm run build`
Expected: PASS
