import express from "express";
import { router } from "./routes";
import { errorHandler, notFound } from "./middleware/errorHandler";

export const app = express();

app.use(express.json());
app.use(router);
app.use(notFound);
app.use(errorHandler);