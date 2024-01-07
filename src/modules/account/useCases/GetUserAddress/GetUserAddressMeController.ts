import { Request, Response } from "express";
import { GetUserAddressUseCase } from "./GetUserAddressUseCase";
import { container } from "tsyringe";

class GetUserAddressMeController {
  async handle(request: Request, response: Response) {
    const { user_id } = request.user;

    const getUserAddressUseCase = container.resolve(GetUserAddressUseCase);

    const userIdNumber = Number(user_id);

    const address = await getUserAddressUseCase.execute({
      user_address_id: userIdNumber,
    });

    return response.json(address);
  }
}

export { GetUserAddressMeController };
