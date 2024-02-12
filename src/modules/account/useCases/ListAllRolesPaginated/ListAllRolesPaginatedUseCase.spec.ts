import { cachePrefixes } from "@config/cache";

import { RoleRepositoryInMemory } from "@modules/account/repositories/inMemory/RoleRepositoryInMemory";

import { DatabaseInMemory } from "@shared/repositories/inMemory/DatabaseInMemory";
import { InMemoryCacheProvider } from "@shared/container/providers/CacheProvider/implementations/InMemoryCacheProvider";
import { DayjsDateProvider } from "@shared/container/providers/DateProvider/implementations/DayjsDateProvider";

import { ListAllRolesPaginatedUseCase } from "./ListAllRolesPaginatedUseCase";

let dateProvider: DayjsDateProvider;

let cacheProvider: InMemoryCacheProvider;

let databaseInMemory: DatabaseInMemory;

let roleRepositoryInMemory: RoleRepositoryInMemory;

let listAllRolesPaginatedUseCase: ListAllRolesPaginatedUseCase;

describe("List All Roles Paginated", () => {
  beforeEach(() => {
    dateProvider = new DayjsDateProvider();
    cacheProvider = new InMemoryCacheProvider(dateProvider);
    databaseInMemory = new DatabaseInMemory();
    roleRepositoryInMemory = new RoleRepositoryInMemory(databaseInMemory);

    listAllRolesPaginatedUseCase = new ListAllRolesPaginatedUseCase(
      cacheProvider,
      roleRepositoryInMemory,
    );
  });

  it("should be able to list all roles with pagination and create cache", async () => {
    for (let i = 0; i < 20; i++) {
      await roleRepositoryInMemory.create({
        role_name: `role_test_${i}`,
      });
    }

    const roles10Params = {
      page: 1,
      limit: 10,
    };

    const roles5Params = {
      page: 4,
      limit: 5,
    };

    const roles30Params = {
      page: 1,
      limit: 30,
    };

    const cacheKey10 = `${cachePrefixes.listAllRolesPaginated}:page:${roles10Params.page}:limit:${roles10Params.limit}`;

    const cacheKey5 = `${cachePrefixes.listAllRolesPaginated}:page:${roles5Params.page}:limit:${roles5Params.limit}`;

    const cacheKey30 = `${cachePrefixes.listAllRolesPaginated}:page:${roles30Params.page}:limit:${roles30Params.limit}`;

    const cacheValueBefore10 = await cacheProvider.cacheGet(cacheKey10);

    const cacheValueBefore5 = await cacheProvider.cacheGet(cacheKey5);

    const cacheValueBefore30 = await cacheProvider.cacheGet(cacheKey30);

    const roles10 = await listAllRolesPaginatedUseCase.execute(roles10Params);
    const roles5 = await listAllRolesPaginatedUseCase.execute(roles5Params);
    const roles30 = await listAllRolesPaginatedUseCase.execute(roles30Params);

    const cacheValueAfter10 = await cacheProvider.cacheGet(cacheKey10);

    const cacheValueAfter5 = await cacheProvider.cacheGet(cacheKey5);

    const cacheValueAfter30 = await cacheProvider.cacheGet(cacheKey30);

    expect(roles10.length).toEqual(10);
    expect(roles5.length).toEqual(5);
    expect(roles30.length).toEqual(20);
    expect(roles10[0].role_name).toEqual("role_test_0");
    expect(roles30[0].role_name).toEqual("role_test_0");
    expect(roles5[0].role_name).toEqual("role_test_15");
    expect(cacheValueBefore10).toBeNull();
    expect(cacheValueBefore5).toBeNull();
    expect(cacheValueBefore30).toBeNull();
    expect(cacheValueAfter10).not.toBeNull();
    expect(cacheValueAfter5).not.toBeNull();
    expect(cacheValueAfter30).not.toBeNull();
  });
});
