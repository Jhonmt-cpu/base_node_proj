import { Request, Response } from "express";
import { container } from "tsyringe";

import { CreateCityUseCase } from "./CreateCityUseCase";

class CreateCityController {
  async handle(request: Request, response: Response): Promise<Response> {
    const { city_name, city_state_id } = request.body;

    const createCityUseCase = container.resolve(CreateCityUseCase);

    const city = await createCityUseCase.execute({
      city_name,
      city_state_id,
    });

    return response.status(201).json(city);
  }
}

export { CreateCityController };
