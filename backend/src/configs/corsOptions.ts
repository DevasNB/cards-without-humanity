import { NextFunction, Request, Response } from "express";
import { FRONTEND_URL } from "./constants";

export const corsOptions = {
  origin: FRONTEND_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Custom-Header"],
};

export const corsMiddleware =
  () => (req: Request, res: Response, next: NextFunction) => {
    res.header("Access-Control-Allow-Origin", FRONTEND_URL);
    res.header(
      "Access-Control-Allow-Methods",
      "GET,HEAD,PATCH,POST,PUT,DELETE,OPTIONS"
    );
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Access-Control-Allow-Credentials", "true");
    next();
  };
