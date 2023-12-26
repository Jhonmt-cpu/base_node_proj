import { RoleRepositoryInMemory } from "@modules/users/repositories/inMemory/RoleRepositoryInMemory";

import { AppError } from "@errors/AppError";

import { CreateRoleUseCase } from "./CreateRoleUseCase";
import { DatabaseInMemory } from "@modules/users/repositories/inMemory/DatabaseInMemory";

let databaseInMemory: DatabaseInMemory;

let roleRepositoryInMemory: RoleRepositoryInMemory;

let createRoleUseCase: CreateRoleUseCase;

describe("Create Role", () => {
  beforeEach(() => {
    databaseInMemory = new DatabaseInMemory();

    roleRepositoryInMemory = new RoleRepositoryInMemory(databaseInMemory);

    createRoleUseCase = new CreateRoleUseCase(roleRepositoryInMemory);
  });

  it("should be able to create a new role", async () => {
    const role = await createRoleUseCase.execute({
      role_name: "any_role_name",
    });

    expect(role).toHaveProperty("role_id");
  });

  it("should not be able to create a new role with name exists", async () => {
    await createRoleUseCase.execute({
      role_name: "any_role_name",
    });

    await expect(
      createRoleUseCase.execute({
        role_name: "any_role_name",
      }),
    ).rejects.toEqual(new AppError("Role already exists!"));
  });
});
