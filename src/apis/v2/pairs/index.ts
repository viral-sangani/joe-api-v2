import { Request, Response } from "express";
import { cache } from "../../..";
import { getAllPairsData } from "../../../core/pairs/calcPairs";
import { calculatePairTvl } from "../../../core/pairs/calcSinglePair";

const getCachedData = async (first: number) => {
  let allPairsData: any[] | undefined = cache.get("allPairsData");
  if (allPairsData == undefined) {
    allPairsData = await getAllPairsData("avax", first);
    cache.set("allPairsData", allPairsData);
  }
  return allPairsData;
};

export const getPairs = async (req: Request, res: Response) => {
  const { first } = req.query as { first: string };
  let allPairsData: any[] | undefined = cache.get("allPairsData");
  if (allPairsData == undefined) {
    allPairsData = await getAllPairsData("avax", parseInt(first));
    cache.set("allPairsData", allPairsData);
  }
  res.send(allPairsData);
};

export const getSinglePair = async (req: Request, res: Response) => {
  const { id } = req.params;
  let pairData: any[] | undefined = cache.get(`pair-${id}`);
  if (pairData == undefined) {
    pairData = await calculatePairTvl("avax", id);
    cache.set(`pair-${id}`, pairData);
  }
  res.send(pairData);
};
