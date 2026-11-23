const placeholder = "rounded bg-white/10";

export default function SheetLoading({ overview = false }) {
  return (
    <>
      <span role="status" className="sr-only">
        {overview ? "Loading sheets…" : "Loading sheet…"}
      </span>
      {overview ? (
        Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            aria-hidden="true"
            className="flex min-h-40 flex-col gap-3 rounded-xl border border-gray-800 bg-[#111111] p-4 motion-safe:animate-pulse"
          >
            <div className={`h-5 w-3/4 ${placeholder}`} />
            <div className={`h-4 w-full ${placeholder}`} />
            <div className={`h-4 w-2/3 ${placeholder}`} />
            <div className={`mt-auto h-2 w-full ${placeholder}`} />
          </div>
        ))
      ) : (
        <div aria-hidden="true" className="space-y-3 motion-safe:animate-pulse">
          <div className="space-y-3 rounded-xl border border-gray-800 bg-[#111111] p-4">
            <div className={`h-7 w-2/5 ${placeholder}`} />
            <div className={`h-4 w-4/5 ${placeholder}`} />
          </div>
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="flex items-center justify-between gap-4 rounded-xl border border-gray-800 bg-[#111111] p-4">
              <div className={`h-4 w-1/3 ${placeholder}`} />
              <div className={`h-4 w-12 ${placeholder}`} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
