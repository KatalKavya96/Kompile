import { Router } from "express";

import {
  createRoom,
  joinRoom,
  getMyRooms,
  leaveRoomHandler,
  getRoomDetail,
} from "../controllers/room.controller.js";
import {
  createRoomContest,
  endRoomContest,
  getContestCatalog,
  getContestLeaderboard,
  listRoomContests,
  setContestPermission,
  verifyContestSolve,
} from "../controllers/roomContest.controller.js";
import {
  createRoomValidator,
  joinRoomValidator,
  roomIdValidator,
} from "../validators/index.js";
import { validate } from "../middlewares/validator.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/").post(verifyJWT, createRoomValidator(), validate, createRoom);
router
  .route("/join-room")
  .post(verifyJWT, joinRoomValidator(), validate, joinRoom);
router.route("/mine").get(verifyJWT, getMyRooms);
router
  .route("/:roomId")
  .get(verifyJWT, roomIdValidator(), validate, getRoomDetail);
router
  .route("/:roomId/leave")
  .post(verifyJWT, roomIdValidator(), validate, leaveRoomHandler);

const contestAccess = [verifyJWT, roomIdValidator(), validate];

router.route("/:roomId/contests")
  .get(...contestAccess, listRoomContests)
  .post(...contestAccess, createRoomContest);
router.get("/:roomId/contests/catalog", ...contestAccess, getContestCatalog);
router.get("/:roomId/contests/:contestId/leaderboard", ...contestAccess, getContestLeaderboard);
router.post("/:roomId/contests/:contestId/end", ...contestAccess, endRoomContest);
router.post("/:roomId/contests/:contestId/questions/:questionId/verify", ...contestAccess, verifyContestSolve);
router.patch("/:roomId/members/:userId/contest-permission", ...contestAccess, setContestPermission);

export default router;
