import { BlockStack, Text } from "@shopify/polaris";

type BundleTotalThemeEditorProps = {};

export function BundleTotalThemeEditor(props: BundleTotalThemeEditorProps) {
  return (
    <BlockStack gap={"400"}>
      <Text as="h2" variant="headingLg">
        Typography & Colour
      </Text>
    </BlockStack>
  );
}

type BundleTotalThemePreviewProps = {};

export function BundleTotalThemePreview(props: BundleTotalThemePreviewProps) {
  return <div></div>;
}
