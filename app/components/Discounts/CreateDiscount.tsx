import { Box, Card, Grid, BlockStack, TextField } from "@shopify/polaris";
import { DVT, ODConfig, SDConfig, VDConfig } from "~/defs";
import { DiscountAutomaticAppInput } from "~/types/admin.types";
import {
  BundleContentField,
  BundleTheme,
  BundleThemePreview,
  createBundleThemeType,
  ProductInfoBundle,
} from "./ThemeDiscount";
import { useEffect, useRef, useState } from "react";
import { ProductInfo, SelectMultipleProducts } from "../Shopify/SelectProduct";
import { useField } from "@shopify/react-form";
import TextFieldSelect from "../Shopify/TextFieldSelect";

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
            >
              {/* <BlockStack>
                {products.map((p, idx) => (
                  <div
                    key={idx}
                    className="flex_row"
                    style={{ padding: "0.75rem", gap: "1rem" }}
                  >
                    <div style={{ minWidth: "92px", height: "71px" }}>
                      <img className="fit_img" src={p.image} alt="" />
                    </div>
                    <TextField label="" value={}> </TextField>
                  </div>
                ))}
              </BlockStack> */}
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
