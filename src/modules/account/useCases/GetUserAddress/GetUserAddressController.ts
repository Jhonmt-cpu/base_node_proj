import { Request, Response } from "express";
import { GetUserAddressUseCase } from "./GetUserAddressUseCase";
import { container } from "tsyringe";

class GetUserAddressController {
  async handle(request: Request, response: Response) {
    const { user_id } = request.params;

    const getUserAddressUseCase = container.resolve(GetUserAddressUseCase);

    const userIdNumber = Number(user_id);

    const address = await getUserAddressUseCase.execute({
      user_address_id: userIdNumber,
    });

    return response.json(address);
  }
}

export { GetUserAddressController };
