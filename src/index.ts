"use strict";

import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import NodeCache from "node-cache";
import { rt } from "./middleware/rt";
import routerV1 from "./routerV1";
import routerV2 from "./routerV2";
import { updateCache } from "./utils/cacheService";

dotenv.config();

const app = express();

export const cache = new NodeCache({
  stdTTL: 60 * 30,
  checkperiod: 10,
});
updateCache(cache);

app.use(helmet());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors({ origin: "*" }));
app.use(rt);

app.use("/v1", routerV1);
app.use("/v2", routerV2);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  return console.log(`Express is listening at Port - ${PORT}`);
});
