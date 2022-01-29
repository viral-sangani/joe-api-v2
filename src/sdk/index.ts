import { ethers, utils } from "ethers";
import { catchedABIs } from "./cachedAbi";
import convertResults from "./convertResults";
import { getProvider } from "./getProvider";
import makeMultiCall from "./makeMultiCall";

type CallParams = string | number | (string | number)[] | undefined;

function resolveABI(providedAbi: string | any) {
  let abi = providedAbi;
  if (typeof abi === "string") {
    abi = catchedABIs[abi];
    if (abi === undefined) {
      throw new Error("ABI method undefined");
    }
  }
  // If type is omitted DP's sdk processes it fine but we don't, so we need to add it
  return {
    type: "function",
    ...abi,
  };
}

function normalizeParams(params: CallParams): (string | number)[] {
  if (params === undefined) {
    return [];
  } else if (typeof params === "object") {
    return params;
  } else {
    return [params];
  }
}

export async function multiCall(params: {
  abi: string | any;
  calls: {
    target: string;
    params?: CallParams;
  }[];
  block?: number;
  target?: string; // Used when calls.target is not provided
  chain?: string;
  requery?: boolean;
}) {
  const abi = resolveABI(params.abi);
  const contractCalls = params.calls.map((call) => {
    const callParams = normalizeParams(call.params);
    return {
      params: callParams,
      contract: call.target ?? params.target,
    };
  });
  // Only a max of around 500 calls are supported by multicall, we have to split bigger batches
  let multicallCalls: any[] = [];
  const result = [] as any[];
  for (let i = 0; i < contractCalls.length; i += 500) {
    const pendingResult = makeMultiCall(
      abi,
      contractCalls.slice(i, i + 500),
      params.chain ?? "avax",
      params.block
    ).then((partialCalls) => {
      result[i / 500] = partialCalls;
    });
    multicallCalls.push(pendingResult);
    if (i % 20000) {
      await Promise.all(multicallCalls); // It would be faster to just await on all of them, but if we do that at some point node crashes without error message, so to prevent that we have to periodically await smaller sets of calls
      multicallCalls = []; // Clear them from memory
    }
  }
  await Promise.all(multicallCalls);
  const flatResults = [].concat.apply([], result) as any[];
  if (params.requery === true && flatResults.some((r) => !r.success)) {
    const failed = flatResults
      .map((r, i) => [r, i])
      .filter((r) => !r[0].success);
    const newResults = await multiCall({
      abi: params.abi,
      chain: params.chain,
      calls: failed.map((f) => f[0].input),
      block: params.block,
      requery: params.requery,
    }).then(({ output }) => output);
    failed.forEach((f, i) => {
      flatResults[f[1]] = newResults[i];
    });
  }
  return {
    output: flatResults, // flatten array
  };
}

export async function call(params: {
  target: string;
  abi: string | any;
  params?: CallParams;
}) {
  const abi = resolveABI(params.abi);
  const callParams = normalizeParams(params.params);

  const contractInterface = new ethers.utils.Interface([abi]);
  const functionABI = ethers.utils.FunctionFragment.from(abi);
  const callData = contractInterface.encodeFunctionData(
    functionABI,
    callParams
  );

  const result = await getProvider().call(
    {
      to: params.target,
      data: callData,
    },
    "latest"
  );
  const decodedResult = contractInterface.decodeFunctionResult(
    functionABI,
    result
  );

  return {
    output: convertResults(decodedResult),
  };
}

export async function getLogs(params: {
  target: string;
  topic: string;
  keys: string[]; // This is just used to select only part of the logs
  fromBlock: number;
  toBlock: number; // DefiPulse's implementation is buggy and doesn't take this into account
  topics?: string[]; // This is an outdated part of DefiPulse's API which is still used in some old adapters
  chain?: string;
}) {
  const filter = {
    address: params.target,
    topics: params.topics ?? [utils.id(params.topic)],
    fromBlock: params.fromBlock,
    toBlock: params.toBlock, // We don't replicate Defipulse's bug because the results end up being the same anyway and hopefully they'll eventually fix it
  };
  let logs: any[] = [];
  let blockSpread = params.toBlock - params.fromBlock;
  let currentBlock = params.fromBlock;
  while (currentBlock < params.toBlock) {
    const nextBlock = Math.min(params.toBlock, currentBlock + blockSpread);
    try {
      const partLogs = await getProvider().getLogs({
        ...filter,
        fromBlock: currentBlock,
        toBlock: nextBlock,
      });
      logs = logs.concat(partLogs);
      currentBlock = nextBlock;
    } catch (e) {
      if (blockSpread >= 2e3) {
        // We got too many results
        // We could chop it up into 2K block spreads as that is guaranteed to always return but then we'll have to make a lot of queries (easily >1000), so instead we'll keep dividing the block spread by two until we make it
        blockSpread = Math.floor(blockSpread / 2);
      } else {
        throw e;
      }
    }
  }
  if (params.keys.length > 0) {
    if (params.keys[0] !== "topics") {
      throw new Error("Unsupported");
    }
    return {
      output: logs.map((log) => log.topics),
    };
  }
  return {
    output: logs,
  };
}
