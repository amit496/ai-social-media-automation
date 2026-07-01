import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../errors/validationError';

export const validateGeneratePayload = (req: Request, res: Response, next: NextFunction): void => {
  const { topic } = req.body;

  if (topic && typeof topic !== 'string') {
    throw new ValidationError('topic must be a string');
  }

  next();
};

export const validatePublishPayload = (req: Request, res: Response, next: NextFunction): void => {
  const { topic, platform, scheduleFor } = req.body;

  if (!topic || typeof topic !== 'string') {
    throw new ValidationError('topic is required and must be a string');
  }
  if (!platform || (platform !== 'facebook' && platform !== 'instagram')) {
    throw new ValidationError('platform is required and must be facebook or instagram');
  }
  if (scheduleFor && typeof scheduleFor !== 'string') {
    throw new ValidationError('scheduleFor must be a string');
  }

  next();
};
