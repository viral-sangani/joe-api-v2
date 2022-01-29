import Web3 from "web3";
import { AVAX_CHAIN_ID, AVAX_RPC } from "./constants";

export const web3Factory = (chainId: number) => {
  switch (chainId) {
    case AVAX_CHAIN_ID:
      return new Web3(AVAX_RPC);
  }
};
