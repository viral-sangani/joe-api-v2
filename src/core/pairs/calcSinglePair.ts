import { BigNumber, utils } from "ethers";
import request from "graphql-request";
import getReserves from "../../abis/getReserves.json";
import { getTokenPrice } from "../../apis/v1/price";
import { multiCall } from "../../sdk";
import {
  getOneDayBlock,
  getSevenDayBlock,
  getTwoDayBlock,
} from "../../utils/block";
import {
  TRADER_JOE_GRAPH_EXCHANGE,
  WAVAX_ADDRESS,
} from "../../utils/constants";
import {
  pairDayDatasQuery,
  pairQuery,
  pairTimeTravelQuery,
  transactionsQuery,
} from "./query";

export async function calculatePairTvl(
  chain: string,
  pairAddress: string,
  pairData?: any
) {
  if (pairData == undefined) {
    let pairAddressData: any = {};
    var data = await request(TRADER_JOE_GRAPH_EXCHANGE, pairQuery, {
      id: pairAddress,
    });

    const oneDayBlock = await getOneDayBlock();
    const twoDayBlock = await getTwoDayBlock();
    const sevenDayBlock = await getSevenDayBlock();

    var { pair: oneDayPair } = await request(
      TRADER_JOE_GRAPH_EXCHANGE,
      pairTimeTravelQuery,
      {
        block: oneDayBlock,
        id: pairAddress,
      }
    );
    var { pair: twoDayPair } = await request(
      TRADER_JOE_GRAPH_EXCHANGE,
      pairTimeTravelQuery,
      {
        block: twoDayBlock,
        id: pairAddress,
      }
    );
    var { pair: sevenDayPair } = await request(
      TRADER_JOE_GRAPH_EXCHANGE,
      pairTimeTravelQuery,
      {
        block: sevenDayBlock,
        id: pairAddress,
      }
    );

    const [reserves] = await Promise.all([
      multiCall({
        abi: getReserves,
        chain,
        calls: [{ target: pairAddress }],
        requery: true,
      }).then(({ output }) => output),
    ]);

    let pair = data.pair;

    pairAddressData.pairAddress = pairAddress;
    pairAddressData.token0 = {
      address: pair.token0.id,
      name: pair.token0.name,
      symbol: pair.token0.symbol,
      decimals: pair.token0.decimals,
      price: pair.token0Price,
    };
    pairAddressData.token1 = {
      address: pair.token1.id,
      name: pair.token1.name,
      symbol: pair.token1.symbol,
      decimals: pair.token1.decimals,
      price: pair.token1Price,
    };

    pairAddressData.reserveUSD = pair.reserveUSD;

    // handle reserve0
    pairAddressData.reserve0 = utils.formatUnits(
      BigNumber.from(reserves[0].output["0"]),
      pairAddressData.token0.decimals
    );
    pairAddressData.reserve1 = utils.formatUnits(
      BigNumber.from(reserves[0].output["1"]),
      pairAddressData.token1.decimals
    );

    pairAddressData.oneDay = {
      untrackedVolumeUSD: String(oneDayPair?.untrackedVolumeUSD),
      volumeUSD: String(oneDayPair?.volumeUSD),
      reserveUSD: String(oneDayPair?.reserveUSD),
      txCount: String(oneDayPair?.txCount),
    };

    pairAddressData.sevenDay = {
      untrackedVolumeUSD: String(sevenDayPair?.untrackedVolumeUSD),
      volumeUSD: String(sevenDayPair?.volumeUSD),
      reserveUSD: String(sevenDayPair?.reserveUSD),
      txCount: String(sevenDayPair?.txCount),
    };

    const volumeUSD =
      pair?.volumeUSD === "0" ? pair?.untrackedVolumeUSD : pair?.volumeUSD;

    const oneDayVolumeUSD =
      pairAddressData.oneDay?.volumeUSD === "0"
        ? pairAddressData.oneDay?.untrackedVolumeUSD
        : pairAddressData.oneDay?.volumeUSD;

    const sevenDayVolumeUSD =
      pairAddressData.sevenDay?.volumeUSD === "0"
        ? pairAddressData.sevenDay?.untrackedVolumeUSD
        : pairAddressData.sevenDay?.volumeUSD;

    const FEE_RATE = 0.0025;
    const oneDayVolume = volumeUSD - oneDayVolumeUSD;
    const oneDayFees = oneDayVolume * FEE_RATE;
    const oneYearFeesAPR = (oneDayFees * 365 * 100) / pair?.reserveUSD;
    const sevenDayVolume = volumeUSD - sevenDayVolumeUSD;
    const sevenDayFees = sevenDayVolume * FEE_RATE;
    pairAddressData.displayName = `${pair.token0.symbol.replace(
      "WETH",
      "ETH"
    )}-${pair.token1.symbol.replace("WETH", "ETH")}`;
    pairAddressData.oneDayVolume = !Number.isNaN(oneDayVolume)
      ? oneDayVolume
      : 0;
    pairAddressData.sevenDayVolume = !Number.isNaN(sevenDayVolume)
      ? sevenDayVolume
      : 0;
    pairAddressData.oneDayFees = !Number.isNaN(oneDayFees) ? oneDayFees : 0;
    pairAddressData.sevenDayFees = !Number.isNaN(sevenDayFees)
      ? sevenDayFees
      : 0;
    pairAddressData.oneYearFeesAPR = oneYearFeesAPR;
    pairAddressData;
    pairData = pairAddressData;
  }

  pairData.twoDay = {
    untrackedVolumeUSD: String(twoDayPair?.untrackedVolumeUSD),
    volumeUSD: String(twoDayPair?.volumeUSD),
    reserveUSD: String(twoDayPair?.reserveUSD),
    txCount: String(twoDayPair?.txCount),
  };

  // Getting pair only data

  var { pairDayDatas } = await request(
    TRADER_JOE_GRAPH_EXCHANGE,
    pairDayDatasQuery,
    {
      pairs: [pairAddress],
    }
  );

  var transactionsQueryData = await request(
    TRADER_JOE_GRAPH_EXCHANGE,
    transactionsQuery,
    {
      pairAddresses: [pairAddress],
    }
  );

  const volumeUSD =
    pairData?.volumeUSD === "0"
      ? pairData?.untrackedVolumeUSD
      : pairData?.volumeUSD;

  const oneDayVolumeUSD =
    pairData?.oneDay?.volumeUSD === "0"
      ? pairData?.oneDay?.untrackedVolumeUSD
      : pairData?.oneDay?.volumeUSD;

  const twoDayVolumeUSD =
    pairData?.twoDay?.volumeUSD === "0"
      ? pairData?.twoDay?.untrackedVolumeUSD
      : pairData?.twoDay?.volumeUSD;

  const volume = volumeUSD - oneDayVolumeUSD;

  const volumeYesterday = oneDayVolumeUSD - twoDayVolumeUSD;

  const volumeChange = ((volume - volumeYesterday) / volumeYesterday) * 100;

  const FEE_RATE = 0.0025;

  const fees = volume * FEE_RATE;

  const feesYesterday = volumeYesterday * FEE_RATE;

  const avgTradePrice =
    volume / (pairData?.txCount - pairData?.oneDay?.txCount);

  const avgTradePriceYesturday =
    volumeYesterday / (pairData?.oneDay?.txCount - pairData?.twoDay?.txCount);

  const avgTradePriceChange =
    ((avgTradePrice - avgTradePriceYesturday) / avgTradePriceYesturday) * 100;

  const utilisation = (volume / pairData.reserveUSD) * 100;

  const utilisationYesterday =
    (volumeYesterday / pairData.oneDay.reserveUSD) * 100;

  const utilisationChange =
    ((utilisation - utilisationYesterday) / utilisationYesterday) * 100;

  const tx = pairData.txCount - pairData.oneDay.txCount;

  const txYesterday = pairData.oneDay.txCount - pairData.twoDay.txCount;

  const txChange = ((tx - txYesterday) / txYesterday) * 100;
  const avaxPrice = await getTokenPrice(WAVAX_ADDRESS);

  const chartDatas = pairDayDatas.reduce(
    (previousValue, currentValue) => {
      const untrackedVolumeUSD =
        currentValue?.token0.derivedAVAX * currentValue?.volumeToken0 +
        currentValue?.token1.derivedAVAX *
          currentValue?.volumeToken1 *
          avaxPrice;

      const volumeUSD =
        currentValue?.volumeUSD === "0"
          ? untrackedVolumeUSD
          : currentValue?.volumeUSD;

      previousValue["liquidity"].unshift({
        date: currentValue.date,
        value: parseFloat(currentValue.reserveUSD),
      });
      previousValue["volume"].unshift({
        date: currentValue.date,
        value: parseFloat(volumeUSD),
      });
      return previousValue;
    },
    { liquidity: [], volume: [] }
  );

  // console.log("pairDayData", pairDayData);
  // console.log("transactionsQueryData", transactionsQueryData);

  var transactionData = [
    ...transactionsQueryData.swaps,
    ...transactionsQueryData.mints,
    ...transactionsQueryData.burns,
  ].map((transaction) => {
    if (transaction.__typename === "Swap") {
      return {
        ...transaction,
        amount0:
          transaction.amount0In === "0"
            ? transaction.amount1In
            : transaction.amount0In,
        amount1:
          transaction.amount1Out === "0"
            ? transaction.amount0Out
            : transaction.amount1Out,
      };
    }

    return transaction;
  });

  return {
    ...pairData,
    chartDatas,
    fees,
    feesYesterday,

    avgTradePrice,
    avgTradePriceYesturday,
    avgTradePriceChange,

    utilisation,
    utilisationYesterday,
    utilisationChange,

    tx,
    txYesterday,
    txChange,

    volume,
    volumeUSD,
    volumeYesterday,
    volumeChange,

    oneDayVolumeUSD,
    twoDayVolumeUSD,
    transactionData,
  };
}
