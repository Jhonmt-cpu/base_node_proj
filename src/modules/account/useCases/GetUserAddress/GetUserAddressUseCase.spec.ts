import { DatabaseInMemory } from "@shared/repositories/inMemory/DatabaseInMemory";

import { AddressRepositoryInMemory } from "@modules/account/repositories/inMemory/AddressRepositoryInMemory";

import { AppError } from "@shared/errors/AppError";

import { GetUserAddressUseCase } from "./GetUserAddressUseCase";
import { AppErrorMessages } from "@shared/errors/AppErrorMessages";

let databaseInMemory: DatabaseInMemory;

let addressRepositoryInMemory: AddressRepositoryInMemory;

let getUserAddressUseCase: GetUserAddressUseCase;

describe("Get User Address", () => {
  beforeEach(() => {
    databaseInMemory = new DatabaseInMemory();
    addressRepositoryInMemory = new AddressRepositoryInMemory(databaseInMemory);

    getUserAddressUseCase = new GetUserAddressUseCase(
      addressRepositoryInMemory,
    );
  });

  it("should be able to get an user address", async () => {
    const addressCreated = await addressRepositoryInMemory.create({
      user_address_id: 1,
      address_street: "Street Test",
      address_number: 123,
      address_complement: "Complement Test",
      address_zip_code: 12345678,
      address_neighborhood_id: 1,
    });

    const address = await getUserAddressUseCase.execute({
      user_address_id: addressCreated.user_address_id,
    });

    expect(address.user_address_id).toEqual(addressCreated.user_address_id);
    expect(address.address_street).toEqual(addressCreated.address_street);
    expect(address.address_number).toEqual(addressCreated.address_number);
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
