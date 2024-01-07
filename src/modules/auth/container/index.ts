import { container } from "tsyringe";

import { IRefreshTokenRepository } from "../repositories/IRefreshTokenRepository";
import { RefreshTokenRepository } from "../infra/knex/repositories/RefreshTokenRepository";

import "./providers";

container.registerSingleton<IRefreshTokenRepository>(
  "RefreshTokenRepository",
  RefreshTokenRepository,
);
