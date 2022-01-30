import { Request, Response } from "express";
import { cache } from "../../..";
import { getAllPairsData } from "../../../core/pairs/calcPairs";
import { calculatePairTvl } from "../../../core/pairs/calcSinglePair";

export const getPairs = async (req: Request, res: Response) => {
  const { first = "25", skip = "0" } = req.query as {
    first: string;
    skip: string;
  };

  let allPairsData = await getAllPairsData(
    "avax",
    parseInt(first),
    parseInt(skip)
  );
  res.send(allPairsData);
};

export const getSinglePair = async (req: Request, res: Response) => {
  const { id } = req.params;
  let pairData: any[] | undefined = cache.get(`pairs-${id}`);
  if (pairData == undefined) {
    pairData = await calculatePairTvl("avax", id);
  } else {
    pairData = await calculatePairTvl("avax", id, pairData);
  }
  res.send(pairData);
};
