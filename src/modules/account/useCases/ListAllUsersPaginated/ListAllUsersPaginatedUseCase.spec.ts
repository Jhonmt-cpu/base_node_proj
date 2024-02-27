import { cachePrefixes } from "@config/cache";

import { UserRepositoryInMemory } from "@modules/account/repositories/inMemory/UserRepositoryInMemory";

import { DatabaseInMemory } from "@shared/repositories/inMemory/DatabaseInMemory";
import { InMemoryCacheProvider } from "@shared/container/providers/CacheProvider/inMemory/InMemoryCacheProvider";
import { DayjsDateProvider } from "@shared/container/providers/DateProvider/implementations/DayjsDateProvider";

import { ListAllUsersPaginatedUseCase } from "./ListAllUsersPaginatedUseCase";

let dateProvider: DayjsDateProvider;

let cacheProvider: InMemoryCacheProvider;

let databaseInMemory: DatabaseInMemory;

let userRepositoryInMemory: UserRepositoryInMemory;

let listAllUsersPaginatedUseCase: ListAllUsersPaginatedUseCase;

describe("List All Users Paginated", () => {
  beforeEach(() => {
    dateProvider = new DayjsDateProvider();
    cacheProvider = new InMemoryCacheProvider(dateProvider);
    databaseInMemory = new DatabaseInMemory();
    userRepositoryInMemory = new UserRepositoryInMemory(databaseInMemory);

    listAllUsersPaginatedUseCase = new ListAllUsersPaginatedUseCase(
      cacheProvider,
      userRepositoryInMemory,
    );
  });

  it("should be able to list all users with pagination and create cache", async () => {
    for (let i = 0; i < 20; i++) {
      await userRepositoryInMemory.create({
        user_name: `User Test ${i}`,
        user_email: `usertest${i}@test.com`,
        user_cpf: 12345678910 + i,
        user_gender_id: 1,
        user_password: "123456",
        user_birth_date: new Date("2005-01-01"),
      });
    }

    const users10Params = {
      page: 1,
      limit: 10,
    };

    const users5Params = {
      page: 4,
      limit: 5,
    };

    const users30Params = {
      page: 1,
      limit: 30,
    };

    const cache10Key = `${cachePrefixes.listAllUsersPaginated}:page:${users10Params.page}:limit:${users10Params.limit}`;

    const cache5Key = `${cachePrefixes.listAllUsersPaginated}:page:${users5Params.page}:limit:${users5Params.limit}`;

    const cache30Key = `${cachePrefixes.listAllUsersPaginated}:page:${users30Params.page}:limit:${users30Params.limit}`;

    const cache10Before = await cacheProvider.cacheGet(cache10Key);

    const cache5Before = await cacheProvider.cacheGet(cache5Key);

    const cache30Before = await cacheProvider.cacheGet(cache30Key);

    const users10 = await listAllUsersPaginatedUseCase.execute({
      page: 1,
      limit: 10,
    });
    const users5 = await listAllUsersPaginatedUseCase.execute({
      page: 4,
      limit: 5,
    });
    const users30 = await listAllUsersPaginatedUseCase.execute({
      page: 1,
      limit: 30,
    });

    const cache10After = await cacheProvider.cacheGet(cache10Key);

    const cache5After = await cacheProvider.cacheGet(cache5Key);

    const cache30After = await cacheProvider.cacheGet(cache30Key);

    expect(users10.length).toEqual(10);
    expect(users5.length).toEqual(5);
    expect(users30.length).toEqual(20);
    expect(users10[0].user_name).toEqual("User Test 0");
    expect(users30[0].user_name).toEqual("User Test 0");
    expect(users5[0].user_name).toEqual("User Test 15");
    expect(cache10Before).toBeNull();
    expect(cache5Before).toBeNull();
    expect(cache30Before).toBeNull();
    expect(cache10After).not.toBeNull();
    expect(cache5After).not.toBeNull();
    expect(cache30After).not.toBeNull();
  });

  it("should be able to list all users with pagination and use cache", async () => {
    for (let i = 0; i < 20; i++) {
      await userRepositoryInMemory.create({
        user_name: `User Test ${i + 20}`,
        user_email: `usertest${i + 20}@test.com`,
        user_cpf: 12345678910 + i + 20,
        user_gender_id: 1,
        user_password: "123456",
        user_birth_date: new Date("2005-01-01"),
      });
    }

    const users10Params = {
      page: 1,
      limit: 10,
    };

    const users5Params = {
      page: 4,
      limit: 5,
    };

    const users30Params = {
      page: 1,
      limit: 30,
    };

    const firstGet10 = await listAllUsersPaginatedUseCase.execute(
      users10Params,
    );

    const firstGet5 = await listAllUsersPaginatedUseCase.execute(users5Params);

    const firstGet30 = await listAllUsersPaginatedUseCase.execute(
      users30Params,
    );

    const spyOnCache = jest.spyOn(cacheProvider, "cacheGet");

    const cache10Key = `${cachePrefixes.listAllUsersPaginated}:page:${users10Params.page}:limit:${users10Params.limit}`;

    const cache5Key = `${cachePrefixes.listAllUsersPaginated}:page:${users5Params.page}:limit:${users5Params.limit}`;

    const cache30Key = `${cachePrefixes.listAllUsersPaginated}:page:${users30Params.page}:limit:${users30Params.limit}`;

    const secondGet10 = await listAllUsersPaginatedUseCase.execute(
      users10Params,
    );

    const secondGet5 = await listAllUsersPaginatedUseCase.execute(users5Params);

    const secondGet30 = await listAllUsersPaginatedUseCase.execute(
      users30Params,
    );

    const cacheReturnedValue10 = await spyOnCache.mock.results[0].value;

    const cacheReturnedValue5 = await spyOnCache.mock.results[1].value;

    const cacheReturnedValue30 = await spyOnCache.mock.results[2].value;

    expect(JSON.stringify(firstGet10)).toEqual(JSON.stringify(secondGet10));
    expect(JSON.stringify(firstGet5)).toEqual(JSON.stringify(secondGet5));
    expect(JSON.stringify(firstGet30)).toEqual(JSON.stringify(secondGet30));
    expect(spyOnCache).toHaveBeenCalledWith(cache10Key);
    expect(spyOnCache).toHaveBeenCalledWith(cache5Key);
    expect(spyOnCache).toHaveBeenCalledWith(cache30Key);
    expect(cacheReturnedValue10).toBe(JSON.stringify(firstGet10));
    expect(cacheReturnedValue5).toBe(JSON.stringify(firstGet5));
    expect(cacheReturnedValue30).toBe(JSON.stringify(firstGet30));
  });
});
