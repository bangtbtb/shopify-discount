import {
  BlockStack,
  Box,
  Button,
  CalloutCard,
  Card,
  Collapsible,
  Grid,
  Icon,
  IconSource,
  InlineGrid,
  InlineStack,
  Text,
} from "@shopify/polaris";
import { CheckSmallIcon, DeliveryIcon } from "@shopify/polaris-icons";
import { TShirt } from "../Common/Icons";
import { useNavigate } from "@remix-run/react";
import { DiscountUseCaseDesc } from "~/defs/discount";
import { StepList } from "../Common/StepList";
import { ColumnRevert, BoxBorderBound } from "../Common";

type CreateDiscountCardProps = {
  title?: string;
  desc?: string;

  illustration?: string | React.ReactNode;
  path: string;
  usecases?: DiscountUseCaseDesc[];
};

export function CreateDiscountCard(props: CreateDiscountCardProps) {
  const nav = useNavigate();

  return (
    <Card>
      <BlockStack gap={"300"}>
        <Text as="h2" variant="headingMd">
          {props.title}
        </Text>
        <Text as="p" variant="bodySm">
          {props.desc}
        </Text>
        <Box paddingBlockEnd={"400"} />

        <InlineGrid columns={2}>
          <Box maxWidth="15rem">
            {typeof props.illustration === "string" ? (
              <img className="fit_img" src={props.illustration} />
            ) : (
              props.illustration
            )}
          </Box>

          <ColumnRevert>
            <Box>
              <Button
                onClick={() => {
                  console.log("Navigate to ", props.path);
                  if (props.path) {
                    nav(props.path);
                  }
                }}
                variant="primary"
              >
                Create
              </Button>
            </Box>
          </ColumnRevert>
        </InlineGrid>
      </BlockStack>
    </Card>
  );
}

type FunnelDiscountDescCardProps = {
  title: string;

  example?: string;
  children?: React.ReactNode;
  onPrimary?: () => void;
  onSecondary?: () => void;
};

export function FunnelDiscountDescCard({
  title,
  example,
  children,
  onPrimary,
  onSecondary,
}: FunnelDiscountDescCardProps) {
  return (
    <Card>
      <div className="Polaris-CalloutCard__Content">
        <BlockStack gap={"200"}>
          <Text as="h2" variant="headingSm">
            {title}
          </Text>
          {children}

          <p
            className="Polaris-Text--root Polaris-Text--bodyMd"
            style={{ fontStyle: "italic" }}
          >
            {example}
          </p>

          <InlineStack gap={"200"}>
            <Button variant="primary" onClick={onPrimary}>
              Creat Funnel
            </Button>
            {/* <Button variant="tertiary" onClick={onSecondary}>
              Select Template
            </Button> */}
          </InlineStack>
        </BlockStack>
      </div>
    </Card>
  );
}

export function FixBundleIllustration() {
  return (
    <BoxBorderBound
      header={
        <span style={{ width: "80px" }}>
          Buy all <span style={{ color: "red", width: "40px" }}>10%</span>
        </span>
      }
      headerAlign="center"
    >
      <InlineStack align="center">
        <TShirt />
        {"+"}
        <TShirt />
        {"+"}
        <TShirt />
      </InlineStack>
    </BoxBorderBound>
  );
}

export function BundleValueIllustratrion() {
  return (
    <BlockStack>
      <InlineGrid columns={4} alignItems="start">
        <Text as="p" variant="bodyLg" tone="base">
          100$
        </Text>
        <Text as="p" variant="bodyLg" tone="base">
          200$
        </Text>
        <Text as="p" variant="bodyLg" tone="success">
          400$
        </Text>
        <Text as="p" variant="bodyLg" tone="base">
          500$
        </Text>
      </InlineGrid>
      <StepList
        activeIndex={2}
        data={[
          <Text as="p" variant="bodyLg" tone="base">
            5%
          </Text>,
          <Text as="p" variant="bodyLg" tone="base">
            10%
          </Text>,
          <Text as="p" variant="bodyLg" tone="success">
            20%
          </Text>,
          <Text as="p" variant="bodyLg" tone="base">
            25%
          </Text>,
        ]}
      />
    </BlockStack>
  );
}

