import { Request, Response } from "express";
import { container } from "tsyringe";

import { GetUserPhoneUseCase } from "./GetUserPhoneUseCase";

class GetUserPhoneController {
  async handle(request: Request, response: Response): Promise<Response> {
    const { user_id } = request.params;

    const getUserPhoneUseCase = container.resolve(GetUserPhoneUseCase);

    const userIdNumber = Number(user_id);

    const phone = await getUserPhoneUseCase.execute({
      user_id: userIdNumber,
    });

    return response.json(phone);
  }
}

export { GetUserPhoneController };
