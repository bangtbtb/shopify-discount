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

const sdConfigTotal: SDConfig = {
  title: "SD Total",
  label: "SD total config",
  applyType: "total",
  steps: [
    { require: 100, value: { value: 10, type: "percent" } },
    { require: 200, value: { value: 15, type: "percent" } },
    { require: 300, value: { value: 20, type: "percent" } },
  ],
};

const sdConfigContain: SDConfig = {
  title: "SD Contain",
  label: "SD contain config",
  applyType: "volume",
  productIds: ["product 1", "product 2"],
  steps: [
    { require: 2, value: { value: 10, type: "percent" } },
    { require: 4, value: { value: 15, type: "percent" } },
    { require: 6, value: { value: 20, type: "percent" } },
  ],
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