export function VolumeBreakIllustratrion() {
  return (
    <InlineGrid columns={2} gap={"200"}>
      <BoxBorderBound
        header={
          <span>
            Discount <span style={{ color: "red", width: "40px" }}>10%</span>
          </span>
        }
        headerAlign="center"
      >
        <InlineGrid columns={2} alignItems="center">
          <TShirt />
          <Text as="p" variant="bodyLg" alignment="justify" tone="magic">
            x 3
          </Text>
        </InlineGrid>
      </BoxBorderBound>

      <BoxBorderBound
        header={
          <span>
            Discount <span style={{ color: "red", width: "40px" }}>20%</span>
          </span>
        }
        headerAlign="center"
      >
        <InlineGrid columns={2} alignItems="center">
          <TShirt />
          <Text as="p" variant="bodyLg" alignment="justify" tone="magic">
            x 4
          </Text>
        </InlineGrid>
      </BoxBorderBound>
    </InlineGrid>
  );
}

export function ShippingBillIllustratrion() {
  return (
    <BlockStack>
      <InlineGrid columns={3} alignItems="start">
        <Text as="p" variant="bodyLg" tone="base">
          100$
        </Text>
        <Text as="p" variant="bodyLg" tone="critical">
          200$
        </Text>
        <Text as="p" variant="bodyLg" tone="base">
          400$
        </Text>
      </InlineGrid>
      <StepList
        activeIndex={1}
        data={[
          <InlineStack aria-colcount={2} gap={"0"}>
            <Text as="p" variant="bodyLg" tone="base">
              30%
            </Text>
            <Box width="20">
              <Icon source={DeliveryIcon} />
            </Box>
          </InlineStack>,
          <InlineStack aria-colcount={2} gap={"0"}>
            <Text as="p" variant="bodyLg" tone="success">
              50%
            </Text>
            <Box width="20">
              <Icon source={DeliveryIcon} />
            </Box>
          </InlineStack>,

          <InlineStack aria-colcount={2} gap={"0"}>
            <Text as="p" variant="bodyLg" tone="base">
              100%
            </Text>
            <Box width="20">
              <Icon source={DeliveryIcon} />
            </Box>
          </InlineStack>,
        ]}
      />
    </BlockStack>
  );
}

export function ShippingVolumeBreakIllustratrion() {
  return (
    <BlockStack>
      <InlineGrid columns={3} alignItems="start">
        <Text as="p" variant="bodyLg" tone="base">
          2 units
        </Text>
        <Text as="p" variant="bodyLg" tone="critical">
          4 units
        </Text>
        <Text as="p" variant="bodyLg" tone="base">
          6 units
        </Text>
      </InlineGrid>
      <StepList
        activeIndex={1}
        data={[
          <InlineStack aria-colcount={2} gap={"0"}>
            <Text as="p" variant="bodyLg" tone="base">
              30%
            </Text>
            <Box width="20">
              <Icon source={DeliveryIcon} />
            </Box>
          </InlineStack>,
          <InlineStack aria-colcount={2} gap={"0"}>
            <Text as="p" variant="bodyLg" tone="success">
              50%
            </Text>
            <Box width="20">
              <Icon source={DeliveryIcon} />
            </Box>
          </InlineStack>,

          <InlineStack aria-colcount={2} gap={"0"}>
            <Text as="p" variant="bodyLg" tone="base">
              100%
            </Text>
            <Box width="20">
              <Icon source={DeliveryIcon} />
            </Box>
          </InlineStack>,
        ]}
      />
    </BlockStack>
  );
}

type TickedTextProps = {
  text: string;
};

export function TickedText(props: TickedTextProps) {
  return (
    <InlineStack gap={"200"} align="start">
      <Box>
        <Icon source={CheckSmallIcon} tone="success" />
      </Box>
      <p
        className="Polaris-Text--root Polaris-Text--bodyMd"
        style={{ fontWeight: "550" }}
      >
        {props.text}
      </p>
    </InlineStack>
  );
}
