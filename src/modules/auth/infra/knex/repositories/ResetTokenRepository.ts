import { v4 as uuid } from "uuid";

import { dbConnection } from "@shared/infra/database/knex";

import {
  ICreateResetTokenRepositoryDTO,
  IResetTokenRepository,
} from "@modules/auth/repositories/IResetTokenRepository";

import { ResetTokenEntity } from "../entities/ResetTokenEntity";

class ResetTokenRepository implements IResetTokenRepository {
  async create(
    data: ICreateResetTokenRepositoryDTO,
  ): Promise<ResetTokenEntity> {
    const resetToken = await dbConnection<ResetTokenEntity>("tb_reset_tokens")
      .insert({
        reset_token_id: uuid(),
        reset_token_user_id: data.reset_token_user_id,
        reset_token_expires_in: data.reset_token_expires_in,
      })
      .returning("*");

    return resetToken[0];
  }

  async deleteById(reset_token_id: string): Promise<number> {
    const rowsDeleted = await dbConnection<ResetTokenEntity>("tb_reset_tokens")
      .delete()
      .where({
        reset_token_id,
      });

    return rowsDeleted;
  }

  async deleteAllByUserId(reset_token_user_id: number): Promise<void> {
    await dbConnection<ResetTokenEntity>("tb_reset_tokens").delete().where({
      reset_token_user_id,
    });
  }

  async findById(
    reset_token_id: string,
  ): Promise<ResetTokenEntity | undefined> {
    const resetToken = await dbConnection<ResetTokenEntity>("tb_reset_tokens")
      .select("*")
      .where({
        reset_token_id,
      })
      .first();

    return resetToken;
  }

  async deleteExpiredTokens(): Promise<void> {
    await dbConnection<ResetTokenEntity>("tb_reset_tokens")
      .delete()
      .where("reset_token_expires_in", "<", new Date());
  }
}

export { ResetTokenRepository };
