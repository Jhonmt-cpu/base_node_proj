import { Request, Response } from "express";
import { container } from "tsyringe";

import { ListAllGendersPaginatedUseCase } from "./ListAllGendersPaginatedUseCase";

class ListAllGendersPaginatedController {
  async handle(request: Request, response: Response): Promise<Response> {
    const { page, limit } = request.query;

    const pageParsed = Number(page);
    const limitParsed = Number(limit);

    const data = {
      page: pageParsed,
      limit: limitParsed,
    };

    const listAllGendersPaginatedUseCase = container.resolve(
      ListAllGendersPaginatedUseCase,
    );

    const genders = await listAllGendersPaginatedUseCase.execute(data);

    return response.status(200).json(genders);
  }
}

export { ListAllGendersPaginatedController };
