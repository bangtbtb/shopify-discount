import {
  Box,
  Grid,
  BlockStack,
  TextField,
  Tooltip,
  InlineGrid,
} from "@shopify/polaris";
import { DiscountValue, ODConfig, SDConfig, VDConfig } from "~/defs";
import { DiscountAutomaticAppInput } from "~/types/admin.types";
import {
  BundleThemeEditor,
  BundleThemePreview,
  defaultBundleTheme,
  ProductInfoBundle,
} from "./BundleThemeDiscount";
import { useState } from "react";
import {
  SelectedProduct,
  SelectMultipleProducts,
} from "../Shopify/SelectProduct";
import {
  DiscountCommonEditor,
  DiscountEditorPreviewLayout,
  DiscountTypeSelect,
} from "./DiscountCommon";
import {
  CombinableDiscountTypes,
  DateTime,
} from "@shopify/discount-app-components";
import { Field, useField } from "@shopify/react-form";
import { CardCollapse } from "~/components/Common";

export type BundleComponentErrors = {};

type BundleComponentProps = {
  errors?: BundleComponentErrors;
  onSubmit?: (
    discount: DiscountAutomaticAppInput,
    config: ODConfig | SDConfig | VDConfig,
  ) => void;
};

export function BundleDetail(props: BundleComponentProps) {
  const title = useField<string>("Bund product offer");
  const buttonContent = useField<string>("Add To Cart");
  const totalContent = useField<string>("Total");
  const startDate = useField<DateTime>(new Date().toString());
  const endDate = useField<DateTime | null>(null);
  const combines = useField<CombinableDiscountTypes>({
    orderDiscounts: false,
    productDiscounts: false,
    shippingDiscounts: true,
  });

  const products = useField<ProductInfoBundle[]>([]);
  const dVal = useField<DiscountValue>({
    type: "percent",
    value: 10,
  }); // Discount value

  const [theme, setTheme] = useState(defaultBundleTheme);
  const onChangeTheme = (k: string, v: any) => {
    setTheme({
      ...theme,
      [k]: v,
    });
  };

  return (
    <DiscountEditorPreviewLayout
      preview={
        <BundleThemePreview
          content={{
            title: title.value,
            button: buttonContent.value,
            total: totalContent.value,
          }}
          discount={dVal.value}
          theme={theme}
          products={products.value}
        />
      }
    >
      <BundleSettingCard
        title={title}
        buttonContent={buttonContent}
        totalContent={totalContent}
        discount={dVal}
        products={products}
      />

      <Box minHeight="1rem" />

      <DiscountCommonEditor
        combines={combines}
        startDate={startDate}
        endDate={endDate}
      />
      <Box minHeight="1rem" />

      <BundleThemeEditor onChangeTheme={onChangeTheme} {...theme} />
    </DiscountEditorPreviewLayout>
  );
}

type BundleSettingCardProps = {
  title: Field<string>;
  buttonContent: Field<string>;
  totalContent: Field<string>;
  discount: Field<DiscountValue>;
  products: Field<ProductInfoBundle[]>;
};

function BundleSettingCard({
  title,
  buttonContent,
  totalContent,
  discount,
  products,
}: BundleSettingCardProps) {
  return (
    <CardCollapse title="Bundle information" collapse>
      <BlockStack gap={"400"}>
        <TextField label="Title" autoComplete="off" {...title} />

        <InlineGrid columns={2} gap={"200"}>
          <TextField
            label="Button Text"
            autoComplete="off"
            {...buttonContent}
          />
          <TextField label="Total text" autoComplete="off" {...totalContent} />
        </InlineGrid>

        <DiscountTypeSelect
          label="Discount value"
          dv={discount.value.value}
          dvt={discount.value.type}
          onChangeType={(v) =>
            discount.onChange({ ...discount.value, type: v })
          }
          onChangeValue={(v) =>
            discount.onChange({ ...discount.value, value: v })
          }
        />

        <SelectMultipleProducts
          label="Bundle products"
          products={products.value}
          onChange={(newPs) =>
            products.onChange(newPs.map((p) => ({ ...p, requireVol: 1 })))
          }
          showDefault={false}
        >
          <BlockStack gap={"300"} key={"product-list"}>
            {products.value.map((p, idx) => (
              <SelectedProduct
                key={idx}
                product={p}
                onRemove={() => {
                  var newProducts = [...products.value];
                  newProducts.splice(idx, 1);
                  products.onChange(newProducts);
                }}
                actions={[
                  <Box maxWidth="3rem" key={`child-${idx}`}>
                    <Tooltip content="Require volume">
                      <TextField
                        label=""
                        autoComplete="off"
                        size="slim"
                        // type="number"
                        max={10}
                        min={0}
                        value={p.requireVol.toString()}
                        onChange={(v) => {
                          var newP = {
                            ...p,
                            requireVol: Number.parseInt(v) || 0,
                          };
                          var newProducts = [...products.value];
                          newProducts[idx] = newP;
                          products.onChange(newProducts);
                        }}
                      />
                    </Tooltip>
                  </Box>,
                ]}
              />
            ))}
          </BlockStack>
        </SelectMultipleProducts>
      </BlockStack>
    </CardCollapse>
  );
}
