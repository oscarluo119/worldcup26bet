import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getFlagRenderData } from "../lib/flags";
import { buildTeamTournamentRecord } from "../lib/teamTournamentRecord";
import { TEAM_PROFILE_DIMENSIONS, getTeamProfileByCountryCode, getTeamProfileByName } from "../lib/teamProfiles";

function joinClasses(...classes) {
  return classes.filter(Boolean).join(" ");
}

function buildRadarPoints(profile, center, radius) {
  return TEAM_PROFILE_DIMENSIONS.map((dimension, index) => {
    const value = profile?.ratings?.[index] ?? 0;
    const angle = (-Math.PI / 2) + (index * (Math.PI * 2 / TEAM_PROFILE_DIMENSIONS.length));
    const scaled = radius * (value / 100);
    const x = center + Math.cos(angle) * scaled;
    const y = center + Math.sin(angle) * scaled;
    return `${x},${y}`;
  }).join(" ");
}

function RadarGraphic({
  profiles,
  size = 152,
  radius = 54,
  lineRadius = 56,
  ringRadii = [18, 34, 50, 54],
  labelOffset = 0,
  canvasPadding = 0,
}) {
  const totalSize = size + (canvasPadding * 2);
  const center = totalSize / 2;
  const pointSets = useMemo(
    () =>
      profiles.filter(Boolean).map((profile) => ({
        key: profile.key || profile.displayNameZh,
        profile,
        points: buildRadarPoints(profile, center, radius),
      })),
    [center, profiles, radius],
  );

  const palette = [
    {
      fill: "rgba(52, 211, 153, 0.26)",
      stroke: "rgba(110,231,183,0.9)",
      dot: "rgba(167,243,208,1)",
    },
    {
      fill: "rgba(56, 189, 248, 0.2)",
      stroke: "rgba(125, 211, 252, 0.96)",
      dot: "rgba(186, 230, 253, 1)",
    },
  ];

  return (
    <svg viewBox={`0 0 ${totalSize} ${totalSize}`} className="h-full w-full shrink-0 overflow-visible">
      {ringRadii.map((ring, index) => (
        <polygon
          key={ring}
          points={TEAM_PROFILE_DIMENSIONS.map((_, pointIndex) => {
            const angle = (-Math.PI / 2) + (pointIndex * (Math.PI * 2 / TEAM_PROFILE_DIMENSIONS.length));
            return `${center + Math.cos(angle) * ring},${center + Math.sin(angle) * ring}`;
          }).join(" ")}
          fill="none"
          stroke={index === ringRadii.length - 1 ? "rgba(110,231,183,0.2)" : "rgba(148,163,184,0.12)"}
          strokeWidth="1"
        />
      ))}
      {TEAM_PROFILE_DIMENSIONS.map((_, index) => {
        const angle = (-Math.PI / 2) + (index * (Math.PI * 2 / TEAM_PROFILE_DIMENSIONS.length));
        return (
          <line
            key={index}
            x1={center}
            y1={center}
            x2={center + Math.cos(angle) * lineRadius}
            y2={center + Math.sin(angle) * lineRadius}
            stroke="rgba(148,163,184,0.14)"
            strokeWidth="1"
          />
        );
      })}
      {pointSets.map((item, profileIndex) => (
        <g key={item.key}>
          <polygon points={item.points} fill={palette[profileIndex]?.fill || palette[0].fill} stroke={palette[profileIndex]?.stroke || palette[0].stroke} strokeWidth="2.5" />
          {TEAM_PROFILE_DIMENSIONS.map((dimension, index) => {
            const angle = (-Math.PI / 2) + (index * (Math.PI * 2 / TEAM_PROFILE_DIMENSIONS.length));
            return (
              <circle
                key={`${item.key}-${dimension.key}`}
                cx={center + Math.cos(angle) * (radius * ((item.profile?.ratings?.[index] ?? 0) / 100))}
                cy={center + Math.sin(angle) * (radius * ((item.profile?.ratings?.[index] ?? 0) / 100))}
                r="2.75"
                fill={palette[profileIndex]?.dot || palette[0].dot}
              />
            );
          })}
        </g>
      ))}
      {labelOffset > 0
        ? TEAM_PROFILE_DIMENSIONS.map((dimension, index) => {
            const angle = (-Math.PI / 2) + (index * (Math.PI * 2 / TEAM_PROFILE_DIMENSIONS.length));
            return (
              <text
                key={dimension.key}
                x={center + Math.cos(angle) * (radius + labelOffset + (Math.abs(Math.cos(angle)) > 0.85 ? 6 : 0))}
                y={center + Math.sin(angle) * (radius + labelOffset + (Math.abs(Math.sin(angle)) > 0.85 ? 4 : 0))}
                fill="rgba(226, 232, 240, 0.72)"
                fontSize="11"
                textAnchor={Math.cos(angle) > 0.3 ? "start" : Math.cos(angle) < -0.3 ? "end" : "middle"}
                dominantBaseline={Math.sin(angle) > 0.5 ? "hanging" : Math.sin(angle) < -0.5 ? "auto" : "middle"}
              >
                {dimension.label}
              </text>
            );
          })
        : null}
    </svg>
  );
}

