export type ErrorType = 'not-found' | 'unauthorized';

export interface SocketError {
  type: string;
  message: string;
}
