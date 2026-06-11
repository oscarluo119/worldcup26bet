import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getFlagRenderData } from "../lib/flags";
import { TEAM_PROFILE_DIMENSIONS, getTeamProfileByCountryCode, getTeamProfileByName } from "../lib/teamProfiles";

function joinClasses(...classes) {
  return classes.filter(Boolean).join(" ");
}

function TeamRadarChart({ profile }) {
  const points = useMemo(() => {
    const center = 76;
    const radius = 54;
    return TEAM_PROFILE_DIMENSIONS.map((dimension, index) => {
      const value = profile.ratings[index] ?? 0;
      const angle = (-Math.PI / 2) + (index * (Math.PI * 2 / TEAM_PROFILE_DIMENSIONS.length));
      const scaled = radius * (value / 100);
      const x = center + Math.cos(angle) * scaled;
      const y = center + Math.sin(angle) * scaled;
      return `${x},${y}`;
    }).join(" ");
  }, [profile]);

  return (
    <div className="rounded-[22px] border px-3 py-3" style={{ borderColor: "color-mix(in srgb, var(--md-sys-color-outline-variant) 60%, transparent)", background: "color-mix(in srgb, var(--md-sys-color-surface-container-low) 82%, transparent)" }}>
      <div className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] md3-subtle">六维战力</div>
      <div className="flex items-center gap-3">
        <svg viewBox="0 0 152 152" className="h-32 w-32 shrink-0">
          {[18, 34, 50, 54].map((ring, index) => (
            <polygon
              key={ring}
              points={TEAM_PROFILE_DIMENSIONS.map((_, pointIndex) => {
                const angle = (-Math.PI / 2) + (pointIndex * (Math.PI * 2 / TEAM_PROFILE_DIMENSIONS.length));
                return `${76 + Math.cos(angle) * ring},${76 + Math.sin(angle) * ring}`;
              }).join(" ")}
              fill="none"
              stroke={index === 3 ? "rgba(110,231,183,0.2)" : "rgba(148,163,184,0.12)"}
              strokeWidth="1"
            />
          ))}
          {TEAM_PROFILE_DIMENSIONS.map((_, index) => {
            const angle = (-Math.PI / 2) + (index * (Math.PI * 2 / TEAM_PROFILE_DIMENSIONS.length));
            return (
              <line
                key={index}
                x1="76"
                y1="76"
                x2={76 + Math.cos(angle) * 56}
                y2={76 + Math.sin(angle) * 56}
                stroke="rgba(148,163,184,0.14)"
                strokeWidth="1"
              />
            );
          })}
          <polygon points={points} fill="rgba(52, 211, 153, 0.26)" stroke="rgba(110,231,183,0.9)" strokeWidth="2.5" />
          {TEAM_PROFILE_DIMENSIONS.map((dimension, index) => {
            const angle = (-Math.PI / 2) + (index * (Math.PI * 2 / TEAM_PROFILE_DIMENSIONS.length));
            return (
              <circle
                key={dimension.key}
                cx={76 + Math.cos(angle) * (54 * ((profile.ratings[index] ?? 0) / 100))}
                cy={76 + Math.sin(angle) * (54 * ((profile.ratings[index] ?? 0) / 100))}
                r="2.75"
                fill="rgba(167,243,208,1)"
              />
            );
          })}
        </svg>
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

export function TeamProfileCard({ profile, className = "" }) {
  if (!profile) return null;

  const flag = getFlagRenderData({
    teamName: profile.displayNameZh,
    countryCode: profile.countryCode,
    fallbackEmoji: "",
    alt: profile.displayNameZh,
  });

  return (
    <div
      className={joinClasses("w-[min(22rem,calc(100vw-2rem))] rounded-[24px] border p-3 text-left shadow-2xl backdrop-blur-xl", className)}
      style={{
        borderColor: "rgba(167, 243, 208, 0.22)",
        background: "linear-gradient(180deg, rgba(15, 23, 42, 0.7), rgba(8, 15, 28, 0.42))",
        boxShadow: "0 30px 90px rgba(2, 6, 23, 0.36), inset 0 1px 0 rgba(255, 255, 255, 0.12)",
        color: "var(--md-sys-color-on-surface)",
      }}
    >
      <div className="mb-3 flex items-start gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px]" style={{ background: "linear-gradient(135deg, color-mix(in srgb, var(--md-sys-color-primary-container) 90%, transparent), color-mix(in srgb, var(--md-sys-color-tertiary-container) 76%, transparent))" }}>
          {flag.type === "image" ? <img src={flag.src} alt={flag.alt} className="h-8 w-10 rounded-[5px] object-cover shadow-sm" loading="lazy" /> : <span className="text-2xl">{flag.emoji || "🏳️"}</span>}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-lg font-black leading-5">{profile.displayNameZh}</div>
          <div className="mt-1 text-sm text-slate-300">{profile.teamName}</div>
          <div className="mt-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-black" style={{ background: "color-mix(in srgb, var(--md-sys-color-primary-container) 88%, transparent)", color: "var(--md-sys-color-on-primary-container)" }}>
            FIFA排名 #{profile.fifaRank}
          </div>
        </div>
      </div>
      <TeamRadarChart profile={profile} />
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div className="rounded-[18px] border px-3 py-2.5" style={{ borderColor: "color-mix(in srgb, var(--md-sys-color-outline-variant) 58%, transparent)", background: "color-mix(in srgb, var(--md-sys-color-surface-container-lowest) 72%, transparent)" }}>
          <div className="text-[11px] font-black uppercase tracking-[0.16em] md3-subtle">主教练</div>
          <div className="mt-1 text-sm font-bold text-slate-100">{profile.coach}</div>
        </div>
        <div className="rounded-[18px] border px-3 py-2.5" style={{ borderColor: "color-mix(in srgb, var(--md-sys-color-outline-variant) 58%, transparent)", background: "color-mix(in srgb, var(--md-sys-color-surface-container-lowest) 72%, transparent)" }}>
          <div className="text-[11px] font-black uppercase tracking-[0.16em] md3-subtle">头号球星</div>
          <div className="mt-1 text-sm font-bold text-slate-100">{profile.starPlayer}</div>
        </div>
      </div>
      <div className="mt-3 inline-flex rounded-full px-3 py-1.5 text-xs font-black" style={{ background: "color-mix(in srgb, var(--md-sys-color-secondary-container) 86%, transparent)", color: "var(--md-sys-color-on-secondary-container)" }}>
        {profile.tag}
      </div>
    </div>
  );
}

export function TeamProfileTrigger({ name, countryCode = "", children }) {
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
      const estimatedWidth = Math.min(352, window.innerWidth - 16);
      const preferredLeft = rect.left;
      const maxLeft = Math.max(8, window.innerWidth - estimatedWidth - 8);
      const nextLeft = Math.min(preferredLeft, maxLeft);
      const spaceBelow = window.innerHeight - rect.bottom;
      const cardHeight = 360;
      const showAbove = spaceBelow < cardHeight && rect.top > cardHeight;
      setPosition({
        left: Math.max(8, nextLeft),
        top: showAbove ? Math.max(8, rect.top - cardHeight - 8) : rect.bottom + 8,
      });
    }

    updatePosition();

    function handlePointerDown(event) {
      if (!wrapperRef.current?.contains(event.target) && !event.target.closest?.("[data-team-profile-card='true']")) setOpen(false);
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

  const floatingCard = open && typeof document !== "undefined"
    ? createPortal(
        <div
          data-team-profile-card="true"
          className="pointer-events-auto z-[220]"
          style={{ position: "fixed", left: position.left, top: position.top }}
          onMouseEnter={clearCloseTimer}
          onMouseLeave={scheduleClose}
        >
          <TeamProfileCard profile={profile} />
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
