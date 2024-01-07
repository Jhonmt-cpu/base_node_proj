import { Joi, Segments, celebrate } from "celebrate";
import { Router } from "express";

import { LoginController } from "@modules/auth/useCases/Login/LoginController";
import { RefreshTokenController } from "@modules/auth/useCases/RefreshToken/RefreshTokenController";
import { SynchronizeCacheController } from "@modules/auth/useCases/SynchronizeCache/SynchronizeCacheController";

import { EnsureAuthenticated } from "@shared/infra/http/middlewares/EnsureAuthenticated";
import { checkRole } from "@shared/infra/http/middlewares/checkRole";
import { rolesGroups } from "@config/roles";

const loginController = new LoginController();
const refreshTokenController = new RefreshTokenController();
const synchronizeCacheController = new SynchronizeCacheController();

const authRouter = Router();

const ensureAuthenticated = new EnsureAuthenticated();

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
  "/synchronize_cache",
  ensureAuthenticated.execute,
  checkRole(rolesGroups.admin),
  synchronizeCacheController.handle,
);

export { authRouter };
