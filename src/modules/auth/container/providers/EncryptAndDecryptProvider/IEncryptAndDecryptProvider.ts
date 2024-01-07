type IEncryptAndDecryptProvider = {
  encrypt(payload: string): Promise<string>;
  decrypt(payload: string): Promise<string>;
};

export { IEncryptAndDecryptProvider };
