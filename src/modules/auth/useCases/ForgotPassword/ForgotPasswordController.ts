import { Request, Response } from "express";
import { container } from "tsyringe";

import { ForgotPasswordUseCase } from "./ForgotPasswordUseCase";

class ForgotPasswordController {
  async handle(request: Request, response: Response): Promise<Response> {
    const { user_email } = request.body;

    const forgotPasswordUseCase = container.resolve(ForgotPasswordUseCase);

    await forgotPasswordUseCase.execute({ user_email });

    return response.status(204).send();
  }
}

export { ForgotPasswordController };
