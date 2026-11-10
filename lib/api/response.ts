import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError, type ApiErrorBody, validationError } from "@/lib/api/errors";

type SuccessBody<T> = {
  data: T;
  error: null;
};

type ErrorBody = {
  data: null;
  error: ApiErrorBody;
};

export function ok<T>(data: T, init?: ResponseInit) {
  const body: SuccessBody<T> = { data, error: null };
  return NextResponse.json(body, { status: 200, ...init });
}

export function created<T>(data: T) {
  const body: SuccessBody<T> = { data, error: null };
  return NextResponse.json(body, { status: 201 });
}

export function fail(error: AppError) {
  const body: ErrorBody = {
    data: null,
    error: {
      code: error.code,
      message: error.message,
      ...(error.details !== undefined ? { details: error.details } : {}),
    },
  };
  return NextResponse.json(body, { status: error.status });
}

export function handleRouteError(error: unknown) {
  if (error instanceof AppError) {
    return fail(error);
  }

  if (error instanceof ZodError) {
    return fail(
      validationError("Invalid request data", error.flatten()),
    );
  }

  console.error(error);
  return fail(new AppError(500, "INTERNAL_ERROR", "Internal server error"));
}
