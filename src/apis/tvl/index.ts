import { BigNumber } from "@ethersproject/bignumber";
import { utils } from "ethers";
import { Request, Response } from "express";
import { performance } from "perf_hooks";
import { JOEFACTORY_ADDRESS } from "../../utils/constants";
import { transformAvaxAddress } from "../../utils/helper";
import { sumChainTvls } from "../../utils/sumChainsTvl";
import { Balances } from "./../../utils/sumChainsTvl";
import { calculateUniTvl } from "./calcTvl";

async function swapTvl(address: string) {
  const trans = await transformAvaxAddress();
  console.log(`trans`, trans("0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7"));
  const balances = await calculateUniTvl(
    trans,
    "avax",
    // "0x9Ad6C38BE94206cA50bb0d90783181662f0Cfa10",
    address,
    0,
    true,
    9763103
  );
  return balances;
}

export const tvl = async (req: Request, res: Response) => {
  console.log("Started at - ", Date.now());
  const start = performance.now();
  let balance: Balances = await sumChainTvls([swapTvl])(JOEFACTORY_ADDRESS);

  var acc: BigNumber = BigNumber.from("0");
  Object.entries(balance).map((item) => {
    acc = acc.add(BigNumber.from(item[1]));
  });
  console.log(`acc`, acc.toString());
  console.log("formatted >> ", utils.formatEther(acc.toString()));
  const end = performance.now();
  console.log(`swapTvl took ${(end - start).toFixed(2)} milliseconds.`);

  res.send(balance);
};
