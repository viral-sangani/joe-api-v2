import { utils } from "ethers";
import { Balances } from "../../../utils/sumChainsTvl";

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
  names: any[],
  pair: string
) => {
  let token0: any = {
    address: Object.keys(balance)[0],
    symbol: symbols[0].output,
    name: names[0].output,
    decimal:
      typeof decimals[0].output === "string"
        ? parseInt(decimals[0].output)
        : decimals[0].output,
    reserver: balance[Object.keys(balance)[0]],
  };

  let token1: any = {
    address: Object.keys(balance)[1],
    symbol: symbols[1].output,
    name: names[1].output,
    decimal:
      typeof decimals[1].output === "string"
        ? parseInt(decimals[1].output)
        : decimals[1].output,
    reserver: balance[Object.keys(balance)[1]],
  };

  let resObj: any = {
    [pair]: {
      token0: token0.address,
      token1: token1.address,
      reserve0: token0.reserve,
      reserve1: token1.reserve,
      token0Symbol: token0.symbol,
      token1Symbol: token1.symbol,
      token0Decimal: token0.decimal,
      token1Decimal: token1.decimal,
    },
  };

  let token0NativeAddress: string = await getAddress(token0.address);
  if (!token0NativeAddress.includes("avax")) {
    resObj[pair].token0NativeAddress = token0NativeAddress;
  }
  let token1NativeAddress: string = await getAddress(token1.address);
  if (!token1NativeAddress.includes("avax")) {
    resObj[pair].token1NativeAddress = token1NativeAddress;
  }

  return { resObj };
};
