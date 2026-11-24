import DonutChart from "../DonutChart.jsx";
import { Settings } from "lucide-react";
import { Link } from "react-router-dom";
import HeatmapComponent from "../HeatmapComponent.jsx";

const panel = "rounded-xl border border-[#2e2e2e] bg-black p-5";
const heading = "text-sm font-semibold uppercase tracking-wide text-zinc-400";
const logo = "/assets/platformLogos/GeeksForGeeks.png";
const labels = {
  cpp: "C++",
  python: "Python",
  python3: "Python 3",
  java: "Java",
  javascript: "JavaScript",
  c: "C",
};

export default function GfgData({ profile, username, isOwner }) {
  if (!username || !profile || profile.handle !== username) {
    return (
      <div className={`flex min-h-48 flex-col items-center justify-center gap-3 text-center ${panel}`}>
        <img src={logo} alt="" className="h-10 w-10 object-contain" />
        <p className="text-sm text-zinc-300">
          {username ? "No synced GeeksforGeeks stats for this handle." : "No GeeksforGeeks username set."}
        </p>
        {isOwner && !username && (
          <Link to="/user_data?tab=platforms" className="flex items-center gap-2 rounded-lg bg-[#f89f1b] px-4 py-2 text-sm font-semibold text-black hover:bg-[#e08e10]">
            <Settings size={14} />
            Add in Settings
          </Link>
        )}
        {isOwner && username && <p className="text-xs text-zinc-400">Use Sync all profiles to try again.</p>}
      </div>
    );
  }

  const { stats, heatmap, languages, recentAcSubmissions } = profile;
  const today = new Date();
  const startDate = new Date(today);
  startDate.setFullYear(today.getFullYear() - 1);
  const extraLevels = [
    { label: "School", count: stats.schoolSolved, color: "#60a5fa", style: "bg-blue-400/10 text-blue-400" },
    { label: "Basic", count: stats.basicSolved, color: "#2dd4bf", style: "bg-teal-400/10 text-teal-400" },
  ].filter(({ count }) => count > 0);
  const difficulty = [
    ...extraLevels,
    { label: "Easy", count: stats.easySolved ?? 0, style: "bg-green-500/10 text-green-500" },
    { label: "Medium", count: stats.mediumSolved ?? 0, style: "bg-[#f89f1b]/10 text-[#f89f1b]" },
    { label: "Hard", count: stats.hardSolved ?? 0, style: "bg-red-500/10 text-red-500" },
  ];

  return (
    <div className="space-y-3">
      {profile.syncStatus === "failed" && (
        <p className="text-sm text-zinc-400">Showing saved stats. The last sync failed.</p>
      )}
      <section className="w-full rounded-xl border border-[#2e2e2e] bg-black p-3">
        <h2 className={`mb-2 ${heading}`}>Solve Activity Heatmap</h2>
        <div className="w-full overflow-x-auto">
          <div className="w-fit min-w-full">
            <HeatmapComponent startDate={startDate} endDate={today} values={heatmap} />
          </div>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {[
          ["Total Questions", stats.totalQuestions],
          ["Recorded Solve Days", stats.activeDays],
        ].map(([label, value]) => (
          <dl key={label} className={`flex flex-col items-center justify-center text-center ${panel}`}>
            <dt className={heading}>{label}</dt>
            <dd className="mt-2 text-4xl font-bold">{value ?? "—"}</dd>
          </dl>
        ))}
        <section className={`sm:col-span-2 xl:col-span-1 ${panel}`}>
          <h2 className={`mb-3 ${heading}`}>Languages</h2>
          {languages.length ? (
            <ul className="flex flex-col gap-2">
              {languages.map(({ name, count }) => (
                <li key={name} className="flex justify-between rounded-lg bg-white/5 px-3 py-1.5 text-sm">
                  <span className="font-medium text-zinc-300">{labels[name] ?? name}</span>
                  <span className="font-bold">{count}</span>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-zinc-400">No language data.</p>}
        </section>
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        <section className={panel}>
          <h2 className={`mb-4 ${heading}`}>Coding Scores &amp; POTD Streaks</h2>
          <dl className="grid grid-cols-2 gap-4 text-center">
            {[
              ["Coding Score", stats.codingScore],
              ["Monthly Score", stats.monthlyScore],
              ["Longest POTD Streak", stats.maxStreak],
              ["Current POTD Streak", stats.currentStreak],
            ].map(([label, value], index) => (
              <div key={label}>
                <dt className={heading}>{label}</dt>
                <dd className={`mt-2 text-3xl font-bold ${index === 0 ? "text-[#f89f1b]" : ""}`}>
                  {value ?? "—"}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className={panel}>
          <h2 className={`mb-4 ${heading}`}>DSA Problems Solved</h2>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <DonutChart
              easy={stats.easySolved}
              medium={stats.mediumSolved}
              hard={stats.hardSolved}
              extraSegments={extraLevels}
            />
            <dl className="flex min-w-28 flex-1 flex-col gap-2">
              {difficulty.map(({ label, count, style }) => (
                <div key={label} className={`flex justify-between rounded-lg px-3 py-2 text-sm font-semibold ${style}`}>
                  <dt>{label}</dt>
                  <dd className="text-white">{count}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </div>
      <section className={panel}>
        <h2 className={`mb-2 ${heading}`}>Recently Solved</h2>
        {recentAcSubmissions.length ? (
          <ul className="divide-y divide-white/10">
            {recentAcSubmissions.map(({ id, title, titleSlug, solvedAt }) => (
              <li key={id} className="flex flex-wrap items-baseline justify-between gap-x-3 py-2 text-sm">
                <a href={`https://www.geeksforgeeks.org/problems/${encodeURIComponent(titleSlug)}/1`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {title}
                </a>
                <time dateTime={solvedAt.slice(0, 10)} className="text-zinc-400">
                  {new Date(solvedAt).toLocaleDateString(undefined, { timeZone: "UTC" })}
                </time>
              </li>
            ))}
          </ul>
        ) : <p className="text-sm text-zinc-400">No solved problems reported.</p>}
      </section>
    </div>
  );
}
