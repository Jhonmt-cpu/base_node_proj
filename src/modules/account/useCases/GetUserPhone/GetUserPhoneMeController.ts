import { Request, Response } from "express";
import { container } from "tsyringe";

import { GetUserPhoneUseCase } from "./GetUserPhoneUseCase";

class GetUserPhoneMeController {
  async handle(request: Request, response: Response): Promise<Response> {
    const { user_id } = request.user;

    const getUserPhoneUseCase = container.resolve(GetUserPhoneUseCase);

    const userIdNumber = Number(user_id);

    const phone = await getUserPhoneUseCase.execute({
      user_id: userIdNumber,
    });

    return response.json(phone);
  }
}

export { GetUserPhoneMeController };
