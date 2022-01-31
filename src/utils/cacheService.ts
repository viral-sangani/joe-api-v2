import NodeCache from "node-cache";
import { getRawLendingData } from "../apis/v2/lending";
import { getPoolCachedData } from "../apis/v2/pools";
import { getStake } from "../apis/v2/stake";
import { getChainVolume } from "../apis/v2/tvl/getSubgraphVolume";
import { staking } from "../apis/v2/tvl/staking";
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
