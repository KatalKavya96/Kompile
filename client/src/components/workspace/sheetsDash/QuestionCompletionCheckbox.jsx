import { Check } from "lucide-react";

export default function QuestionCompletionCheckbox({
  title,
  completed,
  disabled,
  onToggle,
}) {
  function handleClick(event) {
    event.preventDefault();
    event.stopPropagation();
    onToggle();
  }

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={Boolean(completed)}
      aria-label={`${title} completed`}
      title={completed ? "Mark incomplete" : "Mark complete"}
      disabled={disabled}
      onClick={handleClick}
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-400 disabled:cursor-wait ${
        completed ? "border-green-500 bg-green-500/15 text-green-500" : "border-gray-600"
      }`}
    >
      {completed && <Check size={10} strokeWidth={3} aria-hidden="true" />}
    </button>
  );
}
