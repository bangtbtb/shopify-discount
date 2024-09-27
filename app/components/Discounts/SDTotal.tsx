import { Field } from "@shopify/discount-app-components";
import { CardCollapse } from "../Common";
import { DiscountEditorPreviewLayout } from "./DiscountCommon";
import { useField } from "@shopify/react-form";
import { BlockStack, Text, TextField } from "@shopify/polaris";
import { SDTotalThemePreview } from "./SDTotalTheme";

type SDTotalDetailProps = {};

export function SDTotalDetail(props: SDTotalDetailProps) {
  const title = useField<string>("Shipping Volume Offer");

  return (
    <DiscountEditorPreviewLayout preview={<SDTotalThemePreview />}>
      <SDTotalSetting title={title} />
      <SDTotalThemeEditor />
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

type SDTotalThemeEditorProps = {};

function SDTotalThemeEditor(props: SDTotalThemeEditorProps) {
  return (
    <BlockStack gap={"400"}>
      <Text as="h2" variant="headingLg">
        Typography & Colour
      </Text>
    </BlockStack>
  );
}
