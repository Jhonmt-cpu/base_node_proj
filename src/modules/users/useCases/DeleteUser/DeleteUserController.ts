import { Request, Response } from "express";

import { DeleteUserUseCase } from "./DeleteUserUseCase";
import { container } from "tsyringe";

class DeleteUserController {
  async handle(request: Request, response: Response): Promise<Response> {
    const { user_id } = request.params;

    const deleteUserUseCase = container.resolve(DeleteUserUseCase);

    const userIdNumber = Number(user_id);

    await deleteUserUseCase.execute({
      user_id: userIdNumber,
    });

    return response.status(204).send();
  }
}

export { DeleteUserController };
