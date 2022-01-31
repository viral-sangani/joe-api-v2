import { Request, Response } from "express";
import { cache } from "../../..";
import { getCompoundV2Tvl } from "../../../core/lending/compound";
import { cacheLendingDataKey } from "../../../utils/cacheConstants";
import { JOE_COMPTROLLER } from "../../../utils/constants";
import { cacheLendingDataTTL } from "./../../../utils/cacheConstants";
import { LendingDataProp } from "./../../../utils/types";

export const getLendingPairData = async (req: Request, res: Response) => {
  const { jToken } = req.params;
  let allLendingData = await getRawLendingData();
  let lendingPairData = allLendingData?.jTokens?.find(
    (token) => token.jtoken === jToken
  );
  res.send(lendingPairData);
};

export const getLendingData = async (req: Request, res: Response) => {
  let allLendingData = await getRawLendingData();
  // var graphData = await fetchLendingGraphData();
  res.send({
    ...allLendingData,
    // graphData
  });
};

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
