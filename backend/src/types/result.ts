export type Result<T, E = string> =
  | { success: true; data: T }
  | { success: false; error: E };

export const Ok = <T>(data: T): Result<T, never> => ({ success: true, data });
export const Err = <E = string>(error: E): Result<never, E> => ({ success: false, error });
