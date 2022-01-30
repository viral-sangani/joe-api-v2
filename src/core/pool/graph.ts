import { utils } from "ethers";
import { request } from "graphql-request";
import { getTokenPrice } from "../../apis/v1/price";
import {
  JOE_TOKEN,
  MASTERCHEF_ADDRESS,
  TRADER_JOE_GRAPH_EXCHANGE,
  TRADER_JOE_GRAPH_MASTERCHEF,
} from "../../utils/constants";
import { Pools } from "../../utils/types";
import {
  liquidityPositionSubsetQuery,
  pairSubsetQuery,
  poolHistoryQuery,
  poolsQuery,
} from "./query";

const FARMS_BLACKLIST = [
  "35", // JOEBORROW
  "36", // JOELDN
];

export const getPoolsData = async () => {
  const { pools } = await request(TRADER_JOE_GRAPH_MASTERCHEF, poolsQuery);

  const pairAddresses = pools
    .map((pool) => {
      return pool.pair;
    })
    .sort();

  const { pairs } = await request(TRADER_JOE_GRAPH_EXCHANGE, pairSubsetQuery, {
    pairAddresses,
  });

  const joePrice = await getTokenPrice(JOE_TOKEN);

  const { liquidityPositions } = await request(
    TRADER_JOE_GRAPH_EXCHANGE,
    liquidityPositionSubsetQuery,
    {
      user: MASTERCHEF_ADDRESS,
    }
  );
  var data = pools
    .filter(
      (pool) =>
        !FARMS_BLACKLIST.includes(pool.id) &&
        pool.allocPoint !== "0" &&
        pool.accJoePerShare !== "0" &&
        pairs.find((pair) => pair?.id === pool.pair)
    )
    .map((pool) => {
      const pair = pairs.find((pair) => pair.id === pool.pair);
      // JOE rewards issued per sec
      const balance =
        Number(pool.balance / 1e18) > 0 ? Number(pool.balance / 1e18) : 0.1;
      const totalSupply = pair.totalSupply > 0 ? pair.totalSupply : 0.1;
      const reserveUSD = pair.reserveUSD > 0 ? pair.reserveUSD : 0.1;
      const balanceUSD = (balance / Number(totalSupply)) * Number(reserveUSD);
      const rewardPerSec =
        ((pool.allocPoint / pool.owner.totalAllocPoint) *
          pool.owner.joePerSec) /
        2 /
        1e18;

      // calc yields
      const roiPerSec =
        (rewardPerSec * parseFloat(utils.formatUnits(joePrice, 18))) /
        balanceUSD;
      const roiPerHour = roiPerSec * 60 * 60;
      const roiPerDay = roiPerHour * 24;
      const roiPerMonth = roiPerDay * 30;
      const roiPerYear = roiPerMonth * 12;

      // TVL
      const liquidityPosition = liquidityPositions.find(
        (liquidityPosition: { pair: { id: any } }) =>
          liquidityPosition.pair.id === pair.id
      );

      return {
        ...pool,
        liquidityPair: pair,
        rewardPerSec,
        roiPerHour,
        roiPerDay,
        roiPerMonth,
        roiPerYear,
        tvl: pair.reserveUSD,
      };
    });
  return data;
};

export const getPoolHistories = async (id: string, pool: Pools) => {
  const { poolHistories } = await request(
    TRADER_JOE_GRAPH_MASTERCHEF,
    poolHistoryQuery,
    {
      id,
    }
  );
  const {
    slpAge,
    slpAgeRemoved,
    userCount,
    slpDeposited,
    slpWithdrawn,
    slpAgeAverage,
    slpBalance,
    tvl,
  } = poolHistories.reduce(
    (previousValue, currentValue) => {
      const date = currentValue.timestamp * 1000;

      previousValue.slpAge.push({
        date,
        value: currentValue.slpAge,
      });

      const slpAgeAverage =
        parseFloat(currentValue.slpAge) / parseFloat(currentValue.slpBalance);

      previousValue.slpAgeAverage.push({
        date,
        value: !Number.isNaN(slpAgeAverage) ? slpAgeAverage : 0,
      });

      previousValue.slpAgeRemoved.push({
        date,
        value: currentValue.slpAgeRemoved,
      });

      previousValue.slpBalance.push({
        date,
        value: parseFloat(currentValue.slpBalance),
      });

      previousValue.slpDeposited.push({
        date,
        value: parseFloat(currentValue.slpDeposited),
      });

      previousValue.slpWithdrawn.push({
        date,
        value: parseFloat(currentValue.slpWithdrawn),
      });

      previousValue.tvl.push({
        date,
        value:
          (parseFloat(pool.liquidityPair.reserveUSD) /
            parseFloat(pool.liquidityPair.totalSupply)) *
          parseFloat(currentValue.slpBalance),
      });

      previousValue.userCount.push({
        date,
        value: parseFloat(currentValue.userCount),
      });

      return previousValue;
    },
    {
      entries: [],
      exits: [],
      slpAge: [],
      slpAgeAverage: [],
      slpAgeRemoved: [],
      slpBalance: [],
      slpDeposited: [],
      slpWithdrawn: [],
      tvl: [],
      userCount: [],
    }
  );
  return {
    slpAge,
    slpAgeRemoved,
    userCount,
    slpDeposited,
    slpWithdrawn,
    slpAgeAverage,
    slpBalance,
    tvl,
  };
};
