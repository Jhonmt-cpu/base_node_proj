import { UserEntity } from "@modules/users/infra/knex/entities/UserEntity";

type ICreateUserDTO = {
  user_name: string;
  user_email: string;
  user_password: string;
  user_cpf: string;
  user_gender_id: number;
};

type IUserRepository = {
  create(data: ICreateUserDTO): Promise<UserEntity>;
};

export { IUserRepository, ICreateUserDTO };
