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
  user_birth_date: Date;
};

type IUserWithoutPasswordRepositoryDTO = Omit<UserEntity, "user_password">;

type IUserCreateResponseRepositoryDTO = Omit<
  UserEntity,
  "user_cpf" | "user_password" | "user_role_id"
>;

type IFindUserByEmailOrCpfRepositoryDTO = {
  user_email: string;
  user_cpf: number;
};

type IFindAllUsersPaginatedRepositoryDTO = {
  page: number;
  limit: number;
};

type IUpdateUserRepositoryDTO = {
  user_id: number;
  updateFields: Partial<UserEntity>;
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
  create(
    data: ICreateUserRepositoryDTO,
  ): Promise<IUserCreateResponseRepositoryDTO>;
  findByEmailOrCpf(
    data: IFindUserByEmailOrCpfRepositoryDTO,
  ): Promise<IUserWithoutPasswordRepositoryDTO | undefined>;
  findById(user_id: number): Promise<UserEntity | undefined>;
  findByEmail(user_email: string): Promise<UserEntity | undefined>;
  findByIdWithoutPassword(
    user_id: number,
  ): Promise<IUserWithoutPasswordRepositoryDTO | undefined>;
  findByIdCompleteRelations(
    user_id: number,
  ): Promise<IFlatUserCompleteResponseRepositoryDTO | undefined>;
  findAllPaginated(
    data: IFindAllUsersPaginatedRepositoryDTO,
  ): Promise<IUserWithoutPasswordRepositoryDTO[]>;
  update(
    data: IUpdateUserRepositoryDTO,
  ): Promise<IUserCreateResponseRepositoryDTO | undefined>;
  deleteById(user_id: number): Promise<void>;
};

export {
  IUserRepository,
  ICreateUserRepositoryDTO,
  IFindUserByEmailOrCpfRepositoryDTO,
  IFlatUserCompleteResponseRepositoryDTO,
  IFindAllUsersPaginatedRepositoryDTO,
  IUserWithoutPasswordRepositoryDTO,
  IUserCreateResponseRepositoryDTO,
  IUpdateUserRepositoryDTO,
};
