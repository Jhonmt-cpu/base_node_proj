class StateEntity {
  state_id: number;

  state_name: string;

  state_uf: string;

  state_created_at: Date;

  constructor(props: StateEntity) {
    this.state_id = props.state_id;
    this.state_name = props.state_name;
    this.state_uf = props.state_uf;
    this.state_created_at = props.state_created_at;
  }
}

export { StateEntity };
