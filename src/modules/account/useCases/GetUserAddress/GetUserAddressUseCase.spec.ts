import { cachePrefixes } from "@config/cache";

import { AddressRepositoryInMemory } from "@modules/account/repositories/inMemory/AddressRepositoryInMemory";

import { DatabaseInMemory } from "@shared/repositories/inMemory/DatabaseInMemory";
import { AppError } from "@shared/errors/AppError";
import { AppErrorMessages } from "@shared/errors/AppErrorMessages";
import { DayjsDateProvider } from "@shared/container/providers/DateProvider/implementations/DayjsDateProvider";
import { InMemoryCacheProvider } from "@shared/container/providers/CacheProvider/implementations/InMemoryCacheProvider";

import { GetUserAddressUseCase } from "./GetUserAddressUseCase";

let dateProvider: DayjsDateProvider;

let cacheProviderInMemory: InMemoryCacheProvider;

let databaseInMemory: DatabaseInMemory;

let addressRepositoryInMemory: AddressRepositoryInMemory;

let getUserAddressUseCase: GetUserAddressUseCase;

describe("Get User Address", () => {
  beforeEach(() => {
    dateProvider = new DayjsDateProvider();
    cacheProviderInMemory = new InMemoryCacheProvider(dateProvider);
    databaseInMemory = new DatabaseInMemory();
    addressRepositoryInMemory = new AddressRepositoryInMemory(databaseInMemory);

    getUserAddressUseCase = new GetUserAddressUseCase(
      cacheProviderInMemory,
      addressRepositoryInMemory,
    );
  });

  it("should be able to get an user address and create cache", async () => {
    const addressCreated = await addressRepositoryInMemory.create({
      user_address_id: 1,
      address_street: "Street Test",
      address_number: 123,
      address_complement: "Complement Test",
      address_zip_code: 12345678,
      address_neighborhood_id: 1,
    });

    const cacheKey = `${cachePrefixes.getUserAddress}:${addressCreated.user_address_id}`;

    const cacheValueBefore = await cacheProviderInMemory.cacheGet(cacheKey);

    const address = await getUserAddressUseCase.execute({
      user_address_id: addressCreated.user_address_id,
    });

    const cacheValueAfter = await cacheProviderInMemory.cacheGet(cacheKey);

    expect(address.user_address_id).toEqual(addressCreated.user_address_id);
    expect(address.address_street).toEqual(addressCreated.address_street);
    expect(address.address_number).toEqual(addressCreated.address_number);
    expect(cacheValueBefore).toBeNull();
    expect(cacheValueAfter).not.toBeNull();
    expect(cacheValueAfter).toBe(JSON.stringify(address));
  });

  it("should be able to get an user address from cache", async () => {
    const addressCreated = await addressRepositoryInMemory.create({
      user_address_id: 1,
      address_street: "Street Test 2",
      address_number: 123,
      address_complement: "Complement Test",
      address_zip_code: 12345678,
      address_neighborhood_id: 1,
    });

    const firstResponse = await getUserAddressUseCase.execute({
      user_address_id: addressCreated.user_address_id,
    });

    const spyCache = jest.spyOn(cacheProviderInMemory, "cacheGet");

    const cacheKey = `${cachePrefixes.getUserAddress}:${addressCreated.user_address_id}`;

    const secondResponse = await getUserAddressUseCase.execute({
      user_address_id: addressCreated.user_address_id,
    });

    const returnedCacheFromSpy = await spyCache.mock.results[0].value;

    expect(JSON.stringify(firstResponse)).toBe(JSON.stringify(secondResponse));
    expect(spyCache).toHaveBeenCalledWith(cacheKey);
    expect(returnedCacheFromSpy).toBe(JSON.stringify(firstResponse));
  });

  it("should not be able to get an user address with invalid id", async () => {
    await expect(
      getUserAddressUseCase.execute({
        user_address_id: 1,
      }),
    ).rejects.toEqual(
      new AppError(AppErrorMessages.USER_ADDRESS_NOT_FOUND, 404),
    );
  });
});
