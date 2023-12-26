import { AppError } from "@shared/errors/AppError";

import { AddressRepositoryInMemory } from "@modules/users/repositories/inMemory/AddressRepositoryInMemory";
import { DatabaseInMemory } from "@modules/users/repositories/inMemory/DatabaseInMemory";

import { GetUserAddressUseCase } from "./GetUserAddressUseCase";

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
    ).rejects.toEqual(new AppError("Address not found!", 404));
  });
});