import "reflect-metadata";
import "dotenv/config";
import "express-async-errors";

import { app } from "./app";

app.listen(3333, () => console.log("Server is running!"));
