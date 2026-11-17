import { Types } from "mongoose";
import { AppError } from "../utils/AppError";
import { User } from "../models/user.model";
import { Session, SessionStatus } from "../models/session.model";

export async function createUser(data: { fullName: string; email: string; phone: string }) {
  return User.create(data); // duplicate email -> E11000, mapped to 409 by the error handler
}

export async function getUserSessions(userId: string) {
  if (!(await User.exists({ _id: userId }))) throw new AppError(404, "User not found");

  const [result] = await Session.aggregate([
    { $match: { userId: new Types.ObjectId(userId) } },
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
    { $unwind: { path: "$teacher", preserveNullAndEmptyArrays: true } },
    {
      $facet: {
        upcomingSessions: [{ $match: { status: SessionStatus.BOOKED } }],
        completedSessions: [
          { $match: { status: SessionStatus.COMPLETED } },
          { $sort: { completedAt: -1 } },
        ],
      },
    },
  ]);

  return result;
}