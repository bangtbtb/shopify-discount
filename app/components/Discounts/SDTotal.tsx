import {
  CombinableDiscountTypes,
  DateTime,
  Field,
} from "@shopify/discount-app-components";
import { CardCollapse } from "../Common";
import { DiscountEditorPreviewLayout } from "./DiscountCommon";
import { useField } from "@shopify/react-form";
import { BlockStack, Text, TextField } from "@shopify/polaris";
import {
  defaultSDTotalTheme,
  SDTotalThemeEditor,
  SDTotalThemePreview,
} from "./SDTotalTheme";
import { StepData } from "./ConfigStep";
import { useState } from "react";
import { SDTotalTheme } from "~/defs/theme";

type SDTotalDetailProps = {};

export function SDTotalDetail(props: SDTotalDetailProps) {
  const title = useField<string>("Shipping Volume Offer");
  const startDate = useField<DateTime>(new Date().toString());
  const endDate = useField<DateTime | null>(null);
  const combines = useField<CombinableDiscountTypes>({
    orderDiscounts: false,
    productDiscounts: false,
    shippingDiscounts: true,
  });

  const steps = useField<Array<StepData>>([
    { label: "OFF 5%", type: "percent", value: 20, require: 100 },
    { label: "OFF 10%", type: "percent", value: 50, require: 300 },
    { label: "OFF 20%", type: "percent", value: 100, require: 400 },
  ]);

  const [theme, setTheme] = useState<SDTotalTheme>(defaultSDTotalTheme);
  const onChangeTheme = (k: string, v: any) => {
    setTheme({
      ...theme,
      [k]: v,
    });
  };

  return (
    <DiscountEditorPreviewLayout preview={<SDTotalThemePreview />}>
      <SDTotalSetting title={title} />
      <SDTotalThemeEditor {...theme} onChangeTheme={onChangeTheme} />
    </DiscountEditorPreviewLayout>
  );
}

type VolumeDiscountSettingProps = {
  title: Field<string>;
};

function SDTotalSetting({ title }: VolumeDiscountSettingProps) {
  return (
    <CardCollapse title="Shipping Volume discount Information" collapse>
      <BlockStack gap={"400"}>
        <TextField label="Title" autoComplete="off" {...title} />
      </BlockStack>
    </CardCollapse>
  );
}
