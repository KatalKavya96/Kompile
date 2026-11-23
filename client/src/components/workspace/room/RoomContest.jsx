import { useCallback, useEffect, useState } from "react";
import {
  endRoomContest,
  getRoomContestLeaderboard,
  getRoomContests,
  setRoomContestPermission,
  verifyRoomContestSolve,
} from "../../../api/rooms.api.js";
import RoomContestForm from "./RoomContestForm.jsx";

const pollInterval = 15_000;
const outlineButton = "rounded-lg border border-gray-700 bg-[#1b1b1b] px-3 py-2 text-sm hover:bg-[#262626] disabled:text-gray-400";
const dateTime = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });

function phase(contest, now) {
  if (now < Date.parse(contest.startsAt)) return "Upcoming";
  if (now < Date.parse(contest.endsAt)) return "Live";
  if (now < Date.parse(contest.verificationEndsAt)) return "Verification open";
  return "Completed";
}

function timeRemaining(deadline, now) {
  const seconds = Math.max(0, Math.ceil((Date.parse(deadline) - now) / 1000));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return [hours, minutes, seconds % 60].map((part) => String(part).padStart(2, "0")).join(":");
}

function ContestStandings({ roomId, contest, now, onContestUpdate }) {
  const [data, setData] = useState(null);
  const [refresh, setRefresh] = useState(0);
  const [ending, setEnding] = useState(false);
  const [endError, setEndError] = useState("");
  const [pollError, setPollError] = useState("");
  const [verification, setVerification] = useState({});
  const contestId = contest._id;

  useEffect(() => {
    const controller = new AbortController();
    let timer;
    async function load() {
      try {
        const result = await getRoomContestLeaderboard(roomId, contestId, controller.signal);
        if (controller.signal.aborted) return;
        setData(result);
        setPollError("");
        onContestUpdate(result);
        const untilStart = Date.parse(result.contest.startsAt) - result.serverNow;
        const untilEnd = Date.parse(result.contest.endsAt) - result.serverNow;
        const untilFinal = Date.parse(result.contest.verificationEndsAt) - result.serverNow;
        if (untilStart > 0) {
          timer = setTimeout(load, Math.min(untilStart, 2_147_483_647));
        } else if (untilFinal > 0) {
          timer = setTimeout(load, Math.min(pollInterval, untilEnd > 0 ? untilEnd : untilFinal));
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        setPollError(error.response?.data?.message || "Could not refresh standings. Retrying shortly.");
        timer = setTimeout(load, pollInterval);
      }
    }
    load();
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [roomId, contestId, refresh, onContestUpdate]);

  async function verify(questionId) {
    setVerification((previous) => ({ ...previous, [questionId]: { pending: true } }));
    try {
      await verifyRoomContestSolve(roomId, contestId, questionId);
      setVerification((previous) => ({ ...previous, [questionId]: { verified: true } }));
      setRefresh((previous) => previous + 1);
    } catch (error) {
      setVerification((previous) => ({
        ...previous,
        [questionId]: { error: error.response?.data?.message || "Could not verify this solve. Try again." },
      }));
    }
  }

  async function endContest() {
    if (!window.confirm("End this contest now? Members will have 3 minutes to verify solves submitted before it ended.")) return;
    setEnding(true);
    setEndError("");
    try {
      onContestUpdate(await endRoomContest(roomId, contestId));
    } catch (error) {
      setEndError(error.response?.data?.message || "Could not end the contest.");
    } finally {
      setEnding(false);
      setRefresh((previous) => previous + 1);
    }
  }

  const status = phase(contest, now);
  const deadline = {
    Upcoming: contest.startsAt,
    Live: contest.endsAt,
    "Verification open": contest.verificationEndsAt,
  }[status];
  const canVerify = status === "Live" || status === "Verification open";

  return (
    <section aria-label={contest.title} className="space-y-4 rounded-xl border border-gray-800 bg-[#111111] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold">{contest.title}</h3>
          <p className="text-sm text-gray-400">
            {dateTime.format(new Date(contest.startsAt))} – {dateTime.format(new Date(contest.endsAt))}
          </p>
        </div>
        <div className="text-right">
          <p className="font-medium">{status}</p>
          {deadline && <p role="timer" className="font-mono text-sm tabular-nums">{timeRemaining(deadline, now)}</p>}
          {status === "Live" && data?.canEndContest && (
            <button type="button" onClick={endContest} disabled={ending}
              className={`${outlineButton} mt-2 text-red-300`}>
              {ending ? "Ending…" : "End contest"}
            </button>
          )}
        </div>
      </div>
      <p className="text-sm text-gray-400">
        {contest.questionCount} questions · Easy {contest.points.easy} pts · Medium {contest.points.medium} pts · Hard {contest.points.hard} pts
      </p>
      {endError && <p role="alert" className="text-red-400">{endError}</p>}
      {pollError && <p role="status" className="text-amber-300">{pollError}</p>}
      {status === "Upcoming" && <p>Questions unlock when the contest starts.</p>}
      {!data && !pollError && <p role="status" className="text-gray-400">Loading contest…</p>}
      {data && status !== "Upcoming" && (
        <>
          <h4 className="font-semibold">Questions</h4>
          {canVerify && <p className="text-sm text-gray-400">
            Verify each solve promptly. LeetCode returns your 10 most recent accepted submissions.
            Only solves submitted during the contest count, and verification closes 3 minutes after it ends.
          </p>}
          <ul className="divide-y divide-gray-800">
            {data.questions.map((question) => {
              const state = verification[question.questionId];
              const verified = state?.verified || data.verifiedQuestionIds.includes(question.questionId);
              return (
                <li key={question.questionId} className="py-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <a href={`https://leetcode.com/problems/${question.slug}/`} target="_blank" rel="noreferrer"
                        className="font-medium text-[#ff9d3c] hover:underline">{question.title}</a>
                      <p className="text-sm text-gray-400">
                        <span className="capitalize">{question.difficulty}</span> · {contest.points[question.difficulty]} pts
                      </p>
                    </div>
                    {verified ? <span role="status" className="text-green-400">Verified</span> : canVerify && (
                      <button type="button" onClick={() => verify(question.questionId)} disabled={state?.pending}
                        aria-label={`Verify solve for ${question.title}`} className={outlineButton}>
                        {state?.pending ? "Verifying…" : "Verify solve"}
                      </button>
                    )}
                  </div>
                  {state?.error && <p role="alert" className="mt-2 text-sm text-red-400">{state.error}</p>}
                </li>
              );
            })}
          </ul>
          <h4 className="font-semibold">Contest leaderboard</h4>
          {data.standings.length ? (
            <div className="overflow-x-auto">
              <table aria-label="Contest leaderboard" className="w-full text-left text-sm">
                <thead className="text-gray-400">
                  <tr>
                    <th scope="col" className="p-2">Rank</th>
                    <th scope="col" className="p-2">Member</th>
                    <th scope="col" className="p-2">Verified solves</th>
                    <th scope="col" className="p-2">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {data.standings.map((entry) => (
                    <tr key={entry.userId}>
                      <td className="p-2">{entry.rank}</td>
                      <th scope="row" className="p-2 font-medium">{entry.username}</th>
                      <td className="p-2">{entry.solved}</td>
                      <td className="p-2">{entry.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="text-sm text-gray-400">No verified solves yet.</p>}
        </>
      )}
    </section>
  );
}

export default function RoomContest({ roomId, roomDetail, onPermissionChange }) {
  const [contests, setContests] = useState(null);
  const [selectedId, setSelectedId] = useState("");
  const [clockOffset, setClockOffset] = useState(0);
  const [clock, setClock] = useState(Date.now);
  const [listError, setListError] = useState("");
  const [listAttempt, setListAttempt] = useState(0);
  const [creating, setCreating] = useState(false);
  const [pendingPermission, setPendingPermission] = useState(null);
  const [permissionError, setPermissionError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    getRoomContests(roomId, controller.signal)
      .then(({ contests, serverNow }) => {
        if (controller.signal.aborted) return;
        setContests(contests);
        setClockOffset(serverNow - Date.now());
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setListError(error.response?.data?.message || "Could not load contests.");
        }
      });
    return () => controller.abort();
  }, [roomId, listAttempt]);

  useEffect(() => {
    const timer = setInterval(() => setClock(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const updateContest = useCallback(({ contest, serverNow }) => {
    setClock(Date.now());
    setClockOffset(serverNow - Date.now());
    setContests((previous) => previous?.map((entry) =>
      entry._id === contest._id && Date.parse(contest.endsAt) <= Date.parse(entry.endsAt) ? contest : entry,
    ));
  }, []);

  const now = clock + clockOffset;
  const selected = contests?.find(({ _id }) => _id === selectedId) ?? contests?.[0];

  async function togglePermission(member) {
    setPendingPermission(member.userId);
    setPermissionError("");
    try {
      const result = await setRoomContestPermission(roomId, member.userId, !member.canCreateContests);
      onPermissionChange(result);
    } catch (error) {
      setPermissionError(error.response?.data?.message || "Could not update contest permission.");
    } finally {
      setPendingPermission(null);
    }
  }

  return (
    <div className="space-y-5 py-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold">Room contests</h2>
        {roomDetail?.canCreateContests && !creating && (
          <button type="button" onClick={() => setCreating(true)} disabled={!contests}
            className="rounded-lg bg-[#ff9d3c] px-4 py-2 font-medium text-black disabled:opacity-50">Create contest</button>
        )}
      </div>
      {roomDetail && (
        <details className="rounded-xl border border-gray-800 bg-[#111111] p-4">
          <summary className="cursor-pointer font-medium">
            {roomDetail.viewerRole === "admin" ? "Room members and contest permissions" : "Room members"}
          </summary>
          <ul className="mt-3 space-y-2">
            {roomDetail.members.map((member) => (
              <li key={member.userId} className="flex flex-wrap items-center justify-between gap-2">
                <span>{member.username} {member.role === "admin" && <span className="ml-1 text-sm text-[#ff9d3c]">Admin</span>}</span>
                {roomDetail.viewerRole === "admin" && member.role === "member" && (
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={member.canCreateContests} disabled={pendingPermission !== null}
                      onChange={() => togglePermission(member)} aria-label={`Allow ${member.username} to create contests`} />
                    Can create contests
                  </label>
                )}
              </li>
            ))}
          </ul>
          {permissionError && <p role="alert" className="mt-2 text-red-400">{permissionError}</p>}
        </details>
      )}
      {creating && (
        <RoomContestForm roomId={roomId} onCancel={() => setCreating(false)} onPublish={(contest) => {
          setContests((previous) => [contest, ...previous].sort((a, b) => Date.parse(b.startsAt) - Date.parse(a.startsAt)));
          setSelectedId(contest._id);
          setCreating(false);
        }} />
      )}
      {listError && (
        <p role="alert" className="text-red-400">
          {listError} <button type="button" className="underline" onClick={() => {
            setListError("");
            setListAttempt((previous) => previous + 1);
          }}>Retry</button>
        </p>
      )}
      {!contests && !listError && <p role="status" className="text-gray-400">Loading contests…</p>}
      {contests?.length === 0 && <p className="text-gray-400">No contests have been scheduled.</p>}
      {selected && (
        <>
          <label className="block">
            Contest
            <select value={selected._id} onChange={(event) => setSelectedId(event.target.value)}
              className="mt-1 block max-w-full rounded-lg border border-gray-700 bg-[#1b1b1b] p-2">
              {contests.map((contest) => (
                <option key={contest._id} value={contest._id}>{contest.title} · {phase(contest, now)}</option>
              ))}
            </select>
          </label>
          <ContestStandings key={selected._id} roomId={roomId} contest={selected} now={now} onContestUpdate={updateContest} />
        </>
      )}
    </div>
  );
}
