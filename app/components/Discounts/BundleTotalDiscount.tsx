import { BlockStack, Box, TextField } from "@shopify/polaris";
import {
  BundleTotalThemeEditor,
  BundleTotalThemePreview,
} from "./BundleTotalTheme";
import { DiscountEditorPreviewLayout } from "./DiscountCommon";
import { CardCollapse } from "../Common";
import { Field, useField } from "@shopify/react-form";

export function BundleTotalDetail() {
  const title = useField<string>("Bund Total Offer");

  return (
    <DiscountEditorPreviewLayout preview={<BundleTotalThemePreview />}>
      <BundleTotalSetting title={title} />

      <Box minHeight="1rem" />

      <BundleTotalThemeEditor />
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
