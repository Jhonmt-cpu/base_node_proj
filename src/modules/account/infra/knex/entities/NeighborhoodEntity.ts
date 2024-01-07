import { CityEntity } from "./CityEntity";

class NeighborhoodEntity {
  neighborhood_id: number;

  neighborhood_name: string;

  neighborhood_city_id: number;

  neighborhood_city?: CityEntity;

  neighborhood_created_at: Date;

  constructor(props: NeighborhoodEntity) {
    this.neighborhood_id = props.neighborhood_id;
    this.neighborhood_name = props.neighborhood_name;
    this.neighborhood_city_id = props.neighborhood_city_id;
    this.neighborhood_city = props.neighborhood_city;
    this.neighborhood_created_at = props.neighborhood_created_at;
  }
}

export { NeighborhoodEntity };
