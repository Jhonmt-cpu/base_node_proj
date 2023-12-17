import { Router } from "express";
import { Joi, Segments, celebrate } from "celebrate";
import { CreateRoleController } from "../../../useCases/CreateRole/CreateRoleController";

const userRouter = Router();

const createRoleController = new CreateRoleController();

userRouter.post("/role", celebrate({
  [Segments.BODY]: {
    role_name: Joi.string().required(),
  }
}) ,createRoleController.handle);

export { userRouter };