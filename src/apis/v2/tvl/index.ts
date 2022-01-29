import { BigNumber, utils } from "ethers";
import { Request, Response } from "express";
import { JOE_BAR, JOE_TOKEN } from "../../../utils/constants";
import { getTokenPrice } from "../../v1/price";
import { getRawLendingData } from "../lending/index";
import { getChainVolume } from "./getSubgraphVolume";
import { staking } from "./staking";

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

  let formattedPrice = await utils.formatUnits(BigNumber.from(tokenPrice), 18);
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
