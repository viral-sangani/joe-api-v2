import { BigNumber, utils } from "ethers";
import request from "graphql-request";
import { cache } from "../..";
import getReserves from "../../abis/getReserves.json";
import { multiCall } from "../../sdk";
import { getOneDayBlock, getSevenDayBlock } from "../../utils/block";
import { cacheSinglePairTTL } from "../../utils/cacheConstants";
import { TRADER_JOE_GRAPH_EXCHANGE } from "../../utils/constants";
import { pairsQuery, pairsTimeTravelQuery } from "./query";

/**
 * Fetches all the pair data from the graphql endpoint
 * reserves are fetches in real time from the trader joe contract
 *
 * @param first
 * @param skip
 */
export async function getAllPairsData(first: number, skip: number) {
  // const pairLength = (
  //   await call({
  //     target: FACTORY,
  //     abi: factoryAbi.allPairsLength,
  //   })
  // ).output;
  // if (pairLength === null) {
  //   throw new Error("allPairsLength() failed");
  // }
  // const pairNums = Array.from(Array(Number(10)).keys());
  // const pairNums = Array.from(Array(Number(pairLength)).keys());

  const pairs: any = [];
  var data = await request(TRADER_JOE_GRAPH_EXCHANGE, pairsQuery, {
    first,
    skip,
  });

  var allPairs: string[] = [];
  var dataToFetch: string[] = [];

  data.pairs.forEach((pair) => {
    allPairs.push(pair.id);
  });

  allPairs.forEach((pairAddress) => {
    let pairData: any[] | undefined = cache.get(`pairs-${pairAddress}`);
    if (pairData == undefined) {
      dataToFetch.push(pairAddress);
    } else {
      pairs.push(pairData);
    }
  });
  data.pairs = data.pairs.filter((pair) => dataToFetch.includes(pair.id));

  if (dataToFetch.length > 0) {
    const oneDayBlock = await getOneDayBlock();
    const sevenDayBlock = await getSevenDayBlock();

    var { pairs: oneDayPairs } = await request(
      TRADER_JOE_GRAPH_EXCHANGE,
      pairsTimeTravelQuery,
      {
        block: oneDayBlock,
        pairAddresses: dataToFetch,
      }
    );

    var { pairs: sevenDayPairs } = await request(
      TRADER_JOE_GRAPH_EXCHANGE,
      pairsTimeTravelQuery,
      {
        block: sevenDayBlock,
        pairAddresses: dataToFetch,
      }
    );

    const [reserves] = await Promise.all([
      multiCall({
        abi: getReserves,
        calls: dataToFetch.map((pairAddress) => ({
          target: pairAddress,
        })),
        requery: true,
      }).then(({ output }) => output),
    ]);

    for (let i = 0; i < data.pairs.length; i++) {
      let pair = data.pairs[i];
      const pairAddress = pair.id;

      let pairAddressData: any = {};
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

      let oneDayPair = oneDayPairs.find((pair) => pair.id === pairAddress);
      pairAddressData.oneDay = {
        untrackedVolumeUSD: String(oneDayPair?.untrackedVolumeUSD),
        volumeUSD: String(oneDayPair?.volumeUSD),
        reserveUSD: String(oneDayPair?.reserveUSD),
        txCount: String(oneDayPair?.txCount),
      };

      let sevenDayPair = sevenDayPairs.find((pair) => pair.id === pairAddress);
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
      cache.set(`pairs-${pairAddress}`, pairAddressData, cacheSinglePairTTL);
      pairs.push(pairAddressData);
    }
  }

  return pairs;
}
