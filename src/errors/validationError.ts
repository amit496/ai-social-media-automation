import { HttpError } from './httpError';

export class ValidationError extends HttpError {
  constructor(message = 'Validation failed') {
    super(400, message);
  }
}
