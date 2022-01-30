import { Request, Response } from "express";
import { cache } from "../../..";
import { getPoolsData } from "../../../core/pool/graph";
import { Pools } from "../../../utils/types";
import { getPoolHistories } from "./../../../core/pool/graph";

const getCachedData = async () => {
  let allPoolsData: Pools[] | undefined = cache.get("allPoolsData");
  if (allPoolsData == undefined) {
    allPoolsData = await getPoolsData();
    cache.set("allPoolsData", allPoolsData);
  }
  return allPoolsData;
};

export const getPools = async (req: Request, res: Response) => {
  let allPoolsData = await getCachedData();
  res.send(allPoolsData);
};

export const getSinglePool = async (req: Request, res: Response) => {
  try {
    let allPoolsData = await getCachedData();
    const { id } = req.params;
    if (allPoolsData != null) {
      let pool = allPoolsData.find((pool) => pool.id === id);
      if (pool != null) {
        let poolHistory = await getPoolHistories(id, pool);
        res.send({ pool, poolHistory });
      } else {
        res.send({ pool });
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
