class RoleEntity {
	role_id: number;

	role_name: string;

	constructor(props: RoleEntity) {
		this.role_id = props.role_id;
		this.role_name = props.role_name;
	}
}

export { RoleEntity };