// DiscountValueType
export type DVT = "percent" | "fix";

export type DiscountValue = {
  value: number;
  type: DVT;
};
// ----------------------- Basic discount config ---------------------

export type RewardStep = {
  require: number; // Condition
  value: DiscountValue; // Reward
  // label: string;
};

export type ProductCondition = {
  id: string; // Product id
  quantity?: number; // Atleast 1
  // variants?: string[]; // Undefine <=> all
};

// ----------------------------- Order discount (bundle) --------------

export type ODApplyType = "total" | "contain";

export type ODTotalConfig = {
  steps: RewardStep[];
};

export type ODContainConfig = {
  value: DiscountValue;
  allOrder?: boolean;
  productIds: ProductCondition[];
};

// export type ODBXGY = {
//   requireds: ProductCondition[]; // Require product ids
//   rewards: ProductCondition[];
//   rewardValue: DiscountValue;
// };

export type ODConfig = {
  label: string;
  applyType: ODApplyType;
  total?: ODTotalConfig;
  contain?: ODContainConfig;
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

export type VDApplyType = "collection" | "products";

export type VDConfig = {
  label: string;
  applyType: VDApplyType;
  steps: RewardStep[];
  collIds?: string[];
  productIds?: string[];
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

// --------------------- DIscount GUI ---------------------

type DiscountTypeGUI =
  | "bundle"
  | "total_order"
  | "volume"
  | "shipping_volume"
  | "shipping_total"
  | "none";

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

// bold:700, semibol:600 medium:500, regular: normal, light: 300
export type FontWeight = "700" | "600" | "500" | "400" | "300";

export interface FontConfig {
  size: number;
  color: string;
  weight: FontWeight;
}

export interface FrameConfig {
  bgColor: string;
  borderColor: string;
}

export type GUIProductConfig = FrameConfig & {
  name: FontConfig;
  price: FontConfig;
};

export type GUIButtonConfig = {
  frame: FrameConfigField;
  fontConfig: FontConfigField;
};

export type GUIBundleTotalConfig = {
  frame: FrameConfig;
  label: FontConfig;
  price: FontConfig;
  comparePrice: FontConfig;
};

export interface GUIBundleConfig {
  title: FontConfig;
  product: GUIProductConfig;
  button: GUIButtonConfig;
  total: GUIBundleTotalConfig;
  // highLightedTag: FontConfig;
}

export interface GUIVolumeConfig {
  title: FontConfig;
  offerTitle: FontConfig;
  highlight: FrameConfig;
}
