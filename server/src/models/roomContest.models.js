import { Schema, model } from "mongoose";

const questionSchema = new Schema(
  {
    questionId: { type: Schema.Types.ObjectId, ref: "SheetQuestion", required: true },
    title: { type: String, required: true },
    slug: { type: String, required: true },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], required: true },
  },
  { _id: false },
);

const contestSchema = new Schema(
  {
    roomId: { type: Schema.Types.ObjectId, ref: "Room", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    startsAt: { type: Date, required: true },
    endsAt: { type: Date, required: true },
    verificationEndsAt: { type: Date, required: true },
    points: {
      easy: { type: Number, required: true },
      medium: { type: Number, required: true },
      hard: { type: Number, required: true },
    },
    questions: [questionSchema],
  },
  { timestamps: true },
);
contestSchema.index({ roomId: 1, startsAt: -1 });

const solveSchema = new Schema(
  {
    contestId: { type: Schema.Types.ObjectId, ref: "RoomContest", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    username: { type: String, required: true },
    questionId: { type: Schema.Types.ObjectId, ref: "SheetQuestion", required: true },
    leetcodeUsername: { type: String, required: true },
    submissionId: { type: String, required: true },
    submittedAt: { type: Date, required: true },
    points: { type: Number, required: true },
  },
  { timestamps: true },
);
solveSchema.index({ contestId: 1, userId: 1, questionId: 1 }, { unique: true });

solveSchema.index({ contestId: 1, leetcodeUsername: 1, questionId: 1 }, { unique: true });

export const RoomContest = model("RoomContest", contestSchema);
export const RoomContestSolve = model("RoomContestSolve", solveSchema);
