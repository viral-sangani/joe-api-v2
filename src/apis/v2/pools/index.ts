import { Request, Response } from "express";
import { cache } from "../../..";
import { getPoolHistories, getPoolsData } from "../../../core/pool/graph";
import {
  cachePoolDataKey,
  cachePoolDataTTL,
} from "../../../utils/cacheConstants";
import { Pools } from "../../../utils/types";

/**
 * getPoolCachedData returns the cached data for all the pools
 * if the data is not present in cache, it fetches the data from the API and updates the cache
 * @returns {Promise<Pools[] | undefined>}
 */
export const getPoolCachedData = async (): Promise<Pools[] | undefined> => {
  let allPoolsData: Pools[] | undefined = cache.get(cachePoolDataKey);
  if (allPoolsData == undefined) {
    allPoolsData = await getPoolsData();
    cache.set(cachePoolDataKey, allPoolsData, cachePoolDataTTL);
  }
  return allPoolsData;
};

/**
 * getPools fetches the data from getPoolCachedData and returns it
 * @param req express request object
 * @param res express response object
 */
export const getPools = async (req: Request, res: Response) => {
  let allPoolsData = await getPoolCachedData();
  res.send(allPoolsData);
};

/**
 * getSinglePool fetches the data from getPoolCachedData, find the particular pool and returns it
 * req object need to have pool id in params
 * req object can have optional query parameter historical to get historical data for charts
 *
 * @param req express request object
 * @param res express response object
 */
export const getSinglePool = async (req: Request, res: Response) => {
  const { historical } = req.query;
  const { id } = req.params;
  try {
    let allPoolsData = await getPoolCachedData();

    if (allPoolsData != null) {
      let pool = allPoolsData.find((pool) => pool.id === id);
      if (pool != null) {
        if (historical == "true") {
          // getPoolHistories returns list of historical data for a particular pool
          let poolHistory = await getPoolHistories(id, pool);
          res.send({ pool, poolHistory });
        } else {
          res.send({ pool });
        }
      } else {
        res.statusCode = 500;
        res.send({ error: "No pools found" });
      }
    } else {
      res.statusCode = 500;
      res.send({ error: "No pools found" });
    }
  } catch (e) {
    res.statusCode = 500;
    res.send({
      error: "Oops, Something went wrong. Please contact developers.",
    });
  }
};
