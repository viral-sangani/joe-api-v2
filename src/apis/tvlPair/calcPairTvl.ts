import BigNumber from "bignumber.js";
import getReserves from "../../abis/getReserves.json";
import token0 from "../../abis/token0.json";
import token1 from "../../abis/token1.json";
import { multiCall } from "../../sdk";

export async function calculatePairTvl(
  getAddress: (addr: string) => string,
  chain: string,
  block: number,
  pairAddress: string
) {
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
      token0Address: tokenAddress,
    };
  });

  // add token1Addresses
  token1Addresses.forEach((token1Address) => {
    const tokenAddress = token1Address.output.toLowerCase();
    const pairAddress = token1Address.input.target.toLowerCase();
    pairs[pairAddress] = {
      ...(pairs[pairAddress] || {}),
      token1Address: tokenAddress,
    };
  });

  const balances = reserves.reduce((accumulator, reserve, i) => {
    const pairAddress = reserve.input.target.toLowerCase();
    const pair = pairs[pairAddress] || {};

    // handle reserve0
    if (pair.token0Address) {
      const reserve0 = new BigNumber(reserve.output["0"]);
      if (!reserve0.isZero()) {
        const existingBalance = new BigNumber(
          accumulator[pair.token0Address] || "0"
        );

        accumulator[pair.token0Address] = existingBalance
          .plus(reserve0)
          .toFixed();
      }
    }

    // handle reserve1
    if (pair.token1Address) {
      const reserve1 = new BigNumber(reserve.output["1"]);

      if (!reserve1.isZero()) {
        const existingBalance = new BigNumber(
          accumulator[pair.token1Address] || "0"
        );

        accumulator[pair.token1Address] = existingBalance
          .plus(reserve1)
          .toFixed();
      }
    }

    return accumulator;
  }, {});

  return balances;
}
