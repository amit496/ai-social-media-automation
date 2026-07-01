import { HttpError } from './httpError';

export class NotFoundError extends HttpError {
  constructor(message = 'Resource not found') {
    super(404, message);
  }
}
