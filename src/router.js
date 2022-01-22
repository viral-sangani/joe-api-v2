import express from "express";
import { tvlPair } from "./apis/tvlPair";
import { tvl } from "./apis/tvlPairs";

const router = express.Router();

router.get("/tvl/pairs/:pair", tvlPair);
router.get("/tvl/pairs/", tvl);

export default router;
