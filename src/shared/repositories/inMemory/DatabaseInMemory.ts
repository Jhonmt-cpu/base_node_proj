import { RefreshTokenEntity } from "@modules/auth/infra/knex/entities/RefreshTokenEntity";
import { AddressEntity } from "@modules/account/infra/knex/entities/AddressEntity";
import { CityEntity } from "@modules/account/infra/knex/entities/CityEntity";
import { GenderEntity } from "@modules/account/infra/knex/entities/GenderEntity";
import { NeighborhoodEntity } from "@modules/account/infra/knex/entities/NeighborhoodEntity";
import { PhoneEntity } from "@modules/account/infra/knex/entities/PhoneEntity";
import { RoleEntity } from "@modules/account/infra/knex/entities/RoleEntity";
import { StateEntity } from "@modules/account/infra/knex/entities/StateEntity";
import { UserEntity } from "@modules/account/infra/knex/entities/UserEntity";

class DatabaseInMemory {
  states: StateEntity[] = [];

  cities: CityEntity[] = [];

  neighborhoods: NeighborhoodEntity[] = [];

  addresses: AddressEntity[] = [];

  genders: GenderEntity[] = [];

  phones: PhoneEntity[] = [];

  roles: RoleEntity[] = [];

  users: UserEntity[] = [];

  refresh_tokens: RefreshTokenEntity[] = [];
}

export { DatabaseInMemory };
