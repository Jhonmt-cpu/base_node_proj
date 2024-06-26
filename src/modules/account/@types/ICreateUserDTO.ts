type ICreateUserDTO = {
  user_name: string;
  user_email: string;
  user_password: string;
  user_cpf: number;
  user_gender_id: number;
  user_birth_date: Date;
  user_phone: {
    phone_number: number;
    phone_ddd: number;
  };
  user_address: {
    address_street: string;
    address_number: number;
    address_complement?: string;
    address_neighborhood_id: number;
    address_zip_code: number;
  };
};

export { ICreateUserDTO };
