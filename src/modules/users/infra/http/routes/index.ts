import { Router } from "express";
import { Joi, Segments, celebrate } from "celebrate";

import { CreateRoleController } from "@modules/users/useCases/CreateRole/CreateRoleController";
import { ListAllRolesPaginatedController } from "@modules/users/useCases/ListAllRolesPaginated/ListAllRolesPaginatedController";
import { ListAllGendersPaginatedController } from "@modules/users/useCases/ListAllGendersPaginated/ListAllGendersPaginatedController";
import { ListAllStatesController } from "@modules/users/useCases/ListAllStates/ListAllStatesController";

const userRouter = Router();

const createRoleController = new CreateRoleController();
const listAllRolesPaginatedController = new ListAllRolesPaginatedController();
const listAllGendersPaginatedController =
  new ListAllGendersPaginatedController();
const listAllStatesController = new ListAllStatesController();

userRouter.post(
  "/role",
  celebrate({
    [Segments.BODY]: {
      role_name: Joi.string().required(),
    },
  }),
  createRoleController.handle,
);

userRouter.get(
  "/role",
  celebrate({
    [Segments.QUERY]: {
      page: Joi.number().integer().min(1).required(),
      limit: Joi.number().integer().min(1).max(20).required(),
    },
  }),
  listAllRolesPaginatedController.handle,
);

userRouter.get(
  "/gender",
  celebrate({
    [Segments.QUERY]: {
      page: Joi.number().integer().min(1).required(),
      limit: Joi.number().integer().min(1).max(20).required(),
    },
  }),
  listAllGendersPaginatedController.handle,
);

userRouter.get("/state", listAllStatesController.handle);

export { userRouter };
