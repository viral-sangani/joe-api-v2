import { Request, Response } from "express";
import { cache } from "../../..";
import { getCompoundV2Tvl } from "../../../core/lending/compound";
import { fetchLendingHistoricalData } from "../../../core/lending/graph";
import { cacheLendingDataKey } from "../../../utils/cacheConstants";
import { JOE_COMPTROLLER } from "../../../utils/constants";
import { cacheLendingDataTTL } from "./../../../utils/cacheConstants";
import { LendingDataProp } from "./../../../utils/types";

/**
 * Fetches lending data for a particular jToken
 * @param req express request object
 * @param res express response object
 */
export const getLendingPairData = async (req: Request, res: Response) => {
  const { jToken } = req.params;
  let allLendingData = await getRawLendingData();
  let lendingPairData = allLendingData?.jTokens?.find(
    (token) => token.jtoken === jToken
  );
  res.send(lendingPairData);
};

/**
 * Fetch lending data for all jTokens
 * ?historical=true query parameter can be used to fetch historical data
 *
 * @param req express request object
 * @param res express response object
 */
export const getLendingData = async (req: Request, res: Response) => {
  const { historical } = req.query;
  if (historical == "true") {
    const [allLendingData, graphData] = await Promise.all([
      await getRawLendingData(),
      await fetchLendingHistoricalData(),
    ]);
    res.send({ allLendingData, graphData });
  } else {
    let allLendingData = await getRawLendingData();
    res.send({ allLendingData });
  }
};

/**
 * getRawLendingData fetches the data from cache and returns it
 * @returns {Promise<LendingDataProp | undefined>}
 */
export const getRawLendingData = async (): Promise<
  LendingDataProp | undefined
> => {
  let allLendingData: LendingDataProp | undefined =
    cache.get(cacheLendingDataKey);

  if (allLendingData == undefined) {
    allLendingData = await getCompoundV2Tvl(JOE_COMPTROLLER);
    cache.set(cacheLendingDataKey, allLendingData, cacheLendingDataTTL);
  }
  return allLendingData;
};
