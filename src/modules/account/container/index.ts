import { container } from "tsyringe";

import { IRoleRepository } from "@modules/account/repositories/IRoleRepository";
import { RoleRepository } from "@modules/account/infra/knex/repositories/RoleRepository";
import { IGenderRepository } from "@modules/account/repositories/IGenderRepository";
import { GenderRepository } from "@modules/account/infra/knex/repositories/GenderRepository";
import { IStateRepository } from "../repositories/IStateRepository";
import { StateRepository } from "../infra/knex/repositories/StateRepository";
import { ICityRepository } from "../repositories/ICityRepository";
import { CityRepository } from "../infra/knex/repositories/CityRepository";
import { INeighborhoodRepository } from "../repositories/INeighborhoodRepository";
import { NeighborhoodRepository } from "../infra/knex/repositories/NeighborhoodRespositoy";
import { IAddressRepository } from "../repositories/IAddressRepository";
import { AddressRepository } from "../infra/knex/repositories/AddressRepository";
import { IUserRepository } from "../repositories/IUserRepository";
import { UserRepository } from "../infra/knex/repositories/UserRepository";
import { IPhoneRepository } from "../repositories/IPhoneRepository";
import { PhoneRepository } from "../infra/knex/repositories/PhoneRepository";

container.registerSingleton<IRoleRepository>("RoleRepository", RoleRepository);

container.registerSingleton<IGenderRepository>(
  "GenderRepository",
  GenderRepository,
);

container.registerSingleton<IStateRepository>(
  "StateRepository",
  StateRepository,
);

container.registerSingleton<ICityRepository>("CityRepository", CityRepository);

container.registerSingleton<INeighborhoodRepository>(
  "NeighborhoodRepository",
  NeighborhoodRepository,
);

container.registerSingleton<IAddressRepository>(
  "AddressRepository",
  AddressRepository,
);

container.registerSingleton<IPhoneRepository>(
  "PhoneRepository",
  PhoneRepository,
);

container.registerSingleton<IUserRepository>("UserRepository", UserRepository);
