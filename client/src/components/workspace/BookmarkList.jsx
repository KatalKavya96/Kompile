import { useState } from "react";
import toast from "react-hot-toast";
import { toggleSheetQuestion } from "../../api/sheets.api";
import { Link } from "react-router-dom";

function CompletionCheckbox({ sheetId, questionId, title, completed, onCompletionChange }) {
  const [saving, setSaving] = useState(false);

  async function toggleCompletion() {
    setSaving(true);
    try {
      const response = await toggleSheetQuestion(sheetId, questionId);
      onCompletionChange(sheetId, questionId, response.data.completed);
    } catch {
      toast.error("Could not update question completion");
    } finally {
      setSaving(false);
    }
  }

  return (
    <input
      type="checkbox"
      aria-label={`${title} completed`}
      checked={completed ?? false}
      disabled={saving}
      onChange={toggleCompletion}
      className="h-4 w-4 shrink-0 cursor-pointer accent-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-400 disabled:cursor-wait"
    />
  );
}

export default function BookmarkList({ bookmarks, loading, error, onCompletionChange }) {
  if (loading) return <p role="status">Loading bookmarks…</p>;
  if (error) return <p role="alert">{error}</p>;
  if (bookmarks.length === 0) return <p>No bookmarked questions yet.</p>;

  return (
    <ul className="space-y-4">
      {bookmarks.map(({ sheetId, sheetName, sheetSlug, questions }) => (
        <li key={sheetId}>
          <h3 className="font-semibold text-gray-300">{sheetName}</h3>
          <ul className="mt-1 space-y-1">
            {questions.map(({ questionId, title, links, completed }) => {
              const url =
                links?.primary || links?.leetcode || links?.gfg || links?.article ||
                links?.video || links?.[0]?.url;
              const className =
                "block rounded px-2 py-2 break-words text-gray-200 hover:bg-white/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-400";

              return (
                <li key={questionId} className="flex items-center gap-2">
                  <CompletionCheckbox
                    sheetId={sheetId}
                    questionId={questionId}
                    title={title}
                    completed={completed}
                    onCompletionChange={onCompletionChange}
                  />
                  {url ? (
                    <a className={className} href={url} target="_blank" rel="noopener noreferrer">
                      {title}
                    </a>
                  ) : (
                    <Link className={className} to={`/workspace/sheets/${sheetSlug}`}>
                      {title}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </li>
      ))}
    </ul>
  );
}
