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

    const status = roles.length === 0 ? 204 : 200;

    return response.status(status).json(roles);
  }
}

export { ListAllRolesPaginatedController };
