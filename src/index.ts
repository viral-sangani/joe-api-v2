"use strict";

import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { rt } from "./middleware/rt";
import router from "./router";

const app = express();

app.use(helmet());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors({ origin: "*" }));
app.use(rt);

app.use(router);

const port = 3000;

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
