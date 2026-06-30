import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

const appSource = readFileSync(resolve(process.cwd(), "src/App.jsx"), "utf8");

describe("resolved knockout match wiring", () => {
  test("feeds the home page from resolved matches instead of raw matches", () => {
    expect(appSource).toContain('<HomePanel matches={resolvedMatches} predictions={predictions} currentPlayerId={currentPlayerId} myStats={myStats} unPredictedCount={unPredictedCount} players={players} rankings={rankings} currentTime={currentTime} setSelectedMatchId={setSelectedMatchId} setActiveTab={setActiveTab} onOpenPlayerProfile={openPlayerProfile} achievementCollections={achievementCollections} worldCupNews={worldCupNews} newsLoading={newsLoading} onOpenNews={setSelectedNewsItem} />');
    expect(appSource).not.toContain('<HomePanel matches={matches} predictions={predictions} currentPlayerId={currentPlayerId} myStats={myStats} unPredictedCount={unPredictedCount} players={players} rankings={rankings} currentTime={currentTime} setSelectedMatchId={setSelectedMatchId} setActiveTab={setActiveTab} onOpenPlayerProfile={openPlayerProfile} achievementCollections={achievementCollections} worldCupNews={worldCupNews} newsLoading={newsLoading} onOpenNews={setSelectedNewsItem} />');
  });

  test("feeds the admin page from resolved matches while keeping match actions on the same records", () => {
    expect(appSource).toContain('<AdminPanel matches={resolvedMatches} players={players} currentPlayerId={currentPlayerId} predictions={predictions} updateMatchResult={updateMatchResult} clearMatchResult={clearMatchResult} toggleLock={toggleLock} funResults={funResults} onSetFunResults={saveFunResults} sponsorPredictionResults={resolvedSponsorPredictionResults} onSetSponsorPredictionResult={saveSponsorPredictionResult} onSetUserCamp={setUserCamp} onSetUserAdmin={setUserAdmin} onDeleteUser={deleteUser} openDialog={openDialog} />');
    expect(appSource).not.toContain('<AdminPanel matches={matches} players={players} currentPlayerId={currentPlayerId} predictions={predictions} updateMatchResult={updateMatchResult} clearMatchResult={clearMatchResult} toggleLock={toggleLock} funResults={funResults} onSetFunResults={saveFunResults} sponsorPredictionResults={resolvedSponsorPredictionResults} onSetSponsorPredictionResult={saveSponsorPredictionResult} onSetUserCamp={setUserCamp} onSetUserAdmin={setUserAdmin} onDeleteUser={deleteUser} openDialog={openDialog} />');
    expect(appSource).toContain('onResult(match.id, Number(homeScore), Number(awayScore), requiresAdvancingSide ? advancingSide : null)');
    expect(appSource).toContain('onConfirm: () => onToggleLock(match.id)');
    expect(appSource).toContain('onConfirm: () => onClear(match.id)');
  });

  test("feeds player history views from resolved matches instead of raw matches", () => {
    expect(appSource).toContain('<PlayerProfilePanel player={profilePlayer} currentPlayerId={currentPlayerId} players={players} rankings={rankings} predictions={predictions} matches={resolvedMatches} streakRankings={streakRankings} predictionStyleRankings={predictionStyleRankings} reverseLightPlayer={reverseLightPlayer} sponsorPredictions={sponsorPredictions} sponsorPredictionResults={resolvedSponsorPredictionResults} funPredictions={funPredictions} funResults={funResults} achievementCollections={achievementCollections} campBattleSummary={campBattleSummary} themeMode={themeMode} onChangeTheme={setThemeMode} onUpdateProfile={updateProfile} onBack={() => setActiveTab("ranking")} onOpenAchievements={() => setActiveTab("achievements")} onOpenFullHistory={(playerId) => { setSelectedProfilePlayerId(playerId); setActiveTab("allHistory"); }} />');
    expect(appSource).not.toContain('<PlayerProfilePanel player={profilePlayer} currentPlayerId={currentPlayerId} players={players} rankings={rankings} predictions={predictions} matches={matches} streakRankings={streakRankings} predictionStyleRankings={predictionStyleRankings} reverseLightPlayer={reverseLightPlayer} sponsorPredictions={sponsorPredictions} sponsorPredictionResults={resolvedSponsorPredictionResults} funPredictions={funPredictions} funResults={funResults} achievementCollections={achievementCollections} campBattleSummary={campBattleSummary} themeMode={themeMode} onChangeTheme={setThemeMode} onUpdateProfile={updateProfile} onBack={() => setActiveTab("ranking")} onOpenAchievements={() => setActiveTab("achievements")} onOpenFullHistory={(playerId) => { setSelectedProfilePlayerId(playerId); setActiveTab("allHistory"); }} />');
    expect(appSource).toContain('<AllHistoryPanel player={profilePlayer} predictions={predictions} matches={resolvedMatches} onBack={() => setActiveTab("playerProfile")} />');
    expect(appSource).not.toContain('<AllHistoryPanel player={profilePlayer} predictions={predictions} matches={matches} onBack={() => setActiveTab("playerProfile")} />');
  });
});
