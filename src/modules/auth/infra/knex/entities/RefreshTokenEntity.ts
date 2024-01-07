class RefreshTokenEntity {
  refresh_token_id: string;

  refresh_token_user_id: number;

  refresh_token_expires_in: Date;

  constructor({
    refresh_token_id,
    refresh_token_user_id,
    refresh_token_expires_in,
  }: RefreshTokenEntity) {
    this.refresh_token_id = refresh_token_id;
    this.refresh_token_user_id = refresh_token_user_id;
    this.refresh_token_expires_in = refresh_token_expires_in;
  }
}

export { RefreshTokenEntity };
