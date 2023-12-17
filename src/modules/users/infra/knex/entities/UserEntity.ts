import { AddressEntity } from "./AddressEntity";
import { GenderEntity } from "./GenderEntity";
import { PhoneEntity } from "./PhoneEntity";
import { RoleEntity } from "./RoleEntity";

class UserEntity {
	user_id: number;

	user_name: string;

	user_email: string;

	user_password: string;

	user_cpf: string;
  
	user_gender_id: number;

	user_gender?: GenderEntity;

	user_phone?: PhoneEntity;

	user_address?: AddressEntity;

	user_role_id: number;

	user_role?: RoleEntity;

	constructor(props: UserEntity) {
		this.user_id = props.user_id;
		this.user_name = props.user_name;
		this.user_email = props.user_email;
		this.user_password = props.user_password;
		this.user_cpf = props.user_cpf;
		this.user_gender_id = props.user_gender_id;
		this.user_gender = props.user_gender;
		this.user_phone = props.user_phone;
		this.user_address = props.user_address;
		this.user_role_id = props.user_role_id;
		this.user_role = props.user_role;
	}
}

export { UserEntity };