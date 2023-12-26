import { AddressEntity } from "@modules/users/infra/knex/entities/AddressEntity";
import { CityEntity } from "@modules/users/infra/knex/entities/CityEntity";
import { GenderEntity } from "@modules/users/infra/knex/entities/GenderEntity";
import { NeighborhoodEntity } from "@modules/users/infra/knex/entities/NeighborhoodEntity";
import { PhoneEntity } from "@modules/users/infra/knex/entities/PhoneEntity";
import { RoleEntity } from "@modules/users/infra/knex/entities/RoleEntity";
import { StateEntity } from "@modules/users/infra/knex/entities/StateEntity";
import { UserEntity } from "@modules/users/infra/knex/entities/UserEntity";

class DatabaseInMemory {
  states: StateEntity[] = [];

  cities: CityEntity[] = [];

  neighborhoods: NeighborhoodEntity[] = [];

  addresses: AddressEntity[] = [];

  genders: GenderEntity[] = [];

  phones: PhoneEntity[] = [];

  roles: RoleEntity[] = [];

  users: UserEntity[] = [];
}

export { DatabaseInMemory };
