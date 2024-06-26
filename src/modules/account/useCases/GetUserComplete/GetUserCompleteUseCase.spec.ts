import { cachePrefixes } from "@config/cache";

import { AddressRepositoryInMemory } from "@modules/account/repositories/inMemory/AddressRepositoryInMemory";
import { CityRepositoryInMemory } from "@modules/account/repositories/inMemory/CityRepositoryInMemory";
import { GenderRepositoryInMemory } from "@modules/account/repositories/inMemory/GenderRepositoryInMemory";
import { NeighborHoodRepositoryInMemory } from "@modules/account/repositories/inMemory/NeighborhoodRepositoryInMemory";
import { PhoneRepositoryInMemory } from "@modules/account/repositories/inMemory/PhoneRepositoryInMemory";
import { RoleRepositoryInMemory } from "@modules/account/repositories/inMemory/RoleRepositoryInMemory";
import { StateRepositoryInMemory } from "@modules/account/repositories/inMemory/StateRepositoryInMemory";
import { UserRepositoryInMemory } from "@modules/account/repositories/inMemory/UserRepositoryInMemory";
import { flatUserCompleteToUserWithoutPassword } from "@modules/account/mappers/flatUserCompleteToUserWithoutPassword";

import { DatabaseInMemory } from "@shared/repositories/inMemory/DatabaseInMemory";
import { AppError } from "@shared/errors/AppError";
import { AppErrorMessages } from "@shared/errors/AppErrorMessages";
import { InMemoryCacheProvider } from "@shared/container/providers/CacheProvider/inMemory/InMemoryCacheProvider";
import { DayjsDateProvider } from "@shared/container/providers/DateProvider/implementations/DayjsDateProvider";

import { GetUserCompleteUseCase } from "./GetUserCompleteUseCase";

let dateProvider: DayjsDateProvider;

let cacheProvider: InMemoryCacheProvider;

let databaseInMemory: DatabaseInMemory;

let genderRepository: GenderRepositoryInMemory;

let roleRepository: RoleRepositoryInMemory;

let stateRepository: StateRepositoryInMemory;

let cityRepository: CityRepositoryInMemory;

let neighborhoodRepository: NeighborHoodRepositoryInMemory;

let addressRepository: AddressRepositoryInMemory;

let phoneRepository: PhoneRepositoryInMemory;

let userRepository: UserRepositoryInMemory;

let getUserCompleteUseCase: GetUserCompleteUseCase;

