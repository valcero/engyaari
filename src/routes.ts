import { Router } from "express";
import * as c from "./controllers";

export const router = Router();

router.post("/users", c.createUser);
router.get("/users/:id/sessions", c.getUserSessions);

router.post("/teachers", c.createTeacher);

router.post("/sessions", c.createSession);
router.get("/sessions/available", c.getAvailableSessions); // must precede /sessions/:id routes
router.post("/sessions/:id/book", c.bookSession);
router.patch("/sessions/:id/complete", c.completeSession);