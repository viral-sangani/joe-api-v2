import { gql, request } from "graphql-request";
import { TRADER_JOE_GRAPH_LENDING } from "../../utils/constants";

const allLiquidationDayDatasQuery = gql`
  query liquidationDayDatas($first: Int = 1000, $date: Int = 0) {
    liquidationDayDatas(
      first: $first
      orderBy: date
      orderDirection: desc
      where: { date_gte: $date }
    ) {
      id
      date
      underlyingRepayAmountUSD
      underlyingCollateralSeizedAmountUSD
    }
  }
`;

const allMarketDayDatasQuery = gql`
  query marketDayDatas($first: Int = 1000, $date: Int = 0) {
    marketDayDatas(
      first: $first
      orderBy: date
      orderDirection: desc
      where: { date_gte: $date }
    ) {
      id
      date
      totalBorrows
      totalBorrowsUSD
      totalSupplyUSD
      totalSupply
      totalReservesUSD
    }
  }
`;

export const fetchLendingGraphData = async () => {
  let mergedLiquidationDayDatas: any = [];
  const { liquidationDayDatas } = await request(
    TRADER_JOE_GRAPH_LENDING,
    allLiquidationDayDatasQuery
  );

  const { marketDayDatas } = await request(
    TRADER_JOE_GRAPH_LENDING,
    allMarketDayDatasQuery
  );

  liquidationDayDatas.forEach((data) => {
    let existing = mergedLiquidationDayDatas.filter(
      (pastData) => pastData.date == data.date
    );
    if (existing.length) {
      let existingIndex = mergedLiquidationDayDatas.indexOf(existing[0]);
      mergedLiquidationDayDatas[
        existingIndex
      ].underlyingCollateralSeizedAmountUSD =
        Number(
          mergedLiquidationDayDatas[existingIndex]
            .underlyingCollateralSeizedAmountUSD
        ) + Number(data.underlyingCollateralSeizedAmountUSD);
    } else {
      data = {
        date: data.date,
        underlyingCollateralSeizedAmountUSD: Number(
          data.underlyingCollateralSeizedAmountUSD
        ),
      };
      mergedLiquidationDayDatas.push(data);
    }
  });
  const { liquidationChartDatas } = mergedLiquidationDayDatas.reduce(
    (previousValue, currentValue) => {
      previousValue["underlyingCollateralSeizedAmountUSD"].unshift({
        date: currentValue.date,
        value:
          parseFloat(currentValue.underlyingCollateralSeizedAmountUSD) || 0,
      });
      return previousValue || 0;
    },
    { underlyingCollateralSeizedAmountUSD: [] }
  );

  let mergedMarketDayDatas: any[] = [];

  marketDayDatas.forEach((data) => {
    let existing = mergedMarketDayDatas.filter(function (pastData, i) {
      return pastData.date == data.date;
    });
    if (existing.length) {
      let existingIndex = mergedMarketDayDatas.indexOf(existing[0]);
      mergedMarketDayDatas[existingIndex].totalSupplyUSD =
        Number(mergedMarketDayDatas[existingIndex].totalSupplyUSD) +
        Number(data.totalSupplyUSD);
      mergedMarketDayDatas[existingIndex].totalBorrowsUSD =
        Number(mergedMarketDayDatas[existingIndex].totalBorrowsUSD) +
        Number(data.totalBorrowsUSD);
      mergedMarketDayDatas[existingIndex].totalReservesUSD =
        Number(mergedMarketDayDatas[existingIndex].totalReservesUSD) +
        Number(data.totalReservesUSD);
    } else {
      data = {
        date: data.date,
        totalSupplyUSD: Number(data.totalSupplyUSD),
        totalBorrowsUSD: Number(data.totalBorrowsUSD),
        totalReservesUSD: Number(data.totalReservesUSD),
      };
      mergedMarketDayDatas.push(data);
    }
  });

  mergedMarketDayDatas = mergedMarketDayDatas.sort((a, b) =>
    Number(a.date) > Number(b.date) ? 1 : -1
  );

  let cumulativeBorrowsUSD: any[] = [];
  let cumulativeSupplyUSD: any[] = [];
  let cumulativeReservesUSD: any[] = [];

  mergedMarketDayDatas.forEach((data, index) => {
    cumulativeSupplyUSD.push({
      date: data.date,
      value: Number(data.totalSupplyUSD),
    });
    cumulativeBorrowsUSD.push({
      date: data.date,
      value: Number(data.totalBorrowsUSD),
    });
    cumulativeReservesUSD.push({
      date: data.date,
      value: Number(data.totalReservesUSD),
    });
  });

  const marketChartDatas = {
    cumulativeBorrowsUSD,
    cumulativeSupplyUSD,
    cumulativeReservesUSD,
  };

  return { liquidationDayDatas, liquidationChartDatas, marketChartDatas };
};
