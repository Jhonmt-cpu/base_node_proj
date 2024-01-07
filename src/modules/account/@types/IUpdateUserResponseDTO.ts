type IUpdateUserResponseDTO = {
  user_id: number;
  user_name?: string;
  user_email?: string;
  user_gender_id?: number;
  user_phone?: {
    user_phone_id: number;
    phone_number: number;
    phone_ddd: number;
    phone_updated_at: Date;
  };
  user_address?: {
    user_address_id: number;
    address_street?: string;
    address_number?: number;
    address_complement?: string;
    address_neighborhood_id?: number;
    address_zip_code?: number;
    address_updated_at: Date;
  };
  user_created_at?: Date;
  user_updated_at?: Date;
};

export { IUpdateUserResponseDTO };
