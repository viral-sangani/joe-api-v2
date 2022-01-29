import BN from "bn.js";
import { Request, Response } from "express";
import { AbiItem } from "web3-utils";
import JoeContractABI from "../../../abis/JoeTokenContractABI.json";
import LockingWrapperABI from "../../../abis/LockingWrapperABI.json";
import {
  AVAX_CHAIN_ID,
  BN_1E18,
  BURN_ADDRESS,
  JOE_ADDRESS,
  LOCKING_WRAPPER_ADDRESS,
  TEAM_TREASURY_WALLETS,
} from "../../../utils/constants";
import { web3Factory } from "../../../utils/web3";
("use strict");

const web3 = web3Factory(AVAX_CHAIN_ID);
const joeContract = new web3!.eth.Contract(
  JoeContractABI as AbiItem[],
  JOE_ADDRESS
);
const lockingWrapperContract = new web3!.eth.Contract(
  LockingWrapperABI as AbiItem[],
  LOCKING_WRAPPER_ADDRESS
);

class Cache {
  minElapsedTimeInMs = 10000; // 10 seconds
  cachedCirculatingSupply:
    | {
        circulatingSupply: BN;
        lastRequestTimestamp: number;
      }
    | undefined;
  cachedMaxSupply: { maxSupply: BN; lastRequestTimestamp: number } | undefined;
  cachedTotalSupply:
    | { totalSupply: BN; lastRequestTimestamp: number }
    | undefined;

  constructor() {
    this.cachedCirculatingSupply = undefined;
    this.cachedMaxSupply = undefined;
    this.cachedTotalSupply = undefined;
  }

  async getTotalSupply() {
    if (
      !this.cachedTotalSupply ||
      this.cachedTotalSupply.lastRequestTimestamp + this.minElapsedTimeInMs <
        Date.now() // check if supply needs to be updated
    ) {
      const totalSupply = new BN(
        await joeContract.methods.totalSupply().call()
      ).sub(new BN(await getBalanceOf(BURN_ADDRESS))); // Remove burned supply
      const lastRequestTimestamp = Date.now();
      this.cachedTotalSupply = { totalSupply, lastRequestTimestamp };
    }

    return this.cachedTotalSupply.totalSupply;
  }

  async getMaxSupply() {
    if (!this.cachedMaxSupply) {
      const maxSupply = new BN(await joeContract.methods.maxSupply().call());
      const lastRequestTimestamp = Date.now();
      this.cachedMaxSupply = { maxSupply, lastRequestTimestamp };
    }
    return this.cachedMaxSupply.maxSupply;
  }

  async getCirculatingSupply() {
    if (
      !this.cachedCirculatingSupply ||
      this.cachedCirculatingSupply.lastRequestTimestamp +
        this.minElapsedTimeInMs <
        Date.now() // check if supply needs to be updated
    ) {
      const teamTreasuryBalances = TEAM_TREASURY_WALLETS.map((wallet) =>
        getBalanceOf(wallet)
      );
      const results = await Promise.all([
        this.getTotalSupply(),
        ...teamTreasuryBalances,
        lockingBalance(),
      ]);

      let circulatingSupply = new BN(results[0]);
      for (let i = 1; i < results.length; i++) {
        circulatingSupply = circulatingSupply.sub(new BN(results[i]));
      }

      const lastRequestTimestamp = Date.now();
      this.cachedCirculatingSupply = {
        circulatingSupply,
        lastRequestTimestamp,
      };
    }
    return this.cachedCirculatingSupply.circulatingSupply;
  }
}

async function lockingBalance() {
  return await lockingWrapperContract.methods.balanceOf().call();
}

async function getBalanceOf(address) {
  return await joeContract.methods.balanceOf(address).call();
}

export async function circulatingSupply(_req: Request, res: Response) {
  var data = (await cache.getCirculatingSupply()).toString();
  res.send(data);
}

export async function circulatingSupplyAdjusted(_req: Request, res: Response) {
  var data = (await cache.getCirculatingSupply()).div(BN_1E18).toString();
  res.send(data);
}

export async function maxSupply(_req: Request, res: Response) {
  var data = (await cache.getMaxSupply()).toString();
  res.send(data);
}

export async function totalSupply(_req: Request, res: Response) {
  var data = (await cache.getTotalSupply()).toString();
  res.send(data);
}

const cache = new Cache();
