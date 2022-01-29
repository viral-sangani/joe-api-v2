import { AbiItem } from "web3-utils";
// import TotalSupplyAndBorrowABI from "../../../abis/TotalSupplyAndBorrowABI.json";
import {
  AVAX_CHAIN_ID,
  TOTALSUPPLYANDBORROW_ADDRESS,
} from "../../../utils/constants";
import { web3Factory } from "../../../utils/web3";
("use strict");

const TotalSupplyAndBorrowABI = [
  {
    type: "function",
    stateMutability: "view",
    outputs: [
      {
        type: "uint256",
        name: "",
        internalType: "uint256",
      },
      {
        type: "uint256",
        name: "",
        internalType: "uint256",
      },
    ],
    name: "getTotalSupplyAndTotalBorrow",
    inputs: [],
  },
];

const web3 = web3Factory(AVAX_CHAIN_ID);

class Cache {
  minElapsedTimeInMs = 10000; // 10 seconds
  cachedTotal: any;
  totalSupplyAndBorrow: any;

  constructor() {
    this.cachedTotal = undefined;
    this.totalSupplyAndBorrow = new web3!.eth.Contract(
      TotalSupplyAndBorrowABI as AbiItem[],
      TOTALSUPPLYANDBORROW_ADDRESS
    );
  }

  async reloadTotal() {
    if (
      !this.cachedTotal ||
      this.cachedTotal.lastRequestTimestamp + this.minElapsedTimeInMs <
        Date.now() // check if supply needs to be updated
    ) {
      const result = await this.totalSupplyAndBorrow.methods
        .getTotalSupplyAndTotalBorrow()
        .call();
      const lastRequestTimestamp = Date.now();
      this.cachedTotal = {
        supply: result[0],
        borrow: result[1],
        lastRequestTimestamp,
      };
    }
  }

  async getTotalSupply() {
    await this.reloadTotal();
    return this.cachedTotal.supply;
  }

  async getTotalBorrow() {
    await this.reloadTotal();
    return this.cachedTotal.borrow;
  }
}

export async function totalSupplyBankerJoe(ctx) {
  ctx.body = (await cache.getTotalSupply()).toString();
}

export async function totalBorrow(ctx) {
  ctx.body = (await cache.getTotalBorrow()).toString();
}

const cache = new Cache();
