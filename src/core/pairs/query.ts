import { gql } from "graphql-request";

export const pairsQuery = gql`
  query pairsQuery(
    $first: Int!
    $skip: Int!
    $orderBy: String! = "trackedReserveAVAX"
    $orderDirection: String! = "desc"
  ) {
    pairs(
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
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
      token0Price
      token1Price
      totalSupply
      txCount
      timestamp
    }
  }
`;

export const pairQuery = gql`
  query pairQuery($id: String!) {
    pair(id: $id) {
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
        decimals
        totalSupply
        derivedAVAX
      }
      token1 {
        id
        name
        symbol
        decimals
        totalSupply
        derivedAVAX
      }
      token0Price
      token1Price
      totalSupply
      txCount
      timestamp
    }
  }
`;

export const pairsTimeTravelQuery = gql`
  query pairsTimeTravelQuery(
    $first: Int! = 1000
    $pairAddresses: [Bytes]!
    $block: Block_height!
  ) {
    pairs(
      first: $first
      block: $block
      orderBy: trackedReserveAVAX
      orderDirection: desc
      where: { id_in: $pairAddresses }
    ) {
      id
      reserveUSD
      trackedReserveAVAX
      volumeUSD
      untrackedVolumeUSD
      txCount
    }
  }
`;

export const pairTimeTravelQuery = gql`
  query pairTimeTravelQuery($id: String!, $block: Block_height!) {
    pair(id: $id, block: $block) {
      id
      reserveUSD
      trackedReserveAVAX
      volumeUSD
      untrackedVolumeUSD
      txCount
    }
  }
`;

export const pairDayDatasQuery = gql`
  query pairDayDatasQuery(
    $first: Int = 1000
    $date: Int = 0
    $pairs: [Bytes]!
  ) {
    pairDayDatas(
      first: $first
      orderBy: date
      orderDirection: desc
      where: { pair_in: $pairs, date_gt: $date }
    ) {
      date
      pair {
        id
      }
      token0 {
        derivedAVAX
      }
      token1 {
        derivedAVAX
      }
      reserveUSD
      volumeToken0
      volumeToken1
      volumeUSD
      txCount
    }
  }
`;

export const transactionsQuery = gql`
  query transactionsQuery($pairAddresses: [Bytes]!) {
    swaps(
      orderBy: timestamp
      orderDirection: desc
      where: { pair_in: $pairAddresses }
    ) {
      id
      timestamp
      pair {
        token0 {
          symbol
        }
        token1 {
          symbol
        }
      }
      sender
      amount0In
      amount0Out
      amount1In
      amount1Out
      amountUSD
      to
    }
    mints(
      orderBy: timestamp
      orderDirection: desc
      where: { pair_in: $pairAddresses }
    ) {
      id
      timestamp
      pair {
        token0 {
          symbol
        }
        token1 {
          symbol
        }
      }
      sender
      amount0
      amount1
      amountUSD
      to
    }
    burns(
      orderBy: timestamp
      orderDirection: desc
      where: { pair_in: $pairAddresses }
    ) {
      id
      timestamp
      pair {
        token0 {
          symbol
        }
        token1 {
          symbol
        }
      }
      sender
      amount0
      amount1
      amountUSD
      to
    }
  }
`;
