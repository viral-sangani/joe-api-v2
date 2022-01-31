import { gql } from "graphql-request";

export const tokensQuery = gql`
  query tokensQuery($first: Int! = 1000, $skip: Int! = 0) {
    tokens(
      first: $first
      skip: $skip
      orderBy: volumeUSD
      orderDirection: desc
    ) {
      id
      symbol
      name
      decimals
      totalSupply
      volume
      volumeUSD
      untrackedVolumeUSD
      txCount
      liquidity
      derivedAVAX
    }
  }
`;

export const tokensTimeTravelQuery = gql`
  query tokensTimeTravelQuery($first: Int! = 1000, $block: Block_height!) {
    tokens(
      first: $first
      block: $block
      orderBy: volumeUSD
      orderDirection: desc
    ) {
      id
      symbol
      name
      decimals
      totalSupply
      volume
      volumeUSD
      untrackedVolumeUSD
      txCount
      liquidity
      derivedAVAX
    }
  }
`;

export const singleTokenQuery = gql`
  query tokenQuery($id: String!) {
    token(id: $id) {
      id
      symbol
      name
      decimals
      totalSupply
      volume
      volumeUSD
      untrackedVolumeUSD
      txCount
      liquidity
      derivedAVAX
    }
  }
`;

export const avaxPriceTimeTravelQuery = gql`
  query avaxPriceTimeTravelQuery($id: Int! = 1, $block: Block_height!) {
    bundles(id: $id, block: $block) {
      id
      avaxPrice
    }
  }
`;
