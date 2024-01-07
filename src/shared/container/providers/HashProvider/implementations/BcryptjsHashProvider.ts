import { compare, hash } from "bcryptjs";

import { IHashProvider } from "../IHashProvider";

class BcryptjsHashProvider implements IHashProvider {
  async generateHash(payload: string): Promise<string> {
    const hashed = await hash(payload, 8);

    return hashed;
  }

  async compareHash(payload: string, hashed: string): Promise<boolean> {
    const match = await compare(payload, hashed);

    return match;
  }
}

export { BcryptjsHashProvider };
