class GenderEntity {
	gender_id: number;

	gender_name: string;

	constructor(props: GenderEntity) {
		this.gender_id = props.gender_id;
		this.gender_name = props.gender_name;
	}
}

export { GenderEntity };