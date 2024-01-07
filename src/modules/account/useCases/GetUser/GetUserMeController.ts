import { Request, Response } from "express";
import { container } from "tsyringe";

import { GetUserUseCase } from "./GetUserUseCase";

class GetUserMeController {
  async handle(request: Request, response: Response): Promise<Response> {
    const { user_id } = request.user;

    const getUserUseCase = container.resolve(GetUserUseCase);

    const userIdNumber = Number(user_id);

    const user = await getUserUseCase.execute({ user_id: userIdNumber });

    return response.json(user);
  }
}

export { GetUserMeController };
