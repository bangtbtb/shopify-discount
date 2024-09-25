import {
  ActiveDatesCard,
  CombinableDiscountTypes,
  DateTime,
  DiscountClass,
} from "@shopify/discount-app-components";
import {
  BlockStack,
  Box,
  Checkbox,
  Grid,
  Select,
  Text,
  TextField,
} from "@shopify/polaris";
import { Field } from "@shopify/react-form";
import { DiscountProvider } from "../providers/DiscountProvider";
import { DVT } from "~/defs/discount";
import { useState } from "react";
import { CardCollapse } from "../Common";

type DiscountCommonEditorProps = {
  startDate: Field<DateTime>;
  endDate: Field<DateTime | null>;
  combines: Field<CombinableDiscountTypes>;
};

export function DiscountCommonEditor({
  startDate,
  endDate,
  combines,
}: DiscountCommonEditorProps) {
  const [openActived, setOpenActived] = useState(true);

  return (
    <BlockStack gap={"300"}>
      <DiscountProvider>
        <ActiveDatesCard
          startDate={startDate}
          endDate={endDate}
          timezoneAbbreviation="EST"
        />

        <CardCollapse title="Combinations" collapse initCollapse={false}>
          <Text as="p">Discount can be combined with:</Text>
          <Box minHeight="1rem"> </Box>
          <BlockStack>
            <Checkbox
              label="Product discounts"
              checked={combines.value.productDiscounts}
              onChange={(v) =>
                combines.onChange({ ...combines.value, productDiscounts: v })
              }
            />

            <Checkbox
              label="Order discounts"
              checked={combines.value.orderDiscounts}
              onChange={(v) =>
                combines.onChange({ ...combines.value, orderDiscounts: v })
              }
            />

            <Checkbox
              label="Shipping discounts"
              checked={combines.value.shippingDiscounts}
              onChange={(v) =>
                combines.onChange({ ...combines.value, shippingDiscounts: v })
              }
            />
          </BlockStack>
        </CardCollapse>
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
      // type="number"
      autoComplete="off"
      value={props.dv.toString()}
      onChange={(v) => props.onChangeValue(Number.parseInt(v) || 0)}
      placeholder="Discount value"
      connectedRight={
        <Select
          label=""
          value={props.dvt}
          options={[
            { label: "Percent", value: "percent" },
            { label: "Fix Amount", value: "fix" },
          ]}
          onChange={props.onChangeType}
        />
      }
    />
  );
}

type DiscountEditorPreviewLayoutProps = {
  children?: React.ReactNode;
  preview?: React.ReactElement;
};

export function DiscountEditorPreviewLayout(
  props: DiscountEditorPreviewLayoutProps,
) {
  return (
    <Grid>
      <Grid.Cell columnSpan={{ sm: 6, md: 3, lg: 6 }}>
        <BlockStack gap={"400"}>{props.children}</BlockStack>
      </Grid.Cell>
      <Grid.Cell columnSpan={{ sm: 6, md: 3, lg: 6 }}>
        <div className="preview_ctn">{props.preview}</div>
      </Grid.Cell>
    </Grid>
  );
}
