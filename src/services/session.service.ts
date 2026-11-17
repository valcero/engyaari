import { Types } from "mongoose";
import { AppError } from "../utils/AppError";
import { Teacher } from "../models/teacher.model";
import { User } from "../models/user.model";
import { Session, SessionStatus } from "../models/session.model";

export async function createSession(data: { teacherId: string; startTime: Date; endTime: Date }) {
  if (data.endTime <= data.startTime) {
    throw new AppError(400, "endTime must be greater than startTime");
  }
  if (!(await Teacher.exists({ _id: data.teacherId }))) throw new AppError(404, "Teacher not found");
  return Session.create({ ...data, status: SessionStatus.AVAILABLE });
}

/** Available sessions starting on the given UTC calendar day. */
export async function getAvailableSessions(dateTimestamp: number) {
  const dayStart = new Date(dateTimestamp);
  dayStart.setUTCHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

  return Session.aggregate([
    {
      $match: {
        status: SessionStatus.AVAILABLE,
        startTime: { $gte: dayStart, $lt: dayEnd },
      },
    },
    { $sort: { startTime: 1 } },
    {
      $lookup: {
        from: "teachers",
        localField: "teacherId",
        foreignField: "_id",
        as: "teacher",
        pipeline: [{ $project: { fullName: 1, email: 1, specialization: 1, experience: 1 } }],
      },
    },
    { $unwind: "$teacher" },
  ]);
}

export async function bookSession(sessionId: string, userId: string) {
  if (!(await User.exists({ _id: userId }))) throw new AppError(404, "User not found");

  // Atomic check-and-set: two concurrent requests cannot both book the same session.
  const booked = await Session.findOneAndUpdate(
    { _id: new Types.ObjectId(sessionId), status: SessionStatus.AVAILABLE },
    { $set: { status: SessionStatus.BOOKED, userId } },
    { returnDocument: "after" },
  );
  if (booked) return booked;

  if (!(await Session.exists({ _id: sessionId }))) throw new AppError(404, "Session not found");
  throw new AppError(409, "Session is not available for booking");
}

export async function completeSession(sessionId: string) {
  const completed = await Session.findOneAndUpdate(
    { _id: new Types.ObjectId(sessionId), status: SessionStatus.BOOKED },
    { $set: { status: SessionStatus.COMPLETED, completedAt: new Date() } },
    { returnDocument: "after" },
  );
  if (completed) return completed;

  if (!(await Session.exists({ _id: sessionId }))) throw new AppError(404, "Session not found");
  throw new AppError(409, "Only BOOKED sessions can be marked as completed");
}