import { Box } from "@shopify/polaris";
import { CardCollapse } from "../Common/Index";
import {
  BundleTotalThemeEditor,
  BundleTotalThemePreview,
} from "./BundleTotalTheme";
import { DiscountEditorPreviewLayout } from "./DiscountCommon";

export function BundleTotalDetail() {
  return (
    <DiscountEditorPreviewLayout preview={<BundleTotalThemePreview />}>
      <BundleTotalSetting />

      <Box minHeight="1rem" />

      <BundleTotalThemeEditor />
    </DiscountEditorPreviewLayout>
  );
}

type BundleTotalSettingProps = {};

function BundleTotalSetting(props: BundleTotalSettingProps) {
  return (
    <CardCollapse title="Bundle Total Information" collapse></CardCollapse>
  );
}
