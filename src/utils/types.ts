import { Request } from "express";

export interface RequestCustom extends Request {
  cache: any;
}

export interface JToken {
  jtoken: string;
  name: string;
  totalBorrows: string;
  totalSupply: string;
  underlyingDecimal: string;
  underlyingPriceUSD: string;
  underlyingSymbol: string;
  exchangeRate: string;
  cash: string;
  reserve: string;
  liquidityUSD: string;
  totalSupplyUSD: string;
  totalBorrowsUSD: string;
  supplyRate: string;
  borrowRate: string;
}

export interface LendingDataProp {
  jTokens: JToken[];
  totalSupplyUSD: string;
  totalBorrowsUSD: string;
  totalReservesUSD: string;
  totalLiquidityUSD: string;
}
