import { cachePrefixes } from "@config/cache";

import { GenderRepositoryInMemory } from "@modules/account/repositories/inMemory/GenderRepositoryInMemory";
import { NeighborHoodRepositoryInMemory } from "@modules/account/repositories/inMemory/NeighborhoodRepositoryInMemory";
import { AddressRepositoryInMemory } from "@modules/account/repositories/inMemory/AddressRepositoryInMemory";
import { PhoneRepositoryInMemory } from "@modules/account/repositories/inMemory/PhoneRepositoryInMemory";
import { UserRepositoryInMemory } from "@modules/account/repositories/inMemory/UserRepositoryInMemory";

import { DatabaseInMemory } from "@shared/repositories/inMemory/DatabaseInMemory";
import { DayjsDateProvider } from "@shared/container/providers/DateProvider/implementations/DayjsDateProvider";
import { InMemoryHashProvider } from "@shared/container/providers/HashProvider/implementations/InMemoryHashProvider";
import { AppError } from "@shared/errors/AppError";
import { AppErrorMessages } from "@shared/errors/AppErrorMessages";
import { InMemoryCacheProvider } from "@shared/container/providers/CacheProvider/implementations/InMemoryCacheProvider";

import { CreateUserUseCase } from "./CreateUserUseCase";

let dateProvider: DayjsDateProvider;

let cacheProvider: InMemoryCacheProvider;

let databaseInMemory: DatabaseInMemory;

let hashProvider: InMemoryHashProvider;

let genderRepository: GenderRepositoryInMemory;

let neighborhoodRepository: NeighborHoodRepositoryInMemory;

let addressRepository: AddressRepositoryInMemory;

let phoneRepository: PhoneRepositoryInMemory;

let userRepository: UserRepositoryInMemory;

let createUserUseCase: CreateUserUseCase;

