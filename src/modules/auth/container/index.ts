import { container } from "tsyringe";

import { IRefreshTokenRepository } from "../repositories/IRefreshTokenRepository";
import { RefreshTokenRepository } from "../infra/knex/repositories/RefreshTokenRepository";
import { IResetTokenRepository } from "../repositories/IResetTokenRepository";
import { ResetTokenRepository } from "../infra/knex/repositories/ResetTokenRepository";

import "./providers";

container.registerSingleton<IRefreshTokenRepository>(
  "RefreshTokenRepository",
  RefreshTokenRepository,
);

container.registerSingleton<IResetTokenRepository>(
  "ResetTokenRepository",
  ResetTokenRepository,
);
