"use strict";

import express from "express";
import { totalBorrow, totalSupplyBankerJoe } from "./apis/v1/bankerjoe";
import { infos } from "./apis/v1/nft/hat";
import { noop } from "./apis/v1/noop";
import { derivedPriceOfToken, priceOfToken } from "./apis/v1/price";
import {
  circulatingSupply,
  circulatingSupplyAdjusted,
  maxSupply,
  totalSupply,
} from "./apis/v1/supply";

const router = express.Router();

router.get("/supply/circulating", circulatingSupply);
router.get("/supply/circulating-adjusted", circulatingSupplyAdjusted);
router.get("/supply/total", totalSupply);
router.get("/supply/max", maxSupply);
router.get("/nft/hat", infos);
router.get("/nft/hat/:id", infos);
router.get("/priceavax/:tokenAddress", derivedPriceOfToken);
router.get("/priceusd/:tokenAddress", priceOfToken);
router.get("/lending/supply", totalSupplyBankerJoe);
router.get("/lending/borrow", totalBorrow);
router.get("/", noop);

export default router;
