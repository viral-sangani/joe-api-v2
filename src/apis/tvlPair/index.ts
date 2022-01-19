import { Request, Response } from "express";
import { performance } from "perf_hooks";
import decimal from "../../abis/decimals.json";
import name from "../../abis/name.json";
import symbol from "../../abis/symbol.json";
import { multiCall } from "../../sdk";
import { transformAvaxAddress } from "../../utils/helper";
import { sumChainTvls } from "../../utils/sumChainsTvl";
import { Balances } from "./../../utils/sumChainsTvl";
import { calculatePairTvl } from "./calcPairTvl";
import { formatPairRes } from "./formatRes";

async function swapTvl(address: string) {
  const trans = await transformAvaxAddress();
  const balances = await calculatePairTvl(trans, "avax", 9763103, address);
  return balances;
}

export const tvlPair = async (req: Request, res: Response) => {
  const trans = await transformAvaxAddress();
  const start = performance.now();
  let balance: Balances = await sumChainTvls([swapTvl])(req.params.pair);
  const end = performance.now();

  const [symbols, decimals, names] = await Promise.all([
    multiCall({
      abi: symbol,
      chain: "avax",
      calls: [
        { target: Object.keys(balance)[0] },
        { target: Object.keys(balance)[1] },
      ],
      requery: true,
    }).then(({ output }) => output),
    multiCall({
      abi: decimal,
      chain: "avax",
      calls: [
        { target: Object.keys(balance)[0] },
        { target: Object.keys(balance)[1] },
      ],
      requery: true,
    }).then(({ output }) => output),
    multiCall({
      abi: name,
      chain: "avax",
      calls: [
        { target: Object.keys(balance)[0] },
        { target: Object.keys(balance)[1] },
      ],
      requery: true,
    }).then(({ output }) => output),
  ]);
  const { token0, token1 } = await formatPairRes(
    trans,
    balance,
    symbols,
    decimals,
    names
  );

  res.send({
    pairAddress: req.params.pair,
    token0,
    token1,
    time: (end - start).toFixed(2),
  });
};
