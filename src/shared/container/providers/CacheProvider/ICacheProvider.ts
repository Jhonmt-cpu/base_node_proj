type ICacheSet = {
  key: string;
  value: string;
  expiresInSeconds: number;
};

type ICacheProvider = {
  cacheSet({ key, value, expiresInSeconds }: ICacheSet): Promise<void>;
  cacheGet(key: string): Promise<string | null>;
  cacheDel(key: string): Promise<void>;
  cacheFlushAll(): Promise<void>;
  cacheMultipleSet(refreshTokens: ICacheSet[]): Promise<void>;
  cacheDeleteAllByPrefix(prefix: string): Promise<void>;
  cacheGetAllByPrefix(prefix: string): Promise<string[]>;
  cacheDeleteAllBySuffix(suffix: string): Promise<void>;
  cacheDisconnect(): Promise<void>;
};

export { ICacheProvider, ICacheSet };
