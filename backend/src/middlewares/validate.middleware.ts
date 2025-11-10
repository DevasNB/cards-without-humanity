// src/middlewares/validate.middleware.ts
import { Request, Response, NextFunction } from "express";
import { ZodObject, ZodError } from "zod";
import { ValidationError } from "../utils/errors";

/**
 * Middleware factory to validate request bodies using a Zod schema.
 * @param schema The Zod schema to validate against.
 * @returns An Express middleware function.
 */
export const validate =
  (schema: ZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body); // Validate the request body
      next(); // If validation passes, proceed to the next middleware/controller
    } catch (error) {
      if (error instanceof ZodError) {
        // Zod validation failed
        // Format Zod's errors into a single, understandable message
        const errorMessage = error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join(", ");
        next(new ValidationError(`Validation Error: ${errorMessage}`));
      } else {
        // Some other unexpected error during validation
        next(error);
      }
    }
  };
