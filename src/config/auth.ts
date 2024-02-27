import { v4 as uuid } from "uuid";

export default {
  jwt: {
    expiresIn: process.env.JWT_EXPIRES_IN || "15m",
    jwtSecret: uuid(),
  },
  refresh: {
    expiresInDays: process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS || "30",
  },
  forgotPassword: {
    expiresInMinutes: process.env.FORGOT_PASSWORD_EXPIRES_IN_MINUTES || "20",
    callbackUrl:
      process.env.FORGOT_PASSWORD_CALLBACK_URL ||
      "http://localhost:3000/reset-password?token=",
  },
  aes: {
    secretKey: uuid(),
    iv: uuid(),
    method: "aes-256-cbc",
  },
};
