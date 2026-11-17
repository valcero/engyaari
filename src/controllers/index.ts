import { Request, Response } from "express";
import { z } from "zod";
import { objectId, idParams } from "../utils/validate";
import * as userService from "../services/user.service";
import * as sessionService from "../services/session.service";
import * as teacherService from "../services/teacher.service";

const createUserBody = z.object({
  fullName: z.string().trim().min(1),
  email: z.email(),
  phone: z.string().trim().min(5),
});

const createTeacherBody = z.object({
  fullName: z.string().trim().min(1),
  email: z.email(),
  specialization: z.string().trim().min(1),
  experience: z.number().min(0),
});

const createSessionBody = z.object({
  teacherId: objectId,
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
});

const availableQuery = z.object({
  dateTimestamp: z.coerce.number().int().positive(),
});

const bookBody = z.object({ userId: objectId });

export async function createUser(req: Request, res: Response) {
  const user = await userService.createUser(createUserBody.parse(req.body));
  res.status(201).json({ data: user });
}

export async function createTeacher(req: Request, res: Response) {
  const teacher = await teacherService.createTeacher(createTeacherBody.parse(req.body));
  res.status(201).json({ data: teacher });
}

export async function createSession(req: Request, res: Response) {
  const session = await sessionService.createSession(createSessionBody.parse(req.body));
  res.status(201).json({ data: session });
}

export async function getAvailableSessions(req: Request, res: Response) {
  const { dateTimestamp } = availableQuery.parse(req.query);
  const sessions = await sessionService.getAvailableSessions(dateTimestamp);
  res.json({ data: sessions });
}

export async function bookSession(req: Request, res: Response) {
  const { id } = idParams.parse(req.params);
  const { userId } = bookBody.parse(req.body);
  res.json({ data: await sessionService.bookSession(id, userId) });
}

export async function completeSession(req: Request, res: Response) {
  const { id } = idParams.parse(req.params);
  res.json({ data: await sessionService.completeSession(id) });
}

export async function getUserSessions(req: Request, res: Response) {
  const { id } = idParams.parse(req.params);
  res.json({ data: await userService.getUserSessions(id) });
}