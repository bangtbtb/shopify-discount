import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";

export const loader = async ({}: LoaderFunctionArgs) => {
  return json({ abc: "def" });
};

export const action = async ({}: ActionFunctionArgs) => {
  return json({ abc: "def" });
};
