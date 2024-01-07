import { Request, Response } from "express";
import { container } from "tsyringe";
import { ListAllStatesUseCase } from "./ListAllStatesUseCase";

class ListAllStatesController {
  async handle(request: Request, response: Response): Promise<Response> {
    const listAllStatesUseCase = container.resolve(ListAllStatesUseCase);

    const states = await listAllStatesUseCase.execute();

    const status = states.length === 0 ? 204 : 200;

    return response.status(status).json(states);
  }
}

export { ListAllStatesController };
