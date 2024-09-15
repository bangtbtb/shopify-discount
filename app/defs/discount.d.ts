// DiscountValueType
export type DVT = "percent" | "fix";

export type DiscountValue = {
  value: number;
  type: DVT;
};
// ----------------------- Basic discount config ---------------------

export type BasicDiscountConfig = {
  label: string;
  applyType: VDApplyType;
};

// ----------------------------- Order discount (bundle) --------------

export type ODApplyType = "total" | "contain";

export type ODTotalStep = {
  total: number; // Condition
  value: DiscountValue; // Reward
};

export type ODTotalConfig = {
  steps: ODTotalStep[];
};

export type ODContainConfig = {
  value: DiscountValue;
  allOrder: boolean | undefined;
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

// ------------------------------ Volume discount -----------------

export type VDApplyType = "collection" | "products";

export type VDStep = {
  require: number;
  value: DiscountValue;
};

export type VDConfig = {
  label: string;
  applyType: VDApplyType;
  steps: VDStep[];
  // colId: string | undefined;
  collIds: string[] | undefined;
  productIds: string[] | undefined;
};

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
