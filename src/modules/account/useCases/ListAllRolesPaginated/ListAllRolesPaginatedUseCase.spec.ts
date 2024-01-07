import { DatabaseInMemory } from "@global/repositories/inMemory/DatabaseInMemory";

import { RoleRepositoryInMemory } from "@modules/account/repositories/inMemory/RoleRepositoryInMemory";

import { ListAllRolesPaginatedUseCase } from "./ListAllRolesPaginatedUseCase";

let databaseInMemory: DatabaseInMemory;

let roleRepositoryInMemory: RoleRepositoryInMemory;

let listAllRolesPaginatedUseCase: ListAllRolesPaginatedUseCase;

describe("List All Roles Paginated", () => {
  beforeEach(() => {
    databaseInMemory = new DatabaseInMemory();
    roleRepositoryInMemory = new RoleRepositoryInMemory(databaseInMemory);

    listAllRolesPaginatedUseCase = new ListAllRolesPaginatedUseCase(
      roleRepositoryInMemory,
    );
  });

  it("should be able to list all roles", async () => {
    const role = await roleRepositoryInMemory.create({
      role_name: "role_test",
    });

    const roles = await listAllRolesPaginatedUseCase.execute({
      page: 1,
      limit: 20,
    });

    expect(roles).toEqual([role]);
  });

  it("should be able to list all roles with pagination", async () => {
    for (let i = 0; i < 20; i++) {
      await roleRepositoryInMemory.create({
        role_name: `role_test_${i}`,
      });
    }

    const roles10 = await listAllRolesPaginatedUseCase.execute({
      page: 1,
      limit: 10,
    });
    const roles5 = await listAllRolesPaginatedUseCase.execute({
      page: 4,
      limit: 5,
    });
    const roles30 = await listAllRolesPaginatedUseCase.execute({
      page: 1,
      limit: 30,
    });

    expect(roles10.length).toEqual(10);
    expect(roles5.length).toEqual(5);
    expect(roles30.length).toEqual(20);
    expect(roles30[0].role_name).toEqual("role_test_0");
    expect(roles5[0].role_name).toEqual("role_test_15");
  });
});
