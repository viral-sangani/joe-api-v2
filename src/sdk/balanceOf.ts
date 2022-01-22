import { BigNumber, ethers } from "ethers";
import { getProvider } from "./getProvider";

const abi = [
  "function balanceOf(address owner) view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
];

function getContract(address: string) {
  return new ethers.Contract(address, abi, getProvider());
}

export function handleDecimals(num: BigNumber, decimals?: number): string {
  if (decimals === undefined) {
    return num.toString();
  } else {
    return num.div(BigNumber.from(10).pow(decimals)).toString();
  }
}

export async function balanceOf(params: {
  target: string;
  owner: string;
  block?: number;
  decimals?: number;
  chain?: string;
}) {
  const balance: BigNumber = await getContract(params.target).balanceOf(
    params.owner,
    {
      blockTag: params.block ?? "latest",
    }
  );
  return {
    output: handleDecimals(balance, params.decimals),
  };
}