describe("Create User", () => {
  beforeEach(() => {
    dateProvider = new DayjsDateProvider();
    cacheProvider = new InMemoryCacheProvider(dateProvider);
    databaseInMemory = new DatabaseInMemory();
    hashProvider = new InMemoryHashProvider();
    genderRepository = new GenderRepositoryInMemory(databaseInMemory);
    neighborhoodRepository = new NeighborHoodRepositoryInMemory(
      databaseInMemory,
    );
    addressRepository = new AddressRepositoryInMemory(databaseInMemory);
    phoneRepository = new PhoneRepositoryInMemory(databaseInMemory);
    userRepository = new UserRepositoryInMemory(databaseInMemory);

    createUserUseCase = new CreateUserUseCase(
      cacheProvider,
      hashProvider,
      dateProvider,
      genderRepository,
      neighborhoodRepository,
      addressRepository,
      phoneRepository,
      userRepository,
    );
  });

  it("should be able to create a new user and erase cache", async () => {
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
      user_birth_date: new Date("2005-01-01"),
      user_phone: {
        phone_ddd: 34,
        phone_number: 123456789,
      },
      user_address: {
        address_street: "street_test",
        address_number: 123,
        address_complement: "complement_test",
        address_neighborhood_id: neighborhood.neighborhood_id,
        address_zip_code: 12345678,
      },
    };

    const cacheKey = cachePrefixes.listAllUsersPaginated;

    await cacheProvider.cacheSet({
      key: cacheKey,
      value: JSON.stringify([]),
      expiresInSeconds: 60 * 60,
    });

    const cacheValueBefore = await cacheProvider.cacheGet(cacheKey);

    const spyPhoneCreate = jest.spyOn(phoneRepository, "create");

    const spyAddressCreate = jest.spyOn(addressRepository, "create");

    const user = await createUserUseCase.execute(userData);

    const cacheValueAfter = await cacheProvider.cacheGet(cacheKey);

    expect(user).toHaveProperty("user_id");
    expect(spyPhoneCreate).toHaveBeenCalledWith({
      user_phone_id: user.user_id,
      phone_ddd: userData.user_phone.phone_ddd,
      phone_number: userData.user_phone.phone_number,
    });
    expect(spyAddressCreate).toHaveBeenCalledWith({
      user_address_id: user.user_id,
      address_street: userData.user_address.address_street,
      address_number: userData.user_address.address_number,
      address_complement: userData.user_address.address_complement,
      address_neighborhood_id: userData.user_address.address_neighborhood_id,
      address_zip_code: userData.user_address.address_zip_code,
    });
    expect(cacheValueBefore).not.toBeNull();
    expect(cacheValueAfter).toBeNull();
  });

  it("should not create a user with invalid birth date", async () => {
    await expect(
      createUserUseCase.execute({
        user_name: "user_test",
        user_email: "usertest@test.com",
        user_cpf: 12345678910,
        user_password: "123456",
        user_birth_date: new Date(),
        user_gender_id: 0,
        user_phone: {
          phone_ddd: 34,
          phone_number: 123456789,
        },
        user_address: {
          address_street: "street_test",
          address_number: 123,
          address_complement: "complement_test",
          address_neighborhood_id: 0,
          address_zip_code: 12345678,
        },
      }),
    ).rejects.toEqual(new AppError(AppErrorMessages.USER_INVALID_AGE));

    await expect(
      createUserUseCase.execute({
        user_name: "user_test",
        user_email: "usertest@test.com",
        user_cpf: 12345678910,
        user_password: "123456",
        user_birth_date: new Date("1900-01-01"),
        user_gender_id: 0,
        user_phone: {
          phone_ddd: 34,
          phone_number: 123456789,
        },
        user_address: {
          address_street: "street_test",
          address_number: 123,
          address_complement: "complement_test",
          address_neighborhood_id: 0,
          address_zip_code: 12345678,
        },
      }),
    ).rejects.toEqual(new AppError(AppErrorMessages.USER_INVALID_AGE));
  });

  it("should not create a user with invalid gender", async () => {
    await expect(
      createUserUseCase.execute({
        user_name: "user_test",
        user_email: "usertest@test.com",
        user_cpf: 12345678910,
        user_password: "123456",
        user_birth_date: new Date("2005-01-01"),
        user_gender_id: 0,
        user_phone: {
          phone_ddd: 34,
          phone_number: 123456789,
        },
        user_address: {
          address_street: "street_test",
          address_number: 123,
          address_complement: "complement_test",
          address_neighborhood_id: 0,
          address_zip_code: 12345678,
        },
      }),
    ).rejects.toEqual(new AppError(AppErrorMessages.GENDER_NOT_FOUND, 404));
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
        user_birth_date: new Date("2005-01-01"),
        user_phone: {
          phone_ddd: 34,
          phone_number: 123456789,
        },
        user_address: {
          address_street: "street_test",
          address_number: 123,
          address_complement: "complement_test",
          address_neighborhood_id: 0,
          address_zip_code: 12345678,
        },
      }),
    ).rejects.toEqual(
      new AppError(AppErrorMessages.NEIGHBORHOOD_NOT_FOUND, 404),
    );
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
      user_birth_date: new Date("2005-01-01"),
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
        user_birth_date: new Date("2005-01-01"),
        user_gender_id: gender.gender_id,
        user_phone: {
          phone_ddd: 34,
          phone_number: 123456789,
        },
        user_address: {
          address_street: "street_test",
          address_number: 123,
          address_complement: "complement_test",
          address_neighborhood_id: neighborhood.neighborhood_id,
          address_zip_code: 12345678,
        },
      }),
    ).rejects.toEqual(
      new AppError(AppErrorMessages.USER_PHONE_ALREADY_EXISTS, 400),
    );
  });

  it("should not create a user with same email or cpf", async () => {
    const gender = await genderRepository.create({
      gender_name: "gender_test",
    });

    const neighborhood = await neighborhoodRepository.create({
      neighborhood_name: "neighborhood_test",
      neighborhood_city_id: 1,
    });

    const user = {
      user_name: "user_test",
      user_email: "usertest@test.com",
      user_cpf: 12345678910,
      user_birth_date: new Date("2005-01-01"),
      user_password: "123456",
      user_gender_id: gender.gender_id,
    };

    await userRepository.create(user);

    await expect(
      createUserUseCase.execute({
        user_name: "user_test",
        user_email: user.user_email,
        user_cpf: 10987654321,
        user_password: "123456",
        user_gender_id: gender.gender_id,
        user_birth_date: new Date("2005-01-01"),
        user_phone: {
          phone_ddd: 34,
          phone_number: 123456789,
        },
        user_address: {
          address_street: "street_test",
          address_number: 123,
          address_complement: "complement_test",
          address_neighborhood_id: neighborhood.neighborhood_id,
          address_zip_code: 12345678,
        },
      }),
    ).rejects.toEqual(new AppError(AppErrorMessages.USER_ALREADY_EXISTS, 400));

    await expect(
      createUserUseCase.execute({
        user_name: "user_test",
        user_email: "usertest2@test.com",
        user_cpf: user.user_cpf,
        user_password: "123456",
        user_gender_id: gender.gender_id,
        user_birth_date: new Date("2005-01-01"),
        user_phone: {
          phone_ddd: 34,
          phone_number: 123456789,
        },
        user_address: {
          address_street: "street_test",
          address_number: 123,
          address_complement: "complement_test",
          address_neighborhood_id: neighborhood.neighborhood_id,
          address_zip_code: 12345678,
        },
      }),
    ).rejects.toEqual(new AppError(AppErrorMessages.USER_ALREADY_EXISTS, 400));

    await expect(
      createUserUseCase.execute({
        user_name: "user_test",
        user_email: user.user_email,
        user_cpf: user.user_cpf,
        user_password: "123456",
        user_gender_id: gender.gender_id,
        user_birth_date: new Date("2005-01-01"),
        user_phone: {
          phone_ddd: 34,
          phone_number: 123456789,
        },
        user_address: {
          address_street: "street_test",
          address_number: 123,
          address_complement: "complement_test",
          address_neighborhood_id: neighborhood.neighborhood_id,
          address_zip_code: 12345678,
        },
      }),
    ).rejects.toEqual(new AppError(AppErrorMessages.USER_ALREADY_EXISTS, 400));
  });
});
