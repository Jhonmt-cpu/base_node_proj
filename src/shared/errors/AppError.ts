import { AppErrorMessages } from "./AppErrorMessages";

class AppError {
  public readonly message: string;

  public readonly statusCode: number;

  constructor(message: AppErrorMessages, statusCode = 400) {
    this.message = message;
    this.statusCode = statusCode;
  }
}

export { AppError };
