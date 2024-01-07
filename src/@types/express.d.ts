declare namespace Express {
  export interface Request {
    user: {
      user_id: number;
      user_name: string;
      user_role: string;
    };
  }
}
