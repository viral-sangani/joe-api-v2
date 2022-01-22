import { cache } from "../../..";
import decimal from "../../../abis/decimals.json";
import symbol from "../../../abis/symbol.json";
import totalSupplyAndBorrow from "../../../abis/totalSupplyAndBorrowABI.json";
import { call, multiCall } from "../../../sdk";
import {
  JOE_BANKER,
  JOE_COMPTROLLER,
  TOTALSUPPLYANDBORROW_ADDRESS,
  WAVAX_ADDRESS,
} from "../../../utils/constants";
import { getCompoundV2Tvl } from "./compound";

export const getTotalLendingData = async (): Promise<{
  totalDeposited: string;
  totalBorrowed: string;
}> => {
  let totalLending:
    | { totalDeposited: string; totalBorrowed: string }
    | undefined = cache.get("totalLending");
  if (totalLending == undefined) {
    var data = await call({
      abi: totalSupplyAndBorrow,
      target: TOTALSUPPLYANDBORROW_ADDRESS,
    });
    totalLending = {
      totalDeposited: data.output[0],
      totalBorrowed: data.output[1],
    };
    cache.set("totalLending", totalLending);
  }
  return totalLending;
};

export const getLendingData = async () => {
  let allBorrowed = cache.get("borrowed");
  let allDeposited = cache.get("deposited");
  if (allBorrowed == undefined || allDeposited == undefined) {
    var borrow = await getCompoundV2Tvl(
      JOE_COMPTROLLER,
      JOE_BANKER,
      WAVAX_ADDRESS,
      true
    );
    var deposited = await getCompoundV2Tvl(
      JOE_COMPTROLLER,
      JOE_BANKER,
      WAVAX_ADDRESS
    );
    allBorrowed = await formatToken(borrow);
    allDeposited = await formatToken(deposited);
    cache.set("borrowed", allBorrowed);
    cache.set("deposited", allDeposited);
  }
};

const formatToken = async (tokens: any) => {
  let formattedTokens: any[] = [];
  const [symbols, decimals] = await Promise.all([
    multiCall({
      abi: symbol,
      chain: "avax",
      calls: Object.keys(tokens).map((token) => ({ target: token })),
      requery: true,
    }).then(({ output }) => output),
    multiCall({
      abi: decimal,
      chain: "avax",
      calls: Object.keys(tokens).map((token) => ({ target: token })),
      requery: true,
    }).then(({ output }) => output),
  ]);
  Object.keys(tokens).forEach((token, index) => {
    formattedTokens.push({
      symbol: symbols[index].output,
      decimals: decimals[index].output,
      address: token,
      balance: tokens[token],
    });
  });
  return formattedTokens;
};
