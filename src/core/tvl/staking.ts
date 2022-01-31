import BigNumber from "bignumber.js";
import { cache } from "../..";
import { multiCall } from "../../sdk";
import {
  cacheStakingTvlKey,
  cacheStakingTvlTTL,
} from "../../utils/cacheConstants";

export async function staking(stakingContracts, stakingToken) {
  let stakingTvl = cache.get(cacheStakingTvlKey);
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
    cache.set(cacheStakingTvlKey, stakingTvl, cacheStakingTvlTTL);
  }
  return stakingTvl;
}
