import { cachePrefixes } from "@config/cache";

import { RoleRepositoryInMemory } from "@modules/account/repositories/inMemory/RoleRepositoryInMemory";

import { DatabaseInMemory } from "@shared/repositories/inMemory/DatabaseInMemory";
import { AppError } from "@errors/AppError";
import { AppErrorMessages } from "@shared/errors/AppErrorMessages";
import { DayjsDateProvider } from "@shared/container/providers/DateProvider/implementations/DayjsDateProvider";
import { InMemoryCacheProvider } from "@shared/container/providers/CacheProvider/implementations/InMemoryCacheProvider";

import { CreateRoleUseCase } from "./CreateRoleUseCase";

let dateProvider: DayjsDateProvider;

let cacheProviderInMemory: InMemoryCacheProvider;

let databaseInMemory: DatabaseInMemory;

let roleRepositoryInMemory: RoleRepositoryInMemory;

let createRoleUseCase: CreateRoleUseCase;

describe("Create Role", () => {
  beforeEach(() => {
    dateProvider = new DayjsDateProvider();

    cacheProviderInMemory = new InMemoryCacheProvider(dateProvider);

    databaseInMemory = new DatabaseInMemory();

    roleRepositoryInMemory = new RoleRepositoryInMemory(databaseInMemory);

    createRoleUseCase = new CreateRoleUseCase(
      cacheProviderInMemory,
      roleRepositoryInMemory,
    );
  });

  it("should be able to create a new role and erase cache", async () => {
    const cacheKey = `${cachePrefixes.listAllRolesPaginated}`;

    await cacheProviderInMemory.cacheSet({
      key: cacheKey,
      value: JSON.stringify([]),
      expiresInSeconds: 60 * 60,
    });

    const cacheValueBefore = await cacheProviderInMemory.cacheGet(cacheKey);

    const role = await createRoleUseCase.execute({
      role_name: "any_role_name",
    });

    const cacheValueAfter = await cacheProviderInMemory.cacheGet(cacheKey);

    expect(role).toHaveProperty("role_id");
    expect(cacheValueBefore).not.toBe(null);
    expect(cacheValueAfter).toBe(null);
  });

  it("should not be able to create a new role with name exists", async () => {
    await createRoleUseCase.execute({
      role_name: "any_role_name",
    });

    await expect(
      createRoleUseCase.execute({
        role_name: "any_role_name",
      }),
    ).rejects.toEqual(new AppError(AppErrorMessages.ROLE_ALREADY_EXISTS));
  });
});
