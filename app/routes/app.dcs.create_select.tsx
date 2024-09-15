import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { Card, Image, InlineGrid, Page } from "@shopify/polaris";

export const loader = async ({}: LoaderFunctionArgs) => {
  return json({});
};

export const action = async ({}: ActionFunctionArgs) => {
  return json({});
};

export default function DiscountsCreate(props: any) {
  return <Page title="Select Discount Type"></Page>;
}

type CreatePageProps = {
  title: string;
  image: string;
};

function CreateDiscountCard(props: any) {
  return (
    <Card>
      <InlineGrid>
        <Image source="assets/bbb.png" alt="dfd"></Image>
      </InlineGrid>
    </Card>
  );
}

type ToggleContentProps = {
  open: boolean;
  placeholder: React.ReactNode;
  children?: React.ReactNode;
};

function ToggleContent(props: ToggleContentProps) {
  const { open, placeholder, children } = props;
  return (
    <InlineGrid>
      {/* Place holder  */}
      <div
        style={{
          display: open ? "none" : "block",
        }}
      >
        {placeholder}
      </div>

      {/* Content */}
      <div
        style={{
          display: open ? "block" : "none",
        }}
      >
        {children}
      </div>
    </InlineGrid>
  );
}
