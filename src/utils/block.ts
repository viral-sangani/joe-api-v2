import { startOfMinute, subDays, subWeeks } from "date-fns";
import request, { gql } from "graphql-request";
import { GRAPH_BLOCKS_URI } from "./constants";

// returns the block number for one day calculated from the current time
export async function getOneDayBlock() {
  const date = startOfMinute(subDays(Date.now(), 1));
  const start = Math.floor(date.getTime() / 1000);
  const end = Math.floor(date.getTime() / 1000) + 600;
  const { blocks } = await request(GRAPH_BLOCKS_URI, blockQuery, {
    start,
    end,
  });
  return { number: Number(blocks[0].number) };
}

// returns the block number for two days calculated from the current time
export async function getTwoDayBlock() {
  const date = startOfMinute(subDays(Date.now(), 2));
  const start = Math.floor(date.getTime() / 1000);
  const end = Math.floor(date.getTime() / 1000) + 600;

  const { blocks } = await request(GRAPH_BLOCKS_URI, blockQuery, {
    start,
    end,
  });

  return { number: Number(blocks[0].number) };
}

// returns the block number for one week calculated from the current time
export async function getSevenDayBlock() {
  const date = startOfMinute(subWeeks(Date.now(), 1));
  const start = Math.floor(date.getTime() / 1000);
  const end = Math.floor(date.getTime() / 1000) + 600;

  const { blocks } = await request(GRAPH_BLOCKS_URI, blockQuery, {
    start,
    end,
  });

  return { number: Number(blocks[0].number) };
}

// the graph block query to retreive the block number
export const blockQuery = gql`
  query blockQuery($start: Int!, $end: Int!) {
    blocks(
      first: 1
      orderBy: timestamp
      orderDirection: asc
      where: { timestamp_gt: $start, timestamp_lt: $end }
    ) {
      id
      number
      timestamp
    }
  }
`;
