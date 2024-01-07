import crypto from "crypto";

import auth from "@config/auth";

import { IEncryptAndDecryptProvider } from "../IEncryptAndDecryptProvider";

class CryptoEncryptAndDecryptProvider implements IEncryptAndDecryptProvider {
  private secretKey = crypto
    .createHash("sha512")
    .update(auth.aes.secretKey)
    .digest("hex")
    .substring(0, 32);

  private iv = crypto
    .createHash("sha512")
    .update(auth.aes.iv)
    .digest("hex")
    .substring(0, 16);

  async encrypt(payload: string): Promise<string> {
    const cipher = crypto.createCipheriv(
      auth.aes.method,
      this.secretKey,
      this.iv,
    );

    const encrypted = cipher.update(payload, "utf8", "hex");
    const buffer = Buffer.from(encrypted + cipher.final("hex"));

    return buffer.toString("base64");
  }

  async decrypt(payload: string): Promise<string> {
    const buffer = Buffer.from(payload, "base64");

    const decipher = crypto.createDecipheriv(
      auth.aes.method,
      this.secretKey,
      this.iv,
    );

    const decrypted = decipher.update(buffer.toString("utf-8"), "hex", "utf8");

    return decrypted + decipher.final("utf8");
  }
}

export { CryptoEncryptAndDecryptProvider };
