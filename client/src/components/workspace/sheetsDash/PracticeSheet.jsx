import SheetBack from "./SheetBack";
import SheetLoading from "./SheetLoading";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Play, Star } from "lucide-react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  getSheetBySlug,
  toggleBookmarkQuestion,
  toggleSheetQuestion,
} from "../../../api/sheets.api";
import QuestionCompletionCheckbox from "./QuestionCompletionCheckbox";

const resourceLabels = {
  primary: "Problem",
  leetcode: "LeetCode",
  gfg: "GFG",
  video: "Video",
  article: "Article",
};
const focusClass = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-400";

function PracticeQuestion({ question, onChange }) {
  const { _id, sheetId, title, links = {}, completed, bookmarked } = question;
  const [saving, setSaving] = useState(false);
  const resources = Object.entries(resourceLabels).filter(
    ([key]) => links[key] &&
      (key !== "primary" || ![links.leetcode, links.gfg, links.video, links.article].includes(links.primary)),
  );

  async function toggle(field) {
    setSaving(true);
    try {
      const save = field === "completed" ? toggleSheetQuestion : toggleBookmarkQuestion;
      const { data } = await save(sheetId, _id);
      onChange(question.topicId, _id, field, data[field]);
    } catch {
      toast.error(field === "completed" ? "Could not save progress" : "Could not update bookmark");
    } finally {
      setSaving(false);
    }
  }

  return (
    <li className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-800 bg-[#111111] px-4 py-3 hover:border-orange-500/60">
      <QuestionCompletionCheckbox
        title={title}
        completed={completed}
        disabled={saving}
        onToggle={() => toggle("completed")}
      />
      <span className={`min-w-40 flex-1 break-words text-sm ${completed ? "text-gray-400 line-through" : "text-gray-200"}`}>
        {title}
      </span>
      <div className="flex flex-wrap items-center gap-3">
        {resources.map(([key, label]) => (
          <a
            key={key}
            href={links[key]}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${label} for ${title}`}
            className={`inline-flex items-center gap-1 rounded px-1 py-1 text-xs text-gray-300 hover:text-orange-400 ${focusClass}`}
          >
            {key === "video" && <Play size={15} aria-hidden="true" />}
            {label}
          </a>
        ))}
        <button
          type="button"
          disabled={saving}
          aria-pressed={bookmarked}
          aria-label={`Bookmark ${title}`}
          onClick={() => toggle("bookmarked")}
          className={`rounded p-1 hover:text-yellow-400 ${focusClass} ${bookmarked ? "text-yellow-400" : "text-gray-400"}`}
        >
          <Star size={17} fill={bookmarked ? "currentColor" : "none"} aria-hidden="true" />
        </button>
      </div>
    </li>
  );
}

function PracticePart({ part, parentLabel, onChange }) {
  const details = useRef(null);
  const summary = useRef(null);

  function goBack() {
    details.current.open = false;
    summary.current.focus();
  }
  return (
    <details ref={details} className="rounded-xl border border-gray-800 bg-[#111111] hover:border-t-orange-500">
      <summary ref={summary} className={`flex cursor-pointer list-none flex-wrap items-center gap-3 rounded-xl px-4 py-3 text-gray-200 [&::-webkit-details-marker]:hidden ${focusClass}`}>
        <span className="flex-1 font-semibold">{part.code}. {part.name}</span>
        <span className="text-sm tabular-nums text-gray-400">{part.solved} / {part.total} completed</span>
        <ChevronDown size={16} aria-hidden="true" />
      </summary>
      <div className="space-y-2 px-3 pb-3">
        {part.questions.length > 0 && (
          <ul className="space-y-2">
            {part.questions.map((question) => (
              <PracticeQuestion key={question._id} question={question} onChange={onChange} />
            ))}
          </ul>
        )}
        {part.children.map((child) => (
          <PracticePart
            key={child._id}
            part={child}
            parentLabel={part.name}
            onChange={onChange}
          />
        ))}
        <SheetBack onClick={goBack}>Back to {parentLabel}</SheetBack>
      </div>
    </details>
  );
}

function buildParts(topics) {
  const childrenByParent = new Map();
  for (const topic of topics) {
    const parent = topic.parentTopicId ?? null;
    if (!childrenByParent.has(parent)) childrenByParent.set(parent, []);
    childrenByParent.get(parent).push(topic);
  }

  function buildPart(topic) {
    const children = (childrenByParent.get(topic._id) ?? []).map(buildPart);
    return {
      ...topic,
      children,
      total: children.reduce((total, child) => total + child.total, topic.questions.length),
      solved: children.reduce(
        (solved, child) => solved + child.solved,
        topic.questions.filter((question) => question.completed).length,
      ),
    };
  }

  return (childrenByParent.get(null) ?? []).map(buildPart);
}

function SheetContent({ slug }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getSheetBySlug(slug)
      .then(({ data }) => { if (active) setData(data); })
      .catch((error) => {
        if (active) setError(error.response?.data?.message || "Could not load this sheet");
      });
    return () => { active = false; };
  }, [slug]);

  function updateQuestion(topicId, questionId, field, value) {
    setData((previous) => ({
      ...previous,
      topics: previous.topics.map((topic) => topic._id === topicId
        ? {
            ...topic,
            questions: topic.questions.map((question) => question._id === questionId
              ? { ...question, [field]: value }
              : question),
          }
        : topic),
    }));
  }

  if (error || !data) {
    return (
      <>
        <SheetBack to="/workspace/sheets">Back to My Sheets</SheetBack>
        {error ? <p role="alert">{error}</p> : <SheetLoading />}
      </>
    );
  }

  const { sheet, topics } = data;
  const parts = buildParts(topics);
  const solved = parts.reduce((total, part) => total + part.solved, 0);
  const bookmarked = topics.reduce((total, topic) => (
    total + topic.questions.filter((question) => question.bookmarked).length
  ), 0);

  return (
    <div className="space-y-3">
      <SheetBack to="/workspace/sheets">Back to My Sheets</SheetBack>
      <header className="rounded-xl border border-gray-800 bg-[#111111] p-4 shadow-lg">
        <h1 className="mb-2 text-3xl font-bold text-white">{sheet.name}</h1>
        <p className="text-gray-400">{sheet.description}</p>
        <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-300">
          <span>{solved} / {sheet.totalQuestions} completed</span>
          <span>{bookmarked} bookmarked</span>
          {/^https?:\/\//.test(sheet.source) && (
            <a href={sheet.source} target="_blank" rel="noopener noreferrer" className={`rounded text-orange-400 hover:underline ${focusClass}`}>
              Course link
            </a>
          )}
        </div>
      </header>
      {parts.map((part) => <PracticePart
        key={part._id}
        part={part}
        parentLabel="sheet overview"
        onChange={updateQuestion}
      />)}
    </div>
  );
}

export default function PracticeSheet() {
  const { slug } = useParams();
  return <SheetContent key={slug} slug={slug} />;
}
