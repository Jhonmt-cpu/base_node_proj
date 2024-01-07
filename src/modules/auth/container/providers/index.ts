import { container } from "tsyringe";

import { IEncryptAndDecryptProvider } from "./EncryptAndDecryptProvider/IEncryptAndDecryptProvider";
import { CryptoEncryptAndDecryptProvider } from "./EncryptAndDecryptProvider/implementations/CryptoEncryptAndDecryptProvider";
import { IGenerateTokenProvider } from "./GenerateTokenProvider/IGenerateTokenProvider";
import { JWTGenerateTokenProvider } from "./GenerateTokenProvider/implementations/JWTGenerateTokenProvider";

container.registerSingleton<IEncryptAndDecryptProvider>(
  "EncryptAndDecryptProvider",
  CryptoEncryptAndDecryptProvider,
);

container.registerSingleton<IGenerateTokenProvider>(
  "GenerateTokenProvider",
  JWTGenerateTokenProvider,
);
