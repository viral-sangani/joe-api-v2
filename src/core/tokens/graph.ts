import { BigNumber, utils } from "ethers";
import request from "graphql-request";
import { getTokenPrice } from "../../apis/v1/price";
import { getOneDayBlock, getSevenDayBlock } from "../../utils/block";
import {
  TRADER_JOE_GRAPH_EXCHANGE,
  WAVAX_ADDRESS,
} from "../../utils/constants";
import { TokensProps } from "../../utils/types";
import {
  avaxPriceTimeTravelQuery,
  tokensQuery,
  tokensTimeTravelQuery,
} from "./query";

export const getAllTokens = async () => {
  const [oneDayblock, sevenDayBlock] = await Promise.all([
    getOneDayBlock(),
    getSevenDayBlock(),
  ]);
  const [{ tokens }, { tokens: oneDayTokens }, { tokens: sevenDayTokens }] =
    await Promise.all([
      request(TRADER_JOE_GRAPH_EXCHANGE, tokensQuery),
      request(TRADER_JOE_GRAPH_EXCHANGE, tokensTimeTravelQuery, {
        block: oneDayblock,
      }),
      request(TRADER_JOE_GRAPH_EXCHANGE, tokensTimeTravelQuery, {
        block: sevenDayBlock,
      }),
    ]);

  var data = tokens.map((token) => {
    const oneDayToken = oneDayTokens.find(({ id }) => token.id === id);
    const sevenDayToken = sevenDayTokens.find(({ id }) => token.id === id);

    return {
      ...token,
      oneDay: {
        volumeUSD: String(oneDayToken?.volumeUSD),
        derivedAVAX: String(oneDayToken?.derivedAVAX),
        liquidity: String(oneDayToken?.liquidity),
      },
      sevenDay: {
        volumeUSD: String(sevenDayToken?.volumeUSD),
        derivedAVAX: String(sevenDayToken?.derivedAVAX),
        liquidity: String(sevenDayToken?.liquidity),
      },
    };
  });

  return data;
};

export const getTokenDetails = async (
  tokenAddress: string,
  token: TokensProps
) => {
  const [oneDayblock, sevenDayBlock] = await Promise.all([
    getOneDayBlock(),
    getSevenDayBlock(),
  ]);
  const [{ bundles: oneDayAvaxPriceData }, { bundles: sevenDayAvaxPriceData }] =
    await Promise.all([
      request(TRADER_JOE_GRAPH_EXCHANGE, avaxPriceTimeTravelQuery, {
        block: oneDayblock,
      }),
      request(TRADER_JOE_GRAPH_EXCHANGE, avaxPriceTimeTravelQuery, {
        block: sevenDayBlock,
      }),
    ]);

  const tokenPrice = await getTokenPrice(WAVAX_ADDRESS);
  let formattedPrice = utils.formatUnits(BigNumber.from(tokenPrice), 18);

  const price = parseFloat(token.derivedAVAX) * parseFloat(formattedPrice);
  const priceYesterday =
    parseFloat(token.oneDay?.derivedAVAX) *
    parseFloat(oneDayAvaxPriceData[0]?.avaxPrice);

  const priceChange = ((price - priceYesterday) / priceYesterday) * 100;

  const priceLastWeek =
    parseFloat(token.sevenDay?.derivedAVAX) *
    parseFloat(sevenDayAvaxPriceData[0]?.avaxPrice);

  const sevenDayPriceChange = ((price - priceLastWeek) / priceLastWeek) * 100;

  const liquidityUSD =
    parseFloat(token?.liquidity) *
    parseFloat(token?.derivedAVAX) *
    parseFloat(formattedPrice);

  const volumeYesterday =
    parseFloat(token.volumeUSD) - parseFloat(token.oneDay?.volumeUSD);
  return {
    price,
    priceYesterday,
    priceChange,
    priceLastWeek,
    sevenDayPriceChange,
    liquidityUSD,
    volumeYesterday,
  };
};
