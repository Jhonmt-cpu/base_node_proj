import { Request, Response } from "express";
import { container } from "tsyringe";

import { CreateGenderUseCase } from "./CreateGenderUseCase";

class CreateGenderController {
  async handle(request: Request, response: Response): Promise<Response> {
    const { gender_name } = request.body;

    const createGenderUseCase = container.resolve(CreateGenderUseCase);

    const gender = await createGenderUseCase.execute({
      gender_name,
    });

    return response.status(201).json(gender);
  }
}

export { CreateGenderController };
