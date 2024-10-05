import {
  ActiveDatesCard,
  CombinableDiscountTypes,
  DateTime,
  TimePicker,
  useLocalizeCountry,
} from "@shopify/discount-app-components";
import {
  BlockStack,
  Box,
  Card,
  Checkbox,
  DatePicker,
  Grid,
  InlineStack,
  Select,
  Text,
  TextField,
} from "@shopify/polaris";
import { Field, useField } from "@shopify/react-form";
import { DiscountProvider } from "../providers/DiscountProvider";
import { DStatus, DVT } from "~/defs/discount";
import { CardCollapse } from "../Common";
import { useState } from "react";

type DiscountCommonEditorProps = {
  startDate: Field<DateTime>;
  endDate: Field<DateTime | null>;
  combines: Field<CombinableDiscountTypes>;
  disableProduct?: boolean;
  disableBundle?: boolean;
  disableShipping?: boolean;
};

export function DiscountCommonEditor({
  startDate,
  endDate,
  combines,
  disableProduct,
  disableBundle,
  disableShipping,
}: DiscountCommonEditorProps) {
  const [tz] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);

  return (
    <BlockStack gap={"300"}>
      <DiscountProvider>
        <ActiveDatesCard
          startDate={startDate}
          endDate={endDate}
          timezoneAbbreviation={tz}
        />
        {/* 
        <CardCollapse title="Combinations" collapse initCollapse={false}>
          <Text as="p">Discount can be combined with:</Text>
          <Box minHeight="1rem"> </Box>
          <BlockStack>
            {!disableProduct && (
              <Checkbox
                label="Product discounts"
                checked={combines.value.productDiscounts}
                onChange={(v) =>
                  combines.onChange({ ...combines.value, productDiscounts: v })
                }
              />
            )}
            {!disableBundle && (
              <Checkbox
                label="Order discounts"
                checked={combines.value.orderDiscounts}
                onChange={(v) =>
                  combines.onChange({ ...combines.value, orderDiscounts: v })
                }
              />
            )}

            {!disableShipping && (
              <Checkbox
                label="Shipping discounts"
                checked={combines.value.shippingDiscounts}
                onChange={(v) =>
                  combines.onChange({ ...combines.value, shippingDiscounts: v })
                }
              />
            )}
          </BlockStack>
        </CardCollapse> */}
      </DiscountProvider>
    </BlockStack>
  );
}

type DiscountTypeSelectProps = {
  label?: string;
  dv: number;
  dvt: string;
  onChangeValue: (v: number) => void;
  onChangeType: (v: DVT) => void;
};

export function DiscountTypeSelect(props: DiscountTypeSelectProps) {
  return (
    <TextField
      label={props.label}
      type="number"
      autoComplete="off"
      value={props.dv.toString()}
      onChange={(v) => props.onChangeValue(Number.parseInt(v) || 0)}
      placeholder="Discount value"
      connectedRight={
        <Box minWidth="200px">
          <Select
            label=""
            value={props.dvt}
            options={[
              { label: "Percentage discount", value: "percent" },
              { label: "Flat discount", value: "fix" },
            ]}
            onChange={props.onChangeType}
          />
        </Box>
      }
    />
  );
}

type DiscountEditorPreviewLayoutProps = {
  children?: React.ReactNode;
  preview?: React.ReactElement;
  actions?: React.ReactNode;
};

export function DiscountEditorPreviewLayout(
  props: DiscountEditorPreviewLayoutProps,
) {
  return (
    <BlockStack gap={"400"}>
      <InlineStack gap={"100"} align="end">
        {props.actions}
      </InlineStack>

      <Grid>
        <Grid.Cell columnSpan={{ sm: 6, md: 3, lg: 7 }}>
          <BlockStack gap={"800"}>{props.children}</BlockStack>
          <Box
            paddingBlockStart={{
              sm: "400",
              md: "2000",
            }}
          />
        </Grid.Cell>
        <Grid.Cell columnSpan={{ sm: 6, md: 3, lg: 5 }}>
          <Box paddingInlineEnd={"500"} paddingBlockEnd={"1000"}>
            <Text as="h2" variant="headingMd">
              Preview
            </Text>
          </Box>
          <div className="preview_ctn">{props.preview}</div>
        </Grid.Cell>
      </Grid>
    </BlockStack>
  );
}

type SelectDiscountStatusProps = {
  label?: string;
  value: DStatus;
  onChange: (v: DStatus) => void;
};

export function SelectDiscountStatus(props: SelectDiscountStatusProps) {
  return (
    <Select
      label={props.label}
      value={props.value}
      options={[
        {
          label: "Active",
          value: "active",
        },
        {
          label: "Draft",
          value: "draft",
        },
      ]}
      onChange={(v) => props.onChange && props.onChange(v as DStatus)}
    />
  );
}
