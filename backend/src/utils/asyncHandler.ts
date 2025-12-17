// src/utils/asyncHandler.ts
import { Request, Response, NextFunction, RequestHandler } from "express";

// Define a type for an async Express handler
type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

/**
 * A wrapper to handle asynchronous Express route handlers and middleware.
 * It catches any errors thrown by the async function and passes them to `next()`.
 * This prevents the Node.js process from crashing on unhandled promise rejections.
 *
 * @param fn The asynchronous Express handler function.
 * @returns An Express RequestHandler function.
 */
export const asyncHandler =
  (fn: AsyncRequestHandler): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    // Resolve the promise returned by the async function
    // and if it rejects (throws an error), catch it and pass it to next()
    Promise.resolve(fn(req, res, next)).catch(next);
  };
