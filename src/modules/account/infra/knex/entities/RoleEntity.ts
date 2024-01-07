class RoleEntity {
  role_id: number;

  role_name: string;

  role_created_at: Date;

  constructor(props: RoleEntity) {
    this.role_id = props.role_id;
    this.role_name = props.role_name;
    this.role_created_at = props.role_created_at;
  }
}

export { RoleEntity };
