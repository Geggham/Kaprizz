export type ApiErrorBody = {
  code: string;
  message: string;
  details?: unknown;
};

export class AppError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(
    status: number,
    code: string,
    message: string,
    details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function badRequest(message: string, details?: unknown) {
  return new AppError(400, "BAD_REQUEST", message, details);
}

export function unauthorized(message = "Authentication required") {
  return new AppError(401, "UNAUTHORIZED", message);
}

export function forbidden(message = "Forbidden") {
  return new AppError(403, "FORBIDDEN", message);
}

export function notFound(message = "Not found") {
  return new AppError(404, "NOT_FOUND", message);
}

export function conflict(message: string, details?: unknown) {
  return new AppError(409, "CONFLICT", message, details);
}

export function validationError(message: string, details?: unknown) {
  return new AppError(422, "VALIDATION_ERROR", message, details);
}

export function internalError(message = "Internal server error") {
  return new AppError(500, "INTERNAL_ERROR", message);
}