describe("Get User Complete", () => {
  beforeEach(() => {
    dateProvider = new DayjsDateProvider();
    cacheProvider = new InMemoryCacheProvider(dateProvider);
    databaseInMemory = new DatabaseInMemory();
    genderRepository = new GenderRepositoryInMemory(databaseInMemory);
    roleRepository = new RoleRepositoryInMemory(databaseInMemory);
    stateRepository = new StateRepositoryInMemory(databaseInMemory);
    cityRepository = new CityRepositoryInMemory(databaseInMemory);
    neighborhoodRepository = new NeighborHoodRepositoryInMemory(
      databaseInMemory,
    );
    addressRepository = new AddressRepositoryInMemory(databaseInMemory);
    phoneRepository = new PhoneRepositoryInMemory(databaseInMemory);
    userRepository = new UserRepositoryInMemory(databaseInMemory);

    getUserCompleteUseCase = new GetUserCompleteUseCase(
      cacheProvider,
      userRepository,
    );
  });

  it("should be able to get a user complete and create cache", async () => {
    const role = await roleRepository.create({
      role_name: "role_test",
    });

    const gender = await genderRepository.create({
      gender_name: "gender_test",
    });

    const state = await stateRepository.create({
      state_name: "state_test",
      state_uf: "ST",
    });

    const city = await cityRepository.create({
      city_name: "city_test",
      city_state_id: state.state_id,
    });

    const neighborhood = await neighborhoodRepository.create({
      neighborhood_name: "neighborhood_test",
      neighborhood_city_id: city.city_id,
    });

    const user = {
      user_name: "user_test",
      user_email: "usertest@test.com",
      user_cpf: 12345678910,
      user_gender_id: gender.gender_id,
      user_password: "123456",
      user_birth_date: new Date("2005-01-01"),
    };

    const userResponse = await userRepository.create(user);

    const address = await addressRepository.create({
      user_address_id: userResponse.user_id,
      address_zip_code: 12345678,
      address_street: "address_street_test",
      address_number: 123,
      address_neighborhood_id: neighborhood.neighborhood_id,
    });

    const phone = await phoneRepository.create({
      user_phone_id: userResponse.user_id,
      phone_ddd: 34,
      phone_number: 123456789,
    });

    const userWithRoleAndCpf = {
      ...userResponse,
      user_role_id: role.role_id,
      user_cpf: user.user_cpf,
      user_password: user.user_password,
    };

    const userFlat = {
      ...userWithRoleAndCpf,
      ...address,
      ...phone,
      ...neighborhood,
      ...city,
      ...state,
      ...gender,
      ...role,
    };

    const userWithoutPassword = flatUserCompleteToUserWithoutPassword(userFlat);

    const cacheKey = `${cachePrefixes.getUserComplete}:${userResponse.user_id}`;

    const cacheValueBefore = await cacheProvider.cacheGet(cacheKey);

    const userComplete = await getUserCompleteUseCase.execute({
      user_id: userResponse.user_id,
    });

    const cacheValueAfter = await cacheProvider.cacheGet(cacheKey);

    expect(userComplete).toEqual(userWithoutPassword);
    expect(cacheValueBefore).toBeNull();
    expect(cacheValueAfter).not.toBeNull();
    expect(cacheValueAfter).toBe(JSON.stringify(userWithoutPassword));
  });

  it("should be able to get a user complete from cache", async () => {
    await roleRepository.create({
      role_name: "role_test",
    });

    const gender = await genderRepository.create({
      gender_name: "gender_test 2",
    });

    const state = await stateRepository.create({
      state_name: "state_test 2",
      state_uf: "ST",
    });

    const city = await cityRepository.create({
      city_name: "city_test 2",
      city_state_id: state.state_id,
    });

    const neighborhood = await neighborhoodRepository.create({
      neighborhood_name: "neighborhood_test 2",
      neighborhood_city_id: city.city_id,
    });

    const user = {
      user_name: "user_test 2",
      user_email: "usertest2@test.com",
      user_cpf: 12345678911,
      user_gender_id: gender.gender_id,
      user_password: "123456",
      user_birth_date: new Date("2005-01-01"),
    };

    const userResponse = await userRepository.create(user);

    await addressRepository.create({
      user_address_id: userResponse.user_id,
      address_zip_code: 12345678,
      address_street: "address_street_test 2",
      address_number: 123,
      address_neighborhood_id: neighborhood.neighborhood_id,
    });

    await phoneRepository.create({
      user_phone_id: userResponse.user_id,
      phone_ddd: 34,
      phone_number: 123456788,
    });

    const firstResponse = await getUserCompleteUseCase.execute({
      user_id: userResponse.user_id,
    });

    const spyCache = jest.spyOn(cacheProvider, "cacheGet");

    const cacheKey = `${cachePrefixes.getUserComplete}:${userResponse.user_id}`;

    const secondResponse = await getUserCompleteUseCase.execute({
      user_id: userResponse.user_id,
    });

    const returnedCacheFromSpy = await spyCache.mock.results[0].value;

    expect(JSON.stringify(firstResponse)).toBe(JSON.stringify(secondResponse));
    expect(spyCache).toHaveBeenCalledWith(cacheKey);
    expect(returnedCacheFromSpy).toBe(JSON.stringify(firstResponse));
  });

  it("should not be able to get a user complete with non-existent user", async () => {
    await expect(
      getUserCompleteUseCase.execute({
        user_id: 1,
      }),
    ).rejects.toEqual(new AppError(AppErrorMessages.USER_NOT_FOUND, 404));
  });
});
