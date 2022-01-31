import { Request, Response } from "express";
import { cache } from "../../..";
import { getStakeData } from "../../../core/stake/graph";
import { cacheStakeTTL } from "../../../utils/cacheConstants";
import { StakeDataProp } from "../../../utils/types";
import { cacheStakeKey } from "./../../../utils/cacheConstants";

/**
 * getStake returns the stake data for joe token along with historical data
 *
 * @param req express request object
 * @param res express response object
 */
export const getStake = async (req?: Request, res?: Response) => {
  let stakeData: StakeDataProp | undefined = cache.get(cacheStakeKey);
  if (stakeData == undefined) {
    stakeData = await getStakeData();
    cache.set(cacheStakeKey, stakeData, cacheStakeTTL);
  }
  res?.send(stakeData);
};
