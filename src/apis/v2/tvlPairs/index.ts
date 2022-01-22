import { Request, Response } from "express";
import { performance } from "perf_hooks";
import { JOEFACTORY_ADDRESS } from "../../../utils/constants";
import { transformAvaxAddress } from "../../../utils/helper";
import { Balances } from "../../../utils/sumChainsTvl";
import { calculateUniTvl } from "./calcTvl";

interface SwapTvlProp {
  balances: Balances;
  pairsAddress: any[];
}

function range(size: number, startAt: number = 0): Array<number> {
  return [...Array(size).keys()].map((i) => i + startAt);
}

async function swapTvl(address: string, pairsList: Array<number>) {
  const trans = await transformAvaxAddress();
  const balances = await calculateUniTvl(trans, "avax", address, pairsList);
  return balances;
}

export const tvlPairs = async (req: Request, res: Response) => {
  const { offset = "0", limit = "25" } = req.query;

  const start = performance.now();
  let pairsList: Array<number> = range(
    parseInt(limit.toString()),
    parseInt(offset.toString())
  );
  let pairs: any = await swapTvl(JOEFACTORY_ADDRESS, pairsList);

  const end = performance.now();
  console.log({ time: (end - start).toFixed(2) });

  res.send({
    pairs,
  });
};
