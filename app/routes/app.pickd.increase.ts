import { ActionFunctionArgs, json } from "@remix-run/node";
import { dbIncreaseClick } from "~/models/db_dc_analytics";
import { authenticate } from "~/shopify.server";

type IncreasePayload = {
  discountId: string;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin, session } = await authenticate.public.appProxy(request);

  var payload: IncreasePayload = await request.json();
  if (!session?.shop || !payload.discountId) {
    return json(
      { message: "Bad request. Missing data on request" },
      { status: 400 },
    );
  }

  await dbIncreaseClick({
    discountId: payload.discountId,
    shop: session?.shop,
  });
  return json({});
};
