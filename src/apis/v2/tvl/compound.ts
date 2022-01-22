import { BigNumber } from "ethers";
import _ from "underscore";
import abi from "../../../abis/compound.json";
import { call, multiCall } from "../../../sdk";
import { Balances } from "../../../utils/sumChainsTvl";
import { unwrapUniswapLPs } from "./unwrapswapLPs";

// ask comptroller for all markets array
async function getAllCTokens(comptroller) {
  return (
    await call({
      target: comptroller,
      params: [],
      abi: abi["getAllMarkets"],
    })
  ).output;
}

const usdtAddress = "0xdac17f958d2ee523a2206206994597c13d831ec7";
const toUSDT = (value) => BigNumber.from(value).mul(1e6).toNumber().toFixed(0);
const toUSDTBalances = (value) => ({
  [usdtAddress]: toUSDT(value),
});

async function getUnderlying(cToken, cether, cetheEquivalent) {
  if (cToken === "0x5C0401e81Bc07Ca70fAD469b451682c0d747Ef1c") {
    return "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7"; // WAWAX
  }
  var res = (
    await call({
      target: cToken,
      abi: abi["underlying"],
    })
  ).output;
  return res;
}

// returns {[underlying]: {cToken, decimals, symbol}}
async function getMarkets(comptroller, cether, cetheEquivalent) {
  let allCTokens = await getAllCTokens(comptroller);
  const markets: any[] = [];
  // if not in cache, get from the blockchain
  await Promise.all(
    allCTokens.map(async (cToken) => {
      try {
        let underlying = await getUnderlying(cToken, cether, cetheEquivalent);
        markets.push({ underlying, cToken });
      } catch (e) {
        console.log(`${cToken} market rugged, is that market CETH?`);
        throw e;
      }
    })
  );

  return markets;
}

export async function getCompoundV2Tvl(
  comptroller,
  cether,
  cetheEquivalent,
  borrowed = false
) {
  let balances: any = {};
  let markets = await getMarkets(comptroller, cether, cetheEquivalent);

  // Get V2 tokens locked
  let v2Locked = await multiCall({
    calls: _.map(markets, (market: any) => ({
      target: market.cToken,
    })),
    abi: borrowed ? abi.totalBorrows : abi["getCash"],
  });

  const lpPositions = [];
  _.each(markets, (market, idx) => {
    let getCash = _.find(
      v2Locked.output,
      (result) => result.input.target === market.cToken
    );

    sumSingleBalance(balances, market.underlying, getCash.output);
  });
  if (lpPositions.length > 0) {
    await unwrapUniswapLPs(balances, lpPositions);
  }
  return balances;
}

// ask comptroller for all markets array
async function getAllMarkets(comptroller) {
  const { output: markets } = await call({
    target: comptroller,
    abi: abi["getAllMarkets"],
  });
  return markets;
}

// ask comptroller for oracle
async function getOracle(comptroller, oracleAbi) {
  const { output: oracle } = await call({
    target: comptroller,
    abi: oracleAbi,
  });
  return oracle;
}

async function getUnderlyingDecimals(token, cether) {
  if (token.toLowerCase() === cether?.toLowerCase()) {
    return 18;
  }

  try {
    const { output: underlying } = await call({
      target: token,
      abi: abi["underlying"],
    });
    const { output: decimals } = await call({
      target: underlying,
      abi: "erc20:decimals",
    });
    return decimals;
  } catch (e) {
    console.log(`${token} market rugged, is that market CETH?`);
    throw e;
  }
}

async function getUnderlyingPrice(oracle, token, methodAbi) {
  const { output: underlyingPrice } = await call({
    target: oracle,
    abi: methodAbi,
    params: [token],
  });
  return underlyingPrice;
}

async function getCash(token, borrowed) {
  const { output: cash } = await call({
    target: token,
    abi: borrowed ? abi.totalBorrows : abi["getCash"],
  });
  return cash;
}

function getCompoundUsdTvl(
  comptroller,
  chain,
  cether,
  borrowed,
  abis = {
    oracle: abi["oracle"],
    underlyingPrice: abi["getUnderlyingPrice"],
  }
) {
  return async (timestamp, ethBlock, chainBlocks) => {
    let tvl = BigNumber.from("0");

    let allMarkets = await getAllMarkets(comptroller);
    let oracle = await getOracle(comptroller, abis.oracle);

    await Promise.all(
      allMarkets.map(async (token) => {
        let amount = BigNumber.from(await getCash(token, borrowed));
        let decimals = await getUnderlyingDecimals(token, cether);
        let locked = amount.div(10 ** decimals);
        let underlyingPrice = BigNumber.from(
          await getUnderlyingPrice(oracle, token, abis.underlyingPrice)
        ).div(10 ** (18 + 18 - decimals));
        tvl = tvl.add(locked.mul(underlyingPrice));
      })
    );
    return toUSDTBalances(tvl.toNumber());
  };
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
