import { BigNumber, utils } from "ethers";
import { Request, Response } from "express";
import { getChainVolume } from "../../../core/tvl/graph";
import { staking } from "../../../core/tvl/staking";
import { JOE_BAR, JOE_TOKEN } from "../../../utils/constants";
import { getTokenPrice } from "../../v1/price";
import { getRawLendingData } from "../lending/index";

/**
 * getTvl fetches liquidityUSD, stakeUSD, and lending supply to calculate total TVL of trader joe
 * @param req express request object
 * @param res express response object
 */
export const getTvl = async (req: Request, res: Response) => {
  // Handle Lending / Borrowing
  const ledingData = await getRawLendingData();

  // Handle Staking
  const stakingTvl: any = await staking(JOE_BAR, JOE_TOKEN);
  let formattedStakingTvl = utils.formatUnits(
    BigNumber.from(Object.values(stakingTvl)[0]),
    18
  );
  const tokenPrice = await getTokenPrice(JOE_TOKEN);
  let formattedPrice = utils.formatUnits(BigNumber.from(tokenPrice), 18);

  // Handle Liquidity from The Graph
  const allLiquidity = await getChainVolume();

  let liquidityUSD = parseFloat(allLiquidity.liquidityUSD).toFixed(2);
  let stakingUSD = (
    parseFloat(formattedPrice) * parseFloat(formattedStakingTvl)
  ).toFixed(2);
  let lendingSupplyUSD = parseFloat(ledingData?.totalSupplyUSD ?? "0").toFixed(
    2
  );

  res.send({
    tvl: {
      liquidityUSD,
      stakingUSD,
      lendingSupplyUSD,
    },
    totalTvl: (
      parseFloat(liquidityUSD) +
      parseFloat(stakingUSD) +
      parseFloat(ledingData?.totalSupplyUSD ?? "0")
    ).toFixed(2),
  });
};
