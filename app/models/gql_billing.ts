import { AdminOperations } from "@shopify/admin-api-client";
import { GraphQLClient } from "node_modules/@shopify/shopify-app-remix/dist/ts/server/clients/types";
import {
  AppPricingInterval,
  AppSubscriptionLineItemInput,
  CurrencyCode,
} from "~/types/admin.types";

export const DefaultTrialDay = 14;

export type PricingPlanName = "Freemium" | "Basic" | "Advance" | "Enterprise";
type PricingPlan = {
  name: string;
  trialDays: number;
  returnUrl: string;
  lineItems: AppSubscriptionLineItemInput[];
};

type GroupPlan = {
  Freemium: PricingPlan;
  Basic: PricingPlan;
  Advance: PricingPlan;
  Enterprise: PricingPlan;
};

export type PlanceDescription = {
  name: string;
  features: string[];
  noFeatures: string[];
};

export const defPricingMonthly: GroupPlan = {
  Freemium: {
    name: "Freemium",
    trialDays: DefaultTrialDay,
    returnUrl: "",
    lineItems: [
      {
        plan: {
          appUsagePricingDetails: {
            terms: "3% of order",
            cappedAmount: {
              amount: 599100,
              currencyCode: CurrencyCode.Usd,
            },
          },
        },
      },
    ],
  },
  Basic: {
    name: "Basic",
    trialDays: DefaultTrialDay,
    returnUrl: "",
    lineItems: [
      {
        plan: {
          appRecurringPricingDetails: {
            interval: AppPricingInterval.Every_30Days,
            price: {
              amount: 9,
              currencyCode: CurrencyCode.Usd,
            },
          },
        },
      },
      {
        plan: {
          appUsagePricingDetails: {
            terms: "2% of order",
            cappedAmount: {
              amount: 199100,
              currencyCode: CurrencyCode.Usd,
            },
          },
        },
      },
    ],
  },
  Advance: {
    name: "Advance",
    trialDays: DefaultTrialDay,
    returnUrl: "",
    lineItems: [
      {
        plan: {
          appRecurringPricingDetails: {
            interval: AppPricingInterval.Every_30Days,
            price: {
              amount: 49.9,
              currencyCode: CurrencyCode.Usd,
            },
          },
        },
      },
      {
        plan: {
          appUsagePricingDetails: {
            terms: "1% of order",
            cappedAmount: {
              amount: 150100,
              currencyCode: CurrencyCode.Usd,
            },
          },
        },
      },
    ],
  },
  Enterprise: {
    name: "Enterprise",
    trialDays: DefaultTrialDay,
    returnUrl: "",
    lineItems: [
      {
        plan: {
          appRecurringPricingDetails: {
            interval: AppPricingInterval.Every_30Days,
            price: {
              amount: 199.9,
              currencyCode: CurrencyCode.Usd,
            },
          },
        },
      },
    ],
  },
};

type CreateSubscriptionRequest = {
  name: string;
  returnUrl: string;
  isTest: boolean;
  trialDays: number;
  lineItems: AppSubscriptionLineItemInput[];
};

export async function gqlCreateSubscription(
  graphql: GraphQLClient<AdminOperations>,
  req: CreateSubscriptionRequest,
) {
  const resp = await graphql(
    `
      mutation gqlCreateSubscription(
        $name: String!
        $returnUrl: URL!
        $lineItems: [AppSubscriptionLineItemInput!]!
        $isTest: Boolean!
      ) {
        appSubscriptionCreate(
          name: $name
          returnUrl: $returnUrl
          lineItems: $lineItems
          test: $isTest
        ) {
          appSubscription {
            id
            createdAt
            currentPeriodEnd
            trialDays
            test
            lineItems {
              id
            }
          }
          confirmationUrl
          userErrors {
            field
            message
          }
        }
      }
    `,
    {
      variables: {
        name: req.name,
        returnUrl: req.returnUrl,
        lineItems: req.lineItems,
        isTest: req.isTest,
      },
    },
  );
  const respJson = await resp.json();
  return respJson.data;
}

type CreateSubscriptionByNameRequest = {
  name?: PricingPlanName;
  returnUrl: string;
  isTest: boolean;
  trialDays?: number;
};

export async function gqlCreateSubscriptionByName(
  graphql: GraphQLClient<AdminOperations>,
  req: CreateSubscriptionByNameRequest,
) {
  if (!req.name) {
    throw new Error("Subscription input is invalid");
  }
  switch (req.name) {
    case "Freemium":
      return gqlCreateSubscription(graphql, {
        ...req,
        name: req.name,
        trialDays: req.trialDays ?? DefaultTrialDay,
        lineItems: [...defPricingMonthly.Freemium.lineItems],
      });
    case "Basic":
      return gqlCreateSubscription(graphql, {
        ...req,
        name: req.name,
        trialDays: req.trialDays ?? DefaultTrialDay,
        lineItems: [...defPricingMonthly.Basic.lineItems],
      });
    case "Advance":
      return gqlCreateSubscription(graphql, {
        ...req,
        name: req.name,
        trialDays: req.trialDays ?? DefaultTrialDay,
        lineItems: [...defPricingMonthly.Advance.lineItems],
      });

    case "Enterprise":
      return gqlCreateSubscription(graphql, {
        ...req,
        name: req.name,
        trialDays: req.trialDays ?? DefaultTrialDay,
        lineItems: [...defPricingMonthly.Enterprise.lineItems],
      });
    default:
      break;
  }
  throw new Error("Subscription is not support");
}

type CreateUsageRecordRequest = {
  lineItemId: string;
  description: string;
  amount: number;
};

export async function gqlCreateUsageRecord(
  graphql: GraphQLClient<AdminOperations>,
  req: CreateUsageRecordRequest,
) {
  const resp = await graphql(
    `
      mutation gqlCreateUsageRecord(
        $lineItemId: ID!
        $desc: String!
        $amount: Decimal!
      ) {
        appUsageRecordCreate(
          subscriptionLineItemId: $lineItemId
          description: $desc
          price: { amount: $amount, currencyCode: USD }
        ) {
          appUsageRecord {
            id
            price {
              amount
              currencyCode
            }
            description
            createdAt
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
    {
      variables: {
        lineItemId: req.lineItemId,
        desc: req.description,
        amount: req.amount,
      },
    },
  );
  const respJson = await resp.json();
  return respJson.data;
}

export async function gqlGetSubscription(
  graphql: GraphQLClient<AdminOperations>,
  // req: GetSubscriptionRequest | undefined,
) {
  const resp = await graphql(`
    query gqlGetSubscription {
      appInstallation {
        id
        launchUrl
        app {
          apiKey
          description
          title
          pricingDetails
          installation {
            launchUrl
            activeSubscriptions {
              id
              name
              status
              returnUrl
              currentPeriodEnd
              trialDays
              test
              lineItems {
                id
              }
            }
          }
        }
      }
    }
  `);
  var respJson = await resp.json();
  return respJson.data;
}
