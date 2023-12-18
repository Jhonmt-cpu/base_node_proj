import { Request, Response } from "express";
import { container } from "tsyringe";

import { ListAllRolesPaginatedUseCase } from "./ListAllRolesPaginatedUseCase";

class ListAllRolesPaginatedController {
  async handle(request: Request, response: Response): Promise<Response> {
    const { page, limit } = request.query;

    const pageParsed = Number(page);
    const limitParsed = Number(limit);

    const data = {
      page: pageParsed,
      limit: limitParsed,
    };

    const listAllRolesPaginatedUseCase = container.resolve(
      ListAllRolesPaginatedUseCase,
    );

    const roles = await listAllRolesPaginatedUseCase.execute(data);

    return response.status(200).json(roles);
  }
}

export { ListAllRolesPaginatedController };
