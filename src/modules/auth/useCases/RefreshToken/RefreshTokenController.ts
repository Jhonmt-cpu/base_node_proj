import { Request, Response } from "express";

import { RefreshTokenUseCase } from "./RefreshTokenUseCase";
import { container } from "tsyringe";

class RefreshTokenController {
  async handle(request: Request, response: Response): Promise<Response> {
    const { refresh_token } = request.body;

    const refreshTokenUseCase = container.resolve(RefreshTokenUseCase);

    const newToken = await refreshTokenUseCase.execute({ refresh_token });

    return response.json(newToken);
  }
}

export { RefreshTokenController };
