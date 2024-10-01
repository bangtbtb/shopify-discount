import { BlockStack, Box, Text, TextField } from "@shopify/polaris";
import {
  BundleTotalThemeEditor,
  BundleTotalThemePreview,
  defaultTotalOrderTheme,
} from "./BundleTotalTheme";
import { DiscountEditorPreviewLayout } from "./DiscountCommon";
import { CardCollapse } from "../Common";
import { Field, useField } from "@shopify/react-form";
import {
  CombinableDiscountTypes,
  DateTime,
} from "@shopify/discount-app-components";
import { StepData } from "./ConfigStep";
import { useState } from "react";
import { BundleTotalTheme } from "~/defs/theme";
import {
  ProductInfo,
  SelectMultipleProducts,
  SelectProduct,
} from "../Shopify/SelectProduct";
import { DiscountAutomaticAppInput } from "~/types/admin.types";
import { SerializeFrom } from "@remix-run/node";

type BundleTotalDetailProps = {
  isCreate?: boolean;
  disableSetting?: boolean;
  discount?: SerializeFrom<DiscountAutomaticAppInput>;
  onSubmit?: (
    discount: DiscountAutomaticAppInput,
    config: any,
    theme: string,
    themeContent: string,
  ) => void;
};

export function BundleTotalDetail({
  isCreate,
  disableSetting,
  discount,
  onSubmit,
}: BundleTotalDetailProps) {
  const title = useField<string>("Volume Discount Offer");
  // const totalContent = useField<string>("Total");
  const startDate = useField<DateTime>(new Date().toString());
  const endDate = useField<DateTime | null>(null);
  const combines = useField<CombinableDiscountTypes>({
    orderDiscounts: false,
    productDiscounts: false,
    shippingDiscounts: true,
  });
  const products = useField<ProductInfo[]>([]);

  const steps = useField<Array<StepData>>([
    { label: "OFF 5%", type: "percent", value: 5, require: 100 },
    { label: "OFF 10%", type: "percent", value: 10, require: 300 },
    { label: "OFF 20%", type: "percent", value: 20, require: 400 },
  ]);

  const [theme, setTheme] = useState<BundleTotalTheme>(defaultTotalOrderTheme);
  const onChangeTheme = (k: string, v: any) => {
    setTheme({
      ...theme,
      [k]: v,
    });
  };

  return (
    <DiscountEditorPreviewLayout
      preview={<BundleTotalThemePreview theme={theme} steps={steps.value} />}
    >
      <BlockStack gap={"400"}>
        <BundleTotalSetting title={title} />
        <CardCollapse collapse title="Target product">
          <BlockStack gap={"300"}>
            <SelectMultipleProducts
              label="Target product to show this offer"
              products={products.value}
              onChange={products.onChange}
              showDefault
            />
          </BlockStack>
        </CardCollapse>
      </BlockStack>

      {/* <Box minHeight="1rem" /> */}

      <BundleTotalThemeEditor {...theme} onChangeTheme={onChangeTheme} />
    </DiscountEditorPreviewLayout>
  );
}

type BundleTotalSettingProps = {
  title: Field<string>;
};

function BundleTotalSetting({ title }: BundleTotalSettingProps) {
  return (
    <CardCollapse title="Bundle Total Information" collapse>
      <BlockStack>
        <TextField label="Title" autoComplete="off" {...title} />
      </BlockStack>
    </CardCollapse>
  );
}
