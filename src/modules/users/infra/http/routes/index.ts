import { Router } from "express";
import { Joi, Segments, celebrate } from "celebrate";

import { CreateRoleController } from "@modules/users/useCases/CreateRole/CreateRoleController";
import { ListAllRolesPaginatedController } from "@modules/users/useCases/ListAllRolesPaginated/ListAllRolesPaginatedController";
import { ListAllGendersController } from "@modules/users/useCases/ListAllGenders/ListAllGendersController";
import { ListAllGendersPaginatedController } from "@modules/users/useCases/ListAllGendersPaginated/ListAllGendersPaginatedController";
import { ListAllStatesController } from "@modules/users/useCases/ListAllStates/ListAllStatesController";
import { ListCitiesByStateController } from "@modules/users/useCases/ListCitiesByState/ListCitiesByStateController";
import { ListNeighborhoodsByCityController } from "@modules/users/useCases/ListNeighborhoodsByCity/ListNeighborhoodsByCityController";
import { CreateUserController } from "@modules/users/useCases/CreateUser/CreateUserController";
import { validateCPF } from "@utils/validateCpf";
import { GetUserController } from "@modules/users/useCases/GetUser/GetUserController";
import { GetUserAddressController } from "@modules/users/useCases/GetUserAddress/GetUserAddressController";
import { GetUserCompleteController } from "@modules/users/useCases/GetUserComplete/GetUserCompleteController";

const userRouter = Router();

const createRoleController = new CreateRoleController();
const listAllRolesPaginatedController = new ListAllRolesPaginatedController();
const listAllGendersPaginatedController =
  new ListAllGendersPaginatedController();
const listAllGendersController = new ListAllGendersController();
const listAllStatesController = new ListAllStatesController();
const listCitiesByStateController = new ListCitiesByStateController();
const listNeighborhoodsByCityController =
  new ListNeighborhoodsByCityController();
const createUserController = new CreateUserController();
const getUserController = new GetUserController();
const getUserAddressController = new GetUserAddressController();
const getUserCompleteController = new GetUserCompleteController();

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

userRouter.get("/gender/all", listAllGendersController.handle);

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

userRouter.get("/state/all", listAllStatesController.handle);

userRouter.get(
  "/state/:state_id/city",
  celebrate({
    [Segments.PARAMS]: {
      state_id: Joi.number().integer().min(1).required(),
    },
  }),
  listCitiesByStateController.handle,
);

userRouter.get(
  "/city/:city_id/neighborhood",
  celebrate({
    [Segments.PARAMS]: {
      city_id: Joi.number().integer().min(1).required(),
    },
  }),
  listNeighborhoodsByCityController.handle,
);

userRouter.post(
  "/user",
  celebrate({
    [Segments.BODY]: {
      user_name: Joi.string().required(),
      user_email: Joi.string().email().required(),
      user_password: Joi.string().min(8).max(30).required(),
      user_cpf: Joi.string()
        .min(11)
        .max(11)
        .custom((value, helpers) => {
          if (!validateCPF(value)) {
            return helpers.message({ custom: "Invalid CPF" });
          }
          return value;
        })
        .required(),
      user_gender_id: Joi.number().integer().min(1).required(),
      phone: Joi.string()
        .regex(new RegExp("^[0-9]{11}$"))
        .message("Invalid phone number, must be 11 digits")
        .required(),
      address: Joi.object({
        address_street: Joi.string().max(70).required(),
        address_number: Joi.number().integer().min(1).required(),
        address_complement: Joi.string().max(30).optional(),
        address_neighborhood_id: Joi.number().integer().min(1).required(),
        address_zip_code: Joi.string()
          .regex(new RegExp("^[0-9]{8}$"))
          .message("Invalid zip code, must be 8 digits")
          .required(),
      }).required(),
    },
  }),
  createUserController.handle,
);

userRouter.get(
  "/user/:user_id",
  celebrate({
    [Segments.PARAMS]: {
      user_id: Joi.number().integer().min(1).required(),
    },
  }),
  getUserController.handle,
);

userRouter.get(
  "/user/:user_id/address",
  celebrate({
    [Segments.PARAMS]: {
      user_id: Joi.number().integer().min(1).required(),
    },
  }),
  getUserAddressController.handle,
);

userRouter.get(
  "/user/:user_id/complete",
  celebrate({
    [Segments.PARAMS]: {
      user_id: Joi.number().integer().min(1).required(),
    },
  }),
  getUserCompleteController.handle,
);

export { userRouter };
