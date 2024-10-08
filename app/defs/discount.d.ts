// DiscountValueType
export type DVT = "percent" | "fix";

export type DiscountValue = {
  value: number;
  type: DVT;
};

//
type DStatus = "active" | "draft";

// ----------------------- Basic discount config ---------------------

export type RewardStep = {
  require: number; // Condition
  value: DiscountValue; // Reward
  // label: string;
};

export type ProductCondition = {
  id: string; // Product id
  quantity: number; // Atleast 1
  // variants?: string[]; // Undefine <=> all
};

// ----------------------------- Order discount (bundle) --------------

export type ODApplyType = "total" | "bundle";

export type ODTotalConfig = {
  steps: RewardStep[];
};

export type ODBundleConfig = {
  value: DiscountValue;
  allOrder?: boolean;
  productIds: string[];
  numRequires: number[];
};

export type ODConfig = {
  label: string;
  applyType: ODApplyType;
  total?: ODTotalConfig;
  bundle?: ODBundleConfig;
  // bxgy?: ODBXGY;
};

// ----------------------------- Shipping discount --------------

export type SDApplyType = "total" | "volume";

export type SDConfig = {
  label: string;
  applyType: SDApplyType;
  local?: string[];
  steps: RewardStep[] | undefined;
  collIds: string[] | undefined;
  productIds: string[] | undefined;
};

// ------------------------------ Volume discount -----------------

// export type PDApplyType = "collection" | "products"; // | "attach";
export type PDApplyType = "volume" | "recommended";

export type AttachedProduct = {
  product: string;
  maxProduct: number;
  value: DiscountValue;
};

export type AttachedConfig = {
  productRequire: string;
  attachedProduct: AttachedProduct[];
};

export type VolumeConfig = {
  steps: RewardStep[];
  collIds?: string[];
  productIds?: string[];
};

export type PDConfig = {
  label: string;
  applyType: PDApplyType;
  volume?: VolumeConfig;
  attached?: AttachedConfig;

  // steps: RewardStep[];
  // collIds?: string[];
  // productIds?: string[];
};

// -----------------------------------------------------

export interface DiscountApplication {
  target_type: "line_item" | "shipping_line";
  type: string;
  value: bigint;
  value_type: "percentage" | "fixed_amount";
  allocation_method: "across" | "each";
  target_selection: "all" | "entitled" | "explicit";
  title: string;
}

export interface LineItem {
  id: number;
  admin_graphql_api_id: string;
  attributed_staffs: any[];
  current_quantity: number;
  fulfillable_quantity: number;
  fulfillment_service: string;
  fulfillment_status: any;
  gift_card: boolean;
  grams: number;
  name: string;
  price: bigint;
  price_set: PriceSet;
  product_exists: boolean;
  product_id: number;
  properties: any[];
  quantity: number;
  requires_shipping: boolean;
  sku: string;
  taxable: boolean;
  title: string;
  total_discount: bigint;
  total_discount_set: PriceSet;
  variant_id: number;
  variant_inventory_management: string;
  variant_title: string;
  vendor: string;
  tax_lines: TaxLine[];
  duties: any[];
  discount_allocations: DiscountAllocation[];
}

// --------------------- DIscount GUI ---------------------

// type DiscountTypeGUI =
//   | "attached"
//   | "bundle"
//   | "total_order"
//   | "volume"
//   | "shipping_volume"
//   | "shipping_total"
//   | "none";

export interface DiscountUseCaseDesc {
  id: string;
  value: string;
}

export interface DiscountCreateDesc {
  id: DiscountTypeGUI;
  title: string;
  desc: string;
  usecase?: DiscountUseCaseDesc[];
  illustration: React.ReactElement;
}
