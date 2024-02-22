import { UserEntity } from "../infra/knex/entities/UserEntity";
import { IFlatUserCompleteResponseRepositoryDTO } from "../repositories/IUserRepository";

type IUserWithoutPassword = Omit<UserEntity, "user_password">;

function flatUserCompleteToUserWithoutPassword(
  flatUserComplete: IFlatUserCompleteResponseRepositoryDTO,
): IUserWithoutPassword {
  const user = {
    user_id: flatUserComplete.user_id,
    user_name: flatUserComplete.user_name,
    user_email: flatUserComplete.user_email,
    user_cpf: flatUserComplete.user_cpf,
    user_role_id: flatUserComplete.user_role_id,
    user_birth_date: flatUserComplete.user_birth_date,
    user_gender_id: flatUserComplete.user_gender_id,
    user_phone: {
      user_phone_id: flatUserComplete.user_phone_id,
      phone_ddd: flatUserComplete.phone_ddd,
      phone_number: flatUserComplete.phone_number,
      phone_updated_at: flatUserComplete.phone_updated_at,
    },
    user_gender: {
      gender_id: flatUserComplete.gender_id,
      gender_name: flatUserComplete.gender_name,
      gender_created_at: flatUserComplete.gender_created_at,
    },
    user_role: {
      role_id: flatUserComplete.role_id,
      role_name: flatUserComplete.role_name,
      role_created_at: flatUserComplete.role_created_at,
    },
    user_address: {
      user_address_id: flatUserComplete.user_address_id,
      address_street: flatUserComplete.address_street,
      address_number: flatUserComplete.address_number,
      address_complement: flatUserComplete.address_complement,
      address_zip_code: flatUserComplete.address_zip_code,
      address_neighborhood_id: flatUserComplete.address_neighborhood_id,
      address_neighborhood: {
        neighborhood_id: flatUserComplete.neighborhood_id,
        neighborhood_name: flatUserComplete.neighborhood_name,
        neighborhood_city_id: flatUserComplete.neighborhood_city_id,
        neighborhood_city: {
          city_id: flatUserComplete.city_id,
          city_name: flatUserComplete.city_name,
          city_state_id: flatUserComplete.city_state_id,
          city_state: {
            state_id: flatUserComplete.state_id,
            state_name: flatUserComplete.state_name,
            state_uf: flatUserComplete.state_uf,
            state_created_at: flatUserComplete.state_created_at,
          },
          city_created_at: flatUserComplete.city_created_at,
        },
        neighborhood_created_at: flatUserComplete.neighborhood_created_at,
      },
      address_updated_at: flatUserComplete.address_updated_at,
    },
    user_created_at: flatUserComplete.user_created_at,
    user_updated_at: flatUserComplete.user_updated_at,
  };

  return user;
}

export { flatUserCompleteToUserWithoutPassword };
