export type ApiResponse<T> = {
  status: string;
  data: T;
  message: string;
};
