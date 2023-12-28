import { Request, Response } from "express";
import { container } from "tsyringe";

import { CreateStateUseCase } from "./CreateStateUseCase";

class CreateStateController {
  async handle(request: Request, response: Response): Promise<Response> {
    const { state_name, state_uf } = request.body;

    const createStateUseCase = container.resolve(CreateStateUseCase);

    const state = await createStateUseCase.execute({
      state_name,
      state_uf,
    });

    return response.status(201).json(state);
  }
}

export { CreateStateController };
