import { v4 as uuid } from "uuid";

import { DatabaseInMemory } from "@global/repositories/inMemory/DatabaseInMemory";

import { RefreshTokenEntity } from "@modules/auth/infra/knex/entities/RefreshTokenEntity";

import {
  ICreateRefreshTokenRepositoryDTO,
  IFlatRefreshTokenWithUserAndRoleResponseRepositoryDTO,
  IRefreshTokenRepository,
} from "../IRefreshTokenRepository";

class RefreshTokenRepositoryInMemory implements IRefreshTokenRepository {
  constructor(private databaseInMemory: DatabaseInMemory) {}

  async create({
    refresh_token_user_id,
    refresh_token_expires_in,
  }: ICreateRefreshTokenRepositoryDTO): Promise<RefreshTokenEntity> {
    const refreshToken = new RefreshTokenEntity({
      refresh_token_id: uuid(),
      refresh_token_user_id,
      refresh_token_expires_in,
    });

    this.databaseInMemory.refresh_tokens.push(refreshToken);

    return refreshToken;
  }

  async deleteById(refresh_token_id: string): Promise<void> {
    const index = this.databaseInMemory.refresh_tokens.findIndex(
      (refreshToken) => refreshToken.refresh_token_id === refresh_token_id,
    );

    this.databaseInMemory.refresh_tokens.splice(index, 1);
  }

  async deleteAllByUserId(refresh_token_user_id: number): Promise<void> {
    const tokensNotToBeDeleted = this.databaseInMemory.refresh_tokens.filter(
      (refreshToken) =>
        refreshToken.refresh_token_user_id !== refresh_token_user_id,
    );

    this.databaseInMemory.refresh_tokens = tokensNotToBeDeleted;
  }

  async findById(
    refresh_token_id: string,
  ): Promise<RefreshTokenEntity | undefined> {
    const refreshToken = this.databaseInMemory.refresh_tokens.find(
      (refreshToken) => refreshToken.refresh_token_id === refresh_token_id,
    );

    return refreshToken;
  }

  async findAllByUserId(
    refresh_token_user_id: number,
  ): Promise<RefreshTokenEntity[]> {
    const refreshTokens = this.databaseInMemory.refresh_tokens.filter(
      (refreshToken) =>
        refreshToken.refresh_token_user_id === refresh_token_user_id,
    );

    return refreshTokens;
  }

  async deleteExpiredTokens(): Promise<void> {
    const tokensNotToBeDeleted = this.databaseInMemory.refresh_tokens.filter(
      (refreshToken) => refreshToken.refresh_token_expires_in > new Date(),
    );

    this.databaseInMemory.refresh_tokens = tokensNotToBeDeleted;
  }

  async findAll(): Promise<RefreshTokenEntity[]> {
    return this.databaseInMemory.refresh_tokens;
  }

  async findAllWithUserAndRole(): Promise<
    IFlatRefreshTokenWithUserAndRoleResponseRepositoryDTO[]
  > {
    const refreshTokens = this.databaseInMemory.refresh_tokens;

    const refreshTokensWithUserAndRole = refreshTokens.map((refreshToken) => {
      const user = this.databaseInMemory.users.find(
        (user) => user.user_id === refreshToken.refresh_token_user_id,
      );

      if (!user) {
        throw new Error("User not found");
      }

      const role = this.databaseInMemory.roles.find(
        (role) => role.role_id === user.user_role_id,
      );

      if (!role) {
        throw new Error("Role not found");
      }

      const { user_name, user_id } = user;

      const refreshTokenWithUserAndRole = {
        ...refreshToken,
        ...{ user_name, user_id },
        ...role,
      };

      return refreshTokenWithUserAndRole;
    });

    return refreshTokensWithUserAndRole;
  }
}

export { RefreshTokenRepositoryInMemory };
