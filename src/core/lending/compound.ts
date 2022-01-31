import { BigNumber } from "@ethersproject/bignumber";
import { utils } from "ethers";
import borrowRatePerSecondAbi from "../../abis/borrowRatePerSecond.json";
import abi from "../../abis/compound.json";
import ctoken from "../../abis/ctoken.json";
import decimalAbi from "../../abis/decimals.json";
import supplyRatePerSecondAbi from "../../abis/supplyRatePerSecond.json";
import symbolAbi from "../../abis/symbol.json";
import totalReservesAbi from "../../abis/totalReserves.json";
import { call, multiCall } from "../../sdk";
import { jTokenDecimalsBD, secondsPerYear } from "../../utils/constants";
import { LendingDataProp } from "../../utils/types";

/**
 * fetche all the jToken available on trader joe
 * @param comptroller JOE_COMTROLLER address
 */
export async function getAllCTokens(comptroller: any) {
  return (
    await call({
      target: comptroller,
      params: [],
      abi: abi["getAllMarkets"],
    })
  ).output;
}

/**
 * fetches all the markets and the relevant data from comptroller contract
 * @param comptroller JOE_COMTROLLER address
 */
async function getMarkets(comptroller: any) {
  let allJTokens = await getAllCTokens(comptroller);
  let oracle = await getOracle(comptroller, abi["oracle"]);

  const [
    underlying,
    totalSupply,
    totalBorrows,
    underlyingPriceUSD,
    borrowRatePerSecond,
    supplyRatePerSecond,
    exchangeRateStored,
    jTokenCash,
    totalReserves,
  ] = await Promise.all([
    multiCall({
      abi: ctoken.find((c) => c.name === "underlying"),
      calls: allJTokens.map((cToken: string) => ({
        target: cToken,
      })),
    }),
    multiCall({
      abi: ctoken.find((c) => c.name === "totalSupply"),
      calls: allJTokens.map((cToken: string) => ({
        target: cToken,
      })),
    }),
    multiCall({
      abi: ctoken.find((c) => c.name === "totalBorrows"),
      calls: allJTokens.map((cToken: string) => ({
        target: cToken,
      })),
    }),
    multiCall({
      abi: abi["getUnderlyingPrice"],
      calls: allJTokens.map((cToken: string) => ({
        target: oracle,
        params: [cToken],
      })),
    }),
    multiCall({
      abi: borrowRatePerSecondAbi,
      calls: allJTokens.map((cToken: string) => ({
        target: cToken,
      })),
    }),
    multiCall({
      abi: supplyRatePerSecondAbi,
      calls: allJTokens.map((cToken: string) => ({
        target: cToken,
      })),
    }),
    multiCall({
      abi: ctoken.find((c) => c.name === "exchangeRateStored"),
      calls: allJTokens.map((cToken: string) => ({
        target: cToken,
      })),
    }),
    multiCall({
      abi: ctoken.find((c) => c.name === "getCash"),
      calls: allJTokens.map((cToken: string) => ({
        target: cToken,
      })),
    }),
    multiCall({
      abi: totalReservesAbi,
      calls: allJTokens.map((cToken: string) => ({
        target: cToken,
      })),
    }),
    // get decimals of underlying tokens
  ]);
  let [underlyingDecimals, underlyingSymbol, names] = await Promise.all([
    multiCall({
      abi: decimalAbi,
      calls: underlying.output.map((address: any) => ({
        target: address.output,
      })),
    }),
    multiCall({
      abi: symbolAbi,
      calls: underlying.output.map((address: any) => ({
        target: address.output,
      })),
    }),
    multiCall({
      abi: symbolAbi,
      calls: allJTokens.map((address: any) => ({
        target: address,
      })),
    }),
  ]);

  let totalSupplyUSD = 0;
  let totalBorrowsUSD = 0;
  let totalReservesUSD = 0;
  let totalLiquidityUSD = 0;

  let jtokenObj: any[] = allJTokens.map((ctoken: string, index: number) => {
    let obj: any = {};
    obj.jtoken = ctoken;
    obj.name = names.output[index].output;
    obj.totalBorrows = utils.formatUnits(
      totalBorrows.output[index].output,
      underlyingDecimals.output[index].output
    );
    obj.totalSupply = utils.formatUnits(
      totalSupply.output[index].output,
      jTokenDecimalsBD
    );
    obj.underlyingDecimal = underlyingDecimals.output[index].output;
    obj.underlyingPriceUSD = utils.formatUnits(
      BigNumber.from(underlyingPriceUSD.output[index].output),
      18 + 18 - parseInt(obj.underlyingDecimal)
    );
    obj.underlyingSymbol = underlyingSymbol.output[index].output;
    obj.exchangeRate = utils.formatUnits(
      BigNumber.from(exchangeRateStored?.output[index]?.output ?? "0"),
      18 - 8 + parseInt(obj.underlyingDecimal)
    );
    obj.cash = utils.formatUnits(
      BigNumber.from(jTokenCash.output[index].output),
      obj.underlyingDecimal
    );
    obj.reserve = utils.formatUnits(
      BigNumber.from(totalReserves.output[index].output),
      obj.underlyingDecimal
    );
    obj.liquidityUSD = (
      (obj.cash - obj.reserve) *
      obj.underlyingPriceUSD
    ).toString();
    obj.totalSupplyUSD = (
      obj.totalSupply *
      obj.exchangeRate *
      obj.underlyingPriceUSD
    ).toString();
    obj.totalBorrowsUSD = (
      obj.totalBorrows * obj.underlyingPriceUSD
    ).toString();
    obj.supplyRate = (
      parseFloat(
        utils.formatUnits(
          BigNumber.from(supplyRatePerSecond.output[index].output).mul(
            BigNumber.from(secondsPerYear)
          ),
          18
        )
      ) * 100
    ).toString();
    obj.borrowRate = (
      parseFloat(
        utils.formatUnits(
          BigNumber.from(borrowRatePerSecond.output[index].output).mul(
            BigNumber.from(secondsPerYear)
          ),
          18
        )
      ) * 100
    ).toString();
    totalSupplyUSD += parseFloat(obj.totalSupplyUSD);
    totalBorrowsUSD += parseFloat(obj.totalBorrowsUSD);
    totalReservesUSD += parseFloat(obj.reserve);
    totalLiquidityUSD += parseFloat(obj.liquidityUSD);
    return obj;
  });
  return {
    totalSupplyUSD: totalSupplyUSD.toString(),
    totalBorrowsUSD: totalBorrowsUSD.toString(),
    totalReservesUSD: totalReservesUSD.toString(),
    totalLiquidityUSD: totalLiquidityUSD.toString(),
    jTokens: jtokenObj,
  };
}

export const getCompoundV2Tvl = async (
  comptroller: string
): Promise<LendingDataProp> => {
  let ctokenObj = await getMarkets(comptroller);
  return ctokenObj;
};

// ask comptroller for oracle
async function getOracle(
  comptroller: any,
  oracleAbi: {
    inputs: never[];
    name: string;
    outputs: { internalType: string; name: string; type: string }[];
    stateMutability: string;
    type: string;
  }
) {
  const { output: oracle } = await call({
    target: comptroller,
    abi: oracleAbi,
  });
  return oracle;
}
