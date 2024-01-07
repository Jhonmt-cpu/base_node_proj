import { StateEntity } from "./StateEntity";

class CityEntity {
  city_id: number;

  city_name: string;

  city_state_id: number;

  city_state?: StateEntity;

  city_created_at: Date;

  constructor(props: CityEntity) {
    this.city_id = props.city_id;
    this.city_name = props.city_name;
    this.city_state_id = props.city_state_id;
    this.city_state = props.city_state;
    this.city_created_at = props.city_created_at;
  }
}

export { CityEntity };
