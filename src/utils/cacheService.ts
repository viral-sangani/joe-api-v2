/**
 * Cache services make sure that the cache is updated when the ttl expires.
 * The cache is updated by calling the corresponding methods and storing the response in the cache.
 */

import NodeCache from "node-cache";
import { getRawLendingData } from "../apis/v2/lending";
import { getPoolCachedData } from "../apis/v2/pools";
import { getStake } from "../apis/v2/stake";
import { getChainVolume } from "../core/tvl/graph";
import { staking } from "../core/tvl/staking";
import {
  cacheLendingDataKey,
  cachePoolDataKey,
  cacheStakeKey,
  cacheStakingTvlKey,
  cacheTvlLiquidityKey,
} from "./cacheConstants";
import { JOE_BAR, JOE_TOKEN } from "./constants";

export const updateCache = (cache: NodeCache) => {
  cache.on("expired", (key, value) => {
    switch (key) {
      case cacheStakeKey:
        getStake();
        break;

      case cacheLendingDataKey:
        getRawLendingData();
        break;

      case cachePoolDataKey:
        getPoolCachedData();
        break;

      case cacheTvlLiquidityKey:
        getChainVolume();
        break;

      case cacheStakingTvlKey:
        staking(JOE_BAR, JOE_TOKEN);

      default:
        break;
    }
    if (key.includes("pairs-")) {
    }
  });
};
