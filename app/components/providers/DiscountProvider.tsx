import { AppProvider } from "@shopify/discount-app-components";
import { PropsWithChildren, useEffect, useState } from "react";
import { ShopifyGlobal, useAppBridge } from "@shopify/app-bridge-react";

import "@shopify/discount-app-components/build/esm/styles.css";

export function DiscountProvider({ children }: PropsWithChildren) {
  const [bridge, setBridge] = useState<ShopifyGlobal | null>(null);
  const [tz, setTZ] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  );

  useEffect(() => {
    if (!bridge) {
      var curBridge = useAppBridge();
      setBridge(curBridge);
    }
  }, []);

  return (
    <AppProvider locale={bridge?.config.locale ?? "en-US"} ianaTimezone={tz}>
      {children}
    </AppProvider>
  );
}
