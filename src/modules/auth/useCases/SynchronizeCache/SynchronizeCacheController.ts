import { Request, Response } from "express";
import { container } from "tsyringe";

import { SynchronizeCacheUseCase } from "./SynchronizeCacheUseCase";

class SynchronizeCacheController {
  async handle(request: Request, response: Response): Promise<Response> {
    const synchronizeCacheUseCase = container.resolve(SynchronizeCacheUseCase);

    await synchronizeCacheUseCase.execute();

    return response.status(204).send();
  }
}

export { SynchronizeCacheController };
