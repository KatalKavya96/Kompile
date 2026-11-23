import { User } from "../models/user.models.js";
import { PlatformProfile } from "../models/user.models.js";
import { RoomContest, RoomContestSolve } from "../models/roomContest.models.js";

export async function buildRoomContestLeaderboard(roomId, memberIds) {
  const [contestIds, members] = await Promise.all([
    RoomContest.distinct("_id", { roomId }),
    User.find({ _id: { $in: memberIds } }).select("username avatar").lean(),
  ]);
  const totals = contestIds.length ? await RoomContestSolve.aggregate([
    { $match: { contestId: { $in: contestIds }, userId: { $in: memberIds } } },
    { $group: { _id: "$userId", value: { $sum: "$points" } } },
  ]) : [];
  const pointsByMember = new Map(totals.map(({ _id, value }) => [String(_id), value]));

  return members
    .map(({ _id, username, avatar }) => ({
      userId: _id,
      username,
      avatar,
      value: pointsByMember.get(String(_id)) ?? 0,
    }))
    .sort((a, b) => b.value - a.value || a.username.localeCompare(b.username) ||
      String(a.userId).localeCompare(String(b.userId)))
    .map((member, index) => ({ ...member, rank: index + 1 }));
}

const METRICS = {
  totalQuestions: "totalQuestions",
  leetcodeRating: "leetcodeRating",
  codeforcesRating: "codeforcesRating",
};

export const buildLeaderboard = async ({
  metric,
  userIds = null,
  page = 1,
  limit = 20,
}) => {
  if (!METRICS[metric]) {
    throw new Error(`Unsupported leaderboard metric: ${metric}`);
  }

  const skip = (page - 1) * limit;

  if (metric === "totalQuestions") {
    const filter = userIds ? { _id: { $in: userIds } } : {};

    const users = await User.find(filter)
      .select("username avatar stats.totalQuestions")
      .sort({ "stats.totalQuestions": -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return users.map((u, i) => ({
      rank: skip + i + 1,
      userId: u._id,
      username: u.username,
      avatar: u.avatar,
      value: u.stats?.totalQuestions || 0,
    }));
  }

  const platform = metric === "leetcodeRating" ? "leetcode" : "codeforces";

  const match = { platform, "stats.contestRating": { $ne: null } };
  if (userIds) match.userId = { $in: userIds };

  const profiles = await PlatformProfile.find(match)
    .populate("userId", "username avatar")
    .select("userId stats.contestRating")
    .sort({ "stats.contestRating": -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return profiles
    .filter((p) => p.userId)
    .map((p, i) => ({
      rank: skip + i + 1,
      userId: p.userId._id,
      username: p.userId.username,
      avatar: p.userId.avatar,
      value: p.stats.contestRating,
    }));
};
