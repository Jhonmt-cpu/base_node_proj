import { Request, Response } from "express";
import { container } from "tsyringe";

import { GetUserCompleteUseCase } from "./GetUserCompleteUseCase";

class GetUserCompleteMeController {
  async handle(request: Request, response: Response): Promise<Response> {
    const { user_id } = request.user;

    const getUserCompleteUseCase = container.resolve(GetUserCompleteUseCase);

    const userIdNumber = Number(user_id);

    const user = await getUserCompleteUseCase.execute({
      user_id: userIdNumber,
    });

    return response.json(user);
  }
}

export { GetUserCompleteMeController };
