import { Teacher } from "../models/teacher.model";

export async function createTeacher(data: {
  fullName: string;
  email: string;
  specialization: string;
  experience: number;
}) {
  return Teacher.create(data);
}