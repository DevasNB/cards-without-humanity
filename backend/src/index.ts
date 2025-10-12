import express, { NextFunction, Request, Response } from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import { AppError } from "./utils/errors";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON incoming requests
app.use(express.json());
app.use(cors());

// --- Routes ---
app.use("/api/auth", authRoutes); // Mount authentication routes

// Default route
app.get("/", (req: Request, res: Response<string>) => {
  res.status(200).send("Hello, Node.js Backend 🚀");
});

// --- Error Handling Middleware ---
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err); // Log the error for debugging

  if (err instanceof AppError) {
    // If it's a known custom application error
    return res.status(err.statusCode).json({ error: err.message });
  }

  // For any other unexpected errors
  return res.status(500).json({ error: "An unexpected error occurred." });
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
