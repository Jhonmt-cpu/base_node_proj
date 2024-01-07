import { RoleEntity } from "@modules/account/infra/knex/entities/RoleEntity";
import { RefreshTokenEntity } from "../infra/knex/entities/RefreshTokenEntity";
import { UserEntity } from "@modules/account/infra/knex/entities/UserEntity";

type ICreateRefreshTokenRepositoryDTO = {
  refresh_token_user_id: number;
  refresh_token_expires_in: Date;
};

type IFlatRefreshTokenWithUserAndRoleResponseRepositoryDTO =
  RefreshTokenEntity & Pick<UserEntity, "user_id" | "user_name"> & RoleEntity;

type IRefreshTokenRepository = {
  create(data: ICreateRefreshTokenRepositoryDTO): Promise<RefreshTokenEntity>;
  deleteById(refresh_token_id: string): Promise<void>;
  deleteAllByUserId(refresh_token_user_id: number): Promise<void>;
  findById(refresh_token_id: string): Promise<RefreshTokenEntity | undefined>;
  findAllByUserId(refresh_token_user_id: number): Promise<RefreshTokenEntity[]>;
  deleteExpiredTokens(): Promise<void>;
  findAll(): Promise<RefreshTokenEntity[]>;
  findAllWithUserAndRole(): Promise<
    IFlatRefreshTokenWithUserAndRoleResponseRepositoryDTO[]
  >;
};

export {
  IRefreshTokenRepository,
  ICreateRefreshTokenRepositoryDTO,
  IFlatRefreshTokenWithUserAndRoleResponseRepositoryDTO,
};
