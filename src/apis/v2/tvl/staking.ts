import BigNumber from "bignumber.js";
import { cache } from "../../..";
import getReserves from "../../../abis/getReserves.json";
import token0Abi from "../../../abis/token0.json";
import token1Abi from "../../../abis/token1.json";
import { call, multiCall } from "../../../sdk";
import { balanceOf } from "../../../sdk/balanceOf";

export async function staking(stakingContracts, stakingToken) {
  let stakingTvl = cache.get("stakingTvl");
  if (stakingTvl == null || stakingTvl == undefined) {
    const bal = (
      await multiCall({
        calls: [
          {
            target: stakingToken,
            params: [stakingContracts],
          },
        ],
        abi: "erc20:balanceOf",
      })
    ).output.reduce(
      (total, call) => new BigNumber(total).plus(call.output).toFixed(0),
      "0"
    );
    let address = stakingToken;
    stakingTvl = {
      [address]: bal,
    };
    cache.set("stakingTvl", stakingTvl);
  }
  return stakingTvl;
}

export function stakingPricedLP(
  stakingContract,
  stakingToken,
  chain,
  lpContract,
  coingeckoIdOfPairedToken,
  stakedTokenIsToken0 = false,
  decimals = 18
) {
  return stakingUnknownPricedLP(
    stakingContract,
    stakingToken,
    chain,
    lpContract,
    () => coingeckoIdOfPairedToken,
    decimals
  );
}

export function stakingUnknownPricedLP(
  stakingContract,
  stakingToken,
  chain,
  lpContract,
  transform,
  decimals
) {
  return async () => {
    const [bal, reserveAmounts, token0, token1] = await Promise.all([
      balanceOf({
        target: stakingToken,
        owner: stakingContract,
        chain,
      }),
      ...[getReserves, token0Abi, token1Abi].map((abi) =>
        call({
          target: lpContract,
          abi,
        }).then((o) => o.output)
      ),
    ]);
    let token, stakedBal;
    if (token0.toLowerCase() === stakingToken.toLowerCase()) {
      token = token1;
      stakedBal = new BigNumber(bal.output)
        .times(reserveAmounts[1])
        .div(reserveAmounts[0])
        .toFixed(0);
    } else {
      stakedBal = new BigNumber(bal.output)
        .times(reserveAmounts[0])
        .div(reserveAmounts[1])
        .toFixed(0);
      token = token0;
    }
    if (decimals !== undefined) {
      stakedBal = Number(stakedBal) / 10 ** decimals;
    }
    return {
      [transform ? transform(token) : `${chain}:${token}`]: stakedBal,
    };
  };
}
