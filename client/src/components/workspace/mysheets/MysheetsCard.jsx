import { CircleCheck, ListChecks } from "lucide-react";
import { Link } from "react-router-dom";

export default function MysheetsCard({ sheet }) {
  return (
    <Link
      to={`/workspace/sheets/${sheet.slug}`}
      className="flex min-h-40 min-w-0 flex-col gap-3 rounded-xl border border-gray-800 bg-[#111111] p-4 transition-colors hover:border-orange-500/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-400"
    >
      <h2 className="break-words text-lg font-semibold leading-snug text-white">
        {sheet.name}
      </h2>

      <p className="line-clamp-2 text-sm leading-snug text-gray-400">
        {sheet.description}
      </p>

      <div className="mt-auto flex items-center gap-2 pt-1">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#2b2b2f]" aria-hidden="true">
          <div
            className="h-full rounded-full bg-[#ff9d3c]"
            style={{ width: `${sheet.percentSolved}%` }}
          />
        </div>
        <span className="text-xs tabular-nums text-gray-300">{sheet.percentSolved}%</span>
      </div>

      <div className="flex flex-wrap justify-between gap-x-3 gap-y-1 text-sm">
        <span className="flex items-center gap-1.5 text-gray-400">
          <ListChecks size={17} aria-hidden="true" />
          {sheet.totalQuestions} Questions
        </span>

        <span className="flex items-center gap-1.5 font-semibold text-green-400">
          <CircleCheck size={17} aria-hidden="true" />
          {sheet.solvedCount} Solved
        </span>
      </div>
    </Link>
  );
}
