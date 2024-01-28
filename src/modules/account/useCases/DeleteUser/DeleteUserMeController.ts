import { Request, Response } from "express";
import { container } from "tsyringe";

import { DeleteUserUseCase } from "./DeleteUserUseCase";

class DeleteUserMeController {
  async handle(request: Request, response: Response): Promise<Response> {
    const { user_id } = request.user;

    const { user_password } = request.query;

    const deleteUserUseCase = container.resolve(DeleteUserUseCase);

    const userIdNumber = Number(user_id);

    await deleteUserUseCase.execute({
      user_id: userIdNumber,
      is_admin_request: false,
      user_password: user_password as string,
    });

    return response.status(204).send();
  }
}

export { DeleteUserMeController };
