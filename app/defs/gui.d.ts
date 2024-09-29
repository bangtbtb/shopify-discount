// SeriesDataPoint
export type SeriesDP = {
  date: string;
  data: number;
};

// SeriesDataPoint
export type SeriesDateDP = {
  date: Date;
  data: number;
};

export type OrdersReport = {
  orderCount: bigint;
  subTotal: bigint;
  wasApplied: boolean;
  date: string;
};
