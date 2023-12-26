import {
  ICreateUserRepositoryDTO,
  IFlatUserCompleteResponseRepositoryDTO,
  IUserRepository,
} from "@modules/users/repositories/IUserRepository";

import { dbConnection } from "@shared/infra/database/knex";

import { UserEntity } from "../entities/UserEntity";

class UserRepository implements IUserRepository {
  async create(data: ICreateUserRepositoryDTO): Promise<UserEntity> {
    const user = await dbConnection("tb_users")
      .insert({
        user_name: data.user_name,
        user_email: data.user_email,
        user_password: data.user_password,
        user_cpf: data.user_cpf,
        user_gender_id: data.user_gender_id,
      })
      .returning("*");

    return user[0];
  }

  async findByEmailOrCpf({
    user_email,
    user_cpf,
  }: ICreateUserRepositoryDTO): Promise<UserEntity | undefined> {
    const user = await dbConnection<UserEntity>("tb_users")
      .select("*")
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

  async findByIdWithAddressAndPhone(
    user_id: number,
  ): Promise<UserEntity | undefined> {
    const user = await dbConnection<UserEntity>("tb_users")
      .select("*")
      .join(
        "tb_addresses",
        "tb_users.user_id",
        "=",
        "tb_addresses.user_address_id",
      )
      .join("tb_phones", "tb_users.user_id", "=", "tb_phones.user_phone_id")
      .where({
        user_id,
      })
      .first();

    return user;
  }

  async findByIdComplete(
    user_id: number,
  ): Promise<IFlatUserCompleteResponseRepositoryDTO | undefined> {
    const user = await dbConnection("tb_users")
      .select("*")
      .join("tb_phones", "tb_users.user_id", "=", "tb_phones.user_phone_id")
      .join(
        "tb_genders",
        "tb_users.user_gender_id",
        "=",
        "tb_genders.gender_id",
      )
      .join("tb_roles", "tb_users.user_role_id", "=", "tb_roles.role_id")
      .join(
        "tb_addresses",
        "tb_users.user_id",
        "=",
        "tb_addresses.user_address_id",
      )
      .join(
        "tb_neighborhoods",
        "tb_addresses.address_neighborhood_id",
        "=",
        "tb_neighborhoods.neighborhood_id",
      )
      .join(
        "tb_cities",
        "tb_neighborhoods.neighborhood_city_id",
        "=",
        "tb_cities.city_id",
      )
      .join("tb_states", "tb_cities.city_state_id", "=", "tb_states.state_id")
      .where({
        user_id,
      })
      .first();

    return user;
  }
}

export { UserRepository };
