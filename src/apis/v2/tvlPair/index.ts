import { Request, Response } from "express";
import { performance } from "perf_hooks";
import { transformAvaxAddress } from "../../../utils/helper";
import { calculatePairTvl } from "./calcPairTvl";

async function swapTvl(address: string) {
  const trans = await transformAvaxAddress();
  const balances = await calculatePairTvl(trans, "avax", 9763103, address);
  return balances;
}

export const getTvlPair = async (req: Request, res: Response) => {
  const start = performance.now();
  const { pair } = req.params;
  let pairRes: any = await swapTvl(pair);
  const end = performance.now();
  console.log({ time: (end - start).toFixed(2) });

  res.send(pairRes);
};
