import { cachePrefixes } from "@config/cache";

import { GenderRepositoryInMemory } from "@modules/account/repositories/inMemory/GenderRepositoryInMemory";

import { DatabaseInMemory } from "@shared/repositories/inMemory/DatabaseInMemory";
import { AppError } from "@shared/errors/AppError";
import { AppErrorMessages } from "@shared/errors/AppErrorMessages";
import { DayjsDateProvider } from "@shared/container/providers/DateProvider/implementations/DayjsDateProvider";
import { InMemoryCacheProvider } from "@shared/container/providers/CacheProvider/inMemory/InMemoryCacheProvider";

import { CreateGenderUseCase } from "./CreateGenderUseCase";

let dateProvider: DayjsDateProvider;

let cacheProvider: InMemoryCacheProvider;

let databaseInMemory: DatabaseInMemory;

let genderRepository: GenderRepositoryInMemory;

let createGenderUseCase: CreateGenderUseCase;

describe("Create Gender", () => {
  beforeEach(() => {
    dateProvider = new DayjsDateProvider();
    cacheProvider = new InMemoryCacheProvider(dateProvider);
    databaseInMemory = new DatabaseInMemory();
    genderRepository = new GenderRepositoryInMemory(databaseInMemory);

    createGenderUseCase = new CreateGenderUseCase(
      cacheProvider,
      genderRepository,
    );
  });

  it("Should be able to create a new gender and erase cache", async () => {
    const cacheKeyListAllGenders = cachePrefixes.listAllGenders;

    const cacheKeyListAllGendersPaginated = `${cachePrefixes.listAllGendersPaginated}:page:1:limit:10`;

    await cacheProvider.cacheSet({
      key: cacheKeyListAllGenders,
      value: JSON.stringify([]),
      expiresInSeconds: 60 * 60,
    });

    await cacheProvider.cacheSet({
      key: cacheKeyListAllGendersPaginated,
      value: JSON.stringify([]),
      expiresInSeconds: 60 * 60,
    });

    const cacheValueBeforeListAllGenders = await cacheProvider.cacheGet(
      cacheKeyListAllGenders,
    );

    const cacheValueBeforeListAllGendersPaginated =
      await cacheProvider.cacheGet(cacheKeyListAllGendersPaginated);

    const gender = await createGenderUseCase.execute({
      gender_name: "gender_test",
    });

    const cacheValueAfterListAllGenders = await cacheProvider.cacheGet(
      cacheKeyListAllGenders,
    );

    const cacheValueAfterListAllGendersPaginated = await cacheProvider.cacheGet(
      cacheKeyListAllGendersPaginated,
    );

    expect(gender).toHaveProperty("gender_id");
    expect(gender.gender_name).toEqual("gender_test");
    expect(cacheValueBeforeListAllGenders).not.toBeNull();
    expect(cacheValueBeforeListAllGendersPaginated).not.toBeNull();
    expect(cacheValueAfterListAllGenders).toBeNull();
    expect(cacheValueAfterListAllGendersPaginated).toBeNull();
  });

  it("Should not be able to create a gender if name already exists", async () => {
    const gender = await genderRepository.create({
      gender_name: "gender_test",
    });

    await expect(
      createGenderUseCase.execute({
        gender_name: gender.gender_name,
      }),
    ).rejects.toEqual(new AppError(AppErrorMessages.GENDER_ALREADY_EXISTS));
  });
});
