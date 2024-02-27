import { Joi, Segments, celebrate } from "celebrate";
import { Router } from "express";

import { LoginController } from "@modules/auth/useCases/Login/LoginController";
import { RefreshTokenController } from "@modules/auth/useCases/RefreshToken/RefreshTokenController";
import { ForgotPasswordController } from "@modules/auth/useCases/ForgotPassword/ForgotPasswordController";
import { ResetPasswordController } from "@modules/auth/useCases/ResetPassword/ResetPasswordController";

const loginController = new LoginController();
const refreshTokenController = new RefreshTokenController();
const forgotPasswordController = new ForgotPasswordController();
const resetPasswordController = new ResetPasswordController();

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

authRouter.post(
  "/forgot",
  celebrate({
    [Segments.BODY]: {
      user_email: Joi.string().email().required(),
    },
  }),
  forgotPasswordController.handle,
);

authRouter.post(
  "/reset",
  celebrate({
    [Segments.BODY]: {
      reset_token: Joi.string().uuid().required(),
      new_password: Joi.string().required(),
    },
  }),
  resetPasswordController.handle,
);

export { authRouter };
