import { Field } from "@shopify/discount-app-components";
import { CardCollapse } from "../Common";
import { DiscountEditorPreviewLayout } from "./DiscountCommon";
import { useField } from "@shopify/react-form";
import { BlockStack, Text, TextField } from "@shopify/polaris";
import { SerializeFrom } from "@remix-run/node";
import { DiscountAutomaticAppInput } from "~/types/admin.types";

type SDVolumeDetailProps = {
  isCreate?: boolean;
  disableSetting?: boolean;
  discount?: SerializeFrom<DiscountAutomaticAppInput> | null;
  onSubmit?: (
    discount: DiscountAutomaticAppInput,
    config: any,
    theme: string,
    themeContent: string,
  ) => void;
};

export function SDVolumeDetail(props: SDVolumeDetailProps) {
  const title = useField<string>("Shipping Volume Offer");

  return (
    <DiscountEditorPreviewLayout>
      <SDVolumeSetting title={title} />
      <SDVolumeThemeEditor />
    </DiscountEditorPreviewLayout>
  );
}

type VolumeDiscountSettingProps = {
  title: Field<string>;
};

function SDVolumeSetting({ title }: VolumeDiscountSettingProps) {
  return (
    <CardCollapse title="Shipping Volume discount Information" collapse>
      <BlockStack gap={"400"}>
        <TextField label="Title" autoComplete="off" {...title} />
      </BlockStack>
    </CardCollapse>
  );
}

type SDVolumeThemeEditorProps = {};

function SDVolumeThemeEditor(props: SDVolumeThemeEditorProps) {
  return (
    <BlockStack gap={"400"}>
      <Text as="h2" variant="headingLg">
        Typography & Colour
      </Text>
    </BlockStack>
  );
}
