import { gql } from "graphql-request";

export const graphQuery = gql`
  query get_volume($block: Int, $id: Int) {
    factories {
      volumeUSD
      liquidityUSD
    }
    dayData(id: $id) {
      volumeUSD
    }
  }
`;
