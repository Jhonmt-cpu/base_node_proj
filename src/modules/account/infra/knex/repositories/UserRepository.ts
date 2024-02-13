import {
  ICreateUserRepositoryDTO,
  IFindAllUsersPaginatedRepositoryDTO,
  IFlatUserCompleteResponseRepositoryDTO,
  IFlatUserWithRoleResponseRepositoryDTO,
  IUpdateUserRepositoryDTO,
  IUserCreateResponseRepositoryDTO,
  IUserRepository,
  IUserWithoutPasswordRepositoryDTO,
} from "@modules/account/repositories/IUserRepository";

import { dbConnection } from "@shared/infra/database/knex";

import { UserEntity } from "../entities/UserEntity";
import { PhoneEntity } from "../entities/PhoneEntity";
import { GenderEntity } from "../entities/GenderEntity";
import { RoleEntity } from "../entities/RoleEntity";
import { AddressEntity } from "../entities/AddressEntity";
import { NeighborhoodEntity } from "../entities/NeighborhoodEntity";
import { CityEntity } from "../entities/CityEntity";
import { StateEntity } from "../entities/StateEntity";

class UserRepository implements IUserRepository {
  async create(
    data: ICreateUserRepositoryDTO,
  ): Promise<IUserCreateResponseRepositoryDTO> {
    const user = await dbConnection<UserEntity>("tb_users")
      .insert({
        user_name: data.user_name,
        user_email: data.user_email,
        user_password: data.user_password,
        user_cpf: data.user_cpf,
        user_gender_id: data.user_gender_id,
        user_birth_date: data.user_birth_date,
      })
      .returning([
        "user_id",
        "user_name",
        "user_email",
        "user_gender_id",
        "user_created_at",
        "user_updated_at",
        "user_birth_date",
      ]);

    return user[0];
  }

  async findByEmailOrCpf({
    user_email,
    user_cpf,
  }: ICreateUserRepositoryDTO): Promise<
    IUserWithoutPasswordRepositoryDTO | undefined
  > {
    const user = await dbConnection<UserEntity>("tb_users")
      .select([
        "user_id",
        "user_name",
        "user_email",
        "user_cpf",
        "user_role_id",
        "user_gender_id",
        "user_birth_date",
        "user_created_at",
        "user_updated_at",
      ])
      .where({
        user_email,
      })
      .orWhere({
        user_cpf,
      })
      .first();

    return user;
  }

  async findById(user_id: number): Promise<UserEntity | undefined> {
    const user = await dbConnection<UserEntity>("tb_users")
      .select("*")
      .where({
        user_id,
      })
      .first();

    return user;
  }

  async findByEmail(user_email: string): Promise<UserEntity | undefined> {
    const user = await dbConnection<UserEntity>("tb_users")
      .select("*")
      .where({
        user_email,
      })
      .first();

    return user;
  }

  async findByEmailWithRole(
    user_email: string,
  ): Promise<IFlatUserWithRoleResponseRepositoryDTO | undefined> {
    const user = await dbConnection<UserEntity>("tb_users")
      .select("*")
      .join<RoleEntity>(
        "tb_roles",
        "tb_users.user_role_id",
        "=",
        "tb_roles.role_id",
      )
      .where({
        user_email,
      })
      .first();

    return user;
  }

  async findByIdWithRole(
    user_id: number,
  ): Promise<IFlatUserWithRoleResponseRepositoryDTO | undefined> {
    const user = await dbConnection<UserEntity>("tb_users")
      .select("*")
      .join<RoleEntity>(
        "tb_roles",
        "tb_users.user_role_id",
        "=",
        "tb_roles.role_id",
      )
      .where({
        user_id,
      })
      .first();

    return user;
  }

  async findByIdWithoutPassword(
    user_id: number,
  ): Promise<IUserWithoutPasswordRepositoryDTO | undefined> {
    const user = await dbConnection<UserEntity>("tb_users")
      .select([
        "user_id",
        "user_name",
        "user_email",
        "user_cpf",
        "user_role_id",
        "user_gender_id",
        "user_birth_date",
        "user_created_at",
        "user_updated_at",
      ])
      .where({
        user_id,
      })
      .first();

    return user;
  }

  async findByIdCompleteRelations(
    user_id: number,
  ): Promise<IFlatUserCompleteResponseRepositoryDTO | undefined> {
    const user = await dbConnection<UserEntity>("tb_users")
      .select("*")
      .join<PhoneEntity>(
        "tb_phones",
        "tb_users.user_id",
        "=",
        "tb_phones.user_phone_id",
      )
      .join<GenderEntity>(
        "tb_genders",
        "tb_users.user_gender_id",
        "=",
        "tb_genders.gender_id",
      )
      .join<RoleEntity>(
        "tb_roles",
        "tb_users.user_role_id",
        "=",
        "tb_roles.role_id",
      )
      .join<AddressEntity>(
        "tb_addresses",
        "tb_users.user_id",
        "=",
        "tb_addresses.user_address_id",
      )
      .join<NeighborhoodEntity>(
        "tb_neighborhoods",
        "tb_addresses.address_neighborhood_id",
        "=",
        "tb_neighborhoods.neighborhood_id",
      )
      .join<CityEntity>(
        "tb_cities",
        "tb_neighborhoods.neighborhood_city_id",
        "=",
        "tb_cities.city_id",
      )
      .join<StateEntity>(
        "tb_states",
        "tb_cities.city_state_id",
        "=",
        "tb_states.state_id",
      )
      .where({
        user_id,
      })
      .first();

    return user;
  }

  async findAllPaginated({
    page,
    limit,
  }: IFindAllUsersPaginatedRepositoryDTO): Promise<
    IUserWithoutPasswordRepositoryDTO[]
  > {
    const users = await dbConnection<UserEntity>("tb_users")
      .select([
        "user_id",
        "user_name",
        "user_email",
        "user_cpf",
        "user_role_id",
        "user_gender_id",
        "user_birth_date",
        "user_created_at",
        "user_updated_at",
      ])
      .limit(limit)
      .offset((page - 1) * limit);

    return users;
  }

  async deleteById(user_id: number): Promise<void> {
    await dbConnection<UserEntity>("tb_users")
      .where({
        user_id,
      })
      .del();
  }

  async update({
    user_id,
    updateFields,
  }: IUpdateUserRepositoryDTO): Promise<
    IUserCreateResponseRepositoryDTO | undefined
  > {
    const user = await dbConnection<UserEntity>("tb_users")
      .update(updateFields)
      .where({
        user_id,
      })
      .returning([
        "user_id",
        "user_name",
        "user_email",
        "user_gender_id",
        "user_created_at",
        "user_updated_at",
        "user_birth_date",
      ]);

    return user[0];
  }
}

export { UserRepository };
