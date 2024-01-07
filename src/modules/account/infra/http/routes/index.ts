import { Router } from "express";
import { Joi, Segments, celebrate } from "celebrate";

import { rolesGroups } from "@config/roles";

import { CreateRoleController } from "@modules/account/useCases/CreateRole/CreateRoleController";
import { ListAllRolesPaginatedController } from "@modules/account/useCases/ListAllRolesPaginated/ListAllRolesPaginatedController";
import { ListAllGendersController } from "@modules/account/useCases/ListAllGenders/ListAllGendersController";
import { ListAllGendersPaginatedController } from "@modules/account/useCases/ListAllGendersPaginated/ListAllGendersPaginatedController";
import { ListAllStatesController } from "@modules/account/useCases/ListAllStates/ListAllStatesController";
import { ListCitiesByStateController } from "@modules/account/useCases/ListCitiesByState/ListCitiesByStateController";
import { ListNeighborhoodsByCityController } from "@modules/account/useCases/ListNeighborhoodsByCity/ListNeighborhoodsByCityController";
import { CreateUserController } from "@modules/account/useCases/CreateUser/CreateUserController";
import { GetUserController } from "@modules/account/useCases/GetUser/GetUserController";
import { GetUserAddressController } from "@modules/account/useCases/GetUserAddress/GetUserAddressController";
import { GetUserCompleteController } from "@modules/account/useCases/GetUserComplete/GetUserCompleteController";
import { CreateStateController } from "@modules/account/useCases/CreateState/CreateStateController";
import { CreateCityController } from "@modules/account/useCases/CreateCity/CreateCityController";
import { CreateGenderController } from "@modules/account/useCases/CreateGender/CreateGenderController";
import { CreateNeighborhoodController } from "@modules/account/useCases/CreateNeighborhood/CreateNeighborhoodController";
import { GetUserPhoneController } from "@modules/account/useCases/GetUserPhone/GetUserPhoneController";
import { ListAllUsersPaginatedController } from "@modules/account/useCases/ListAllUsersPaginated/ListAllUsersPaginatedController";
import { DeleteUserController } from "@modules/account/useCases/DeleteUser/DeleteUserController";
import { UpdateUserController } from "@modules/account/useCases/UpdateUser/UpdateUserController";
import { GetUserMeController } from "@modules/account/useCases/GetUser/GetUserMeController";
import { GetUserAddressMeController } from "@modules/account/useCases/GetUserAddress/GetUserAddressMeController";
import { GetUserPhoneMeController } from "@modules/account/useCases/GetUserPhone/GetUserPhoneMeController";
import { GetUserCompleteMeController } from "@modules/account/useCases/GetUserComplete/GetUserCompleteMeController";
import { UpdateUserMeController } from "@modules/account/useCases/UpdateUser/UpdateUserMeController";
import { DeleteUserMeController } from "@modules/account/useCases/DeleteUser/DeleteUserMeController";

import { EnsureAuthenticated } from "@shared/infra/http/middlewares/EnsureAuthenticated";
import { checkRole } from "@shared/infra/http/middlewares/checkRole";

import { validateCPF } from "@utils/validateCpf";

const accountRouter = Router();

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
const getUserMeController = new GetUserMeController();
const getUserAddressController = new GetUserAddressController();
const getUserAddressMeController = new GetUserAddressMeController();
const getUserPhoneController = new GetUserPhoneController();
const getUserPhoneMeController = new GetUserPhoneMeController();
const getUserCompleteController = new GetUserCompleteController();
const getUserCompleteMeController = new GetUserCompleteMeController();
const listAllUsersPaginatedController = new ListAllUsersPaginatedController();
const updateUserController = new UpdateUserController();
const updateUserMeController = new UpdateUserMeController();
const deleteUserController = new DeleteUserController();
const deleteUserMeController = new DeleteUserMeController();

const ensureAuthenticated = new EnsureAuthenticated();

accountRouter.post(
  "/role",
  ensureAuthenticated.execute,
  checkRole(rolesGroups.admin),
  celebrate({
    [Segments.BODY]: {
      role_name: Joi.string().trim().min(3).max(30).required(),
    },
  }),
  createRoleController.handle,
);

accountRouter.get(
  "/role",
  ensureAuthenticated.execute,
  checkRole(rolesGroups.admin),
  celebrate({
    [Segments.QUERY]: {
      page: Joi.number().integer().min(1).required(),
      limit: Joi.number().integer().min(1).max(20).required(),
    },
  }),
  listAllRolesPaginatedController.handle,
);

accountRouter.post(
  "/gender",
  ensureAuthenticated.execute,
  checkRole(rolesGroups.admin),
  celebrate({
    [Segments.BODY]: {
      gender_name: Joi.string().trim().min(3).max(30).required(),
    },
  }),
  createGenderController.handle,
);

