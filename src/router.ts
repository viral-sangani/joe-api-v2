import express from "express";
import { getLendingData, getLendingPairData } from "./apis/v2/lending";
import { getTvl } from "./apis/v2/tvl";
import { getTvlPair } from "./apis/v2/tvlPair";
import { getTvlPairs } from "./apis/v2/tvlPairs";
import { getCompoundV2Tvl } from "./core/lending/compound";
import { JOE_COMPTROLLER } from "./utils/constants";

const router = express.Router();

router.get("/tvl/pairs/:pair", getTvlPair);
router.get("/tvl/pairs/", getTvlPairs);
router.get("/tvl/", getTvl);
router.get("/lending/:jToken", getLendingPairData);
router.get("/lending", getLendingData);
router.get("/test", async (req, res) => {
  const test = await getCompoundV2Tvl(JOE_COMPTROLLER);
  res.send(test);
});

export default router;
