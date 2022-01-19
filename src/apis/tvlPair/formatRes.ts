import { utils } from "ethers";
import { Balances } from "./../../utils/sumChainsTvl";

const formattedReserve = (token: any) => {
  {
    return (
      parseFloat(utils.formatUnits(token.address, token.decimal)).toFixed(2) +
      " " +
      token.symbol
    );
  }
};

export const formatPairRes = async (
  getAddress: (address: string) => Promise<string>,
  balance: Balances,
  symbols: any[],
  decimals: any[],
  names: any[]
) => {
  let token0: any = {
    address: Object.keys(balance)[0],
    symbol: symbols[0].output,
    name: names[0].output,
    decimal: decimals[0].output,
    reserver: balance[Object.keys(balance)[0]],
  };
  let token0NativeAddress: string = await getAddress(token0.address);
  if (!token0NativeAddress.includes("avax")) {
    token0.nativeAddress = token0NativeAddress;
  }
  token0.formattedReserve =
    parseFloat(utils.formatUnits(token0.address, token0.decimal)).toFixed(2) +
    " " +
    token0.symbol;

  let token1: any = {
    address: Object.keys(balance)[1],
    symbol: symbols[1].output,
    name: names[1].output,
    decimal: decimals[1].output,
    reserver: balance[Object.keys(balance)[1]],
  };
  let token1NativeAddress: string = await getAddress(token1.address);
  if (!token1NativeAddress.includes("avax")) {
    token1.nativeAddress = token1NativeAddress;
  }
  token1.formattedReserve =
    parseFloat(utils.formatUnits(token1.address, token1.decimal)).toFixed(2) +
    " " +
    token1.symbol;
  return { token0, token1 };
};
