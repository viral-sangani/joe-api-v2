import { utils } from "ethers";
import request from "graphql-request";
import { getTokenPrice } from "../../apis/v1/price";
import { getOneDayBlock } from "../../utils/block";
import {
  JOE_ADDRESS,
  TRADER_JOE_GRAPH_BAR,
  TRADER_JOE_GRAPH_EXCHANGE,
} from "../../utils/constants";
import { StakeDataProp } from "../../utils/types";
import {
  barHistoriesQuery,
  barQuery,
  dayDatasQuery,
  factoryQuery,
  factoryTimeTravelQuery,
} from "./query";

const FEE_RATE = 0.0005; // 0.05%

export const getStakeData = async (): Promise<StakeDataProp> => {
  const block = await getOneDayBlock();
  const [
    { bar },
    { histories },
    { factory },
    { factory: factoryTimeTravel },
    { dayDatas },
    joePriceWei,
  ] = await Promise.all([
    await request(TRADER_JOE_GRAPH_BAR, barQuery),
    await request(TRADER_JOE_GRAPH_BAR, barHistoriesQuery),
    await request(TRADER_JOE_GRAPH_EXCHANGE, factoryQuery),
    await request(TRADER_JOE_GRAPH_EXCHANGE, factoryTimeTravelQuery, { block }),
    await request(TRADER_JOE_GRAPH_EXCHANGE, dayDatasQuery),
    await getTokenPrice(JOE_ADDRESS.toLocaleLowerCase()),
  ]);
  let joePrice = parseFloat(utils.formatUnits(joePriceWei, 18));
  const {
    joeStakedUSD,
    joeHarvestedUSD,
    xJoeMinted,
    xJoeBurned,
    xJoe,
    apr,
    apy,
    fees,
  } = histories.reduce(
    (previousValue, currentValue) => {
      const date = currentValue.date * 1000;
      const dayData = dayDatas.find((d) => d.date === currentValue.date);
      previousValue["joeStakedUSD"].push({
        date,
        value: parseFloat(currentValue.joeStakedUSD),
      });
      previousValue["joeHarvestedUSD"].push({
        date,
        value: parseFloat(currentValue.joeHarvestedUSD),
      });

      previousValue["xJoeMinted"].push({
        date,
        value: parseFloat(currentValue.xJoeMinted),
      });
      previousValue["xJoeBurned"].push({
        date,
        value: parseFloat(currentValue.xJoeBurned),
      });
      previousValue["xJoe"].push({
        date,
        value: parseFloat(currentValue.xJoeSupply),
      });
      const apr =
        (((dayData?.volumeUSD * FEE_RATE) / currentValue.xJoeSupply) * 365) /
        (currentValue.ratio * joePrice);
      previousValue["apr"].push({
        date,
        value: apr * 100,
      });
      previousValue["apy"].push({
        date,
        value: (Math.pow(1 + apr / 365, 365) - 1) * 100,
      });
      previousValue["fees"].push({
        date,
        value: dayData?.volumeUSD * FEE_RATE,
      });
      return previousValue;
    },
    {
      joeStakedUSD: [],
      joeHarvestedUSD: [],
      xJoeMinted: [],
      xJoeBurned: [],
      xJoe: [],
      apr: [],
      apy: [],
      fees: [],
    }
  );
  const averageApy =
    apy.reduce((prevValue, currValue) => {
      return prevValue + (currValue.value || 0);
    }, 0) / apy.length;

  // get last day volume and APY
  const oneDayVolume = factory?.volumeUSD - factoryTimeTravel.volumeUSD;
  const oneDayFees = oneDayVolume * FEE_RATE;
  const totalStakedUSD = bar.joeStaked * joePrice;

  const APR = (oneDayFees * 365) / totalStakedUSD;
  const APY = Math.pow(1 + APR / 365, 365) - 1;
  return {
    averageApy,
    oneDayVolume,
    oneDayFees,
    totalStakedUSD,
    totalApr: APR,
    totalApy: APY,
    joeStakedUSD,
    joeHarvestedUSD,
    xJoeMinted,
    xJoeBurned,
    xJoe,
    apr,
    apy,
    fees,
  };
};
