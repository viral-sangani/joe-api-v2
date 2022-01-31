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

export interface Owner {
  id: string;
  joePerSec: string;
  totalAllocPoint: string;
}

export interface Token0 {
  derivedAVAX: string;
  id: string;
  name: string;
  symbol: string;
  totalSupply: string;
}

export interface Token1 {
  derivedAVAX: string;
  id: string;
  name: string;
  symbol: string;
  totalSupply: string;
}

export interface LiquidityPair {
  id: string;
  reserve0: string;
  reserve1: string;
  reserveAVAX: string;
  reserveUSD: string;
  timestamp: string;
  token0: Token0;
  token0Price: string;
  token1: Token1;
  token1Price: string;
  totalSupply: string;
  trackedReserveAVAX: string;
  txCount: string;
  untrackedVolumeUSD: string;
  volumeUSD: string;
}

export interface Pools {
  accJoePerShare: string;
  allocPoint: string;
  balance: string;
  id: string;
  lastRewardTimestamp: string;
  owner: Owner;
  pair: string;
  timestamp: string;
  userCount: string;
  liquidityPair: LiquidityPair;
  rewardPerSec: number;
  roiPerHour: number;
  roiPerDay: number;
  roiPerMonth: number;
  roiPerYear: number;
  tvl: string;
}

export interface JoeStakedUSD {
  date: any;
  value: number;
}

export interface JoeHarvestedUSD {
  date: any;
  value: number;
}

export interface XJoeMinted {
  date: any;
  value: number;
}

export interface XJoeBurned {
  date: any;
  value: number;
}

export interface XJoe {
  date: any;
  value: number;
}

export interface Apr {
  date: any;
  value: number;
}

export interface Apy {
  date: any;
  value: number;
}

export interface Fee {
  date: any;
  value: number;
}

export interface StakeDataProp {
  averageApy: number;
  oneDayVolume: number;
  oneDayFees: number;
  totalStakedUSD: number;
  totalApr: number;
  totalApy: number;
  joeStakedUSD: JoeStakedUSD[];
  joeHarvestedUSD: JoeHarvestedUSD[];
  xJoeMinted: XJoeMinted[];
  xJoeBurned: XJoeBurned[];
  xJoe: XJoe[];
  apr: Apr[];
  apy: Apy[];
  fees: Fee[];
}
