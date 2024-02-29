import { Joi, Segments, celebrate } from "celebrate";
import { Router } from "express";

import { EnsureAuthenticated } from "@shared/infra/http/middlewares/EnsureAuthenticated";

import { LoginController } from "@modules/auth/useCases/Login/LoginController";
import { RefreshTokenController } from "@modules/auth/useCases/RefreshToken/RefreshTokenController";
import { ForgotPasswordController } from "@modules/auth/useCases/ForgotPassword/ForgotPasswordController";
import { ResetPasswordController } from "@modules/auth/useCases/ResetPassword/ResetPasswordController";
import { LogoutMeController } from "@modules/auth/useCases/Logout/LogoutMeController";
import { LogoutController } from "@modules/auth/useCases/Logout/LogoutController";
import { checkRole } from "@shared/infra/http/middlewares/checkRole";
import { rolesGroups } from "@config/roles";

const loginController = new LoginController();
const refreshTokenController = new RefreshTokenController();
const forgotPasswordController = new ForgotPasswordController();
const resetPasswordController = new ResetPasswordController();
const logoutMeController = new LogoutMeController();
const logoutController = new LogoutController();

const ensureAuthenticated = new EnsureAuthenticated();

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

authRouter.post(
  "/logout/me",
  ensureAuthenticated.execute,
  logoutMeController.handle,
);

authRouter.post(
  "/logout",
  ensureAuthenticated.execute,
  checkRole(rolesGroups.admin),
  celebrate({
    [Segments.BODY]: {
      user_id: Joi.number().required(),
    },
  }),
  logoutController.handle,
);

export { authRouter };
