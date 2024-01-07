import { DatabaseInMemory } from "@global/repositories/inMemory/DatabaseInMemory";

import { UserRepositoryInMemory } from "@modules/account/repositories/inMemory/UserRepositoryInMemory";
import { RoleRepositoryInMemory } from "@modules/account/repositories/inMemory/RoleRepositoryInMemory";

import { ListAllUsersPaginatedUseCase } from "./ListAllUsersPaginatedUseCase";

let databaseInMemory: DatabaseInMemory;

let roleRepositoryInMemory: RoleRepositoryInMemory;

let userRepositoryInMemory: UserRepositoryInMemory;

let listAllUsersPaginatedUseCase: ListAllUsersPaginatedUseCase;

describe("List All Users Paginated", () => {
  beforeEach(() => {
    databaseInMemory = new DatabaseInMemory();
    roleRepositoryInMemory = new RoleRepositoryInMemory(databaseInMemory);
    userRepositoryInMemory = new UserRepositoryInMemory(databaseInMemory);

    listAllUsersPaginatedUseCase = new ListAllUsersPaginatedUseCase(
      userRepositoryInMemory,
    );
  });

  it("should be able to list all users paginated", async () => {
    const user = {
      user_name: "User Test",
      user_email: "usertest@test.com",
      user_cpf: 12345678910,
      user_gender_id: 1,
      user_password: "123456",
      user_birth_date: new Date("2005-01-01"),
    };

    const user2 = {
      user_name: "User Test 2",
      user_email: "usertest2@test.com",
      user_cpf: 10987654321,
      user_gender_id: 2,
      user_password: "123456",
      user_birth_date: new Date("2005-01-01"),
    };

    const role = await roleRepositoryInMemory.create({
      role_name: "role_test",
    });

    const user1Response = await userRepositoryInMemory.create(user);

    const user1WithRoleAndCpf = {
      ...user1Response,
      user_role_id: role.role_id,
      user_cpf: user.user_cpf,
    };

    const user2Response = await userRepositoryInMemory.create(user2);

    const user2WithRoleAndCpf = {
      ...user2Response,
      user_role_id: role.role_id,
      user_cpf: user2.user_cpf,
    };

    const users = await listAllUsersPaginatedUseCase.execute({
      page: 1,
      limit: 20,
    });

    expect(users).toEqual([user1WithRoleAndCpf, user2WithRoleAndCpf]);
  });

  it("should be able to list all users with pagination", async () => {
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

    expect(users10.length).toEqual(10);
    expect(users5.length).toEqual(5);
    expect(users30.length).toEqual(20);
    expect(users30[0].user_name).toEqual("User Test 0");
    expect(users5[0].user_name).toEqual("User Test 15");
  });
});
