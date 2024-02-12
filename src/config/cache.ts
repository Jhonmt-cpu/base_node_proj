import { RedisOptions } from "ioredis";

const cacheOptions: { [key: string]: RedisOptions } = {
  test: {
    host: process.env.REDIS_CACHE_HOST_TEST,
    port: Number(process.env.REDIS_CACHE_PORT_TEST),
    password: process.env.REDIS_CACHE_PASSWORD_TEST,
    username: process.env.REDIS_CACHE_USER_TEST,
  },
  prod: {
    host: process.env.REDIS_CACHE_HOST,
    port: Number(process.env.REDIS_CACHE_PORT),
    password: process.env.REDIS_CACHE_PASSWORD,
    username: process.env.REDIS_CACHE_USER,
  },
};

const cachePrefixes = {
  rateLimiter: "rate_limiter",
  refreshToken: "refresh_token",
  listAllRolesPaginated: "list_all_roles_paginated",
  listAllGenders: "list_all_genders",
  listAllGendersPaginated: "list_all_genders_paginated",
  listAllStates: "list_all_states",
  listCitiesByState: "list_cities_by_state",
  listNeighborhoodsByCity: "list_neighborhoods_by_city",
  listAllUsersPaginated: "list_all_users_paginated",
  getUser: "get_user",
  getUserAddress: "get_user_address",
  getUserPhone: "get_user_phone",
  getUserComplete: "get_user_complete",
};

export { cacheOptions, cachePrefixes };
