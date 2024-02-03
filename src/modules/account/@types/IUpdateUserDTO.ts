type IUpdateUserDTO = {
  user_id: number;
  user_password: string;
  user_name?: string;
  user_email?: string;
  user_new_password?: string;
  user_gender_id?: number;
  user_phone?: {
    phone_number: number;
    phone_ddd: number;
  };
  user_address?: {
    address_street?: string;
    address_number?: number;
    address_complement?: string;
    address_neighborhood_id?: number;
    address_zip_code?: number;
  };
  is_admin_request: boolean;
};

export { IUpdateUserDTO };
