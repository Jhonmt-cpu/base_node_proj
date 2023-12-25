import { Request, Response } from "express";
import { container } from "tsyringe";

import { ListNeighborhoodsByCityUseCase } from "./ListNeighborhoodsByCityUseCase";

class ListNeighborhoodsByCityController {
  async handle(request: Request, response: Response) {
    const { city_id } = request.params;

    const listNeighborhoodsByCityUseCase = container.resolve(
      ListNeighborhoodsByCityUseCase,
    );

    const neighborhoods = await listNeighborhoodsByCityUseCase.execute({
      city_id: Number(city_id),
    });

    const status = neighborhoods.length === 0 ? 204 : 200;

    return response.status(status).json(neighborhoods);
  }
}

export { ListNeighborhoodsByCityController };
