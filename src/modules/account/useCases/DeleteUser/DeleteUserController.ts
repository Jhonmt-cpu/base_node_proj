import { Request, Response } from "express";
import { container } from "tsyringe";

import { DeleteUserUseCase } from "./DeleteUserUseCase";

class DeleteUserController {
  async handle(request: Request, response: Response): Promise<Response> {
    const { user_id } = request.params;

    const deleteUserUseCase = container.resolve(DeleteUserUseCase);

    const userIdNumber = Number(user_id);

    await deleteUserUseCase.execute({
      user_id: userIdNumber,
      is_admin_request: true,
      user_password: "",
    });

    return response.status(204).send();
  }
}

export { DeleteUserController };
