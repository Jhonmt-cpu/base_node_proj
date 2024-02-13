import { Joi, Segments, celebrate } from "celebrate";
import { Router } from "express";

import { LoginController } from "@modules/auth/useCases/Login/LoginController";
import { RefreshTokenController } from "@modules/auth/useCases/RefreshToken/RefreshTokenController";

const loginController = new LoginController();
const refreshTokenController = new RefreshTokenController();

const authRouter = Router();

authRouter.post(
  "/login",
  celebrate({
    [Segments.BODY]: {
      user_email: Joi.string().email().required(),
      user_password: Joi.string().required(),
    },
  }),
  loginController.handle,
);

authRouter.post(
  "/refresh",
  celebrate({
    [Segments.BODY]: {
      refresh_token: Joi.string().uuid().required(),
    },
  }),
  refreshTokenController.handle,
);

export { authRouter };
