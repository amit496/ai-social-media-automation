import { NextFunction, Request, Response } from 'express';
import { HttpError } from '../errors/httpError';
import { logger } from '../utils/logger';

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): Response => {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ success: false, error: err.message });
  }

  if (
    err instanceof SyntaxError &&
    'status' in err &&
    (err as any).status === 400 &&
    'body' in err
  ) {
    return res.status(400).json({ success: false, error: 'Invalid JSON payload' });
  }

  const errorMessage = err.message || 'Internal server error';
  logger.error(`${req.method} ${req.path} - ${errorMessage}`);

  return res.status(500).json({ success: false, error: errorMessage });
};
