import {
  ICreateUserRepositoryDTO,
  IUserRepository,
} from "@modules/users/repositories/IUserRepository";

import { UserEntity } from "../entities/UserEntity";
import { dbConnection } from "@shared/infra/database/knex";

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
}

export { UserRepository };
