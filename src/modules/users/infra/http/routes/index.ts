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
import { GetUserController } from "@modules/users/useCases/GetUser/GetUserController";
import { GetUserAddressController } from "@modules/users/useCases/GetUserAddress/GetUserAddressController";
import { GetUserCompleteController } from "@modules/users/useCases/GetUserComplete/GetUserCompleteController";
import { CreateStateController } from "@modules/users/useCases/CreateState/CreateStateController";
import { CreateCityController } from "@modules/users/useCases/CreateCity/CreateCityController";
import { CreateGenderController } from "@modules/users/useCases/CreateGender/CreateGenderController";
import { CreateNeighborhoodController } from "@modules/users/useCases/CreateNeighborhood/CreateNeighborhoodController";
import { GetUserPhoneController } from "@modules/users/useCases/GetUserPhone/GetUserPhoneController";
import { ListAllUsersPaginatedController } from "@modules/users/useCases/ListAllUsersPaginated/ListAllUsersPaginatedController";
import { DeleteUserController } from "@modules/users/useCases/DeleteUser/DeleteUserController";
import { UpdateUserController } from "@modules/users/useCases/UpdateUser/UpdateUserController";

import { validateCPF } from "@utils/validateCpf";

const userRouter = Router();

const createRoleController = new CreateRoleController();
const listAllRolesPaginatedController = new ListAllRolesPaginatedController();
const createGenderController = new CreateGenderController();
const listAllGendersPaginatedController =
  new ListAllGendersPaginatedController();
const listAllGendersController = new ListAllGendersController();
const createStateController = new CreateStateController();
const listAllStatesController = new ListAllStatesController();
const listCitiesByStateController = new ListCitiesByStateController();
const createCityController = new CreateCityController();
const listNeighborhoodsByCityController =
  new ListNeighborhoodsByCityController();
const createNeighborhoodController = new CreateNeighborhoodController();
const createUserController = new CreateUserController();
const getUserController = new GetUserController();
const getUserAddressController = new GetUserAddressController();
const getUserPhoneController = new GetUserPhoneController();
const getUserCompleteController = new GetUserCompleteController();
const listAllUsersPaginatedController = new ListAllUsersPaginatedController();
const updateUserController = new UpdateUserController();
const deleteUserController = new DeleteUserController();

userRouter.post(
  "/role",
  celebrate({
    [Segments.BODY]: {
      role_name: Joi.string().trim().min(3).max(30).required(),
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

userRouter.post(
  "/gender",
  celebrate({
    [Segments.BODY]: {
      gender_name: Joi.string().trim().min(3).max(30).required(),
    },
  }),
  createGenderController.handle,
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

userRouter.post(
  "/state",
  celebrate({
    [Segments.BODY]: {
      state_name: Joi.string().trim().min(3).max(30).required(),
      state_uf: Joi.string().trim().min(2).max(2).required(),
    },
  }),
  createStateController.handle,
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

userRouter.post(
  "/city",
  celebrate({
    [Segments.BODY]: {
      city_name: Joi.string().trim().min(3).max(60).required(),
      city_state_id: Joi.number().integer().min(1).required(),
    },
  }),
  createCityController.handle,
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
  "/neighborhood",
  celebrate({
    [Segments.BODY]: {
      neighborhood_name: Joi.string().trim().min(3).max(60).required(),
      neighborhood_city_id: Joi.number().integer().min(1).required(),
    },
  }),
  createNeighborhoodController.handle,
);

userRouter.post(
  "/user",
  celebrate({
    [Segments.BODY]: {
      user_name: Joi.string().trim().min(3).max(250).required(),
      user_email: Joi.string().trim().email().required(),
      user_password: Joi.string().min(8).max(50).required(),
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
      user_birth_date: Joi.date().required(),
      user_phone: Joi.string()
        .regex(new RegExp("^[0-9]{11}$"))
        .message("Invalid phone number, must be 11 digits")
        .required(),
      user_address: Joi.object({
        address_street: Joi.string().trim().min(3).max(70).required(),
        address_number: Joi.number().integer().min(1).required(),
        address_complement: Joi.string().trim().min(3).max(30).optional(),
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
  "/user",
  celebrate({
    [Segments.QUERY]: {
      page: Joi.number().integer().min(1).required(),
      limit: Joi.number().integer().min(1).max(20).required(),
    },
  }),
  listAllUsersPaginatedController.handle,
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
  "/user/:user_id/phone",
  celebrate({
    [Segments.PARAMS]: {
      user_id: Joi.number().integer().min(1).required(),
    },
  }),
  getUserPhoneController.handle,
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

userRouter.patch(
  "/user/:user_id",
  celebrate({
    [Segments.PARAMS]: {
      user_id: Joi.number().integer().min(1).required(),
    },
    [Segments.BODY]: {
      user_name: Joi.string().trim().min(3).max(250).optional(),
      user_email: Joi.string().trim().email().optional(),
      user_password: Joi.string().min(8).max(50).required(),
      user_new_password: Joi.string().min(8).max(50).optional(),
      user_gender_id: Joi.number().integer().min(1).optional(),
      user_phone: Joi.string()
        .regex(new RegExp("^[0-9]{11}$"))
        .message("Invalid phone number, must be 11 digits")
        .optional(),
      user_address: Joi.object({
        address_street: Joi.string().trim().min(3).max(70).optional(),
        address_number: Joi.number().integer().min(1).optional(),
        address_complement: Joi.string().trim().min(3).max(30).optional(),
        address_neighborhood_id: Joi.number().integer().min(1).optional(),
        address_zip_code: Joi.string()
          .regex(new RegExp("^[0-9]{8}$"))
          .message("Invalid zip code, must be 8 digits")
          .optional(),
      }).optional(),
    },
  }),
  updateUserController.handle,
);

userRouter.delete(
  "/user/:user_id",
  celebrate({
    [Segments.PARAMS]: {
      user_id: Joi.number().integer().min(1).required(),
    },
  }),
  deleteUserController.handle,
);

export { userRouter };
