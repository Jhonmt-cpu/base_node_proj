import { container } from "tsyringe";

import { IRoleRepository } from "@modules/users/repositories/IRoleRepository";
import { RoleRepository } from "@modules/users/infra/knex/repositories/RoleRepository";
import { IGenderRepository } from "@modules/users/repositories/IGenderRepository";
import { GenderRepository } from "@modules/users/infra/knex/repositories/GenderRepository";
import { IStateRepository } from "../repositories/IStateRepository";
import { StateRepository } from "../infra/knex/repositories/StateRepository";

container.registerSingleton<IRoleRepository>("RoleRepository", RoleRepository);

container.registerSingleton<IGenderRepository>(
  "GenderRepository",
  GenderRepository,
);

container.registerSingleton<IStateRepository>(
  "StateRepository",
  StateRepository,
);
