import { UserEntity } from "../infra/knex/entities/UserEntity";

type IUserResponse = Omit<
  UserEntity,
  "user_cpf" | "user_password" | "user_role_id"
>;

function userToUserResponse(user: UserEntity): IUserResponse {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user_cpf, user_password, user_role_id, ...userResponse } = user;

  return userResponse;
}

export { userToUserResponse };
