import { Request, Response } from "express";

import { ListAllUsersPaginatedUseCase } from "./ListAllUsersPaginatedUseCase";
import { container } from "tsyringe";

class ListAllUsersPaginatedController {
  async handle(request: Request, response: Response): Promise<Response> {
    const { page, limit } = request.query;

    const listAllUsersPaginatedUseCase = container.resolve(
      ListAllUsersPaginatedUseCase,
    );

    const users = await listAllUsersPaginatedUseCase.execute({
      page: Number(page),
      limit: Number(limit),
    });

    return response.json(users);
  }
}

export { ListAllUsersPaginatedController };
