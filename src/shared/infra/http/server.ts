import "reflect-metadata";
import "dotenv/config";
import "express-async-errors";

import { container } from "tsyringe";
import { scheduleJob } from "node-schedule";

import { SynchronizeCacheUseCase } from "@modules/auth/useCases/SynchronizeCache/SynchronizeCacheUseCase";

import { app } from "./app";

app.listen(3333, () => console.log("Server is running!"));

scheduleJob("0 0 * * *", async () => {
  console.log("Synchronizing cache");

  const synchronizeRefreshTokensUseCase = container.resolve(
    SynchronizeCacheUseCase,
  );

  await synchronizeRefreshTokensUseCase.execute();

  console.log("Cache synchronized");
});
