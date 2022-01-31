import { gql, request } from "graphql-request";
import { cache } from "../../..";
import {
  cacheTvlLiquidityKey,
  cacheTvlLiquidityTTL,
} from "../../../utils/cacheConstants";
import { TRADER_JOE_GRAPH_EXCHANGE } from "../../../utils/constants";

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

// To get ID for daily data https://docs.uniswap.org/protocol/V2/reference/API/entities
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
    const totalVolumeQuery = gql`
  factories {
    volumeUSD
    liquidityUSD
  }
  `;

    const dailyVolumeQuery = gql`
  dayData (
    id: $id
  ) {
    volumeUSD
  }
  `;

    const graphQuery = gql`
    query get_volume($block: Int, $id: Int) {
  ${totalVolumeQuery}
  ${dailyVolumeQuery}
}
`;
    const graphUrl = TRADER_JOE_GRAPH_EXCHANGE;

    const id = getUniswapDateId();
    const graphRes = await request(graphUrl, graphQuery, {
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
