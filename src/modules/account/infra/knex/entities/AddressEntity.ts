import { NeighborhoodEntity } from "./NeighborhoodEntity";

class AddressEntity {
  user_address_id: number;

  address_street: string;

  address_number: number;

  address_complement?: string;

  address_neighborhood_id: number;

  address_neighborhood?: NeighborhoodEntity;

  address_zip_code: number;

  address_updated_at: Date;

  constructor(props: AddressEntity) {
    this.user_address_id = props.user_address_id;
    this.address_street = props.address_street;
    this.address_number = props.address_number;
    this.address_complement = props.address_complement;
    this.address_neighborhood_id = props.address_neighborhood_id;
    this.address_neighborhood = props.address_neighborhood;
    this.address_zip_code = props.address_zip_code;
    this.address_updated_at = props.address_updated_at;
  }
}

export { AddressEntity };
