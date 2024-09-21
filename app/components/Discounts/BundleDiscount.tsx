import {
  Box,
  Card,
  Grid,
  BlockStack,
  TextField,
  Text,
  Tooltip,
} from "@shopify/polaris";
import { DVT, ODConfig, SDConfig, VDConfig } from "~/defs";
import { DiscountAutomaticAppInput } from "~/types/admin.types";
import {
  BundleContentField,
  BundleTheme,
  BundleThemePreview,
  BundleThemeType,
  createBundleThemeType,
  ProductInfoBundle,
} from "./BundleThemeDiscount";
import { useEffect, useRef, useState } from "react";
import {
  SelectedProduct,
  SelectMultipleProducts,
} from "../Shopify/SelectProduct";
import { useField } from "@shopify/react-form";
import TextFieldSelect from "../Shopify/TextFieldSelect";
import { CombinableDiscountTypes } from "@shopify/discount-app-components";

type BundleComponentProps = {
  onSubmit?: (
    discount: DiscountAutomaticAppInput,
    config: ODConfig | SDConfig | VDConfig,
  ) => void;
};

export function BundleDetail(props: BundleComponentProps) {
  const refPreview = useRef<HTMLDivElement>(null);

  const content: BundleContentField = {
    title: useField<string>("Bund product offer"),
    startDate: useField<Date>(new Date()),
    endDate: useField(null),
    combines: useField<CombinableDiscountTypes>({
      orderDiscounts: false,
      productDiscounts: false,
      shippingDiscounts: true,
    }),
    footerText: useField<string>("Total"),
    buttonContent: useField<string>("Add To Cart"),
  };
  const [products, setProducts] = useState<ProductInfoBundle[]>([]);

  const [discountVal, setDiscountVal] = useState(10);
  const discountType = useField<DVT>("percent");

  const themeConfig = createBundleThemeType();

  // const handleScroll = (ev: Event<Document>) => {
  //   document.get
  //   if (refPreview.current) {
  //     ev.currentTarget.
  //   }
  // };

  // useEffect(() => {
  //   if (refPreview.current) {
  //     document.addEventListener("scroll", handleScroll);
  //   }
  //   return () => {
  //     document.removeEventListener("scroll", handleScroll);
  //   };
  // });

  return (
    <Grid>
      <Grid.Cell columnSpan={{ sm: 6, md: 3, lg: 6 }}>
        <Card>
          <BlockStack gap={"300"}>
            <TextField label="Title" autoComplete="off" {...content.title} />
            <TextFieldSelect
              label="Discount value"
              type={discountType.value}
              value={discountVal.toString()}
              options={[
                { label: "Percent", value: "percent" },
                { label: "Fix Amount", value: "fix" },
              ]}
              onChangeType={(v) => discountType.onChange(v as DVT)}
              onChangeValue={(v) => setDiscountVal(Number.parseFloat(v) || 0)}
            />

            <SelectMultipleProducts
              label="Bundle products"
              products={products}
              onChange={(newPs) =>
                setProducts(newPs.map((p) => ({ ...p, requireVol: 1 })))
              }
              showDefault={false}
            >
              <BlockStack gap={"300"}>
                {products.map((p, idx) => (
                  <SelectedProduct
                    product={p}
                    onRemove={() => {
                      var newProducts = [...products];
                      newProducts.splice(idx, 1);
                      setProducts(newProducts);
                    }}
                    actions={[
                      <Box maxWidth="3rem">
                        <Tooltip content="Require volume">
                          <TextField
                            label=""
                            autoComplete="off"
                            size="slim"
                            // type="number"
                            value={p.requireVol.toString()}
                            onChange={(v) => {
                              var newP = {
                                ...p,
                                requireVol: Number.parseInt(v),
                              };
                              var newPs = [...products];
                              newPs[idx] = newP;
                              setProducts(newPs);
                            }}
                          />
                        </Tooltip>
                      </Box>,
                    ]}
                  ></SelectedProduct>
                ))}
              </BlockStack>
            </SelectMultipleProducts>
          </BlockStack>
        </Card>

        <Box minHeight="12px" />
        <BundleTheme {...themeConfig} />
      </Grid.Cell>

      <Grid.Cell columnSpan={{ sm: 6, md: 3, lg: 6 }}>
        <div
          ref={refPreview}
          style={{
            position: "fixed",
          }}
        >
          <BundleThemePreview
            content={content}
            discountType={discountType.value}
            discountValue={discountVal}
            theme={themeConfig}
            products={products}
          />
        </div>
      </Grid.Cell>
    </Grid>
  );
}
