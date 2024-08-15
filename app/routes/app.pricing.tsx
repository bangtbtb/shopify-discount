import type {
  ActionFunctionArgs,
  HeadersFunction,
  LoaderFunctionArgs,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  useActionData,
  useLoaderData,
  useNavigate,
  useRouteError,
  useSubmit,
} from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";

import { authenticate } from "../shopify.server";
import { InlineGrid, Page, Text } from "@shopify/polaris";
import { PricingPlanName } from "~/models/gql_billing";

import {
  CurrentPlanCard,
  PlanCardProps,
  PlanStack,
} from "~/components/Billing";
import { useEffect, useState } from "react";
import { getShopName } from "~/models/utils";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { billing } = await authenticate.admin(request);

  var subscription = await billing.check({
    plans: ["Freemium", "Basic", "Advance", "Enterprise"],
  });

  return json({ activedSubs: subscription.appSubscriptions });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin, session, billing } = await authenticate.admin(request);

  const formData = await request.formData();
  const subTitle = formData.get("title") as PricingPlanName;
  var status = "success";

  console.log("Sub title: ", subTitle);

  const isBillingTest = process.env.BILLING_TEST === "true";

  const resp = await billing.require({
    isTest: isBillingTest,
    plans: [subTitle],
    onFailure: () => {
      return billing.request({
        plan: subTitle,
        isTest: isBillingTest,
        returnUrl: `https://admin.shopify.com/store/${getShopName(session.shop)}/apps/xbilling/app`,
      });
    },
  });
  console.log("Response of subscription: ", resp.appSubscriptions);
  return json({ status });
};

export default function PricingPage() {
  const submit = useSubmit();
  const onSubmit = (title: string) => {
    submit({ title: title }, { method: "post" });
  };

  const { activedSubs } = useLoaderData<typeof loader>();

  const [planInfos, setPlanInfos] = useState<PlanCardProps[]>([
    {
      isActived: false,
      title: "Freemium",
      features: ["1 Bundle Discount", "1 Volume Discount"],
      noFeatures: ["Shipping Discount"],
      price: 0,
      usage: "Up to 500$ of monthly sales",
      onSubscription: onSubmit,
    },
    {
      isActived: false,
      title: "Basic",
      features: ["10 Bundle Discount", "10 Volume Discount"],
      price: 9,
      usage: "Up to $3K of monthly sales",
      onSubscription: onSubmit,
    },
    {
      isActived: false,
      title: "Advanced",
      features: [
        "Unlimit Bundle Discount",
        "Unlimit Volume Discount",
        "24/7 Support",
      ],
      price: 29.9,
      usage: "Up to $12K of monthly sales",
      onSubscription: onSubmit,
    },
    {
      isActived: false,
      title: "Enterprise",
      features: [
        "Unlimit Bundle Discount",
        "Unlimit Volume Discount",
        "Unlimit Shipping Discount",
        "24/7 Support",
      ],
      price: 199.9,
      usage: "Unlimited",
      onSubscription: onSubmit,
    },
  ]);

  useEffect(() => {
    if (!activedSubs?.length) {
      return;
    }

    var newPlans = [...planInfos];
    newPlans.forEach((plan) => {
      activedSubs?.forEach((sub) => {
        if (!plan.isActived && plan.title == sub.name) {
          plan.isActived = true;
          plan.onSubscription = undefined;
          console.log("Actived: ", plan);
        }
      });
    });
    setPlanInfos(newPlans);

    console.log("Actived subs: ", activedSubs);
  }, [activedSubs]);

  return (
    <Page title="Pricing page">
      <InlineGrid columns={["oneThird", "twoThirds"]}>
        <Text as="h2">Current plan</Text>
        {activedSubs?.length && <CurrentPlanCard title={activedSubs[0].name} />}
      </InlineGrid>

      <PlanStack plans={planInfos} />
    </Page>
  );
}

// Shopify needs Remix to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
