import { BigNumber } from "@ethersproject/bignumber";
type ChainBlocks = {
  [chain: string]: number;
};

export type Balances = {
  [address: string]: string | number;
};

export function sumChainTvls(
  chainTvls: Array<(address: string) => Promise<Balances>>
) {
  return async (address: string) => {
    const balances = {};
    await Promise.all(
      chainTvls.map(async (chainTvl) => {
        const chainBalances = await chainTvl(address);
        mergeBalances(balances, chainBalances);
      })
    );
    return balances;
  };
}

function mergeBalances(balances: Balances, balancesToMerge: Balances) {
  Object.entries(balancesToMerge).forEach((balance) => {
    sumSingleBalance(balances, balance[0], balance[1]);
  });
}

export function sumSingleBalance(
  balances: Balances,
  token: string,
  balance: string | number
) {
  if (typeof balance === "number") {
    const prevBalance = balances[token] ?? 0;
    if (typeof prevBalance !== "number") {
      throw new Error(
        `Trying to merge token balance and coingecko amount for ${token}`
      );
    }
    (balances[token] as number) = prevBalance + balance;
  } else {
    const prevBalance = BigNumber.from(balances[token] ?? "0");
    balances[token] = prevBalance.add(BigNumber.from(balance)).toString();
  }
}
