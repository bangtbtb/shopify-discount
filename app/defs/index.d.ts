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

// ----------------------------- Common --------------

type ActionStatus = "success" | "failed" | "";

// ------------------------------------- PubSub -----------------

export interface AttributesEvent {
  "X-Shopify-Event-Id": string;
  "X-Shopify-Webhook-Id": string;
  "X-Shopify-Shop-Domain": string;
  "X-Shopify-Topic": string;
  "X-Shopify-Triggered-At": string;
  "X-Shopify-Hmac-SHA256": string;
  "Content-Type": string;
  "X-Shopify-API-Version": string;
}

export interface DiscountEvent {
  admin_graphql_api_id: string;
  title: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Money {
  amount: string;
  currency_code: string;
}

export interface PriceSet {
  shop_money: Money;
  presentment_money: Money;
}

export interface OrderCreateEvent {
  id: number;
  admin_graphql_api_id: string;
  app_id: number;
  browser_ip: string;
  buyer_accepts_marketing: boolean;
  cancel_reason: any;
  cancelled_at: any;
  cart_token: string;
  checkout_id: number;
  checkout_token: string;
  client_details: ClientDetails;
  closed_at: any;
  company: any;
  confirmation_number: string;
  confirmed: boolean;
  created_at: string;
  currency: string;
  current_subtotal_price: string;
  current_subtotal_price_set: PriceSet;
  current_total_additional_fees_set: any;
  current_total_discounts: string;
  current_total_discounts_set: PriceSet;
  current_total_duties_set: any;
  current_total_price: string;
  current_total_price_set: PriceSet;
  current_total_tax: string;
  current_total_tax_set: PriceSet;
  customer_locale: string;
  device_id: any;
  discount_codes: any[];
  estimated_taxes: boolean;
  financial_status: string;
  fulfillment_status: any;
  landing_site: string;
  landing_site_ref: any;
  location_id: any;
  merchant_of_record_app_id: any;
  name: string;
  note: any;
  note_attributes: any[];
  number: number;
  order_number: number;
  original_total_additional_fees_set: any;
  original_total_duties_set: any;
  payment_gateway_names: string[];
  po_number: any;
  presentment_currency: string;
  processed_at: string;
  reference: string;
  referring_site: string;
  source_identifier: string;
  source_name: string;
  source_url: any;
  subtotal_price: string;
  subtotal_price_set: PriceSet;
  tags: string;
  tax_exempt: boolean;
  tax_lines: TaxLine[];
  taxes_included: boolean;
  test: boolean;
  token: string;
  total_discounts: string;
  total_discounts_set: PriceSet;
  total_line_items_price: string; // Total order
  total_line_items_price_set: PriceSet;
  total_outstanding: string;
  total_price: string;
  total_price_set: PriceSet;
  total_shipping_price_set: PriceSet;
  total_tax: string;
  total_tax_set: PriceSet;
  total_tip_received: string;
  total_weight: number;
  updated_at: string;
  user_id: any;
  billing_address: BillingAddress;
  customer: Customer;
  discount_applications: DiscountApplication[];
  fulfillments: any[];
  line_items: LineItem[];
  payment_terms: any;
  refunds: any[];
  shipping_address: ShippingAddress;
  shipping_lines: ShippingLine[];
}

export interface ClientDetails {
  accept_language: string;
  browser_height: any;
  browser_ip: string;
  browser_width: any;
  session_hash: any;
  user_agent: string;
}

export interface TaxLine {
  price: string;
  rate: number;
  title: string;
  price_set: PriceSet;
  channel_liable: boolean;
}

export interface BillingAddress {
  province: any;
  country: string;
  country_code: string;
  province_code: any;
}

export interface Customer {
  id: number;
  created_at: string;
  updated_at: string;
  state: string;
  note: any;
  verified_email: boolean;
  multipass_identifier: any;
  tax_exempt: boolean;
  email_marketing_consent: EmailMarketingConsent;
  sms_marketing_consent: any;
  tags: string;
  currency: string;
  tax_exemptions: any[];
  admin_graphql_api_id: string;
  default_address: DefaultAddress;
}

export interface EmailMarketingConsent {
  state: string;
  opt_in_level: string;
  consent_updated_at: any;
}

export interface DefaultAddress {
  id: number;
  customer_id: number;
  company: any;
  province: any;
  country: string;
  province_code: any;
  country_code: string;
  country_name: string;
  default: boolean;
}

export interface DiscountApplication {
  target_type: string;
  type: string;
  value: string;
  value_type: string;
  allocation_method: string;
  target_selection: string;
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
  price: string;
  price_set: PriceSet;
  product_exists: boolean;
  product_id: number;
  properties: any[];
  quantity: number;
  requires_shipping: boolean;
  sku: string;
  taxable: boolean;
  title: string;
  total_discount: string;
  total_discount_set: PriceSet;
  variant_id: number;
  variant_inventory_management: string;
  variant_title: string;
  vendor: string;
  tax_lines: TaxLine2[];
  duties: any[];
  discount_allocations: DiscountAllocation[];
}

export interface TaxLine2 {
  channel_liable: boolean;
  price: string;
  price_set: PriceSet;
  rate: number;
  title: string;
}

export interface DiscountAllocation {
  amount: string;
  amount_set: PriceSet;
  discount_application_index: number;
}

export interface ShippingAddress {
  province: any;
  country: string;
  country_code: string;
  province_code: any;
}

export interface ShippingLine {
  id: number;
  carrier_identifier: string;
  code: string;
  discounted_price: string;
  discounted_price_set: PriceSet;
  is_removed: boolean;
  phone: any;
  price: string;
  price_set: PriceSet;
  requested_fulfillment_service_id: any;
  source: string;
  title: string;
  tax_lines: any[];
  discount_allocations: any[];
}
