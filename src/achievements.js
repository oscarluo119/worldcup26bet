const STAGE_MULTIPLIERS = {
  GROUP: 1,
  R32: 2,
  R16: 2,
  QF: 4,
  SF: 8,
  THIRD: 8,
  FINAL: 16,
};

export const ACHIEVEMENT_DEFINITIONS = [
  { id: "firstPrediction", name: "初登赛场", description: "第一次提交比分竞猜", rarity: "普通", category: "参与类", hidden: false, target: 1 },
  { id: "prediction10", name: "世界杯观众席", description: "累计完成 10 场比赛竞猜", rarity: "普通", category: "参与类", hidden: false, target: 10 },
  { id: "prediction50", name: "世界杯常驻民", description: "累计完成 50 场比赛竞猜", rarity: "稀有", category: "参与类", hidden: false, target: 50 },
  { id: "prediction104", name: "全勤观赛员", description: "累计完成全部 104 场比赛竞猜", rarity: "传说", category: "参与类", hidden: false, target: 104 },
  { id: "groupAll", name: "铁杆球迷", description: "完成全部小组赛竞猜", rarity: "史诗", category: "参与类", hidden: false, target: "GROUP_ALL" },
  { id: "openingMatch", name: "揭幕战见证者", description: "成功提交揭幕战竞猜", rarity: "普通", category: "参与类", hidden: false, target: 1 },
  { id: "knockoutEntry", name: "淘汰赛入场券", description: "第一次提交淘汰赛竞猜", rarity: "普通", category: "淘汰赛类", hidden: false, target: 1 },
  { id: "thirdPlaceEntry", name: "季军战也不放过", description: "成功提交三四名决赛竞猜", rarity: "普通", category: "淘汰赛类", hidden: false, target: 1 },
  { id: "finalEntry", name: "决赛见证者", description: "成功提交决赛竞猜", rarity: "稀有", category: "淘汰赛类", hidden: false, target: 1 },
  { id: "knockout10", name: "生死战玩家", description: "累计完成 10 场淘汰赛竞猜", rarity: "稀有", category: "淘汰赛类", hidden: false, target: 10 },
  { id: "firstKnockoutExact", name: "淘汰赛神算", description: "第一次猜中淘汰赛完整比分", rarity: "稀有", category: "淘汰赛类", hidden: false, target: 1 },
  { id: "finalExact", name: "终局之战", description: "准确猜出世界杯决赛完整比分", rarity: "神话", category: "淘汰赛类", hidden: false, target: 1 },
  { id: "dailyStreak7", name: "每日看球人", description: "连续 7 个比赛日都有提交竞猜", rarity: "稀有", category: "时间策略类", hidden: false, target: 7 },
  { id: "dailyStreak15", name: "世界杯生物钟", description: "连续 15 个比赛日都有提交竞猜", rarity: "稀有", category: "时间策略类", hidden: false, target: 15 },
  { id: "firstOutcome", name: "小试牛刀", description: "第一次猜中比赛结果", rarity: "普通", category: "命中结果类", hidden: false, target: 1 },
  { id: "outcome5", name: "有点东西", description: "累计猜中 5 场比赛结果", rarity: "普通", category: "命中结果类", hidden: false, target: 5 },
  { id: "outcome10", name: "稳定发挥", description: "累计猜中 10 场比赛结果", rarity: "稀有", category: "命中结果类", hidden: false, target: 10 },
  { id: "outcome30", name: "胜负观察员", description: "累计猜中 30 场比赛结果", rarity: "史诗", category: "命中结果类", hidden: false, target: 30 },
  { id: "outcome50", name: "胜负大师", description: "累计猜中 50 场比赛结果", rarity: "传说", category: "命中结果类", hidden: false, target: 50 },
  { id: "outcome70", name: "懂球帝", description: "累计猜中 70 场比赛结果", rarity: "神话", category: "命中结果类", hidden: false, target: 70 },
  { id: "firstExact", name: "精准一击", description: "第一次猜中完整比分", rarity: "稀有", category: "命中比分类", hidden: false, target: 1 },
  { id: "exact3", name: "比分入门", description: "累计猜中 3 场完整比分", rarity: "稀有", category: "命中比分类", hidden: false, target: 3 },
  { id: "exact5", name: "比分猎手", description: "累计猜中 5 场完整比分", rarity: "史诗", category: "命中比分类", hidden: false, target: 5 },
  { id: "exact8", name: "比分大师", description: "累计猜中 8 场完整比分", rarity: "史诗", category: "命中比分类", hidden: false, target: 8 },
  { id: "exact12", name: "神级比分师", description: "累计猜中 12 场完整比分", rarity: "传说", category: "命中比分类", hidden: false, target: 12 },
  { id: "exact15", name: "世界预言家", description: "累计猜中 15 场完整比分", rarity: "神话", category: "命中比分类", hidden: false, target: 15 },
  { id: "outcomeStreak3", name: "连中三元", description: "连续 3 场猜中胜平负结果", rarity: "稀有", category: "连击类", hidden: false, target: 3 },
  { id: "outcomeStreak5", name: "久热手感", description: "连续 5 场猜中胜平负结果", rarity: "史诗", category: "连击类", hidden: false, target: 5 },
  { id: "outcomeStreak7", name: "状态爆棚", description: "连续 7 场猜中胜平负结果", rarity: "传说", category: "连击类", hidden: false, target: 7 },
  { id: "outcomeStreak10", name: "预言家之眼", description: "连续 10 场猜中胜平负结果", rarity: "神话", category: "连击类", hidden: false, target: 10 },
  { id: "exactStreak2", name: "预言连响", description: "连续 2 场猜中完整比分", rarity: "传说", category: "连击类", hidden: false, target: 2 },
  { id: "exactStreak3", name: "三场封神", description: "连续 3 场猜中完整比分", rarity: "史诗", category: "连击类", hidden: false, target: 3 },
  { id: "exactStreak4", name: "四战皆准", description: "连续 4 场猜中完整比分", rarity: "神话", category: "连击类", hidden: false, target: 4 },
  { id: "exactStreak5", name: "五连天命", description: "连续 5 场猜中完整比分", rarity: "神话", category: "连击类", hidden: true, target: 5 },
  { id: "firstNetGoal", name: "净胜球专家", description: "第一次猜中比赛净胜球数", rarity: "普通", category: "进球类", hidden: false, target: 1 },
  { id: "netGoal10", name: "差距判断师", description: "累计猜中 10 场净胜球数", rarity: "稀有", category: "进球类", hidden: false, target: 10 },
  { id: "netGoal20", name: "局势掌控者", description: "累计猜中 20 场净胜球数", rarity: "稀有", category: "进球类", hidden: false, target: 20 },
  { id: "earlyStreak10", name: "赛前纪律委员", description: "连续 10 场都在开赛前 1 小时以上提交竞猜", rarity: "稀有", category: "时间策略类", hidden: false, target: 10 },
  { id: "lateStreak10", name: "卡点大师", description: "连续 10 场在开赛前 1 小时内提交竞猜", rarity: "稀有", category: "时间策略类", hidden: false, target: 10 },
  { id: "earlyStreak20", name: "提前部署", description: "连续 20 场都在开赛前 1 小时以上提交竞猜", rarity: "史诗", category: "时间策略类", hidden: false, target: 20 },
  { id: "lateStreak20", name: "压哨绝地", description: "连续 20 场在开赛前 1 小时内提交竞猜", rarity: "史诗", category: "时间策略类", hidden: false, target: 20 },
  { id: "firstDrawOutcome", name: "和气生财", description: "第一次猜中平局结果", rarity: "普通", category: "平局类", hidden: false, target: 1 },
  { id: "drawPredictions10", name: "平局爱好者", description: "累计 10 次预测平局比分", rarity: "普通", category: "平局类", hidden: false, target: 10 },
  { id: "firstZeroZeroExact", name: "0:0 守夜人", description: "第一次猜中 0:0 完整比分", rarity: "史诗", category: "平局类", hidden: false, target: 1 },
  { id: "bttsFirst", name: "双方都有球", description: "第一次猜中双方均有进球的比赛结果", rarity: "普通", category: "进球类", hidden: false, target: 1 },
  { id: "btts10", name: "对攻预感", description: "累计 10 次猜中双方均有进球的比赛结果", rarity: "稀有", category: "进球类", hidden: false, target: 10 },
  { id: "highGoalsExact4", name: "进球盛宴", description: "第一次猜中双方总进球不少于 4 球的完整比分", rarity: "稀有", category: "进球类", hidden: false, target: 1 },
  { id: "highGoalsExact5", name: "大比分狂魔", description: "第一次猜中双方总进球不少于 5 球的完整比分", rarity: "史诗", category: "进球类", hidden: false, target: 1 },
  { id: "top10First", name: "首位上榜", description: "第一次进入房间排行榜前 10", rarity: "普通", category: "房间排名类", hidden: false, target: 1 },
  { id: "firstTop1", name: "榜首体验卡", description: "至少完成 5 场比赛后，首次登顶房间排行榜第 1 名", rarity: "稀有", category: "房间排名类", hidden: false, target: 1 },
  { id: "top3Streak3", name: "稳住前三", description: "至少完成 5 场比赛后，连续 3 场结算后保持房间排行榜前三", rarity: "史诗", category: "房间排名类", hidden: false, target: 3 },
  { id: "top1Streak3", name: "守擂成功", description: "至少完成 5 场比赛后，连续 3 场结算后保持房间排行榜第 1 名", rarity: "传说", category: "房间排名类", hidden: false, target: 3 },
  { id: "top1Streak10", name: "榜首不动如山", description: "连续 10 场结算后保持房间排行榜第 1 名", rarity: "神话", category: "房间排名类", hidden: false, target: 10 },
  { id: "finalChampion", name: "世界杯大魔王", description: "全部赛事结束时排名房间第 1 名", rarity: "神话", category: "房间排名类", hidden: false, target: 1 },
  { id: "finalTop3", name: "房间三甲", description: "全部赛事结束时排名房间前三", rarity: "传说", category: "房间排名类", hidden: false, target: 1 },
  { id: "singleMatchBest", name: "单场最光", description: "单场比赛成为房间最高积分玩家", rarity: "稀有", category: "房间排名类", hidden: false, target: 1 },
  { id: "singleMatchSoloBest", name: "单场独胆", description: "单场比赛成为房间唯一最高积分玩家", rarity: "史诗", category: "房间排名类", hidden: false, target: 1 },
  { id: "rareOutcome30", name: "逆风选择", description: "一局比赛内少于 30% 的用户选对，而你选对", rarity: "史诗", category: "冷门类", hidden: false, target: 1 },
  { id: "rareOutcome10", name: "孤勇者", description: "一局比赛内少于 10% 的用户选对，而你选对", rarity: "传说", category: "冷门类", hidden: false, target: 1 },
  { id: "soloOutcome", name: "众人皆醉我独醒", description: "房间内只有你一人猜中胜平负结果", rarity: "传说", category: "唯一成就类", hidden: false, target: 1 },
  { id: "soloExact", name: "比分独苗", description: "只有你猜中某场比赛完整比分", rarity: "神话", category: "唯一成就类", hidden: false, target: 1 },
  { id: "soloKnockoutExact", name: "淘汰赛比分独胆", description: "只有你一人猜中淘汰赛完整比分", rarity: "神话", category: "唯一成就类", hidden: true, target: 1 },
  { id: "soloExact3", name: "三次比分独胆", description: "累计 3 次成为房间唯一猜中完整比分的玩家", rarity: "神话", category: "唯一成就类", hidden: true, target: 3 },
  { id: "funChampion", name: "世界杯导演", description: "趣味预测命中世界杯冠军", rarity: "稀有", category: "趣味预测类", hidden: false, target: 1 },
  { id: "funGoldenBoot", name: "金靴伯乐", description: "趣味预测命中世界杯金靴", rarity: "稀有", category: "趣味预测类", hidden: false, target: 1 },
  { id: "funFirstRed", name: "我闻到了火药味", description: "趣味预测命中首张红牌球队", rarity: "稀有", category: "趣味预测类", hidden: false, target: 1 },
  { id: "funTotalGoals", name: "进球神算子", description: "趣味预测总进球数最接近真实结果", rarity: "稀有", category: "趣味预测类", hidden: false, target: 1 },
];

