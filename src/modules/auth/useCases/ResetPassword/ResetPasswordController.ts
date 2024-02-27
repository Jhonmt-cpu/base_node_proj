import { Request, Response } from "express";
import { container } from "tsyringe";

import { ResetPasswordUseCase } from "./ResetPasswordUseCase";

class ResetPasswordController {
  async handle(request: Request, response: Response): Promise<Response> {
    const { reset_token, new_password } = request.body;

    const resetPasswordUseCase = container.resolve(ResetPasswordUseCase);

    await resetPasswordUseCase.execute({
      reset_token,
      new_password,
    });

    return response.status(204).send();
  }
}

export { ResetPasswordController };
