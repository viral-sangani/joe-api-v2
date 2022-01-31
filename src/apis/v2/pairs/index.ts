import { Request, Response } from "express";
import { cache } from "../../..";
import { getAllPairsData } from "../../../core/pairs/calcPairs";
import { calculatePairData } from "../../../core/pairs/calcSinglePair";
import { cacheSinglePairTTL } from "../../../utils/cacheConstants";

/**
 * Fetch all pairs data w.r.t first and skip parameters
 * @param req express request object
 * @param res express response object
 */
export const getPairs = async (req: Request, res: Response) => {
  const { first = "25", skip = "0" } = req.query as {
    first: string;
    skip: string;
  };

  let allPairsData = await getAllPairsData(parseInt(first), parseInt(skip));
  res.send(allPairsData);
};

/**
 * getSinglePair get the data for a particular pair
 * If data is present in cache, return it else fetch the new data, update the cache and return the data
 *
 * @param req express request object
 * @param res express response object
 */
export const getSinglePair = async (req: Request, res: Response) => {
  const { id } = req.params;
  let pairDetailedData: any[] | undefined = cache.get(`pair-${id}`);

  if (pairDetailedData == undefined) {
    let pairData: any[] | undefined = cache.get(`pairs-${id}`);

    // pairData includes basic data for all the pairs
    // calculatePairData fetches detailed data for a single pair
    if (pairData == undefined) {
      pairData = await calculatePairData(id);
    } else {
      pairData = await calculatePairData(id, pairData);
    }
    cache.set(`pair-${id}`, pairData, cacheSinglePairTTL);
    res.send(pairData);
  } else {
    res.send(pairDetailedData);
  }
};
