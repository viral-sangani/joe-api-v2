import BigNumber from "bignumber.js";
import factoryAbi from "../../abis/factory.json";
import getReserves from "../../abis/getReserves.json";
import token0 from "../../abis/token0.json";
import token1 from "../../abis/token1.json";
import { call, getLogs, multiCall } from "../../sdk";

export async function calculateUniTvl(
  getAddress: (addr: string) => string,
  chain: string,
  FACTORY: string,
  START_BLOCK: number,
  useMulticall = false,
  block: number
) {
  let pairAddresses;
  if (useMulticall) {
    const pairLength = (
      await call({
        target: FACTORY,
        abi: factoryAbi.allPairsLength,
      })
    ).output;
    if (pairLength === null) {
      throw new Error("allPairsLength() failed");
    }
    const pairNums = Array.from(Array(Number(10)).keys());
    // const pairNums = Array.from(Array(Number(pairLength)).keys());
    const pairs = (
      await multiCall({
        abi: factoryAbi.allPairs,
        chain,
        calls: pairNums.map((num) => ({
          target: FACTORY,
          params: [num],
        })),
        requery: true,
      })
    ).output;
    pairAddresses = pairs.map((result) => result.output.toLowerCase());
  } else {
    const logs = (
      await getLogs({
        keys: [],
        toBlock: block,
        chain,
        target: FACTORY,
        fromBlock: START_BLOCK,
        topic: "PairCreated(address,address,address,uint256)",
      })
    ).output;

    pairAddresses = logs
      // sometimes the full log is emitted
      .map((log) =>
        typeof log === "string"
          ? log
          : `0x${log.toString().slice(64 - 40 + 2, 64 + 2)}`
      )
      // lowercase
      .map((pairAddress) => pairAddress.toLowerCase());
  }
  const [token0Addresses, token1Addresses, reserves] = await Promise.all([
    multiCall({
      abi: token0,
      chain,
      calls: pairAddresses.map((pairAddress) => ({
        target: pairAddress,
      })),
      requery: true,
    }).then(({ output }) => output),

    multiCall({
      abi: token1,
      chain,
      calls: pairAddresses.map((pairAddress) => ({
        target: pairAddress,
      })),
      requery: true,
    }).then(({ output }) => output),

    multiCall({
      abi: getReserves,
      chain,
      calls: pairAddresses.map((pairAddress) => ({
        target: pairAddress,
      })),
      requery: true,
    }).then(({ output }) => output),
  ]);

  const pairs: any = {};
  // add token0Addresses
  token0Addresses.forEach((token0Address) => {
    const tokenAddress = token0Address.output.toLowerCase();

    const pairAddress: string = token0Address.input.target.toLowerCase();
    pairs[pairAddress] = {
      token0Address: getAddress(tokenAddress),
    };
  });

  // add token1Addresses
  token1Addresses.forEach((token1Address) => {
    const tokenAddress = token1Address.output.toLowerCase();
    const pairAddress = token1Address.input.target.toLowerCase();
    pairs[pairAddress] = {
      ...(pairs[pairAddress] || {}),
      token1Address: getAddress(tokenAddress),
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
