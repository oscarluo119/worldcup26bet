# Local Flags Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace externally loaded country flags with local SVG assets across match views and favorite-team flag rendering.

**Architecture:** Add a dedicated `src/lib/flags.js` module that owns local SVG imports, team-name aliases, and render fallbacks. Keep `src/App.jsx` focused on UI by switching `TeamLogo` and `FlagIcon` to consume the shared helper instead of API logos or `flagcdn.com`.

**Tech Stack:** React 18, Vite 6, Vitest 4

---

### Task 1: Lock behavior with failing tests

**Files:**
- Create: `src/__tests__/flags.test.js`
- Modify: `package.json`

- [ ] **Step 1: Write the failing test**

```js
import { describe, expect, test } from "vitest";
import { getFlagAssetByCountryCode, getFlagAssetByTeamName, getFlagRenderData } from "../lib/flags";

describe("local flags", () => {
  test("maps France by team name to a local asset", () => {
    expect(getFlagAssetByTeamName("法国")).toMatch(/fr\.svg$/);
  });

  test("maps England by special country code to a local asset", () => {
    expect(getFlagAssetByCountryCode("gb-eng")).toMatch(/gb-eng\.svg$/);
  });

  test("prefers local image rendering over emoji fallback", () => {
    expect(getFlagRenderData({ teamName: "France", countryCode: "fr", fallbackEmoji: "🇫🇷" })).toMatchObject({
      type: "image",
    });
  });

  test("app no longer references flagcdn", async () => {
    const source = await import("node:fs").then(({ readFileSync }) => readFileSync("src/App.jsx", "utf8"));
    expect(source).not.toContain("flagcdn.com");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/__tests__/flags.test.js`
Expected: FAIL because `src/lib/flags.js` does not exist and `App.jsx` still contains `flagcdn.com`.

- [ ] **Step 3: Confirm the test script exists**

```json
"scripts": {
  "dev": "vite --host 0.0.0.0",
  "build": "vite build",
  "preview": "vite preview --host 0.0.0.0",
  "check:worldcup-api": "node scripts/check-worldcup-api.mjs",
  "test": "vitest run"
}
```

- [ ] **Step 4: Re-run the targeted test**

Run: `npm test -- src/__tests__/flags.test.js`
Expected: FAIL with the same missing-helper and external-CDN assertions.

### Task 2: Add local flag assets and helper

**Files:**
- Create: `src/assets/flags/*.svg`
- Create: `src/lib/flags.js`
- Test: `src/__tests__/flags.test.js`

- [ ] **Step 1: Add the local SVG files**

Create SVG assets for every team code used by the alias map, including at minimum:

```text
ar.svg au.svg be.svg br.svg ca.svg ch.svg ci.svg co.svg cw.svg
cz.svg de.svg dz.svg ec.svg eg.svg fr.svg gh.svg hr.svg ht.svg
iq.svg ir.svg jp.svg kr.svg ma.svg mx.svg nl.svg no.svg nz.svg
pa.svg pt.svg py.svg qa.svg sa.svg se.svg sn.svg tn.svg tr.svg
us.svg uy.svg uz.svg za.svg gb-eng.svg gb-sct.svg
```

- [ ] **Step 2: Create the flag helper**

