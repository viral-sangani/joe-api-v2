import express from "express";
import { tvl } from "./apis/v2/tvl";
import { tvlPair } from "./apis/v2/tvlPair";
import { tvlPairs } from "./apis/v2/tvlPairs";

const router = express.Router();

router.get("/tvl/pairs/:pair", tvlPair);
router.get("/tvl/pairs/", tvlPairs);
router.get("/tvl/", tvl);

export default router;