accountRouter.get("/gender/all", listAllGendersController.handle);

accountRouter.get(
  "/gender",
  ensureAuthenticated.execute,
  checkRole(rolesGroups.admin),
  celebrate({
    [Segments.QUERY]: {
      page: Joi.number().integer().min(1).required(),
      limit: Joi.number().integer().min(1).max(20).required(),
    },
  }),
  listAllGendersPaginatedController.handle,
);

accountRouter.post(
  "/state",
  ensureAuthenticated.execute,
  checkRole(rolesGroups.admin),
  celebrate({
    [Segments.BODY]: {
      state_name: Joi.string().trim().min(3).max(30).required(),
      state_uf: Joi.string().trim().min(2).max(2).required(),
    },
  }),
  createStateController.handle,
);

accountRouter.get("/state/all", listAllStatesController.handle);

accountRouter.get(
  "/state/:state_id/city",
  celebrate({
    [Segments.PARAMS]: {
      state_id: Joi.number().integer().min(1).required(),
    },
  }),
  listCitiesByStateController.handle,
);

accountRouter.post(
  "/city",
  ensureAuthenticated.execute,
  checkRole(rolesGroups.admin),
  celebrate({
    [Segments.BODY]: {
      city_name: Joi.string().trim().min(3).max(60).required(),
      city_state_id: Joi.number().integer().min(1).required(),
    },
  }),
  createCityController.handle,
);

accountRouter.get(
  "/city/:city_id/neighborhood",
  celebrate({
    [Segments.PARAMS]: {
      city_id: Joi.number().integer().min(1).required(),
    },
  }),
  listNeighborhoodsByCityController.handle,
);

accountRouter.post(
  "/neighborhood",
  ensureAuthenticated.execute,
  checkRole(rolesGroups.admin),
  celebrate({
    [Segments.BODY]: {
      neighborhood_name: Joi.string().trim().min(3).max(60).required(),
      neighborhood_city_id: Joi.number().integer().min(1).required(),
    },
  }),
  createNeighborhoodController.handle,
);

accountRouter.post(
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

accountRouter.get(
  "/user",
  ensureAuthenticated.execute,
  checkRole(rolesGroups.admin),
  celebrate({
    [Segments.QUERY]: {
      page: Joi.number().integer().min(1).required(),
      limit: Joi.number().integer().min(1).max(20).required(),
    },
  }),
  listAllUsersPaginatedController.handle,
);

accountRouter.get(
  "/user/me",
  ensureAuthenticated.execute,
  getUserMeController.handle,
);

accountRouter.get(
  "/user/:user_id",
  ensureAuthenticated.execute,
  checkRole(rolesGroups.admin),
  celebrate({
    [Segments.PARAMS]: {
      user_id: Joi.number().integer().min(1).required(),
    },
  }),
  getUserController.handle,
);

accountRouter.get(
  "/user/me/address",
  ensureAuthenticated.execute,
  getUserAddressMeController.handle,
);

accountRouter.get(
  "/user/:user_id/address",
  ensureAuthenticated.execute,
  checkRole(rolesGroups.admin),
  celebrate({
    [Segments.PARAMS]: {
      user_id: Joi.number().integer().min(1).required(),
    },
  }),
  getUserAddressController.handle,
);

accountRouter.get(
  "/user/me/phone",
  ensureAuthenticated.execute,
  getUserPhoneMeController.handle,
);

accountRouter.get(
  "/user/:user_id/phone",
  ensureAuthenticated.execute,
  checkRole(rolesGroups.admin),
  celebrate({
    [Segments.PARAMS]: {
      user_id: Joi.number().integer().min(1).required(),
    },
  }),
  getUserPhoneController.handle,
);

accountRouter.get(
  "/user/me/complete",
  ensureAuthenticated.execute,
  getUserCompleteMeController.handle,
);

accountRouter.get(
  "/user/:user_id/complete",
  ensureAuthenticated.execute,
  checkRole(rolesGroups.admin),
  celebrate({
    [Segments.PARAMS]: {
      user_id: Joi.number().integer().min(1).required(),
    },
  }),
  getUserCompleteController.handle,
);

accountRouter.patch(
  "/user/me",
  ensureAuthenticated.execute,
  celebrate({
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
  updateUserMeController.handle,
);

accountRouter.patch(
  "/user/:user_id",
  ensureAuthenticated.execute,
  checkRole(rolesGroups.admin),
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

accountRouter.delete(
  "/user/me",
  ensureAuthenticated.execute,
  deleteUserMeController.handle,
);

accountRouter.delete(
  "/user/:user_id",
  ensureAuthenticated.execute,
  checkRole(rolesGroups.admin),
  celebrate({
    [Segments.PARAMS]: {
      user_id: Joi.number().integer().min(1).required(),
    },
  }),
  deleteUserController.handle,
);

export { accountRouter };
