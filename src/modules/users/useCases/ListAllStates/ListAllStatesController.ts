import { Request, Response } from "express";
import { container } from "tsyringe";
import { ListAllStatesUseCase } from "./ListAllStatesUseCase";

class ListAllStatesController {
  async handle(request: Request, response: Response): Promise<Response> {
    const listAllStatesUseCase = container.resolve(ListAllStatesUseCase);

    const states = await listAllStatesUseCase.execute();

    return response.status(200).json(states);
  }
}

export { ListAllStatesController };
