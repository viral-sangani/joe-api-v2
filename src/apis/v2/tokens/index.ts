import { Request, Response } from "express";
import { cache } from "../../..";
import { TokenDetails, TokensProps } from "../../../utils/types";
import { getAllTokens, getTokenDetails } from "./../../../core/tokens/graph";
import {
  cacheTokensKey,
  cacheTokensTTL,
} from "./../../../utils/cacheConstants";

const getCachedTokens = async () => {
  let tokens: TokensProps[] | undefined = cache.get(cacheTokensKey);
  if (tokens == undefined) {
    tokens = await getAllTokens();
    cache.set(cacheTokensKey, tokens, cacheTokensTTL);
  }
  return tokens;
};

const getCachedTokenDetails = async (id: string, token: TokensProps) => {
  let tokenDetails: TokenDetails | undefined = cache.get(`token-${id}`);
  if (tokenDetails == undefined) {
    tokenDetails = await getTokenDetails(id, token);
    cache.set(`token-${id}`, tokenDetails, cacheTokensTTL);
  }
  return tokenDetails;
};

export const getTokens = async (req: Request, res: Response) => {
  const { first = "25", skip = "0" } = req.query as {
    first: string;
    skip: string;
  };
  let tokens = await getCachedTokens();
  var data = tokens?.splice(Number(skip), Number(first)) ?? [];
  res.send(data);
};

export const getSingleToken = async (req: Request, res: Response) => {
  const { id } = req.params;
  let tokens = await getCachedTokens();
  var data = tokens?.find(({ id: tokenId }) => tokenId === id);
  if (data == undefined || data == null) {
    res.send({ error: "Invalid Token" });
  } else {
    var extraDetails = await getCachedTokenDetails(id, data);
    res.send({ ...data, ...extraDetails });
  }
};
