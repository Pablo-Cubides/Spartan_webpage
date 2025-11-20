/**
 * Centralized Error Handler for API Routes
 * Provides consistent error handling and logging across all endpoints
 */

import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';

export interface ApiErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  details?: Record<string, unknown>;
  timestamp: string;
}

export class ApiError extends Error {
  constructor(
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR',
    message: string = 'An unexpected error occurred',
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(400, 'VALIDATION_ERROR', message, details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = 'Unauthorized') {
    super(401, 'AUTHENTICATION_ERROR', message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends ApiError {
  constructor(message: string = 'Forbidden') {
    super(403, 'AUTHORIZATION_ERROR', message);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string = 'Resource') {
    super(404, 'NOT_FOUND', `${resource} not found`);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends ApiError {
  constructor(message: string = 'Conflict') {
    super(409, 'CONFLICT', message);
    this.name = 'ConflictError';
  }
}

/**
 * Main error handler wrapper for route handlers
 */
export function withErrorHandler(
  handler: (req: NextRequest) => Promise<Response>
) {
  return async (req: NextRequest): Promise<Response> => {
    try {
      return await handler(req);
    } catch (error) {
      return handleError(error, req);
    }
  };
}

/**
 * Handle different types of errors and return appropriate responses
 */
export function handleError(error: unknown, req?: NextRequest): NextResponse<ApiErrorResponse> {
  const timestamp = new Date().toISOString();

  // Handle Zod validation errors
  if (error instanceof z.ZodError) {
    const fieldErrors = error.errors.reduce(
      (acc, err) => {
        const path = err.path.join('.');
        acc[path] = err.message;
        return acc;
      },
      {} as Record<string, string>
    );

    logError('Validation Error', {
      path: req?.nextUrl.pathname,
      fields: fieldErrors,
    });

    return NextResponse.json<ApiErrorResponse>(
      {
        error: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        statusCode: 400,
        details: fieldErrors,
        timestamp,
      },
      { status: 400 }
    );
  }

  // Handle custom API errors
  if (error instanceof ApiError) {
    logError(error.name, {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      path: req?.nextUrl.pathname,
    });

    return NextResponse.json<ApiErrorResponse>(
      {
        error: error.code,
        message: error.message,
        statusCode: error.statusCode,
        details: error.details,
        timestamp,
      },
      { status: error.statusCode }
    );
  }

  // Handle generic Error objects
  if (error instanceof Error) {
    const statusCode = determineStatusCode(error);
    
    logError('Unhandled Error', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      path: req?.nextUrl.pathname,
    });

    return NextResponse.json<ApiErrorResponse>(
      {
        error: 'INTERNAL_ERROR',
        message: process.env.NODE_ENV === 'production' 
          ? 'An unexpected error occurred'
          : error.message,
        statusCode,
        timestamp,
      },
      { status: statusCode }
    );
  }

  // Handle unknown errors
  logError('Unknown Error', {
    error: String(error),
    path: req?.nextUrl.pathname,
  });

  return NextResponse.json<ApiErrorResponse>(
    {
      error: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      statusCode: 500,
      timestamp,
    },
    { status: 500 }
  );
}

/**
 * Determine appropriate HTTP status code based on error message
 */
function determineStatusCode(error: Error): number {
  const message = error.message.toLowerCase();

  if (message.includes('unauthorized')) return 401;
  if (message.includes('forbidden')) return 403;
  if (message.includes('not found')) return 404;
  if (message.includes('conflict')) return 409;
  if (message.includes('timeout')) return 408;
  if (message.includes('rate limit')) return 429;

  return 500;
}

/**
 * Centralized error logging
 */
function logError(
  errorType: string,
  context: Record<string, unknown>
): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    errorType,
    environment: process.env.NODE_ENV,
    ...context,
  };

  if (process.env.NODE_ENV === 'production') {
    // In production, send to monitoring service (Sentry, etc.)
    console.error(JSON.stringify(logEntry));
  } else {
    // In development, log with formatting
    console.error(`\n❌ [${errorType}]`, context);
  }
}

/**
 * Helper to safely parse JSON request body
 */
export async function parseJsonBody<T>(
  req: NextRequest,
  schema?: z.ZodSchema<T>
): Promise<T> {
  try {
    const body = await req.json();
    
    if (schema) {
      const result = schema.safeParse(body);
      if (!result.success) {
        throw new ValidationError('Invalid request body', {
          errors: result.error.errors,
        });
      }
      return result.data;
    }
    
    return body as T;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new ValidationError('Invalid JSON in request body');
    }
    throw error;
  }
}
