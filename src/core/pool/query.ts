import { gql } from "graphql-request";

export const pairTokenFieldsQuery = gql`
  fragment pairTokenFields on Token {
    id
    name
    symbol
    totalSupply
    derivedAVAX
  }
`;

export const pairFieldsQuery = gql`
  fragment pairFields on Pair {
    id
    reserveUSD
    reserveAVAX
    volumeUSD
    untrackedVolumeUSD
    trackedReserveAVAX
    token0 {
      ...pairTokenFields
    }
    token1 {
      ...pairTokenFields
    }
    reserve0
    reserve1
    token0Price
    token1Price
    totalSupply
    txCount
    timestamp
  }
  ${pairTokenFieldsQuery}
`;

export const pairSubsetQuery = gql`
  query pairSubsetQuery(
    $first: Int! = 1000
    $pairAddresses: [Bytes]!
    $orderBy: String! = "trackedReserveAVAX"
    $orderDirection: String! = "desc"
  ) {
    pairs(
      first: $first
      orderBy: $orderBy
      orderDirection: $orderDirection
      where: { id_in: $pairAddresses }
    ) {
      id
      reserveUSD
      reserveAVAX
      volumeUSD
      untrackedVolumeUSD
      trackedReserveAVAX
      token0 {
        id
        name
        symbol
        totalSupply
        derivedAVAX
      }
      token1 {
        id
        name
        symbol
        totalSupply
        derivedAVAX
      }
      reserve0
      reserve1
      token0Price
      token1Price
      totalSupply
      txCount
      timestamp
    }
  }
  ${pairFieldsQuery}
`;

export const poolsQuery = gql`
  query poolsQuery(
    $first: Int! = 1000
    $skip: Int! = 0
    $orderBy: String! = "timestamp"
    $orderDirection: String! = "desc"
  ) {
    pools(
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
    ) {
      id
      pair
      allocPoint
      lastRewardTimestamp
      accJoePerShare
      balance
      userCount
      owner {
        id
        joePerSec
        totalAllocPoint
      }
      timestamp
    }
  }
`;

export const liquidityPositionSubsetQuery = gql`
  query liquidityPositionSubsetQuery($first: Int! = 1000, $user: Bytes!) {
    liquidityPositions(
      first: $first
      where: { user: "0xd6a4F121CA35509aF06A0Be99093d08462f53052" }
    ) {
      id
      liquidityTokenBalance
      user {
        id
      }
      pair {
        id
      }
    }
  }
`;

export const poolHistoryQuery = gql`
  query poolHistoryQuery($id: String!) {
    poolHistories(first: 1000, where: { pool: $id }, orderBy: timestamp) {
      id
      pool {
        id
        accJoePerShare
      }
      jlpBalance
      jlpAge
      jlpAgeRemoved
      jlpDeposited
      jlpWithdrawn
      entryUSD
      exitUSD
      joeHarvestedUSD
      userCount
      timestamp
      block
    }
  }
`;
