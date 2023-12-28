import { Request, Response } from "express";
import { container } from "tsyringe";

import { CreateNeighborhoodUseCase } from "./CreateNeighborhoodUseCase";

class CreateNeighborhoodController {
  async handle(request: Request, response: Response): Promise<Response> {
    const { neighborhood_name, neighborhood_city_id } = request.body;

    const createNeighborhoodUseCase = container.resolve(
      CreateNeighborhoodUseCase,
    );

    const neighborhood = await createNeighborhoodUseCase.execute({
      neighborhood_name,
      neighborhood_city_id,
    });

    return response.status(201).json(neighborhood);
  }
}

export { CreateNeighborhoodController };
