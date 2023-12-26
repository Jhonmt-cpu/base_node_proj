import { UserEntity } from "../infra/knex/entities/UserEntity";
import { AddressEntity } from "../infra/knex/entities/AddressEntity";
import { RoleEntity } from "../infra/knex/entities/RoleEntity";
import { GenderEntity } from "../infra/knex/entities/GenderEntity";
import { NeighborhoodEntity } from "../infra/knex/entities/NeighborhoodEntity";
import { StateEntity } from "../infra/knex/entities/StateEntity";
import { PhoneEntity } from "../infra/knex/entities/PhoneEntity";
import { CityEntity } from "../infra/knex/entities/CityEntity";

type ICreateUserRepositoryDTO = {
  user_name: string;
  user_email: string;
  user_password: string;
  user_cpf: number;
  user_gender_id: number;
};

type IFindUserByEmailOrCpfRepositoryDTO = {
  user_email: string;
  user_cpf: number;
};

type IFlatUserCompleteResponseRepositoryDTO = UserEntity &
  AddressEntity &
  NeighborhoodEntity &
  CityEntity &
  StateEntity &
  PhoneEntity &
  RoleEntity &
  GenderEntity;

type IUserRepository = {
  create(data: ICreateUserRepositoryDTO): Promise<UserEntity>;
  findByEmailOrCpf(
    data: IFindUserByEmailOrCpfRepositoryDTO,
  ): Promise<UserEntity | undefined>;
  findById(user_id: number): Promise<UserEntity | undefined>;
  findByIdWithAddressAndPhone(user_id: number): Promise<UserEntity | undefined>;
  findByIdComplete(
    user_id: number,
  ): Promise<IFlatUserCompleteResponseRepositoryDTO | undefined>;
};

export {
  IUserRepository,
  ICreateUserRepositoryDTO,
  IFindUserByEmailOrCpfRepositoryDTO,
  IFlatUserCompleteResponseRepositoryDTO,
};
