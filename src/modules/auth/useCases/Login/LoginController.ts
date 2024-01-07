import { Request, Response } from "express";

import { LoginUseCase } from "./LoginUseCase";
import { container } from "tsyringe";

class LoginController {
  async handle(request: Request, response: Response): Promise<Response> {
    const { user_email, user_password } = request.body;

    const loginUseCase = container.resolve(LoginUseCase);

    const loginResponse = await loginUseCase.execute({
      user_email,
      user_password,
    });

    return response.json(loginResponse);
  }
}

export { LoginController };
