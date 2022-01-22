import BigNumber from "bignumber.js";
import { cache } from "../..";
import decimal from "../../abis/decimals.json";
import getReserves from "../../abis/getReserves.json";
import name from "../../abis/name.json";
import symbol from "../../abis/symbol.json";
import token0 from "../../abis/token0.json";
import token1 from "../../abis/token1.json";
import { multiCall } from "../../sdk";

export async function calculatePairTvl(
  getAddress: (addr: string) => string,
  chain: string,
  block: number,
  pairAddress: string
) {
  let pairData = cache.get(pairAddress);
  if (pairData != null || pairData != undefined) {
    // Found in cache
    return { [pairAddress]: pairData };
  }
  const [token0Addresses, token1Addresses, reserves] = await Promise.all([
    multiCall({
      abi: token0,
      chain,
      calls: [{ target: pairAddress }],
      block,
      requery: true,
    }).then(({ output }) => output),

    multiCall({
      abi: token1,
      chain,
      calls: [{ target: pairAddress }],
      block,
      requery: true,
    }).then(({ output }) => output),

    multiCall({
      abi: getReserves,
      chain,
      calls: [{ target: pairAddress }],
      block,
      requery: true,
    }).then(({ output }) => output),
  ]);

  const pairs: any = {};
  // add token0Addresses
  token0Addresses.forEach((token0Address) => {
    const tokenAddress = token0Address.output.toLowerCase();

    const pairAddress: string = token0Address.input.target.toLowerCase();
    pairs[pairAddress] = {
      token0: tokenAddress,
    };
  });

  // add token1Addresses
  token1Addresses.forEach((token1Address) => {
    const tokenAddress = token1Address.output.toLowerCase();
    const pairAddress = token1Address.input.target.toLowerCase();
    pairs[pairAddress] = {
      ...(pairs[pairAddress] || {}),
      token1: tokenAddress,
    };
  });

  const [symbols, decimals, names] = await Promise.all([
    multiCall({
      abi: symbol,
      chain: "avax",
      calls: [
        { target: pairs[pairAddress].token0 },
        { target: pairs[pairAddress].token1 },
      ],
      requery: true,
    }).then(({ output }) => output),
    multiCall({
      abi: decimal,
      chain: "avax",
      calls: [
        { target: pairs[pairAddress].token0 },
        { target: pairs[pairAddress].token1 },
      ],
      requery: true,
    }).then(({ output }) => output),
    multiCall({
      abi: name,
      chain: "avax",
      calls: [
        { target: pairs[pairAddress].token0 },
        { target: pairs[pairAddress].token1 },
      ],
      requery: true,
    }).then(({ output }) => output),
  ]);

  reserves.forEach((reserve, i) => {
    const pairAddress = reserve.input.target.toLowerCase();
    const pair = pairs[pairAddress] || {};

    // handle reserve0
    if (pair.token0) {
      const reserve0 = new BigNumber(reserve.output["0"]);
      if (!reserve0.isZero()) {
        pairs[pairAddress].reserve0 = reserve0;
      }
    }

    // handle reserve1
    if (pair.token1) {
      const reserve1 = new BigNumber(reserve.output["1"]);
      if (!reserve1.isZero()) {
        pairs[pairAddress].reserve1 = reserve1;
      }
    }

    // Add Symbols
    pairs[pairAddress].token0Symbol = symbols[0].output;
    pairs[pairAddress].token1Symbol = symbols[1].output;

    // Add Decimals
    pairs[pairAddress].token0Decimal = decimals[0].output;
    pairs[pairAddress].token1Decimal = decimals[1].output;
    cache.set(pairAddress, pairs[pairAddress], 600);
  }, {});

  return pairs;
}
