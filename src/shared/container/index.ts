import { container } from "tsyringe";
import { RoleRepository } from "../../modules/users/infra/knex/repositories/RoleRepository";
import { IRoleRepository } from "../../modules/users/repositories/IRoleRepository";

container.registerSingleton<IRoleRepository>(
  "RoleRepository", RoleRepository
);