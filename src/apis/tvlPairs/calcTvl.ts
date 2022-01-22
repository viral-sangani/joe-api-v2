import BigNumber from "bignumber.js";
import { cache } from "../..";
import decimals from "../../abis/decimals.json";
import factoryAbi from "../../abis/factory.json";
import getReserves from "../../abis/getReserves.json";
import symbol from "../../abis/symbol.json";
import token0 from "../../abis/token0.json";
import token1 from "../../abis/token1.json";
import { multiCall } from "../../sdk";

export async function calculateUniTvl(
  getAddress: (addr: string) => string,
  chain: string,
  FACTORY: string,
  pairsList: number[]
) {
  let pairAddresses;

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
  const pairs: any = {};
  const pairsAddress = (
    await multiCall({
      abi: factoryAbi.allPairs,
      chain,
      calls: pairsList.map((num) => ({
        target: FACTORY,
        params: [num],
      })),
      requery: true,
    })
  ).output;
  pairAddresses = pairsAddress.map((result) => result.output.toLowerCase());
  var dataToFetch: string[] = [];

  pairAddresses.forEach((address) => {
    var pairData = cache.get(address);
    if (pairData != null || pairData != undefined) {
      // Found in cache
      pairs[address] = pairData;
    } else {
      // Not found in cache
      dataToFetch.push(address);
    }
  });

  const [token0Addresses, token1Addresses, reserves] = await Promise.all([
    multiCall({
      abi: token0,
      chain,
      calls: dataToFetch.map((pairAddress) => ({
        target: pairAddress,
      })),
      requery: true,
    }).then(({ output }) => output),

    multiCall({
      abi: token1,
      chain,
      calls: dataToFetch.map((pairAddress) => ({
        target: pairAddress,
      })),
      requery: true,
    }).then(({ output }) => output),

    multiCall({
      abi: getReserves,
      chain,
      calls: dataToFetch.map((pairAddress) => ({
        target: pairAddress,
      })),
      requery: true,
    }).then(({ output }) => output),
  ]);

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
  const [token0Symbols, token0Decimals, token1Symbols, token1Decimals] =
    await Promise.all([
      multiCall({
        abi: symbol,
        chain,
        calls: token0Addresses.map((token0) => ({
          target: token0.output,
        })),
        requery: true,
      }).then(({ output }) => output),
      multiCall({
        abi: decimals,
        chain,
        calls: token0Addresses.map((token0) => ({
          target: token0.output,
        })),
        requery: true,
      }).then(({ output }) => output),
      multiCall({
        abi: symbol,
        chain,
        calls: token1Addresses.map((token1) => ({
          target: token1.output,
        })),
        requery: true,
      }).then(({ output }) => output),
      multiCall({
        abi: decimals,
        chain,
        calls: token1Addresses.map((token1) => ({
          target: token1.output,
        })),
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

    // Add token0 Symbols
    token0Symbols.forEach((token0Symbol) => {
      if (token0Symbol.input.target.toLowerCase() === pair.token0) {
        pairs[pairAddress].token0Symbol = token0Symbol.output;
      }
    });

    // Add token1 Symbols
    token1Symbols.forEach((token1Symbol) => {
      if (token1Symbol.input.target.toLowerCase() === pair.token1) {
        pairs[pairAddress].token1Symbol = token1Symbol.output;
      }
    });

    // Add token0 Decimals
    token0Decimals.forEach((token0Decimal) => {
      if (token0Decimal.input.target.toLowerCase() === pair.token0) {
        pairs[pairAddress].token0Decimal = Number(token0Decimal.output);
      }
    });

    // Add token1 Decimals
    token1Decimals.forEach((token1Decimal) => {
      if (token1Decimal.input.target.toLowerCase() === pair.token1) {
        pairs[pairAddress].token1Decimal = Number(token1Decimal.output);
      }
    });

    // Add native token if token is bridged
    let token0NativeAddress: string = getAddress(pair.token0);
    if (!token0NativeAddress.includes("avax")) {
      pairs[pairAddress].token0NativeAddress = token0NativeAddress;
    }
    // Add native token if token is bridged
    let token1NativeAddress: string = getAddress(pair.token1);
    if (!token1NativeAddress.includes("avax")) {
      pairs[pairAddress].token1NativeAddress = token1NativeAddress;
    }
    cache.set(pairAddress, pairs[pairAddress], 600);
  }, {});

  return pairs;
}
