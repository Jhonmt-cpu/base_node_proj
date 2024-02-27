import { ResetTokenEntity } from "../infra/knex/entities/ResetTokenEntity";

type ICreateResetTokenRepositoryDTO = {
  reset_token_user_id: number;
  reset_token_expires_in: Date;
};

type IResetTokenRepository = {
  create(data: ICreateResetTokenRepositoryDTO): Promise<ResetTokenEntity>;
  deleteById(reset_token_id: string): Promise<number>;
  deleteAllByUserId(reset_token_user_id: number): Promise<void>;
  findById(reset_token_id: string): Promise<ResetTokenEntity | undefined>;
  deleteExpiredTokens(): Promise<void>;
};

export { IResetTokenRepository, ICreateResetTokenRepositoryDTO };
