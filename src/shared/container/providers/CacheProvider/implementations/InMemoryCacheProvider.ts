import { IDateProvider } from "../../DateProvider/IDateProvider";
import { ICacheProvider, ICacheSet } from "../ICacheProvider";

interface IInMemoryCache {
  value: string;
  expireTime: Date;
}

class InMemoryCacheProvider implements ICacheProvider {
  constructor(private dateProvider: IDateProvider) {}

  private cache: Map<string, IInMemoryCache> = new Map();

  async cacheSet({ key, value, expiresInSeconds }: ICacheSet): Promise<void> {
    const expireDate = this.dateProvider.addSeconds(expiresInSeconds);

    this.cache.set(key, {
      value,
      expireTime: expireDate,
    });
  }

  async cacheGet(key: string): Promise<string | null> {
    const token = this.cache.get(key);

    if (!token) {
      return null;
    }

    if (this.dateProvider.isBeforeNow(token.expireTime)) {
      this.cache.delete(key);
      return null;
    }

    return token.value;
  }

  async cacheDel(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async cacheFlushAll(): Promise<void> {
    this.cache.clear();
  }

  async cacheMultipleSet(refreshTokens: ICacheSet[]): Promise<void> {
    refreshTokens.forEach((refreshToken) => {
      const { key, value, expiresInSeconds } = refreshToken;

      const expireDate = new Date();

      expireDate.setSeconds(expireDate.getSeconds() + expiresInSeconds);

      this.cache.set(key, {
        value,
        expireTime: expireDate,
      });
    });
  }

  async cacheDeleteAllByPrefix(prefix: string): Promise<void> {
    const keys = Array.from(this.cache.keys());

    const keysToDelete = keys.filter((key) => key.startsWith(prefix));

    keysToDelete.forEach((key) => {
      this.cache.delete(key);
    });
  }

  async cacheGetAllByPrefix(prefix: string): Promise<string[]> {
    const keys = Array.from(this.cache.keys());

    const keysToGet = keys.filter((key) => key.startsWith(prefix));

    const values: string[] = [];

    keysToGet.forEach((key) => {
      const value = this.cache.get(key);

      if (!value) {
        return;
      }

      if (this.dateProvider.isBeforeNow(value.expireTime)) {
        this.cache.delete(key);
        return;
      }

      values.push(value.value);
    });

    return values;
  }

  async cacheDeleteAllBySuffix(suffix: string): Promise<void> {
    const keys = Array.from(this.cache.keys());

    const keysToDelete = keys.filter((key) => key.endsWith(suffix));

    keysToDelete.forEach((key) => {
      this.cache.delete(key);
    });
  }

  async cacheDisconnect(): Promise<void> {
    return;
  }
}

export { InMemoryCacheProvider };
