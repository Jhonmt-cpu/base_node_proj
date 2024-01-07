import { Router } from "express";

import { accountRouter } from "@modules/account/infra/http/routes";
import { authRouter } from "@modules/auth/infra/http/routes";

const router = Router();

router.use("/account", accountRouter);

router.use("/auth", authRouter);

router.get("/", (request, response) => {
  return response.json({ message: "Hello World" });
});

export { router };
