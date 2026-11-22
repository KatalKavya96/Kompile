import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function SheetBack({ to, onClick, children }) {
  const className =
    "my-2 inline-flex w-fit items-center gap-2 rounded-md border border-gray-700 bg-[#111111] px-3 py-2 text-sm font-medium text-gray-300 hover:border-orange-500/60 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-400";
  const content = (
    <>
      <ArrowLeft size={16} aria-hidden="true" />
      {children}
    </>
  );

  return to ? (
    <Link to={to} className={className}>{content}</Link>
  ) : (
    <button type="button" onClick={onClick} className={className}>{content}</button>
  );
}
