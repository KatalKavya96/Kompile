import axiosInstance from "./axiosInstance.js";

export const createRoom = async (data) => {
  const response = await axiosInstance.post("/rooms", data);
  return response.data;
};

export const joinRoom = async (data) => {
  const response = await axiosInstance.post(`/rooms/join-room`, data);
  return response.data;
};

export const leaveRoom = async (roomId) => {
  const response = await axiosInstance.post(`/rooms/${roomId}/leave`);
  return response.data;
};

export const getRoom = async (roomId, signal) => {
  const response = await axiosInstance.get(`/rooms/${roomId}`, { signal });
  return response.data;
};

export const getRooms = async () => {
  const response = await axiosInstance.get("/rooms/mine");
  return response.data;
};

export const deleteRoom = async (roomId) => {
  const response = await axiosInstance.delete(`/rooms/${roomId}`);
  return response.data;
};

export const getRoomContests = async (roomId, signal) =>
  (await axiosInstance.get(`/rooms/${roomId}/contests`, { signal })).data.data;

export const getRoomContestCatalog = async (roomId, signal) =>
  (await axiosInstance.get(`/rooms/${roomId}/contests/catalog`, { signal })).data.data;

export const publishRoomContest = async (roomId, contest) =>
  (await axiosInstance.post(`/rooms/${roomId}/contests`, contest)).data.data.contest;

export const getRoomContestLeaderboard = async (roomId, contestId, signal) =>
  (await axiosInstance.get(`/rooms/${roomId}/contests/${contestId}/leaderboard`, { signal })).data.data;

export const verifyRoomContestSolve = async (roomId, contestId, questionId) =>
  (await axiosInstance.post(`/rooms/${roomId}/contests/${contestId}/questions/${questionId}/verify`)).data.data;

export const setRoomContestPermission = async (roomId, userId, canCreateContests) =>
  (await axiosInstance.patch(`/rooms/${roomId}/members/${userId}/contest-permission`, {
    canCreateContests,
  })).data.data;

export const endRoomContest = async (roomId, contestId) =>
  (await axiosInstance.post(`/rooms/${roomId}/contests/${contestId}/end`)).data.data;
