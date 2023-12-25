import { UserEntity } from "@modules/users/infra/knex/entities/UserEntity";

import {
  ICreateUserRepositoryDTO,
  IFindUserByEmailOrCpfDTO,
  IUserRepository,
} from "../IUserRepository";

class UserRepositoryInMemory implements IUserRepository {
  private users: UserEntity[] = [];

  async create(data: ICreateUserRepositoryDTO): Promise<UserEntity> {
    const user = new UserEntity({
      user_id: this.users.length + 1,
      user_name: data.user_name,
      user_email: data.user_email,
      user_password: data.user_password,
      user_cpf: data.user_cpf,
      user_gender_id: data.user_gender_id,
      user_role_id: 2,
      user_created_at: new Date(),
      user_updated_at: new Date(),
    });

    this.users.push(user);

    return user;
  }

  async findByEmailOrCpf({
    user_email,
    user_cpf,
  }: IFindUserByEmailOrCpfDTO): Promise<UserEntity | undefined> {
    const user = this.users.find(
      (user) => user.user_email === user_email || user.user_cpf === user_cpf,
    );

    return user;
  }
}

export { UserRepositoryInMemory };
