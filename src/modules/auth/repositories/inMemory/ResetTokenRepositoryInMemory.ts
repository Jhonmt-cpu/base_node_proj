import { v4 as uuid } from "uuid";

import { DatabaseInMemory } from "@shared/repositories/inMemory/DatabaseInMemory";

import { ResetTokenEntity } from "@modules/auth/infra/knex/entities/ResetTokenEntity";
import {
  ICreateResetTokenRepositoryDTO,
  IResetTokenRepository,
} from "../IResetTokenRepository";

class ResetTokenRepositoryInMemory implements IResetTokenRepository {
  constructor(private databaseInMemory: DatabaseInMemory) {}

  async create(
    data: ICreateResetTokenRepositoryDTO,
  ): Promise<ResetTokenEntity> {
    const resetToken = new ResetTokenEntity({
      reset_token_id: uuid(),
      reset_token_user_id: data.reset_token_user_id,
      reset_token_expires_in: data.reset_token_expires_in,
    });

    this.databaseInMemory.reset_tokens.push(resetToken);

    return resetToken;
  }

  async deleteById(reset_token_id: string): Promise<number> {
    const index = this.databaseInMemory.reset_tokens.findIndex(
      (resetToken) => resetToken.reset_token_id === reset_token_id,
    );

    if (index === -1) {
      return 0;
    }

    this.databaseInMemory.reset_tokens.splice(index, 1);

    return 1;
  }

  async deleteAllByUserId(reset_token_user_id: number): Promise<void> {
    const tokensNotToBeDeleted = this.databaseInMemory.reset_tokens.filter(
      (resetToken) => resetToken.reset_token_user_id !== reset_token_user_id,
    );

    this.databaseInMemory.reset_tokens = tokensNotToBeDeleted;
  }

  async findById(
    reset_token_id: string,
  ): Promise<ResetTokenEntity | undefined> {
    const resetToken = this.databaseInMemory.reset_tokens.find(
      (resetToken) => resetToken.reset_token_id === reset_token_id,
    );

    return resetToken;
  }

  async deleteExpiredTokens(): Promise<void> {
    const currentDate = new Date();

    const tokensNotToBeDeleted = this.databaseInMemory.reset_tokens.filter(
      (resetToken) => resetToken.reset_token_expires_in > currentDate,
    );

    this.databaseInMemory.reset_tokens = tokensNotToBeDeleted;
  }
}

export { ResetTokenRepositoryInMemory };