export const ACHIEVEMENT_RARITIES = ["普通", "稀有", "史诗", "传说", "神话"];

function getOutcome(home, away) {
  if (home > away) return "H";
  if (home < away) return "A";
  return "D";
}

function calculateBasePoints(prediction, match) {
  if (!prediction || !match || match.status !== "settled") return 0;
  if (prediction.home === match.homeScore && prediction.away === match.awayScore) return 4;
  if (getOutcome(match.homeScore, match.awayScore) !== getOutcome(prediction.home, prediction.away)) return 0;
  return match.homeScore - match.awayScore === prediction.home - prediction.away ? 2 : 1;
}

function calculatePoints(prediction, match) {
  return calculateBasePoints(prediction, match) * (STAGE_MULTIPLIERS[match?.stage] || 1);
}

function normalizeComparableText(value) {
  return String(value || "").replace(/[\s·,，.。/／()（）-]/g, "").toLowerCase();
}

function isSameText(left, right) {
  const a = normalizeComparableText(left);
  const b = normalizeComparableText(right);
  return Boolean(a && b && a === b);
}

function getBeijingDateKey(value) {
  const parts = new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(value));
  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${map.year}-${map.month}-${map.day}`;
}

function getProgress(current, target, achievedAt = null) {
  const safeTarget = typeof target === "number" && target > 0 ? target : 1;
  return {
    current: Math.max(0, Math.min(current, safeTarget)),
    target: safeTarget,
    achieved: current >= safeTarget,
    achievedAt: current >= safeTarget ? achievedAt : null,
  };
}

function getBinaryProgress(condition, achievedAt = null) {
  return {
    current: condition ? 1 : 0,
    target: 1,
    achieved: Boolean(condition),
    achievedAt: condition ? achievedAt : null,
  };
}

function buildRankingSnapshots(players, predictions, settledMatches) {
  const settledMatchesById = Object.fromEntries(settledMatches.map((match) => [match.id, match]));
  return settledMatches.map((currentMatch, index) => {
    const includedMatchIds = new Set(settledMatches.slice(0, index + 1).map((match) => match.id));
    const snapshot = players.map((player) => {
      const playerPredictions = predictions.filter((prediction) => prediction.playerId === player.id && includedMatchIds.has(prediction.matchId));
      const total = playerPredictions.reduce((sum, prediction) => sum + calculatePoints(prediction, settledMatchesById[prediction.matchId]), 0);
      const exactCount = playerPredictions.filter((prediction) => calculateBasePoints(prediction, settledMatchesById[prediction.matchId]) === 4).length;
      const netGoalOnlyCount = playerPredictions.filter((prediction) => calculateBasePoints(prediction, settledMatchesById[prediction.matchId]) === 2).length;
      const outcomeOnlyCount = playerPredictions.filter((prediction) => calculateBasePoints(prediction, settledMatchesById[prediction.matchId]) === 1).length;
      const outcomeCount = playerPredictions.filter((prediction) => calculateBasePoints(prediction, settledMatches.find((match) => match.id === prediction.matchId)) > 0).length;
      const pointsThisMatch = calculatePoints(predictions.find((prediction) => prediction.playerId === player.id && prediction.matchId === currentMatch.id), currentMatch);
      return { ...player, total, exactCount, netGoalOnlyCount, outcomeOnlyCount, outcomeCount, played: playerPredictions.length, pointsThisMatch };
    }).sort((a, b) => b.total - a.total || b.exactCount - a.exactCount || b.netGoalOnlyCount - a.netGoalOnlyCount || b.outcomeOnlyCount - a.outcomeOnlyCount || b.played - a.played || new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime());

    const maxPoints = Math.max(...snapshot.map((item) => item.pointsThisMatch), 0);
    const topPlayers = maxPoints > 0 ? snapshot.filter((item) => item.pointsThisMatch === maxPoints) : [];

    return {
      match: currentMatch,
      rankings: snapshot.map((item, rankingIndex) => ({ ...item, rank: rankingIndex + 1 })),
      maxPoints,
      topPlayerIds: topPlayers.map((item) => item.id),
      topPlayerUniqueId: topPlayers.length === 1 ? topPlayers[0].id : null,
    };
  });
}

function buildMatchContext(players, predictions, matches) {
  const matchesById = Object.fromEntries(matches.map((match) => [match.id, match]));
  const settledMatches = matches.filter((match) => match.status === "settled").sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime());
  const predictionsByPlayer = Object.fromEntries(players.map((player) => [player.id, predictions.filter((item) => item.playerId === player.id).sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime())]));
  const settledPredictionEventsByPlayer = {};
  const matchEvaluations = {};

  settledMatches.forEach((match) => {
    const matchPredictions = predictions.filter((prediction) => prediction.matchId === match.id);
    const outcomeHits = matchPredictions.filter((prediction) => calculateBasePoints(prediction, match) > 0);
    const exactHits = matchPredictions.filter((prediction) => calculateBasePoints(prediction, match) === 4);
    const outcomeOutcome = getOutcome(match.homeScore, match.awayScore);

    const outcomeChoiceCounts = matchPredictions.reduce((acc, prediction) => {
      const key = getOutcome(prediction.home, prediction.away);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    matchEvaluations[match.id] = {
      match,
      matchPredictions,
      outcomeHits,
      exactHits,
      outcomeChoiceCounts,
      actualOutcome: outcomeOutcome,
      topOutcomeShare: matchPredictions.length ? ((outcomeChoiceCounts[outcomeOutcome] || 0) / matchPredictions.length) : 0,
      uniqueOutcomeHitPlayerId: outcomeHits.length === 1 ? outcomeHits[0].playerId : null,
      uniqueExactHitPlayerId: exactHits.length === 1 ? exactHits[0].playerId : null,
    };
  });

  players.forEach((player) => {
    const events = settledMatches.map((match) => {
      const prediction = predictions.find((item) => item.playerId === player.id && item.matchId === match.id);
      const basePoints = calculateBasePoints(prediction, match);
      const totalGoalsPrediction = prediction ? prediction.home + prediction.away : null;
      return {
        match,
        prediction,
        basePoints,
        points: calculatePoints(prediction, match),
        outcomeHit: basePoints > 0,
        exactHit: basePoints === 4,
        netGoalHit: Boolean(prediction) && match.homeScore - match.awayScore === prediction.home - prediction.away,
        drawPrediction: Boolean(prediction) && prediction.home === prediction.away,
        drawOutcomeHit: Boolean(prediction) && match.homeScore === match.awayScore && basePoints > 0,
        zeroZeroExact: Boolean(prediction) && prediction.home === 0 && prediction.away === 0 && match.homeScore === 0 && match.awayScore === 0,
        bothTeamsScoreResult: match.homeScore > 0 && match.awayScore > 0,
        bothTeamsScoreHit: Boolean(prediction) && (prediction.home > 0 && prediction.away > 0) === (match.homeScore > 0 && match.awayScore > 0),
        highGoals4Exact: basePoints === 4 && Number.isFinite(totalGoalsPrediction) && totalGoalsPrediction >= 4,
        highGoals5Exact: basePoints === 4 && Number.isFinite(totalGoalsPrediction) && totalGoalsPrediction >= 5,
      };
    });
    settledPredictionEventsByPlayer[player.id] = events;
  });

  return {
    matchesById,
    predictionsByPlayer,
    settledMatches,
    settledPredictionEventsByPlayer,
    rankingSnapshots: buildRankingSnapshots(players, predictions, settledMatches),
    matchEvaluations,
  };
}

function computeLongestStreak(items, predicate) {
  let best = 0;
  let current = 0;
  let achievedAt = null;
  items.forEach((item) => {
    if (predicate(item)) {
      current += 1;
      if (current > best) {
        best = current;
        achievedAt = item.match?.kickoff || item.submittedAt || null;
      }
    } else {
      current = 0;
    }
  });
  return { count: best, achievedAt };
}

function computeDateStreak(predictions) {
  const uniqueDates = [...new Set(predictions.map((item) => getBeijingDateKey(item.submittedAt)))].sort();
  let best = 0;
  let current = 0;
  let previous = null;
  let achievedAt = null;
  uniqueDates.forEach((date) => {
    if (!previous) {
      current = 1;
    } else {
      const diff = (new Date(`${date}T00:00:00+08:00`).getTime() - new Date(`${previous}T00:00:00+08:00`).getTime()) / 86400000;
      current = diff === 1 ? current + 1 : 1;
    }
    if (current > best) {
      best = current;
      achievedAt = predictions.find((item) => getBeijingDateKey(item.submittedAt) === date)?.submittedAt || null;
    }
    previous = date;
  });
  return { count: best, achievedAt };
}

function computeSubmissionStreak(predictions, matchesById, predicate) {
  let best = 0;
  let current = 0;
  let achievedAt = null;
  predictions.forEach((prediction) => {
    const match = matchesById[prediction.matchId];
    if (!match) return;
    if (predicate(prediction, match)) {
      current += 1;
      if (current > best) {
        best = current;
        achievedAt = prediction.submittedAt;
      }
    } else {
      current = 0;
    }
  });
  return { count: best, achievedAt };
}

function findNthTimestamp(items, n, getTimestamp) {
  if (items.length < n) return null;
  return getTimestamp(items[n - 1]);
}

function computeFunPredictionWins(players, funPredictions, funResults) {
  const resultTotalGoals = Number(funResults.totalGoals);
  const goalPredictions = players
    .map((player) => ({ playerId: player.id, prediction: funPredictions[player.id] }))
    .filter((item) => item.prediction && Number.isFinite(Number(item.prediction.totalGoals)) && Number.isFinite(resultTotalGoals));
  const closestDiff = goalPredictions.length ? Math.min(...goalPredictions.map((item) => Math.abs(Number(item.prediction.totalGoals) - resultTotalGoals))) : null;

  return Object.fromEntries(players.map((player) => {
    const prediction = funPredictions[player.id];
    return [player.id, {
      champion: Boolean(prediction && funResults.champion && isSameText(prediction.champion, funResults.champion)),
      goldenBoot: Boolean(prediction && funResults.goldenBoot && isSameText(prediction.goldenBoot, funResults.goldenBoot)),
      firstRed: Boolean(prediction && funResults.firstRedCardTeam && isSameText(prediction.firstRedCardTeam, funResults.firstRedCardTeam)),
      totalGoals: Boolean(prediction && closestDiff !== null && Math.abs(Number(prediction.totalGoals) - resultTotalGoals) === closestDiff),
    }];
  }));
}

function computePlayerProgress(definition, player, context, funWins) {
  const playerPredictions = context.predictionsByPlayer[player.id] || [];
  const settledEvents = context.settledPredictionEventsByPlayer[player.id] || [];
  const groupMatches = Object.values(context.matchesById).filter((match) => match.stage === "GROUP");
  const groupMatchIds = new Set(groupMatches.map((match) => match.id));
  const knockoutPredictions = playerPredictions.filter((prediction) => context.matchesById[prediction.matchId] && context.matchesById[prediction.matchId].stage !== "GROUP");
  const exactHits = settledEvents.filter((event) => event.exactHit);
  const outcomeHits = settledEvents.filter((event) => event.outcomeHit);
  const netGoalHits = settledEvents.filter((event) => event.netGoalHit);
  const rankingSnapshots = context.rankingSnapshots.filter((snapshot) => snapshot.rankings.some((item) => item.id === player.id));
  const fun = funWins[player.id] || {};

  switch (definition.id) {
    case "firstPrediction":
      return getBinaryProgress(playerPredictions.length >= 1, playerPredictions[0]?.submittedAt || null);
    case "prediction10":
      return getProgress(playerPredictions.length, 10, findNthTimestamp(playerPredictions, 10, (item) => item.submittedAt));
    case "prediction50":
      return getProgress(playerPredictions.length, 50, findNthTimestamp(playerPredictions, 50, (item) => item.submittedAt));
    case "prediction104":
      return getProgress(playerPredictions.length, 104, findNthTimestamp(playerPredictions, 104, (item) => item.submittedAt));
    case "groupAll": {
      const predictedGroups = new Set(playerPredictions.filter((item) => groupMatchIds.has(item.matchId)).map((item) => item.matchId));
      const achieved = groupMatches.length > 0 && predictedGroups.size >= groupMatches.length;
      const achievedAt = achieved ? playerPredictions.filter((item) => groupMatchIds.has(item.matchId)).slice(-1)[0]?.submittedAt || null : null;
      return { current: Math.min(predictedGroups.size, groupMatches.length || 1), target: groupMatches.length || 1, achieved, achievedAt };
    }
    case "openingMatch":
      return getBinaryProgress(playerPredictions.some((item) => Number(context.matchesById[item.matchId]?.no) === 1), playerPredictions.find((item) => Number(context.matchesById[item.matchId]?.no) === 1)?.submittedAt || null);
    case "knockoutEntry":
      return getBinaryProgress(knockoutPredictions.length >= 1, knockoutPredictions[0]?.submittedAt || null);
    case "thirdPlaceEntry":
      return getBinaryProgress(playerPredictions.some((item) => context.matchesById[item.matchId]?.stage === "THIRD"), playerPredictions.find((item) => context.matchesById[item.matchId]?.stage === "THIRD")?.submittedAt || null);
    case "finalEntry":
      return getBinaryProgress(playerPredictions.some((item) => context.matchesById[item.matchId]?.stage === "FINAL"), playerPredictions.find((item) => context.matchesById[item.matchId]?.stage === "FINAL")?.submittedAt || null);
    case "knockout10":
      return getProgress(knockoutPredictions.length, 10, findNthTimestamp(knockoutPredictions, 10, (item) => item.submittedAt));
    case "firstKnockoutExact":
      return getBinaryProgress(exactHits.some((event) => event.match.stage !== "GROUP"), exactHits.find((event) => event.match.stage !== "GROUP")?.match.kickoff || null);
    case "finalExact":
      return getBinaryProgress(exactHits.some((event) => event.match.stage === "FINAL"), exactHits.find((event) => event.match.stage === "FINAL")?.match.kickoff || null);
    case "dailyStreak7": {
      const streak = computeDateStreak(playerPredictions);
      return getProgress(streak.count, 7, streak.achievedAt);
    }
    case "dailyStreak15": {
      const streak = computeDateStreak(playerPredictions);
      return getProgress(streak.count, 15, streak.achievedAt);
    }
    case "firstOutcome":
      return getBinaryProgress(outcomeHits.length >= 1, outcomeHits[0]?.match.kickoff || null);
    case "outcome5":
      return getProgress(outcomeHits.length, 5, findNthTimestamp(outcomeHits, 5, (item) => item.match.kickoff));
    case "outcome10":
      return getProgress(outcomeHits.length, 10, findNthTimestamp(outcomeHits, 10, (item) => item.match.kickoff));
    case "outcome30":
      return getProgress(outcomeHits.length, 30, findNthTimestamp(outcomeHits, 30, (item) => item.match.kickoff));
    case "outcome50":
      return getProgress(outcomeHits.length, 50, findNthTimestamp(outcomeHits, 50, (item) => item.match.kickoff));
    case "outcome70":
      return getProgress(outcomeHits.length, 70, findNthTimestamp(outcomeHits, 70, (item) => item.match.kickoff));
    case "firstExact":
      return getBinaryProgress(exactHits.length >= 1, exactHits[0]?.match.kickoff || null);
    case "exact3":
      return getProgress(exactHits.length, 3, findNthTimestamp(exactHits, 3, (item) => item.match.kickoff));
    case "exact5":
      return getProgress(exactHits.length, 5, findNthTimestamp(exactHits, 5, (item) => item.match.kickoff));
    case "exact8":
      return getProgress(exactHits.length, 8, findNthTimestamp(exactHits, 8, (item) => item.match.kickoff));
    case "exact12":
      return getProgress(exactHits.length, 12, findNthTimestamp(exactHits, 12, (item) => item.match.kickoff));
    case "exact15":
      return getProgress(exactHits.length, 15, findNthTimestamp(exactHits, 15, (item) => item.match.kickoff));
    case "outcomeStreak3": {
      const streak = computeLongestStreak(settledEvents, (item) => item.outcomeHit);
      return getProgress(streak.count, 3, streak.achievedAt);
    }
    case "outcomeStreak5": {
      const streak = computeLongestStreak(settledEvents, (item) => item.outcomeHit);
      return getProgress(streak.count, 5, streak.achievedAt);
    }
    case "outcomeStreak7": {
      const streak = computeLongestStreak(settledEvents, (item) => item.outcomeHit);
      return getProgress(streak.count, 7, streak.achievedAt);
    }
    case "outcomeStreak10": {
      const streak = computeLongestStreak(settledEvents, (item) => item.outcomeHit);
      return getProgress(streak.count, 10, streak.achievedAt);
    }
    case "exactStreak2": {
      const streak = computeLongestStreak(settledEvents, (item) => item.exactHit);
      return getProgress(streak.count, 2, streak.achievedAt);
    }
    case "exactStreak3": {
      const streak = computeLongestStreak(settledEvents, (item) => item.exactHit);
      return getProgress(streak.count, 3, streak.achievedAt);
    }
    case "exactStreak4": {
      const streak = computeLongestStreak(settledEvents, (item) => item.exactHit);
      return getProgress(streak.count, 4, streak.achievedAt);
    }
    case "exactStreak5": {
      const streak = computeLongestStreak(settledEvents, (item) => item.exactHit);
      return getProgress(streak.count, 5, streak.achievedAt);
    }
    case "firstNetGoal":
      return getBinaryProgress(netGoalHits.length >= 1, netGoalHits[0]?.match.kickoff || null);
    case "netGoal10":
      return getProgress(netGoalHits.length, 10, findNthTimestamp(netGoalHits, 10, (item) => item.match.kickoff));
    case "netGoal20":
      return getProgress(netGoalHits.length, 20, findNthTimestamp(netGoalHits, 20, (item) => item.match.kickoff));
    case "earlyStreak10": {
      const streak = computeSubmissionStreak(playerPredictions, context.matchesById, (prediction, match) => new Date(match.kickoff).getTime() - new Date(prediction.submittedAt).getTime() > 3600000);
      return getProgress(streak.count, 10, streak.achievedAt);
    }
    case "lateStreak10": {
      const streak = computeSubmissionStreak(playerPredictions, context.matchesById, (prediction, match) => {
        const diff = new Date(match.kickoff).getTime() - new Date(prediction.submittedAt).getTime();
        return diff >= 0 && diff <= 3600000;
      });
      return getProgress(streak.count, 10, streak.achievedAt);
    }
    case "earlyStreak20": {
      const streak = computeSubmissionStreak(playerPredictions, context.matchesById, (prediction, match) => new Date(match.kickoff).getTime() - new Date(prediction.submittedAt).getTime() > 3600000);
      return getProgress(streak.count, 20, streak.achievedAt);
    }
    case "lateStreak20": {
      const streak = computeSubmissionStreak(playerPredictions, context.matchesById, (prediction, match) => {
        const diff = new Date(match.kickoff).getTime() - new Date(prediction.submittedAt).getTime();
        return diff >= 0 && diff <= 3600000;
      });
      return getProgress(streak.count, 20, streak.achievedAt);
    }
    case "firstDrawOutcome": {
      const first = settledEvents.find((item) => item.drawOutcomeHit);
      return getBinaryProgress(Boolean(first), first?.match.kickoff || null);
    }
    case "drawPredictions10": {
      const drawPredictions = playerPredictions.filter((item) => item.home === item.away);
      return getProgress(drawPredictions.length, 10, findNthTimestamp(drawPredictions, 10, (item) => item.submittedAt));
    }
    case "firstZeroZeroExact": {
      const first = settledEvents.find((item) => item.zeroZeroExact);
      return getBinaryProgress(Boolean(first), first?.match.kickoff || null);
    }
    case "bttsFirst": {
      const first = settledEvents.find((item) => item.bothTeamsScoreResult && item.bothTeamsScoreHit);
      return getBinaryProgress(Boolean(first), first?.match.kickoff || null);
    }
    case "btts10": {
      const hits = settledEvents.filter((item) => item.bothTeamsScoreResult && item.bothTeamsScoreHit);
      return getProgress(hits.length, 10, findNthTimestamp(hits, 10, (item) => item.match.kickoff));
    }
    case "highGoalsExact4": {
      const first = settledEvents.find((item) => item.highGoals4Exact);
      return getBinaryProgress(Boolean(first), first?.match.kickoff || null);
    }
    case "highGoalsExact5": {
      const first = settledEvents.find((item) => item.highGoals5Exact);
      return getBinaryProgress(Boolean(first), first?.match.kickoff || null);
    }
    case "top10First": {
      const first = rankingSnapshots.find((snapshot) => {
        const current = snapshot.rankings.find((item) => item.id === player.id);
        return current && current.rank <= 10;
      });
      return getBinaryProgress(Boolean(first), first?.match.kickoff || null);
    }
    case "firstTop1": {
      const first = rankingSnapshots.find((snapshot) => {
        const current = snapshot.rankings.find((item) => item.id === player.id);
        return current && current.rank === 1 && current.played >= 5;
      });
      return getBinaryProgress(Boolean(first), first?.match.kickoff || null);
    }
    case "top3Streak3": {
      const streak = computeLongestStreak(rankingSnapshots.map((snapshot) => ({ ...snapshot, match: snapshot.match })), (snapshot) => {
        const current = snapshot.rankings.find((item) => item.id === player.id);
        return Boolean(current && current.played >= 5 && current.rank <= 3);
      });
      return getProgress(streak.count, 3, streak.achievedAt);
    }
    case "top1Streak3": {
      const streak = computeLongestStreak(rankingSnapshots.map((snapshot) => ({ ...snapshot, match: snapshot.match })), (snapshot) => {
        const current = snapshot.rankings.find((item) => item.id === player.id);
        return Boolean(current && current.played >= 5 && current.rank === 1);
      });
      return getProgress(streak.count, 3, streak.achievedAt);
    }
    case "top1Streak10": {
      const streak = computeLongestStreak(rankingSnapshots.map((snapshot) => ({ ...snapshot, match: snapshot.match })), (snapshot) => (snapshot.rankings.find((item) => item.id === player.id)?.rank || 999) === 1);
      return getProgress(streak.count, 10, streak.achievedAt);
    }
    case "finalChampion": {
      const final = rankingSnapshots.at(-1);
      const finalMatchCount = Object.keys(context.matchesById).length;
      const current = final?.rankings.find((item) => item.id === player.id);
      const condition = context.settledMatches.length >= finalMatchCount && current?.rank === 1;
      return getBinaryProgress(condition, final?.match.kickoff || null);
    }
    case "finalTop3": {
      const final = rankingSnapshots.at(-1);
      const finalMatchCount = Object.keys(context.matchesById).length;
      const current = final?.rankings.find((item) => item.id === player.id);
      const condition = context.settledMatches.length >= finalMatchCount && current?.rank <= 3;
      return getBinaryProgress(condition, final?.match.kickoff || null);
    }
    case "singleMatchBest": {
      const first = rankingSnapshots.find((snapshot) => snapshot.topPlayerIds.includes(player.id));
      return getBinaryProgress(Boolean(first), first?.match.kickoff || null);
    }
    case "singleMatchSoloBest": {
      const first = rankingSnapshots.find((snapshot) => snapshot.topPlayerUniqueId === player.id);
      return getBinaryProgress(Boolean(first), first?.match.kickoff || null);
    }
    case "rareOutcome30": {
      const hits = settledEvents.filter((item) => item.outcomeHit && (context.matchEvaluations[item.match.id]?.topOutcomeShare || 1) < 0.3);
      return getBinaryProgress(hits.length >= 1, hits[0]?.match.kickoff || null);
    }
    case "rareOutcome10": {
      const hits = settledEvents.filter((item) => item.outcomeHit && (context.matchEvaluations[item.match.id]?.topOutcomeShare || 1) < 0.1);
      return getBinaryProgress(hits.length >= 1, hits[0]?.match.kickoff || null);
    }
    case "soloOutcome": {
      const hit = settledEvents.find((item) => item.outcomeHit && context.matchEvaluations[item.match.id]?.uniqueOutcomeHitPlayerId === player.id);
      return getBinaryProgress(Boolean(hit), hit?.match.kickoff || null);
    }
    case "soloExact": {
      const hit = settledEvents.find((item) => item.exactHit && context.matchEvaluations[item.match.id]?.uniqueExactHitPlayerId === player.id);
      return getBinaryProgress(Boolean(hit), hit?.match.kickoff || null);
    }
    case "soloKnockoutExact": {
      const hit = settledEvents.find((item) => item.exactHit && item.match.stage !== "GROUP" && context.matchEvaluations[item.match.id]?.uniqueExactHitPlayerId === player.id);
      return getBinaryProgress(Boolean(hit), hit?.match.kickoff || null);
    }
    case "soloExact3": {
      const hits = settledEvents.filter((item) => item.exactHit && context.matchEvaluations[item.match.id]?.uniqueExactHitPlayerId === player.id);
      return getProgress(hits.length, 3, findNthTimestamp(hits, 3, (item) => item.match.kickoff));
    }
    case "funChampion":
      return getBinaryProgress(fun.champion, fun.champion ? new Date().toISOString() : null);
    case "funGoldenBoot":
      return getBinaryProgress(fun.goldenBoot, fun.goldenBoot ? new Date().toISOString() : null);
    case "funFirstRed":
      return getBinaryProgress(fun.firstRed, fun.firstRed ? new Date().toISOString() : null);
    case "funTotalGoals":
      return getBinaryProgress(fun.totalGoals, fun.totalGoals ? new Date().toISOString() : null);
    default:
      return { current: 0, target: 1, achieved: false, achievedAt: null };
  }
}

export function buildAchievementCollections({ players, currentPlayerId, predictions, matches, funPredictions, funResults }) {
  const safePlayers = players || [];
  const safePredictions = predictions || [];
  const safeMatches = matches || [];
  const context = buildMatchContext(safePlayers, safePredictions, safeMatches);
  const funWins = computeFunPredictionWins(safePlayers, funPredictions || {}, funResults || {});
  const byPlayerId = {};
  const roomCounts = {};

  safePlayers.forEach((player) => {
    byPlayerId[player.id] = ACHIEVEMENT_DEFINITIONS.map((achievement) => ({
      achievement,
      progress: computePlayerProgress(achievement, player, context, funWins),
    }));
  });

  ACHIEVEMENT_DEFINITIONS.forEach((achievement) => {
    roomCounts[achievement.id] = safePlayers.filter((player) => byPlayerId[player.id]?.find((item) => item.achievement.id === achievement.id)?.progress.achieved).length;
  });

  const currentPlayerItems = (byPlayerId[currentPlayerId] || byPlayerId[safePlayers[0]?.id] || []).map((item) => ({
    achievement: item.achievement,
    currentPlayerProgress: item.progress,
    roomAchievedCount: roomCounts[item.achievement.id] || 0,
    roomTotalPlayers: safePlayers.length,
  }));

  return {
    currentPlayerItems,
    byPlayerId,
    roomCounts,
    totalAchievements: ACHIEVEMENT_DEFINITIONS.length,
  };
}

export function getAchievementTheme(item) {
  const achieved = item?.currentPlayerProgress?.achieved;
  const hiddenUnlocked = item?.achievement?.hidden && achieved;
  if (hiddenUnlocked) {
    return {
      card: "border-emerald-300/35 bg-[linear-gradient(135deg,rgba(6,78,59,0.82),rgba(20,83,45,0.7),rgba(6,95,70,0.36))] shadow-[0_0_35px_rgba(16,185,129,0.14)]",
      title: "bg-gradient-to-r from-emerald-100 via-teal-100 to-lime-50 bg-clip-text text-transparent",
      badge: "border border-emerald-200/35 bg-emerald-100/10 text-emerald-100",
      accent: "text-emerald-100",
    };
  }

  if (!achieved) {
    return {
      card: item?.achievement?.hidden
        ? "border-emerald-900/45 bg-[linear-gradient(180deg,rgba(7,18,12,0.96),rgba(10,24,16,0.94))]"
        : "border-emerald-950/45 bg-[linear-gradient(180deg,rgba(11,23,16,0.92),rgba(15,31,22,0.86))]",
      title: "text-slate-100",
      badge: "border border-emerald-900/45 bg-emerald-950/45 text-emerald-100/80",
      accent: "text-emerald-100/80",
    };
  }

  switch (item?.achievement?.rarity) {
    case "普通":
      return { card: "border-emerald-900/35 bg-[linear-gradient(180deg,rgba(10,23,16,0.96),rgba(14,31,22,0.9))] shadow-[0_0_20px_rgba(34,197,94,0.06)]", title: "text-emerald-50", badge: "border border-emerald-200/20 bg-emerald-100/10 text-emerald-50", accent: "text-emerald-100" };
    case "稀有":
      return { card: "border-emerald-500/25 bg-[linear-gradient(180deg,rgba(11,39,28,0.96),rgba(15,45,32,0.9))] shadow-[0_0_24px_rgba(52,211,153,0.08)]", title: "text-emerald-100", badge: "border border-emerald-400/25 bg-emerald-400/10 text-emerald-100", accent: "text-emerald-100" };
    case "史诗":
      return { card: "border-violet-400/28 bg-[linear-gradient(180deg,rgba(14,34,22,0.96),rgba(23,44,31,0.9))] shadow-[0_0_24px_rgba(168,85,247,0.09)]", title: "text-violet-100", badge: "border border-violet-400/26 bg-violet-400/10 text-violet-100", accent: "text-violet-100" };
    case "传说":
      return { card: "border-amber-300/34 bg-[linear-gradient(180deg,rgba(18,35,22,0.96),rgba(31,46,26,0.9))] shadow-[0_0_28px_rgba(251,191,36,0.11)]", title: "text-amber-100", badge: "border border-amber-300/28 bg-amber-300/10 text-amber-100", accent: "text-amber-100" };
    case "神话":
      return { card: "border-rose-400/36 bg-[linear-gradient(135deg,rgba(19,38,27,0.96),rgba(45,31,27,0.86),rgba(68,22,40,0.52))] before:absolute before:inset-0 before:rounded-[inherit] before:bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.08),transparent)] before:animate-[pulse_4s_ease-in-out_infinite] overflow-hidden shadow-[0_0_30px_rgba(244,63,94,0.12)]", title: "text-rose-50", badge: "border border-rose-300/30 bg-rose-300/10 text-rose-50", accent: "text-rose-100" };
    default:
      return { card: "border-emerald-950/40 bg-[linear-gradient(180deg,rgba(10,23,16,0.96),rgba(14,31,22,0.9))]", title: "text-emerald-50", badge: "border border-emerald-900/45 bg-emerald-950/45 text-emerald-100/80", accent: "text-emerald-100" };
  }
}

export function getAchievementBadgeClass(item) {
  if (item?.achievement?.hidden && item?.currentPlayerProgress?.achieved) {
    return "border border-emerald-200/35 bg-emerald-100/10 text-emerald-100";
  }

  switch (item?.achievement?.rarity) {
    case "普通":
      return "border border-emerald-200/20 bg-emerald-100/10 text-emerald-50";
    case "稀有":
      return "border border-emerald-400/25 bg-emerald-400/10 text-emerald-100";
    case "史诗":
      return "border border-violet-400/30 bg-violet-400/10 text-violet-100";
    case "传说":
      return "border border-amber-300/30 bg-amber-300/10 text-amber-100";
    case "神话":
      return "border border-rose-300/35 bg-rose-300/10 text-rose-50";
    default:
      return "border border-emerald-900/45 bg-emerald-950/45 text-emerald-100/80";
  }
}
