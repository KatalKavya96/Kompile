import { useState, useEffect, useCallback } from "react";
import { getBookmarks } from "../../api/sheets.api";

export const useBookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getBookmarks();
      setBookmarks(res.data ?? []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load bookmarks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const removeQuestion = useCallback((sheetId, questionId) => {
    setBookmarks((prev) =>
      prev
        .map((sheet) => {
          if (sheet.sheetId.toString() !== sheetId.toString()) return sheet;
          return {
            ...sheet,
            questions: sheet.questions.filter(
              (q) => q.questionId.toString() !== questionId.toString(),
            ),
          };
        })
        .filter((sheet) => sheet.questions.length > 0),
    );
  }, []);

  const updateCompletion = useCallback((sheetId, questionId, completed) => {
    setBookmarks((previous) =>
      previous.map((sheet) =>
        sheet.sheetId === sheetId
          ? {
              ...sheet,
              questions: sheet.questions.map((question) =>
                question.questionId === questionId
                  ? { ...question, completed }
                  : question,
              ),
            }
          : sheet,
      ),
    );
  }, []);

  return { bookmarks, loading, error, refresh: fetch, removeQuestion, updateCompletion };
};


