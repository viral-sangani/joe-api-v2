import BigNumber from "bignumber.js";
import { multiCall } from "../../../sdk";
import { sumSingleBalance } from "../../../utils/sumChainsTvl";

const lpReservesAbi = {
  constant: true,
  inputs: [],
  name: "getReserves",
  outputs: [
    { internalType: "uint112", name: "_reserve0", type: "uint112" },
    { internalType: "uint112", name: "_reserve1", type: "uint112" },
    { internalType: "uint32", name: "_blockTimestampLast", type: "uint32" },
  ],
  payable: false,
  stateMutability: "view",
  type: "function",
};
const lpSuppliesAbi = {
  constant: true,
  inputs: [],
  name: "totalSupply",
  outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
  payable: false,
  stateMutability: "view",
  type: "function",
};
const token0Abi = {
  constant: true,
  inputs: [],
  name: "token0",
  outputs: [{ internalType: "address", name: "", type: "address" }],
  payable: false,
  stateMutability: "view",
  type: "function",
};
const token1Abi = {
  constant: true,
  inputs: [],
  name: "token1",
  outputs: [{ internalType: "address", name: "", type: "address" }],
  payable: false,
  stateMutability: "view",
  type: "function",
};

export async function unwrapUniswapLPs(balances, lpPositions) {
  const lpTokenCalls = lpPositions.map((lpPosition) => ({
    target: lpPosition.token,
  }));
  const lpReserves = multiCall({
    abi: lpReservesAbi,
    calls: lpTokenCalls,
  });
  const lpSupplies = multiCall({
    abi: lpSuppliesAbi,
    calls: lpTokenCalls,
  });
  const tokens0 = multiCall({
    abi: token0Abi,
    calls: lpTokenCalls,
  });
  const tokens1 = multiCall({
    abi: token1Abi,
    calls: lpTokenCalls,
  });
  await Promise.all(
    lpPositions.map(async (lpPosition) => {
      try {
        const lpToken = lpPosition.token;
        const token0 = (await tokens0).output
          .find((call) => call.input.target === lpToken)
          .output.toLowerCase();
        const token1 = (await tokens1).output
          .find((call) => call.input.target === lpToken)
          .output.toLowerCase();
        const supply = (await lpSupplies).output.find(
          (call) => call.input.target === lpToken
        ).output;
        const { _reserve0, _reserve1 } = (await lpReserves).output.find(
          (call) => call.input.target === lpToken
        ).output;

        const token0Balance = new BigNumber(lpPosition.balance)
          .times(new BigNumber(_reserve0))
          .div(new BigNumber(supply));
        sumSingleBalance(balances, token0, token0Balance.toFixed(0));

        const token1Balance = new BigNumber(lpPosition.balance)
          .times(new BigNumber(_reserve1))
          .div(new BigNumber(supply));
        sumSingleBalance(balances, token1, token1Balance.toFixed(0));
      } catch (e) {
        console.log(`Failed to get data for LP token at ${lpPosition.token}`);
        throw e;
      }
    })
  );
}
