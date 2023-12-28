import { Request, Response } from "express";
import { container } from "tsyringe";

import { IUpdateUserDTO } from "@modules/users/@types/IUpdateUserDTO";

import { UpdateUserUseCase } from "./UpdateUserUseCase";

class UpdateUserController {
  async handle(request: Request, response: Response): Promise<Response> {
    const { user_id } = request.params;

    const userIdNumber = Number(user_id);

    const {
      user_name,
      user_email,
      user_password,
      user_new_password,
      user_gender_id,
      user_phone,
      user_address,
    } = request.body;

    const updateFields: IUpdateUserDTO = {
      user_id: userIdNumber,
      user_password,
      user_name,
      user_email,
      user_new_password,
      user_gender_id,
    };

    if (user_phone) {
      const phone_ddd = Number(user_phone.substring(0, 2));
      const phone_number = Number(user_phone.substring(2, 11));

      updateFields["user_phone"] = {
        phone_ddd,
        phone_number,
      };
    }

    if (user_address) {
      const { address_zip_code } = user_address;

      if (address_zip_code) {
        const address_zip_code_number = Number(address_zip_code);

        user_address.address_zip_code = address_zip_code_number;
      }

      updateFields["user_address"] = user_address;
    }

    const updateUserUseCase = container.resolve(UpdateUserUseCase);

    const user = await updateUserUseCase.execute(updateFields);

    return response.json(user);
  }
}

export { UpdateUserController };
