class ResetTokenEntity {
  reset_token_id: string;

  reset_token_user_id: number;

  reset_token_expires_in: Date;

  constructor({
    reset_token_id,
    reset_token_user_id,
    reset_token_expires_in,
  }: ResetTokenEntity) {
    this.reset_token_id = reset_token_id;
    this.reset_token_user_id = reset_token_user_id;
    this.reset_token_expires_in = reset_token_expires_in;
  }
}

export { ResetTokenEntity };
