// src/utils/errors.ts

// Base custom error class
export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.name = this.constructor.name; // Set the name of the error to the class name
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor); // Captures stack trace
  }
}

// Specific error for validation failures (e.g., bad input)
export class ValidationError extends AppError {
  constructor(message: string = "Validation failed") {
    super(message, 400); // Bad Request
  }
}

// Specific error for resource not found
export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, 404); // Not Found
  }
}

// Specific error for unique constraint violations (e.g., duplicate username)
export class ConflictError extends AppError {
  constructor(message: string = "Resource already exists") {
    super(message, 409); // Conflict
  }
}

// Specific error for authentication issues
export class UnauthorizedError extends AppError {
  constructor(message: string = "Authentication required") {
    super(message, 401); // Unauthorized
  }
}

// Specific error for authorization issues (permissions)
export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden access") {
    super(message, 403); // Forbidden
  }
}
