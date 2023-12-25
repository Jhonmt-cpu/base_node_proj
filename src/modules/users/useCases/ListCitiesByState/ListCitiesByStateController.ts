import { Request, Response } from "express";
import { container } from "tsyringe";

import { ListCitiesByStateUseCase } from "./ListCitiesByStateUseCase";

class ListCitiesByStateController {
  async handle(request: Request, response: Response) {
    const { state_id } = request.params;

    const listCitiesByStateUseCase = container.resolve(
      ListCitiesByStateUseCase,
    );

    const cities = await listCitiesByStateUseCase.execute({
      state_id: Number(state_id),
    });

    const status = cities.length === 0 ? 204 : 200;

    return response.status(status).json(cities);
  }
}

export { ListCitiesByStateController };
