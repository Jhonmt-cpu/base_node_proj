import { RefreshTokenRepositoryInMemory } from "@modules/auth/repositories/inMemory/RefreshTokenRepositoryInMemory";
import { DatabaseInMemory } from "@shared/repositories/inMemory/DatabaseInMemory";
import { LogoutUseCase } from "./LogoutUseCase";

let databaseInMemory: DatabaseInMemory;

let refreshTokenRepositoryInMemory: RefreshTokenRepositoryInMemory;

let logoutUseCase: LogoutUseCase;

describe("Logout Use Case", () => {
  beforeEach(() => {
    databaseInMemory = new DatabaseInMemory();
    refreshTokenRepositoryInMemory = new RefreshTokenRepositoryInMemory(
      databaseInMemory,
    );

    logoutUseCase = new LogoutUseCase(refreshTokenRepositoryInMemory);
  });

  it("should be able to logout", async () => {
    const userId = 1;

    const refreshToken = await refreshTokenRepositoryInMemory.create({
      refresh_token_user_id: userId,
      refresh_token_expires_in: new Date(),
    });

    await logoutUseCase.execute({
      user_id: userId,
    });

    const refreshTokenFound = await refreshTokenRepositoryInMemory.findById(
      refreshToken.refresh_token_id,
    );

    expect(refreshTokenFound).toBeUndefined();
  });
});
