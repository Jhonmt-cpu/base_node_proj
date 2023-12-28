import { Request, Response } from "express";
import { CreateUserUseCase } from "./CreateUserUseCase";
import { container } from "tsyringe";

class CreateUserController {
  async handle(request: Request, response: Response): Promise<Response> {
    const {
      user_name,
      user_email,
      user_password,
      user_cpf,
      user_gender_id,
      user_birth_date,
      user_phone,
      user_address,
    } = request.body;

    const phone_ddd = Number(user_phone.substring(0, 2));
    const phone_number = Number(user_phone.substring(2, 11));
    const user_cpf_number = Number(user_cpf);

    const { address_zip_code } = user_address;

    const address_zip_code_number = Number(address_zip_code);

    user_address.address_zip_code = address_zip_code_number;

    const createUserUseCase = container.resolve(CreateUserUseCase);

    const user = await createUserUseCase.execute({
      user_name,
      user_email,
      user_cpf: user_cpf_number,
      user_password,
      user_gender_id,
      user_birth_date,
      user_phone: {
        phone_ddd,
        phone_number,
      },
      user_address: user_address,
    });

    return response.status(201).json(user);
  }
}

export { CreateUserController };
