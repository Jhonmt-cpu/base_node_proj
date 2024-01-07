type IGenerateToken = {
  user_id: number;
  user_name: string;
  user_role: string;
};

interface IGenerateTokenProvider {
  generateToken(data: IGenerateToken): Promise<string>;
}

export { IGenerateTokenProvider, IGenerateToken };
