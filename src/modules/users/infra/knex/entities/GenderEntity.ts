class GenderEntity {
  gender_id: number;

  gender_name: string;

  gender_created_at: Date;

  constructor(props: GenderEntity) {
    this.gender_id = props.gender_id;
    this.gender_name = props.gender_name;
    this.gender_created_at = props.gender_created_at;
  }
}

export { GenderEntity };
