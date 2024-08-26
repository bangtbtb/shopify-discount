import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { ShopifyGlobal, useAppBridge } from "@shopify/app-bridge-react";
import { useEffect, useState } from "react";
import { I18nContext, I18nManager } from "@shopify/react-i18n";

export default function App() {
  const [bridge, setBridge] = useState<ShopifyGlobal | null>(null);
  const [i18nManager, seti18nManager] = useState(
    new I18nManager({
      locale: "en",
      onError(error) {
        console.log("Load i18n error: ", error);
      },
    }),
  );

  useEffect(() => {
    if (!bridge) {
      var curBridge = useAppBridge();
      seti18nManager(
        new I18nManager({
          locale: curBridge.config.locale,
          onError(error) {
            console.log("Load i18n error: ", error);
          },
        }),
      );
      setBridge(curBridge);
      console.log("Reload bridge", curBridge);
    }
  }, []);

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta
          name="shopify-api-key"
          content="59c7dbfbeefd1f11ba1aa85228d3700a"
        />

        <link rel="preconnect" href="https://cdn.shopify.com/" />
        <link
          rel="stylesheet"
          href="https://cdn.shopify.com/static/fonts/inter/v4/styles.css"
        />
        <script src="https://cdn.shopify.com/shopifycloud/app-bridge.js"></script>
        <Meta />
        <Links />
      </head>
      <body>
        <I18nContext.Provider value={i18nManager}>
          <Outlet />
        </I18nContext.Provider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
