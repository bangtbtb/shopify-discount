// type VDApplyType = "all" | "collection";

type VDApplyType = "collection" | "products";

export type VDConfigValue = {
  minQuantity: number;
  maxQuantity: number;
  percent: number;
  applyType: VDApplyType;
  colId?: string;
  productIds?: Array<string>;
};
