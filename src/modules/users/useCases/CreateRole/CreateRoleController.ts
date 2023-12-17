import { Request, Response } from "express";
import { container } from "tsyringe";
import { CreateRoleUseCase } from "./CreateRoleUseCase";

class CreateRoleController {
  async handle(request: Request, response: Response): Promise<Response> {
    const { role_name } = request.body;

    const createRoleUseCase = container.resolve(CreateRoleUseCase);

    const role = await createRoleUseCase.execute(role_name);

    return response.status(201).json(role);
  }
}

export { CreateRoleController }