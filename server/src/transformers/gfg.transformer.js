export function transformGfgResponse({ handle, profile, submissions }) {
  const difficulty = new Map();
  const calendar = new Map();
  const languages = new Map();
  const solved = [];

  for (const [level, problems] of Object.entries(submissions)) {
    difficulty.set(level.toLowerCase(), Object.keys(problems).length);
    for (const [id, problem] of Object.entries(problems)) {
      if (problem.lang) {
        languages.set(problem.lang, (languages.get(problem.lang) ?? 0) + 1);
      }

      // The API returns a timestamp without an offset. Preserve its calendar day.
      const timestamp = problem.user_subtime?.replace(" ", "T");
      const solvedAt = timestamp ? new Date(`${timestamp}Z`) : null;
      if (!solvedAt || Number.isNaN(solvedAt.getTime())) continue;

      const date = solvedAt.toISOString().slice(0, 10);
      calendar.set(date, (calendar.get(date) ?? 0) + 1);
      solved.push({ id, title: problem.pname, titleSlug: problem.slug, solvedAt });
    }
  }

  const count = [...difficulty.values()].reduce((total, value) => total + value, 0);
  const languageTotal = [...languages.values()].reduce((total, value) => total + value, 0);

  return {
    profileUrl: `https://www.geeksforgeeks.org/user/${encodeURIComponent(handle)}/`,
    avatarUrl: profile.profile_image_url,
    stats: {
      totalQuestions: profile.total_problems_solved ?? count,
      codingScore: profile.score,
      monthlyScore: profile.monthly_score,
      activeDays: calendar.size,
      basicSolved: difficulty.get("basic") ?? 0,
      schoolSolved: difficulty.get("school") ?? 0,
      easySolved: difficulty.get("easy") ?? 0,
      mediumSolved: difficulty.get("medium") ?? 0,
      hardSolved: difficulty.get("hard") ?? 0,
      maxStreak: profile.pod_solved_longest_streak,
      currentStreak: profile.pod_solved_current_streak,
    },
    languages: [...languages]
      .sort(([, a], [, b]) => b - a)
      .map(([name, count]) => ({ name, count, percentage: (count / languageTotal) * 100 })),
    heatmap: [...calendar]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date: new Date(date), count })),
    recentAcSubmissions: solved.sort((a, b) => b.solvedAt - a.solvedAt).slice(0, 10),
  };
}
