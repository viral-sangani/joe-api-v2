import { gql } from "graphql-request";
import { JOEFACTORY_ADDRESS, JOE_BAR } from "../../utils/constants";

export const barQuery = gql`
  query barQuery($id: String! = "${JOE_BAR.toLocaleLowerCase()}") {
    bar(id: $id) {
      id
      totalSupply
      ratio
      xJoeMinted
      xJoeBurned
      joeStaked
      joeStakedUSD
      joeHarvested
      joeHarvestedUSD
      xJoeAge
      xJoeAgeDestroyed
    }
  }
`;

export const barHistoriesQuery = gql`
  query barHistoriesQuery {
    histories(first: 1000, where: { date_gte: 1625616000 }) {
      id
      date
      timeframe
      joeStaked
      joeStakedUSD
      joeHarvested
      joeHarvestedUSD
      xJoeAge
      xJoeAgeDestroyed
      xJoeMinted
      xJoeBurned
      xJoeSupply
      ratio
    }
  }
`;

export const factoryQuery = gql`
  query factoryQuery(
    $id: String! = "${JOEFACTORY_ADDRESS.toLocaleLowerCase()}"
  ) {
    factory(id: $id) {
      id
      volumeUSD
    }
  }
`;

export const factoryTimeTravelQuery = gql`
  query factoryTimeTravelQuery(
    $id: String! = "${JOEFACTORY_ADDRESS.toLocaleLowerCase()}"
    $block: Block_height!
  ) {
    factory(id: $id, block: $block) {
      id
      volumeUSD
    }
  }
`;

export const dayDatasQuery = gql`
  query dayDatasQuery($first: Int! = 1000, $date: Int! = 0) {
    dayDatas(first: $first, orderBy: date, orderDirection: desc) {
      id
      date
      volumeAVAX
      volumeUSD
      untrackedVolume
      liquidityAVAX
      liquidityUSD
      txCount
    }
  }
`;
