class PhoneEntity {
  user_phone_id: number;

  phone_number: number;

  phone_ddd: number;

  phone_updated_at: Date;

  constructor(props: PhoneEntity) {
    this.user_phone_id = props.user_phone_id;
    this.phone_number = props.phone_number;
    this.phone_ddd = props.phone_ddd;
    this.phone_updated_at = props.phone_updated_at;
  }
}

export { PhoneEntity };
