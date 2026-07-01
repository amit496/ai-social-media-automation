export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type ErrorResponse = {
  success: false;
  error: string;
};

export type SuccessResponse<T> = {
  success: true;
  data: T;
};
