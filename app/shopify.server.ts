import "@shopify/shopify-app-remix/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  BillingInterval,
  DeliveryMethod,
  shopifyApp,
} from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import { restResources } from "@shopify/shopify-api/rest/admin/2024-07";
import prisma from "./db.server";
import { startGooglePubsub } from "./pubsub";
import { BillingReplacementBehavior } from "@shopify/shopify-api";

startGooglePubsub();
console.log("Init beepify");

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: ApiVersion.July24,
  scopes: process.env.SCOPES?.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  billing: {
    Freemium: {
      lineItems: [
        {
          interval: BillingInterval.Usage,
          terms: "Up to 500$ of monthly sales",
          amount: 499200,
          currencyCode: "USD",
        },
      ],
    },
    Basic: {
      lineItems: [
        {
          interval: BillingInterval.Every30Days,
          amount: 9.9,
          currencyCode: "USD",
        },
        {
          interval: BillingInterval.Usage,
          terms: "Up to $3K of monthly sales",
          amount: 499200,
          currencyCode: "USD",
        },
      ],
    },
    Advance: {
      lineItems: [
        {
          interval: BillingInterval.Every30Days,
          amount: 39.9,
          currencyCode: "USD",
        },
        {
          interval: BillingInterval.Usage,
          terms: "Up to $15K of monthly sales",
          amount: 500100,
          currencyCode: "USD",
        },
      ],
    },
    Enterprise: {
      lineItems: [
        {
          interval: BillingInterval.Every30Days,
          amount: 199.9,
          currencyCode: "USD",
        },
      ],
    },
  },
  restResources,
  webhooks: {
    APP_UNINSTALLED: {
      pubSubProject: "earnest-command-226202",
      pubSubTopic: "vd_discount",
      deliveryMethod: DeliveryMethod.PubSub,
    },
    DISCOUNTS_CREATE: {
      pubSubProject: "earnest-command-226202",
      pubSubTopic: "vd_discount",
      deliveryMethod: DeliveryMethod.PubSub,
    },
    DISCOUNTS_UPDATE: {
      pubSubProject: "earnest-command-226202",
      pubSubTopic: "vd_discount",
      deliveryMethod: DeliveryMethod.PubSub,
      // deliveryMethod: DeliveryMethod.Http,
      // callbackUrl: "/webhooks",
    },
    DISCOUNTS_DELETE: {
      pubSubProject: "earnest-command-226202",
      pubSubTopic: "vd_discount",
      deliveryMethod: DeliveryMethod.PubSub,
    },
  },
  hooks: {
    afterAuth: async ({ session }) => {
      console.log("-------------------Call after_auth");

      shopify
        .registerWebhooks({ session })
        .then(() => {
          console.log("Register webhook success");
        })
        .catch((error) => {
          console.error(`Try to register webhooks error: `, error);
        });
    },
  },
  future: {
    unstable_newEmbeddedAuthStrategy: true,
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});

export default shopify;
export const apiVersion = ApiVersion.July24;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
