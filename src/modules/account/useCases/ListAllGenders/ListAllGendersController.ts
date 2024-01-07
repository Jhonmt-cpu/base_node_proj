import { Request, Response } from "express";
import { container } from "tsyringe";

import { ListAllGendersUseCase } from "./ListAllGendersUseCase";

class ListAllGendersController {
  async handle(request: Request, response: Response) {
    const listAllGendersUseCase = container.resolve(ListAllGendersUseCase);

    const genders = await listAllGendersUseCase.execute();

    const status = genders.length === 0 ? 204 : 200;

    return response.status(status).json(genders);
  }
}

export { ListAllGendersController };