export function TeamRadarChart({ profile }) {
  if (!profile) return null;

  return (
    <div
      className="rounded-[22px] border px-3 py-3"
      style={{
        borderColor: "color-mix(in srgb, var(--md-sys-color-outline-variant) 60%, transparent)",
        background: "color-mix(in srgb, var(--md-sys-color-surface-container-low) 82%, transparent)",
      }}
    >
      <div className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] md3-subtle">六维战力</div>
      <div className="flex items-center gap-3">
        <div className="h-32 w-32 shrink-0">
          <RadarGraphic profiles={[profile]} />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          {TEAM_PROFILE_DIMENSIONS.map((dimension, index) => (
            <div key={dimension.key}>
              <div className="mb-1 flex items-center justify-between gap-2 text-[11px]">
                <span className="font-bold text-slate-100">{dimension.label}</span>
                <span className="font-black text-emerald-200">{profile.ratings[index]}</span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-900/75">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${profile.ratings[index]}%`,
                    background: "linear-gradient(90deg, rgba(16,185,129,0.78), rgba(134,239,172,0.95))",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TeamRadarComparison({ homeProfile, awayProfile, className = "" }) {
  const profiles = [homeProfile, awayProfile].filter(Boolean);
  if (!profiles.length) return null;

  return (
    <div
      className={joinClasses("rounded-[24px] border px-4 py-4", className)}
      style={{
        borderColor: "color-mix(in srgb, var(--md-sys-color-outline-variant) 60%, transparent)",
        background: "color-mix(in srgb, var(--md-sys-color-surface-container-low) 80%, transparent)",
      }}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-[11px] font-black uppercase tracking-[0.18em] md3-subtle">六维战力</div>
        <div className="flex flex-wrap items-center justify-end gap-3 text-[11px] font-bold">
          {homeProfile ? <span className="inline-flex items-center gap-1.5 text-emerald-100"><span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />{homeProfile.displayNameZh}</span> : null}
          {awayProfile ? <span className="inline-flex items-center gap-1.5 text-sky-100"><span className="h-2.5 w-2.5 rounded-full bg-sky-300" />{awayProfile.displayNameZh}</span> : null}
        </div>
      </div>
      <div className="mx-auto h-[20rem] max-w-[24rem]">
        <RadarGraphic profiles={profiles} size={248} radius={78} lineRadius={82} ringRadii={[26, 50, 72, 78]} labelOffset={24} canvasPadding={32} />
      </div>
    </div>
  );
}

function InfoBlock({ label, primary, secondary }) {
  return (
    <div
      className="rounded-[18px] border px-3 py-2.5"
      style={{
        borderColor: "color-mix(in srgb, var(--md-sys-color-outline-variant) 58%, transparent)",
        background: "color-mix(in srgb, var(--md-sys-color-surface-container-lowest) 72%, transparent)",
      }}
    >
      <div className="text-[11px] font-black uppercase tracking-[0.16em] md3-subtle">{label}</div>
      <div className="mt-1 text-sm font-bold text-slate-100">{primary}</div>
      {secondary ? <div className="mt-1 text-xs text-slate-300">{secondary}</div> : null}
    </div>
  );
}

function TeamTournamentRecordSection({ profile, matches = [] }) {
  const record = useMemo(() => buildTeamTournamentRecord(profile, matches), [matches, profile]);

  return (
    <div
      className="mt-3 rounded-[22px] border px-3 py-3"
      style={{
        borderColor: "rgba(110, 231, 183, 0.16)",
        background: "linear-gradient(180deg, rgba(7, 18, 32, 0.88), rgba(12, 24, 40, 0.68))",
      }}
    >
      <div className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] md3-subtle">本届战绩</div>
      {record.played ? (
        <>
          <div className="mb-3 flex flex-wrap gap-2">
            <span className="rounded-full border px-2.5 py-1 text-xs font-black text-emerald-100" style={{ borderColor: "rgba(110, 231, 183, 0.16)", background: "rgba(16, 185, 129, 0.14)" }}>{record.summary}</span>
            <span className="rounded-full border px-2.5 py-1 text-xs font-black text-slate-100" style={{ borderColor: "rgba(148, 163, 184, 0.16)", background: "rgba(30, 41, 59, 0.55)" }}>{record.goalsSummary}</span>
          </div>
          <div className="space-y-2">
            {record.matchResults.map((match) => (
              <div
                key={match.id}
                className="rounded-[16px] border px-3 py-2.5"
                style={{
                  borderColor: "color-mix(in srgb, var(--md-sys-color-outline-variant) 48%, transparent)",
                  background: "color-mix(in srgb, var(--md-sys-color-surface-container-lowest) 52%, transparent)",
                }}
              >
                <div className="flex items-center justify-between gap-3 text-[11px]">
                  <span className="font-black md3-subtle">{match.stageLabel}</span>
                  <span className="font-black text-slate-200">{match.result}</span>
                </div>
                <div className="mt-1.5 flex items-center justify-between gap-3">
                  <span className="min-w-0 text-sm font-bold text-slate-100">{match.opponent}</span>
                  <span className="shrink-0 text-sm font-black text-emerald-200">{match.scoreline}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div
          className="rounded-[16px] border px-3 py-3 text-sm text-slate-300"
          style={{
            borderColor: "color-mix(in srgb, var(--md-sys-color-outline-variant) 48%, transparent)",
            background: "color-mix(in srgb, var(--md-sys-color-surface-container-lowest) 52%, transparent)",
          }}
        >
          本届暂无已结束比赛
        </div>
      )}
    </div>
  );
}

export function TeamProfileCard({ profile, matches = [], className = "" }) {
  if (!profile) return null;

  const flag = getFlagRenderData({
    teamName: profile.displayNameZh,
    countryCode: profile.countryCode,
    fallbackEmoji: "",
    alt: profile.displayNameZh,
  });

  return (
    <div
      className={joinClasses("w-[min(24rem,calc(100vw-2rem))] rounded-[24px] border p-3 text-left shadow-2xl backdrop-blur-xl", className)}
      style={{
        borderColor: "rgba(167, 243, 208, 0.22)",
        background: "linear-gradient(180deg, rgba(15, 23, 42, 0.7), rgba(8, 15, 28, 0.42))",
        boxShadow: "0 30px 90px rgba(2, 6, 23, 0.36), inset 0 1px 0 rgba(255, 255, 255, 0.12)",
        color: "var(--md-sys-color-on-surface)",
      }}
    >
      <div className="mb-3 flex items-start gap-3">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px]"
          style={{
            background:
              "linear-gradient(135deg, color-mix(in srgb, var(--md-sys-color-primary-container) 90%, transparent), color-mix(in srgb, var(--md-sys-color-tertiary-container) 76%, transparent))",
          }}
        >
          {flag.type === "image" ? (
            <img src={flag.src} alt={flag.alt} className="h-8 w-10 rounded-[5px] object-cover shadow-sm" loading="lazy" />
          ) : (
            <span className="text-2xl">{flag.emoji || "🏳️"}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-lg font-black leading-5">{profile.displayNameZh}</div>
          <div className="mt-1 text-sm text-slate-300">{profile.teamName}</div>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <div
              className="rounded-[16px] border px-2.5 py-2"
              style={{
                borderColor: "color-mix(in srgb, var(--md-sys-color-outline-variant) 58%, transparent)",
                background: "color-mix(in srgb, var(--md-sys-color-primary-container) 72%, transparent)",
              }}
            >
              <div className="text-[10px] font-black uppercase tracking-[0.16em] md3-subtle">世界排名</div>
              <div className="mt-1 text-sm font-black text-slate-50">FIFA #{profile.fifaRank}</div>
            </div>
            <div
              className="rounded-[16px] border px-2.5 py-2"
              style={{
                borderColor: "color-mix(in srgb, var(--md-sys-color-outline-variant) 58%, transparent)",
                background: "color-mix(in srgb, var(--md-sys-color-secondary-container) 72%, transparent)",
              }}
            >
              <div className="text-[10px] font-black uppercase tracking-[0.16em] md3-subtle">所属大洲</div>
              <div className="mt-1 text-sm font-black text-slate-50">{profile.continent} / {profile.confederation}</div>
            </div>
          </div>
        </div>
      </div>

      <TeamRadarChart profile={profile} />

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <InfoBlock label="主教练" primary={profile.coach} />
        <InfoBlock label="最高身价" primary={profile.topValuablePlayer} secondary={profile.topValuablePlayerValue} />
        <InfoBlock label="总身价" primary={profile.totalSquadValue} />
        <InfoBlock label="上届世界杯" primary={profile.lastWorldCupResult} />
      </div>
      <TeamTournamentRecordSection profile={profile} matches={matches} />
    </div>
  );
}

export function TeamProfileTrigger({ name, countryCode = "", matches = [], children }) {
  const profile = getTeamProfileByCountryCode(countryCode) || getTeamProfileByName(name);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ left: 0, top: 0 });
  const wrapperRef = useRef(null);
  const longPressTimerRef = useRef(null);
  const longPressTriggeredRef = useRef(false);
  const closeTimerRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    function updatePosition() {
      const node = wrapperRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const estimatedWidth = Math.min(384, window.innerWidth - 16);
      const preferredLeft = rect.left;
      const maxLeft = Math.max(8, window.innerWidth - estimatedWidth - 8);
      const nextLeft = Math.min(preferredLeft, maxLeft);
      const cardHeight = 620;
      const spaceBelow = window.innerHeight - rect.bottom;
      const showAbove = spaceBelow < cardHeight && rect.top > cardHeight;
      setPosition({
        left: Math.max(8, nextLeft),
        top: showAbove ? Math.max(8, rect.top - cardHeight - 8) : rect.bottom + 8,
      });
    }

    updatePosition();

    function handlePointerDown(event) {
      if (!wrapperRef.current?.contains(event.target) && !event.target.closest?.("[data-team-profile-card='true']")) {
        setOpen(false);
      }
    }

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [open]);

  if (!profile) return children;

  function clearCloseTimer() {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }

  function clearLongPressTimer() {
    if (longPressTimerRef.current) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }

  function handleTouchStart() {
    clearLongPressTimer();
    longPressTimerRef.current = window.setTimeout(() => {
      longPressTriggeredRef.current = true;
      setOpen(true);
    }, 420);
  }

  function handleTouchEnd() {
    clearLongPressTimer();
  }

  function scheduleClose() {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => setOpen(false), 120);
  }

  function handleClickCapture(event) {
    if (!longPressTriggeredRef.current) return;
    longPressTriggeredRef.current = false;
    event.preventDefault();
    event.stopPropagation();
  }

  const floatingCard =
    open && typeof document !== "undefined"
      ? createPortal(
          <div
            data-team-profile-card="true"
            className="pointer-events-auto z-[220]"
            style={{ position: "fixed", left: position.left, top: position.top }}
            onMouseEnter={clearCloseTimer}
            onMouseLeave={scheduleClose}
          >
            <TeamProfileCard profile={profile} matches={matches} />
          </div>,
          document.body,
        )
      : null;

  return (
    <span
      ref={wrapperRef}
      className={joinClasses("relative inline-flex max-w-full", open && "z-[140]")}
      onMouseEnter={() => {
        clearCloseTimer();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onClickCapture={handleClickCapture}
    >
      <span className="inline-flex max-w-full cursor-help">{children}</span>
      {floatingCard}
    </span>
  );
}
