import { request } from "graphql-request";
import { cache } from "../..";
import {
  cacheTvlLiquidityKey,
  cacheTvlLiquidityTTL,
} from "../../utils/cacheConstants";
import { TRADER_JOE_GRAPH_EXCHANGE } from "../../utils/constants";
import { graphQuery } from "./query";

export const getUniqStartOfTodayTimestamp = (date = new Date()) => {
  var date_utc = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds()
  );
  var startOfDay = new Date(date_utc);
  var timestamp: any = startOfDay.getTime() / 1000;
  return Math.floor(timestamp / 86400) * 86400;
};

const getUniswapDateId = () => getUniqStartOfTodayTimestamp() / 86400;

export const getChainVolume = async (): Promise<{
  totalVolume: string;
  liquidityUSD: string;
  dailyVolume: string;
}> => {
  let allLiquidity:
    | { totalVolume: string; liquidityUSD: string; dailyVolume: string }
    | undefined = cache.get(cacheTvlLiquidityKey);
  if (allLiquidity == null || allLiquidity == undefined) {
    const id = getUniswapDateId();
    const graphRes = await request(TRADER_JOE_GRAPH_EXCHANGE, graphQuery, {
      id,
    });

    allLiquidity = {
      totalVolume: parseInt(graphRes["factories"][0]["volumeUSD"]).toFixed(2),
      liquidityUSD: parseInt(graphRes["factories"][0]["liquidityUSD"]).toFixed(
        2
      ),
      dailyVolume:
        parseInt(graphRes?.["dayData"]?.["volumeUSD"] || "0").toFixed(2) ??
        undefined,
    };
    cache.set(cacheTvlLiquidityKey, allLiquidity, cacheTvlLiquidityTTL);
  }
  return allLiquidity;
};
