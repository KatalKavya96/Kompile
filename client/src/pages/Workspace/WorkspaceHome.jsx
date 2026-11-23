import React from "react";
import LoginCalendar from "./LoginCalendar";
import DailyMissions from "./DailyMissions";
import MyWorkspace from "../../components/workspace/MyWorkspace";

export default function WorkspaceHome() {
  return (
    <div className="flex flex-col xl:flex-row gap-6 xl:h-[calc(100vh-72px-64px)]">
      <div className="flex-1 min-w-0 flex flex-col gap-6 xl:overflow-y-auto xl:pb-6">
        {/* Welcome Banner */}
        <div className="bg-[#111111] border border-white/[0.08] rounded-2xl py-6 px-7 shadow-xl flex items-center flex-shrink-0">
          <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
            Welcome To Your WorkSpace!
          </h1>
        </div>

        <MyWorkspace />
      </div>

      {/* Right sidebar — scrollable */}
      <div className="w-full xl:w-80 flex-shrink-0 xl:overflow-y-auto pb-6 custom-scrollbar flex flex-col gap-6">
        <LoginCalendar />
        <DailyMissions />
      </div>
    </div>
  );
}
