type ISendMailDTO = {
  to: string;
  subject: string;
  variables: {
    [key: string]: string | number;
  };
  path: string;
};

export { ISendMailDTO };
