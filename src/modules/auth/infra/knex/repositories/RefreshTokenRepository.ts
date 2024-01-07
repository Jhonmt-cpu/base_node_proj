import { v4 as uuid } from "uuid";

import {
  ICreateRefreshTokenRepositoryDTO,
  IFlatRefreshTokenWithUserAndRoleResponseRepositoryDTO,
  IRefreshTokenRepository,
} from "@modules/auth/repositories/IRefreshTokenRepository";

import { dbConnection } from "@shared/infra/database/knex";

import { RefreshTokenEntity } from "../entities/RefreshTokenEntity";
import { UserEntity } from "@modules/account/infra/knex/entities/UserEntity";
import { RoleEntity } from "@modules/account/infra/knex/entities/RoleEntity";

class RefreshTokenRepository implements IRefreshTokenRepository {
  async create({
    refresh_token_user_id,
    refresh_token_expires_in,
  }: ICreateRefreshTokenRepositoryDTO): Promise<RefreshTokenEntity> {
    const refreshToken = await dbConnection<RefreshTokenEntity>(
      "tb_refresh_tokens",
    )
      .insert({
        refresh_token_id: uuid(),
        refresh_token_user_id,
        refresh_token_expires_in,
      })
      .returning("*");

    return refreshToken[0];
  }

  async deleteById(refresh_token_id: string): Promise<void> {
    await dbConnection<RefreshTokenEntity>("tb_refresh_tokens").delete().where({
      refresh_token_id,
    });
  }

  async deleteAllByUserId(refresh_token_user_id: number): Promise<void> {
    await dbConnection<RefreshTokenEntity>("tb_refresh_tokens").delete().where({
      refresh_token_user_id,
    });
  }

  async findById(
    refresh_token_id: string,
  ): Promise<RefreshTokenEntity | undefined> {
    const refreshToken = await dbConnection<RefreshTokenEntity>(
      "tb_refresh_tokens",
    )
      .select("*")
      .where({
        refresh_token_id,
      })
      .first();

    return refreshToken;
  }

  async findAllByUserId(
    refresh_token_user_id: number,
  ): Promise<RefreshTokenEntity[]> {
    const refreshTokens = await dbConnection<RefreshTokenEntity>(
      "tb_refresh_tokens",
    )
      .select("*")
      .where({
        refresh_token_user_id,
      });

    return refreshTokens;
  }

  async deleteExpiredTokens(): Promise<void> {
    await dbConnection<RefreshTokenEntity>("tb_refresh_tokens")
      .delete()
      .where("refresh_token_expires_in", "<", new Date());
  }

  async findAll(): Promise<RefreshTokenEntity[]> {
    const refreshTokens = await dbConnection<RefreshTokenEntity>(
      "tb_refresh_tokens",
    ).select("*");

    return refreshTokens;
  }

  async findAllWithUserAndRole(): Promise<
    IFlatRefreshTokenWithUserAndRoleResponseRepositoryDTO[]
  > {
    const refreshTokens = await dbConnection<RefreshTokenEntity>(
      "tb_refresh_tokens",
    )
      .select(
        "tb_refresh_tokens.*",
        "tb_users.user_id",
        "tb_users.user_name",
        "tb_roles.role_id",
        "tb_roles.role_name",
      )
      .join<UserEntity>(
        "tb_users",
        "tb_refresh_tokens.refresh_token_user_id",
        "=",
        "tb_users.user_id",
      )
      .join<RoleEntity>(
        "tb_roles",
        "tb_users.user_role_id",
        "=",
        "tb_roles.role_id",
      );

    return refreshTokens;
  }
}

export { RefreshTokenRepository };