```js
import ar from "../assets/flags/ar.svg";
import au from "../assets/flags/au.svg";
import be from "../assets/flags/be.svg";
import br from "../assets/flags/br.svg";
import ca from "../assets/flags/ca.svg";
import ch from "../assets/flags/ch.svg";
import ci from "../assets/flags/ci.svg";
import co from "../assets/flags/co.svg";
import cw from "../assets/flags/cw.svg";
import cz from "../assets/flags/cz.svg";
import de from "../assets/flags/de.svg";
import dz from "../assets/flags/dz.svg";
import ec from "../assets/flags/ec.svg";
import eg from "../assets/flags/eg.svg";
import fr from "../assets/flags/fr.svg";
import gbEng from "../assets/flags/gb-eng.svg";
import gbSct from "../assets/flags/gb-sct.svg";
import gh from "../assets/flags/gh.svg";
import hr from "../assets/flags/hr.svg";
import ht from "../assets/flags/ht.svg";
import iq from "../assets/flags/iq.svg";
import ir from "../assets/flags/ir.svg";
import jp from "../assets/flags/jp.svg";
import kr from "../assets/flags/kr.svg";
import ma from "../assets/flags/ma.svg";
import mx from "../assets/flags/mx.svg";
import nl from "../assets/flags/nl.svg";
import no from "../assets/flags/no.svg";
import nz from "../assets/flags/nz.svg";
import pa from "../assets/flags/pa.svg";
import pt from "../assets/flags/pt.svg";
import py from "../assets/flags/py.svg";
import qa from "../assets/flags/qa.svg";
import sa from "../assets/flags/sa.svg";
import se from "../assets/flags/se.svg";
import sn from "../assets/flags/sn.svg";
import tn from "../assets/flags/tn.svg";
import tr from "../assets/flags/tr.svg";
import us from "../assets/flags/us.svg";
import uy from "../assets/flags/uy.svg";
import uz from "../assets/flags/uz.svg";
import za from "../assets/flags/za.svg";

const FLAG_ASSETS = {
  ar,
  au,
  be,
  br,
  ca,
  ch,
  ci,
  co,
  cw,
  cz,
  de,
  dz,
  ec,
  eg,
  fr,
  "gb-eng": gbEng,
  "gb-sct": gbSct,
  gh,
  hr,
  ht,
  iq,
  ir,
  jp,
  kr,
  ma,
  mx,
  nl,
  no,
  nz,
  pa,
  pt,
  py,
  qa,
  sa,
  se,
  sn,
  tn,
  tr,
  us,
  uy,
  uz,
  za,
};

const TEAM_NAME_TO_CODE = {
  France: "fr",
  "法国": "fr",
  Spain: "es",
  "西班牙": "es",
  Argentina: "ar",
  "阿根廷": "ar",
  England: "gb-eng",
  "英格兰": "gb-eng",
};

export function getFlagAssetByCountryCode(countryCode) {
  return FLAG_ASSETS[countryCode] || "";
}

export function getFlagAssetByTeamName(name) {
  const code = TEAM_NAME_TO_CODE[name] || "";
  return code ? getFlagAssetByCountryCode(code) : "";
}

export function getFlagRenderData({ teamName = "", countryCode = "", fallbackEmoji = "", alt = "" } = {}) {
  const src = getFlagAssetByCountryCode(countryCode) || getFlagAssetByTeamName(teamName);
  if (src) return { type: "image", src, alt: alt || teamName || countryCode };
  if (fallbackEmoji) return { type: "emoji", emoji: fallbackEmoji, alt: alt || teamName || countryCode };
  return { type: "fallback", alt: alt || teamName || countryCode };
}
```

- [ ] **Step 3: Run the targeted test to verify the helper passes**

Run: `npm test -- src/__tests__/flags.test.js`
Expected: still FAIL only on the `flagcdn.com` assertion until `App.jsx` is switched over.

### Task 3: Switch the UI to the helper

**Files:**
- Modify: `src/App.jsx`
- Test: `src/__tests__/flags.test.js`

- [ ] **Step 1: Import the helper into `App.jsx`**

```js
import { getFlagRenderData } from "./lib/flags";
```

- [ ] **Step 2: Replace `TeamLogo` to use local flag render data**

```jsx
function TeamLogo({ logo, name, size = "h-6 w-6" }) {
  const flag = getFlagRenderData({ teamName: name, fallbackEmoji: TEAM_FLAGS[name] || "" });
  if (flag.type === "image") {
    return <img src={flag.src} alt={`${name} flag`} className={`${size} rounded-full bg-slate-900 object-contain`} loading="lazy" />;
  }
  if (flag.type === "emoji") {
    return <span className={`inline-flex ${size} items-center justify-center rounded-full bg-slate-800 text-xs`}>{flag.emoji}</span>;
  }
  return <span className={`inline-flex ${size} items-center justify-center rounded-full bg-slate-800 text-xs text-slate-400`}>?</span>;
}
```

- [ ] **Step 3: Replace `FlagIcon` to use local assets**

```jsx
function FlagIcon({ team, className = "", alt = "" }) {
  const flag = getFlagRenderData({
    teamName: team?.displayNameZh || team?.teamName || "",
    countryCode: team?.countryCode || "",
    fallbackEmoji: team?.flagEmoji || "",
    alt: alt || team?.displayNameZh || team?.teamName || "",
  });

  if (flag.type === "image") {
    return <img src={flag.src} alt={flag.alt} className={className} loading="lazy" />;
  }
  if (flag.type === "emoji") {
    return <span className={cn("emoji-glyph", className)}>{flag.emoji}</span>;
  }
  return <span className={cn("emoji-glyph", className)}>🏳️</span>;
}
```

- [ ] **Step 4: Run the targeted test to verify it passes**

Run: `npm test -- src/__tests__/flags.test.js`
Expected: PASS

### Task 4: Verify the app still builds

**Files:**
- Modify: `src/lib/flags.js` or `src/App.jsx` only if build exposes gaps

- [ ] **Step 1: Run the production build**

Run: `npm run build`
Expected: PASS

- [ ] **Step 2: Run the full current test suite**

Run: `npm test`
Expected: PASS

- [ ] **Step 3: Re-run the targeted flags test**

Run: `npm test -- src/__tests__/flags.test.js`
Expected: PASS
