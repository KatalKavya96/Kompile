import { useBookmarks } from "../hooks/useBookmarks";
import BookmarkList from "./BookmarkList";

export default function Bookmarks() {
  const bookmarkState = useBookmarks();

  return (
    <section className="rounded-xl border border-white/10 bg-[#141414] p-5">
      <h1 className="mb-4 text-lg font-semibold text-white">Bookmarks</h1>
      <BookmarkList {...bookmarkState} onCompletionChange={bookmarkState.updateCompletion} />
    </section>
  );
}
