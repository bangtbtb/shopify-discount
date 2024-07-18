import { AppProvider } from "@shopify/discount-app-components";
import { PropsWithChildren } from "react";
import "@shopify/discount-app-components/build/esm/styles.css";

export function DiscountProvider({ children }: PropsWithChildren) {
  return (
    <AppProvider locale="en-US" ianaTimezone="America/Toronto">
      {children}
    </AppProvider>
  );
}
