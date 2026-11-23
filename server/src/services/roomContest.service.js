export const difficulties = ["easy", "medium", "hard"];

export function leetcodeSlug(link) {
  if (!link) return null;
  try {
    const url = new URL(link);
    if (url.protocol !== "https:" || !["leetcode.com", "www.leetcode.com"].includes(url.hostname)) {
      return null;
    }
    return /^\/problems\/([a-z0-9-]+)(?:\/|$)/i.exec(url.pathname)?.[1].toLowerCase() ?? null;
  } catch {
    return null;
  }
}

export function findContestSubmission(submissions, slug, startsAt, endsAt) {
  let earliest;
  for (const submission of submissions) {
    if (submission.titleSlug !== slug || !submission.id) continue;
    const submittedAt = new Date(Number(submission.timestamp) * 1000);
    if (!(submittedAt >= startsAt && submittedAt < endsAt)) continue;
    if (!earliest || submittedAt < earliest.submittedAt) {
      earliest = { submissionId: String(submission.id), submittedAt };
    }
  }
  return earliest;
}

export function contestStandings(solves) {
  const entries = new Map();
  for (const solve of solves) {
    const userId = String(solve.userId);
    const entry = entries.get(userId) ?? {
      userId,
      username: solve.username,
      points: 0,
      solved: 0,
      reachedAt: null,
    };
    entry.points += solve.points;
    entry.solved += 1;
    if (solve.points > 0 && (entry.reachedAt === null || solve.submittedAt > entry.reachedAt)) {
      entry.reachedAt = solve.submittedAt;
    }
    entries.set(userId, entry);
  }

  let rank = 1;
  return [...entries.values()]
    .sort((a, b) => b.points - a.points || a.reachedAt - b.reachedAt || a.userId.localeCompare(b.userId))
    .map((entry, index, sorted) => {
      const previous = sorted[index - 1];
      if (previous && (entry.points !== previous.points || +entry.reachedAt !== +previous.reachedAt)) {
        rank = index + 1;
      }
      return { ...entry, rank };
    });
}
