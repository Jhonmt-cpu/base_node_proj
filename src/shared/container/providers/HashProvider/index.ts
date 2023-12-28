import { container } from "tsyringe";

import { BcryptjsHashProvider } from "./implementations/BcryptjsHashProvider";
import { IHashProvider } from "./IHashProvider";

container.registerSingleton<IHashProvider>(
  "HashProvider",
  BcryptjsHashProvider,
);
