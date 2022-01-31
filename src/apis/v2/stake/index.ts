import { Request, Response } from "express";
import { cache } from "../../..";
import { getStakeData } from "../../../core/stake/graph";
import { cacheStakeTTL } from "../../../utils/cacheConstants";
import { StakeDataProp } from "../../../utils/types";
import { cacheStakeKey } from "./../../../utils/cacheConstants";

export const getStake = async (req?: Request, res?: Response) => {
  console.log("called");
  let stakeData: StakeDataProp | undefined = cache.get(cacheStakeKey);
  if (stakeData == undefined) {
    stakeData = await getStakeData();
    cache.set(cacheStakeKey, stakeData, cacheStakeTTL);
  }
  res?.send(stakeData);
};
