import { GenderRepositoryInMemory } from "@modules/users/repositories/inMemory/GenderRepositoryInMemory";
import { NeighborHoodRepositoryInMemory } from "@modules/users/repositories/inMemory/NeighborhoodRepositoryInMemory";
import { AddressRepositoryInMemory } from "@modules/users/repositories/inMemory/AddressRepositoryInMemory";
import { PhoneRepositoryInMemory } from "@modules/users/repositories/inMemory/PhoneRepositoryInMemory";
import { UserRepositoryInMemory } from "@modules/users/repositories/inMemory/UserRepositoryInMemory";

import { CreateUserUseCase } from "./CreateUserUseCase";
import { AppError } from "@shared/errors/AppError";

let genderRepository: GenderRepositoryInMemory;

let neighborhoodRepository: NeighborHoodRepositoryInMemory;

let addressRepository: AddressRepositoryInMemory;

let phoneRepository: PhoneRepositoryInMemory;

let userRepository: UserRepositoryInMemory;

let createUserUseCase: CreateUserUseCase;

describe("Create User", () => {
  beforeEach(() => {
    genderRepository = new GenderRepositoryInMemory();
    neighborhoodRepository = new NeighborHoodRepositoryInMemory();
    addressRepository = new AddressRepositoryInMemory();
    phoneRepository = new PhoneRepositoryInMemory();
    userRepository = new UserRepositoryInMemory();

    createUserUseCase = new CreateUserUseCase(
      genderRepository,
      neighborhoodRepository,
      addressRepository,
      phoneRepository,
      userRepository,
    );
  });

  it("should be able to create a new user", async () => {
    const gender = await genderRepository.create({
      gender_name: "gender_test",
    });

    const neighborhood = await neighborhoodRepository.create({
      neighborhood_name: "neighborhood_test",
      neighborhood_city_id: 1,
    });

    const userData = {
      user_name: "user_test",
      user_email: "usertest@test.com",
      user_cpf: 12345678910,
      user_password: "123456",
      user_gender_id: gender.gender_id,
      phone: {
        phone_ddd: 34,
        phone_number: 123456789,
      },
      address: {
        address_street: "street_test",
        address_number: 123,
        address_complement: "complement_test",
        address_neighborhood_id: neighborhood.neighborhood_id,
        address_zip_code: 12345678,
      },
    };

    const spyPhoneCreate = jest.spyOn(phoneRepository, "create");

    const spyAddressCreate = jest.spyOn(addressRepository, "create");

    const user = await createUserUseCase.execute(userData);

    expect(user).toHaveProperty("user_id");
    expect(spyPhoneCreate).toHaveBeenCalledWith({
      user_phone_id: user.user_id,
      phone_ddd: userData.phone.phone_ddd,
      phone_number: userData.phone.phone_number,
    });
    expect(spyAddressCreate).toHaveBeenCalledWith({
      user_address_id: user.user_id,
      address_street: userData.address.address_street,
      address_number: userData.address.address_number,
      address_complement: userData.address.address_complement,
      address_neighborhood_id: userData.address.address_neighborhood_id,
      address_zip_code: userData.address.address_zip_code,
    });
  });

  it("should not create a user with invalid gender", async () => {
    await expect(
      createUserUseCase.execute({
        user_name: "user_test",
        user_email: "usertest@test.com",
        user_cpf: 12345678910,
        user_password: "123456",
        user_gender_id: 0,
        phone: {
          phone_ddd: 34,
          phone_number: 123456789,
        },
        address: {
          address_street: "street_test",
          address_number: 123,
          address_complement: "complement_test",
          address_neighborhood_id: 0,
          address_zip_code: 12345678,
        },
      }),
    ).rejects.toEqual(new AppError("Invalid Gender", 404));
  });

  it("should not create a user with invalid neighborhood", async () => {
    const gender = await genderRepository.create({
      gender_name: "gender_test",
    });

    await expect(
      createUserUseCase.execute({
        user_name: "user_test",
        user_email: "usertest@test.com",
        user_cpf: 12345678910,
        user_password: "123456",
        user_gender_id: gender.gender_id,
        phone: {
          phone_ddd: 34,
          phone_number: 123456789,
        },
        address: {
          address_street: "street_test",
          address_number: 123,
          address_complement: "complement_test",
          address_neighborhood_id: 0,
          address_zip_code: 12345678,
        },
      }),
    ).rejects.toEqual(new AppError("Invalid Neighborhood", 404));
  });

  it("should not create a user with same phone number", async () => {
    const gender = await genderRepository.create({
      gender_name: "gender_test",
    });

    const neighborhood = await neighborhoodRepository.create({
      neighborhood_name: "neighborhood_test",
      neighborhood_city_id: 1,
    });

    const user = await userRepository.create({
      user_name: "user_test",
      user_email: "usertest@test.com",
      user_cpf: 12345678910,
      user_password: "123456",
      user_gender_id: gender.gender_id,
    });

    await phoneRepository.create({
      user_phone_id: user.user_id,
      phone_ddd: 34,
      phone_number: 123456789,
    });

    await expect(
      createUserUseCase.execute({
        user_name: "user_test",
        user_email: "usertest@test.com",
        user_cpf: 12345678910,
        user_password: "123456",
        user_gender_id: gender.gender_id,
        phone: {
          phone_ddd: 34,
          phone_number: 123456789,
        },
        address: {
          address_street: "street_test",
          address_number: 123,
          address_complement: "complement_test",
          address_neighborhood_id: neighborhood.neighborhood_id,
          address_zip_code: 12345678,
        },
      }),
    ).rejects.toEqual(new AppError("Phone already exists", 400));
  });

  it("should not create a user with same email or cpf", async () => {
    const gender = await genderRepository.create({
      gender_name: "gender_test",
    });

    const neighborhood = await neighborhoodRepository.create({
      neighborhood_name: "neighborhood_test",
      neighborhood_city_id: 1,
    });

    const user = await userRepository.create({
      user_name: "user_test",
      user_email: "usertest@test.com",
      user_cpf: 12345678910,
      user_password: "123456",
      user_gender_id: gender.gender_id,
    });

    await expect(
      createUserUseCase.execute({
        user_name: "user_test",
        user_email: user.user_email,
        user_cpf: 10987654321,
        user_password: "123456",
        user_gender_id: gender.gender_id,
        phone: {
          phone_ddd: 34,
          phone_number: 123456789,
        },
        address: {
          address_street: "street_test",
          address_number: 123,
          address_complement: "complement_test",
          address_neighborhood_id: neighborhood.neighborhood_id,
          address_zip_code: 12345678,
        },
      }),
    ).rejects.toEqual(new AppError("User already exists", 400));

    await expect(
      createUserUseCase.execute({
        user_name: "user_test",
        user_email: "usertest2@test.com",
        user_cpf: user.user_cpf,
        user_password: "123456",
        user_gender_id: gender.gender_id,
        phone: {
          phone_ddd: 34,
          phone_number: 123456789,
        },
        address: {
          address_street: "street_test",
          address_number: 123,
          address_complement: "complement_test",
          address_neighborhood_id: neighborhood.neighborhood_id,
          address_zip_code: 12345678,
        },
      }),
    ).rejects.toEqual(new AppError("User already exists", 400));

    await expect(
      createUserUseCase.execute({
        user_name: "user_test",
        user_email: user.user_email,
        user_cpf: user.user_cpf,
        user_password: "123456",
        user_gender_id: gender.gender_id,
        phone: {
          phone_ddd: 34,
          phone_number: 123456789,
        },
        address: {
          address_street: "street_test",
          address_number: 123,
          address_complement: "complement_test",
          address_neighborhood_id: neighborhood.neighborhood_id,
          address_zip_code: 12345678,
        },
      }),
    ).rejects.toEqual(new AppError("User already exists", 400));
  });
});
