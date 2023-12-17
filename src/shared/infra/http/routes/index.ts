import { Router } from "express";
import { userRouter } from "../../../../modules/users/infra/http/routes";

const router = Router();

router.use(userRouter)

router.get("/", (request, response) => {
  return response.json({ message: "Hello World" });
});

export { router };