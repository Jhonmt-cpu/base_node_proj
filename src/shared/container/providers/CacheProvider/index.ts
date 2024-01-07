import { container } from "tsyringe";
import { RedisCacheProvider } from "./implementations/RedisCacheProvider";
import { ICacheProvider } from "./ICacheProvider";

container.registerSingleton<ICacheProvider>(
  "CacheProvider",
  RedisCacheProvider,
);
