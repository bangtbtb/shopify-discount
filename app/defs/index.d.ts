// DiscountValueType
export type DVT = "percent" | "fix";

export type DiscountValue = {
  value: number;
  type: DVT;
};

// ------------------------------ Volume discount -----------------

export type VDApplyType = "collection" | "products";

export type ODApplyType = "total" | "contain";

export type VDStep = {
  require: number;
  value: DiscountValue;
};

export type VDConfig = {
  label: string;
  steps: VDStep[];
  applyType: VDApplyType;
  colId: string | undefined;
  productIds: string[] | undefined;
};

// ----------------------------- Order discount (bundle) --------------

export type ODTotalStep = {
  total: number; // Condition
  value: DiscountValue; // Reward
};

export type ODTotalConfig = {
  steps: ODTotalStep[];
};

export type ODContainConfig = {
  value: DiscountValue;
  productIds: string[];
};

export type ODConfig = {
  label: string;
  applyType: ODApplyType;
  total?: ODTotalConfig | undefined;
  contain?: ODContainConfig | undefined;
};

// ----------------------------- Shipping discount --------------

export type SDApplyType = "total" | "volume";

export type SDStep = {
  require: number;
  value: DiscountValue;
};

export type SDConfig = {
  label: string;
  applyType: SDApplyType;
  local?: string[] | undefined;
  steps: SDStep[] | undefined;
  collIds: string[] | undefined;
  productIds: string[] | undefined;
};

// export type VDConfigValue = {
//   label: string;
//   minQuantity: number;
//   maxQuantity: number;
//   percent: number;
//   applyType: VDApplyType;
//   colId?: string;
//   productIds?: Array<string>;
// };

// ----------------------------- Common --------------

type ActionStatus = "success" | "failed" | "";
