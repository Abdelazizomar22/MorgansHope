import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Wraps an async Express handler so unhandled promise rejections are
 * automatically forwarded to the global error handler via next(err).
 * Eliminates the try/catch boilerplate in every controller.
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
