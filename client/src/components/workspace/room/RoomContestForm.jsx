import { useEffect, useMemo, useState } from "react";
import { getRoomContestCatalog, publishRoomContest } from "../../../api/rooms.api.js";

const difficulties = ["easy", "medium", "hard"];
const fieldClass = "w-full min-w-0 rounded-lg border border-gray-700 bg-[#1b1b1b] p-2";
const formatDifficulty = (level) => level[0].toUpperCase() + level.slice(1);

function QuestionLink({ question }) {
  return (
    <a
      href={`https://leetcode.com/problems/${question.slug}/`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Open ${question.title} on LeetCode (new tab)`}
      className="shrink-0 rounded text-sm text-[#ff9d3c] underline underline-offset-2 focus-visible:outline-2"
    >
      Open on LeetCode
    </a>
  );
}

function indexTopics(catalog) {
  const topics = new Map(catalog?.topics?.map((topic) => [topic._id, topic]));
  const paths = new Map();
  const available = new Set();
  for (const { topicId } of catalog?.questions ?? []) {
    if (paths.has(topicId)) continue;
    const path = new Set();
    let current = topics.get(topicId);
    while (current && !path.has(current._id)) {
      path.add(current._id);
      available.add(current._id);
      current = topics.get(current.parentTopicId);
    }
    paths.set(topicId, path);
  }

  const optionsBySheet = new Map();
  for (const topic of topics.values()) {
    if (!available.has(topic._id)) continue;
    const parent = topics.get(topic.parentTopicId);
    const options = optionsBySheet.get(topic.sheetId) ?? [];
    options.push({ id: topic._id, label: parent ? `${parent.name} / ${topic.name}` : topic.name });
    optionsBySheet.set(topic.sheetId, options);
  }
  return { paths, optionsBySheet };
}

export default function RoomContestForm({ roomId, onPublish, onCancel }) {
  const [catalog, setCatalog] = useState(null);
  const [title, setTitle] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [duration, setDuration] = useState(60);
  const [count, setCount] = useState(3);
  const [points, setPoints] = useState({ easy: 1, medium: 2, hard: 3 });
  const [selected, setSelected] = useState([]);
  const [sheet, setSheet] = useState("");
  const [topic, setTopic] = useState("");
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [catalogAttempt, setCatalogAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    getRoomContestCatalog(roomId, controller.signal)
      .then(setCatalog)
      .catch((error) => {
        if (!controller.signal.aborted) {
          setError(error.response?.data?.message || "Could not load contest questions.");
        }
      });
    return () => controller.abort();
  }, [roomId, catalogAttempt]);

  const { paths, optionsBySheet } = useMemo(() => indexTopics(catalog), [catalog]);
  const visibleQuestions = catalog?.questions.filter((question) =>
    (!sheet || question.sheetId === sheet) &&
    (!topic || paths.get(question.topicId)?.has(topic)) &&
    (!filter || (question.difficulty ?? "unrated") === filter) &&
    question.title.toLowerCase().includes(search.trim().toLowerCase()),
  ) ?? [];
  const ready = catalog && selected.length === Number(count) && selected.every(({ difficulty }) => difficulty);

  async function publish(event) {
    event.preventDefault();
    if (!ready || saving) return;
    setSaving(true);
    setError("");
    try {
      const contest = await publishRoomContest(roomId, {
        title,
        startsAt: new Date(startsAt).toISOString(),
        durationMinutes: Number(duration),
        questionCount: Number(count),
        points: Object.fromEntries(difficulties.map((level) => [level, Number(points[level])])),
        questions: selected.map(({ questionId, difficulty }) => ({ questionId, difficulty })),
      });
      onPublish(contest);
    } catch (error) {
      setError(error.response?.data?.message || "Could not publish the contest.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={publish} className="space-y-5 rounded-xl border border-gray-800 bg-[#111111] p-4">
      <h3 className="text-lg font-semibold">Create contest</h3>
      <fieldset disabled={saving} className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <label>Title
            <input required maxLength={120} value={title} onChange={(event) => setTitle(event.target.value)} className={fieldClass} />
          </label>
          <label>Start time ({Intl.DateTimeFormat().resolvedOptions().timeZone})
            <input required type="datetime-local" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} className={fieldClass} />
          </label>
          <label>Duration (minutes)
            <input required type="number" min="1" value={duration} onChange={(event) => setDuration(event.target.value)} className={fieldClass} />
          </label>
          <label>Number of questions
            <input required type="number" min="1" value={count} onChange={(event) => setCount(event.target.value)} className={fieldClass} />
          </label>
        </div>
        <fieldset>
          <legend className="mb-2 font-medium">Points per verified solve</legend>
          <div className="grid gap-3 sm:grid-cols-3">
            {difficulties.map((level) => (
              <label key={level}>{formatDifficulty(level)}
                <input required type="number" min="0" value={points[level]} className={fieldClass}
                  onChange={(event) => setPoints({ ...points, [level]: event.target.value })} />
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-2 font-medium">LeetCode questions</legend>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label>Search
              <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} className={fieldClass} />
            </label>
            <label>Sheet
              <select value={sheet} onChange={(event) => {
                const nextSheet = event.target.value;
                setSheet(nextSheet);
                if (nextSheet && !optionsBySheet.get(nextSheet)?.some(({ id }) => id === topic)) setTopic("");
              }} className={fieldClass}>
                <option value="">All sheets</option>
                {catalog?.sheets.map(({ _id, name }) => <option key={_id} value={_id}>{name}</option>)}
              </select>
            </label>
            <label>Topic
              <select value={topic} onChange={(event) => setTopic(event.target.value)} className={fieldClass}>
                <option value="">All topics</option>
                {catalog?.sheets.filter(({ _id }) => !sheet || _id === sheet).map(({ _id, name }) => {
                  const options = optionsBySheet.get(_id);
                  return options && (
                    <optgroup key={_id} label={name}>
                      {options.map(({ id, label }) => <option key={id} value={id}>{label}</option>)}
                    </optgroup>
                  );
                })}
              </select>
            </label>
            <label>Difficulty filter
              <select value={filter} onChange={(event) => setFilter(event.target.value)} className={fieldClass}>
                <option value="">All difficulties</option>
                {difficulties.map((level) => <option key={level} value={level}>{formatDifficulty(level)}</option>)}
                <option value="unrated">Needs difficulty</option>
              </select>
            </label>
          </div>
          {catalog && (
            <ul className="mt-3 max-h-64 overflow-y-auto divide-y divide-gray-800 rounded-lg border border-gray-800 bg-[#1b1b1b]">
              {visibleQuestions.map((question) => {
                const existing = selected.find(({ slug }) => slug === question.slug);
                return (
                  <li key={question.questionId} className="flex flex-wrap items-center gap-x-3 gap-y-1 p-3">
                    <label className="flex min-w-0 flex-1 basis-48 items-center gap-3">
                      <input type="checkbox" checked={Boolean(existing)}
                        disabled={!existing && selected.length >= Number(count)}
                        onChange={() => setSelected(existing
                          ? selected.filter(({ slug }) => slug !== question.slug)
                          : [...selected, question])} />
                      <span>{question.title}</span>
                      <span className="ml-auto text-sm text-gray-400">
                        {question.difficulty ? formatDifficulty(question.difficulty) : "Needs difficulty"}
                      </span>
                    </label>
                    <QuestionLink question={question} />
                  </li>
                );
              })}
              {!visibleQuestions.length && <li className="p-3 text-gray-400">No matching LeetCode questions.</li>}
            </ul>
          )}
          {!catalog && !error && <p className="mt-2 text-gray-400">Loading questions…</p>}
          {!catalog && error && (
            <button type="button" className="mt-2 underline" onClick={() => {
              setError("");
              setCatalogAttempt(catalogAttempt + 1);
            }}>Retry loading questions</button>
          )}
        </fieldset>

        <section aria-label="Selected questions">
          <p role="status" className="font-medium">{selected.length} of {count || 0} selected</p>
          {selected.length > Number(count) && <p className="text-amber-300">Remove questions to match the configured count.</p>}
          <ul className="mt-2 space-y-2">
            {selected.map((question) => (
              <li key={question.questionId} className="flex flex-wrap items-center gap-3">
                <span>{question.title}</span>
                <QuestionLink question={question} />
                {catalog.questions.find(({ questionId }) => questionId === question.questionId)?.difficulty ? (
                  <span className="text-sm text-gray-400">{formatDifficulty(question.difficulty)}</span>
                ) : (
                  <select aria-label={`Difficulty for ${question.title}`} required
                    value={question.difficulty ?? ""} className="rounded border border-gray-700 bg-[#1b1b1b] p-1"
                    onChange={(event) => setSelected(selected.map((entry) => entry.slug === question.slug
                      ? { ...entry, difficulty: event.target.value }
                      : entry))}>
                    <option value="">Choose difficulty</option>
                    {difficulties.map((level) => <option key={level} value={level}>{formatDifficulty(level)}</option>)}
                  </select>
                )}
                <button type="button" aria-label={`Remove ${question.title}`} className="text-sm underline"
                  onClick={() => setSelected(selected.filter(({ slug }) => slug !== question.slug))}>Remove</button>
              </li>
            ))}
          </ul>
        </section>
      </fieldset>
      {error && <p role="alert" className="text-red-400">{error}</p>}
      <div className="flex gap-3">
        <button type="submit" disabled={!ready || saving}
          className="rounded-lg bg-[#ff9d3c] px-4 py-2 font-medium text-black disabled:opacity-50">
          {saving ? "Publishing…" : "Publish contest"}
        </button>
        <button type="button" disabled={saving} onClick={onCancel} className="px-3 py-2 underline">Cancel</button>
      </div>
    </form>
  );
}
