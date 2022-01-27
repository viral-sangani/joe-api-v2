import { Request, Response } from "express";
import { cache } from "../../..";
import { getCompoundV2Tvl } from "../../../core/lending/compound";
import { JOE_COMPTROLLER } from "../../../utils/constants";
import { fetchLendingGraphData } from "./../../../core/lending/graph";
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
  var graphData = await fetchLendingGraphData();
  res.send({ ...allLendingData, graphData });
};

export const getRawLendingData = async (): Promise<
  LendingDataProp | undefined
> => {
  let allLendingData: LendingDataProp | undefined = cache.get("allLendingData");
  if (allLendingData == undefined) {
    allLendingData = await getCompoundV2Tvl(JOE_COMPTROLLER);
    cache.set("allLendingData", allLendingData);
  }
  return allLendingData;
};
