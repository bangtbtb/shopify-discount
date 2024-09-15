import { LoaderFunctionArgs } from "@remix-run/node";
import { useSubmit } from "@remix-run/react";
import { Page } from "@shopify/polaris";
import { useField, useForm } from "@shopify/react-form";

import { authenticate } from "~/shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const {} = await authenticate.public.appProxy(request);
  console.log("Call loader");

  return {};
};

export const action = async () => {
  console.log("Call action");
  return {};
};

export default function ABCIndex() {
  const submit = useSubmit();
  const p = useForm({
    fields: {
      productId: useField(""),
      productTitle: useField(""),
      image: useField(""),
      imageAlt: useField(""),
    },
    onSubmit: async (form) => {
      return { status: "success" };
    },
  });

  return <Page title="ABC index"></Page>;
}
