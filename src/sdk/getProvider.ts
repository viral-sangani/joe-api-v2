import { ethers } from "ethers";

export const getProvider = () => {
  // createProvider("avax", "https://api.avax.network/ext/bc/C/rpc", 43114);
  if (process.env.HISTORICAL) {
    return new ethers.providers.StaticJsonRpcProvider(
      "https://api.avax.network/ext/bc/C/rpc",
      {
        name: "avax",
        chainId: 43114,
      }
    );
  } else {
    return new ethers.providers.FallbackProvider(
      "https://api.avax.network/ext/bc/C/rpc".split(",").map((url, i) => ({
        provider: new ethers.providers.StaticJsonRpcProvider(url, {
          name: "avax",
          chainId: 43114,
        }),
        priority: i,
      })),
      1
    );
  }
};
