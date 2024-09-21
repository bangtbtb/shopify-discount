import { useField } from "@shopify/react-form";
import {
  ProductInfo,
  SelectedProduct,
  SelectMultipleProducts,
} from "../Shopify/SelectProduct";
import { BlockStack, Box, Card, Grid, TextField } from "@shopify/polaris";
import TextFieldSelect from "~/components/Shopify/TextFieldSelect";
import { useEffect, useRef, useState } from "react";
import { DVT } from "~/defs";
import {
  createVolumeDiscountContent,
  VolumeDiscountContentField,
  VolumeDiscountPreview,
} from "./VolumeThemeDiscount";
import { DiscountCommonEditor } from "./DiscountCommonEditor";
import { SerializeFrom } from "@remix-run/node";
import { DiscountClass } from "@shopify/discount-app-components";
import { DiscountAutomaticApp } from "~/types/admin.types";

type VolumeDiscountComponentProps = {
  discount?: SerializeFrom<DiscountAutomaticApp>;
  rawConfig?: string;
  onSubmit?: () => void;
};

export function VolumeDiscountComponent(props: VolumeDiscountComponentProps) {
  const refPreview = useRef<HTMLDivElement>(null);

  // const content: VolumeDiscountContentField = createVolumeDiscountContent(
  //   props.discount,
  //   props.rawConfig ? JSON.parse(props.rawConfig) : undefined,
  // );

  const [content, setContent] = useState(
    createVolumeDiscountContent(
      props.discount,
      props.rawConfig ? JSON.parse(props.rawConfig) : undefined,
    ),
  );

  return (
    <Grid>
      {/* Setting */}
      <Grid.Cell columnSpan={{ sm: 6, md: 3, lg: 6 }}>
        <BlockStack gap={"300"}>
          <Card>
            <BlockStack gap={"200"}>
              <TextField
                label={"Title"}
                autoComplete="off"
                {...content.title}
              />
              <SelectMultipleProducts
                label="Bundle products"
                products={content.products.value}
                onChange={content.products.onChange}
                showDefault={true}
              ></SelectMultipleProducts>
            </BlockStack>
          </Card>
          <DiscountCommonEditor
            discountClass={DiscountClass.Product}
            {...content}
          />
        </BlockStack>

        <Box minHeight="12px" />
      </Grid.Cell>

      {/* Preview */}
      <Grid.Cell columnSpan={{ sm: 6, md: 3, lg: 6 }}>
        <VolumeDiscountPreview />
      </Grid.Cell>
    </Grid>
  );
}
