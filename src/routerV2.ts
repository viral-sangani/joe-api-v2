import express from "express";
import { getLendingData, getLendingPairData } from "./apis/v2/lending";
import { getPairs, getSinglePair } from "./apis/v2/pairs";
import { getPools } from "./apis/v2/pools";
import { getSinglePool } from "./apis/v2/pools/index";
import { getStake } from "./apis/v2/stake";
import { getTvl } from "./apis/v2/tvl";
import { getCompoundV2Tvl } from "./core/lending/compound";
import { JOE_COMPTROLLER } from "./utils/constants";

const router = express.Router();

router.get("/tvl", getTvl);

router.get("/stake", getStake);

router.get("/pairs/:id", getSinglePair);
router.get("/pairs", getPairs);

router.get("/lending/:jToken", getLendingPairData);
router.get("/lending", getLendingData);

router.get("/pool/:id", getSinglePool);
router.get("/pool", getPools);

router.get("/test", async (req, res) => {
  const test = await getCompoundV2Tvl(JOE_COMPTROLLER);
  res.send(test);
});

export default router;
