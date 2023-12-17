class AddressEntity {
	user_address_id: number;

	address_street: string;

	address_number: number;

	address_complement?: string;

	address_neighborhood: string;

	address_city: string;

	address_state: string;

	address_zip_code: number;

	constructor(props: AddressEntity) {
		this.user_address_id = props.user_address_id;
		this.address_street = props.address_street;
		this.address_number = props.address_number;
		this.address_complement = props.address_complement;
		this.address_neighborhood = props.address_neighborhood;
		this.address_city = props.address_city;
		this.address_state = props.address_state;
		this.address_zip_code = props.address_zip_code;
	}
}

export { AddressEntity };