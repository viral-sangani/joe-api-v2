import express from "express";
import { getLendingData, getLendingPairData } from "./apis/v2/lending";
import { getPairs, getSinglePair } from "./apis/v2/pairs";
import { getPools } from "./apis/v2/pools";
import { getSinglePool } from "./apis/v2/pools/index";
import { getStake } from "./apis/v2/stake";
import { getTvl } from "./apis/v2/tvl";

const router = express.Router();

/**
 * /tvl api provides the total TVL of traderjoe protocol.
 * The TVL is the addition of
 * 1) All the liquidity present in the pools
 * 2) All the staked joe tokens
 * 3) All the tokens present in lending protocol
 *
 * tvl = liquidity(USD) + staking(USD) + lending(USD)
 */
router.get("/tvl", getTvl);

/**
 * /stake api provides the total staked joe tokens.
 * This api returns all the staking details for Joe/xJoe token
 * incluing the data required to create historial graph
 */
router.get("/stake", getStake);

/**
 * /pairs returns the list of pairs and all the data related to them
 * including tokens, reserves, one day volume, seven day volume, fees, APR, et.
 *
 * /pairs/:pairId returns the data related to a single pair along with some extra data like
 * historical liquidity data, historical volume data, tx count, recent transactions, etc.
 */
router.get("/pairs/:id", getSinglePair);
router.get("/pairs", getPairs);

/**
 * /lending returns all the tokens present in the lending protocol
 * along with the total supply, total borrow, cash, reserves, liquidity, borrow rate, supply rate, exchange rate, etc.
 *
 * /lending/:tokenAddress returns the data related to a single token

 * all the reserves, supply, borrow, liquidity, etc are fetched from the compound contract
 */
router.get("/lending/:jToken", getLendingPairData);
router.get("/lending", getLendingData);

/**
 * /pools returns list of all the pools along with pairs, daily, weekly, monthly, yearly ROI, TVL, etc.
 *
 * /pools/:id returns the data related to a single pool along with historical data about
 * user count, age, balance, tvl, etc to create historical graphs
 *
 * Note: id is the pool id not the pair address
 */
router.get("/pool/:id", getSinglePool);
router.get("/pool", getPools);

export default router;
