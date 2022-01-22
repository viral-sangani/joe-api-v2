import { BigNumber, utils } from "ethers";
import { Request, Response } from "express";
import { JOE_BAR, JOE_TOKEN } from "../../../utils/constants";
import { priceOfToken } from "../../v1/price";
import { getChainVolume } from "./getSubgraphVolume";
import { getTotalLendingData } from "./lending";
import { staking } from "./staking";

export const tvl = async (req: Request, res: Response) => {
  // Handle Lending / Borrowing
  const ledingData = await getTotalLendingData();

  // Handle Staking
  const stakingTvl: any = await staking(JOE_BAR, JOE_TOKEN);
  let formattedStakingTvl = utils.formatUnits(
    BigNumber.from(Object.values(stakingTvl)[0]),
    18
  );
  const tokenPrice = await priceOfToken({
    params: { tokenAddress: JOE_TOKEN },
  });
  let formattedPrice = await utils.formatUnits(BigNumber.from(tokenPrice), 18);
  // Handle Liquidity from The Graph
  const allLiquidity = await getChainVolume();

  let liquidityUSD = parseFloat(allLiquidity.liquidityUSD).toFixed(2);
  let stakingUSD = (
    parseFloat(formattedPrice) * parseFloat(formattedStakingTvl)
  ).toFixed(2);
  let depositedUSD = parseFloat(
    utils.formatUnits(BigNumber.from(ledingData.totalDeposited), 18)
  ).toFixed(2);

  res.send({
    tvl: {
      liquidityUSD,
      stakingUSD,
      depositedUSD,
    },
    totalTvl: (
      parseFloat(liquidityUSD) +
      parseFloat(stakingUSD) +
      parseFloat(depositedUSD)
    ).toFixed(2),
  });
};
