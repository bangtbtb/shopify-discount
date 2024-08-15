import { BillingCheckResponseObject } from "@shopify/shopify-api";

export type AppContextType = {
  bill: BillingCheckResponseObject | null;
};
