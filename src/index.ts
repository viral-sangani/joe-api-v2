"use strict";

import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import NodeCache from "node-cache";
import { rt } from "./middleware/rt";
import routerV1 from "./routerV1";
import routerV2 from "./routerV2";
import { updateCache } from "./utils/cacheService";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

dotenv.config();

const app = express();

/**
 * Cache service is initialized here with TTL of 30 minutes and check peridocity of 10 minutes
 * Checkperiod is used to determine if the cache needs to be updated
 * TTL is used to determine how long the cache should be valid for
 * @type {NodeCache}
 *
 * updateCache() is a listner that is used to update the cache when the cache is expired
 * It is called by the cache service when the cache is expired
 */
export const cache = new NodeCache({
  stdTTL: 60 * 30,
  checkperiod: 60 * 10,
});
updateCache(cache);

// Middleware
app.use(helmet());
app.use(limiter);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors({ origin: "*" }));
app.use(rt);

// Routes
/**
 * Routes for version 1 of the API (backward compatibility) i.e joe-api - https://github.com/traderjoe-xyz/joe-api
 */
app.use("/v1", routerV1);

/**
 * Routes for version 2 of the API i.e joe-api-v2 - https://github.com/viral-sangani/joe-api-v2
 */
app.use("/v2", routerV2);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  return console.log(`Server is listening at Port - ${PORT}`);
});
