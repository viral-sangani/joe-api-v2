import express from "express";
import { tvl } from "./apis/tvl";
import { tvlPair } from "./apis/tvlPair";

const router = express.Router();

router.get("/tvl/:pair", tvlPair);
router.get("/tvl", tvl);

export default router;
