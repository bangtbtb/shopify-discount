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
import { FontConfig, FrameConfig } from "~/defs/theme";
import CardWithHeading from "../Common";
import {
  ButtonTheme,
  FontTheme,
  FrameTheme,
  SelectFontWeight,
} from "./ThemeField";
import { NumberField } from "../Shopify/NumberField";
import { ColorPickerField } from "../Common/ColorPickerField";

type BundleComponentProps = {
  onSubmit?: (
    discount: DiscountAutomaticAppInput,
    config: ODConfig | SDConfig | VDConfig,
  ) => void;
};

export function BundleDetail(props: BundleComponentProps) {
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

  const [titleFont, setTitleFont] = useState<FontConfig>({
    color: "#1B1B1B",
    size: 16,
    weight: "700",
  });

  const [productFrame, setproductFrame] = useState<FrameConfig>({
    bgColor: "#F5F5F5",
    borderColor: "#F5F5F5",
  });

  const [productName, setproductName] = useState<FontConfig>({
    color: "#1B1B1B",
    size: 14,
    weight: "400",
  });

  const [productPrice, setproductPrice] = useState<FontConfig>({
    color: "#1B1B1B",
    size: 16,
    weight: "700",
  });

  const [totalFrame, setTotalFrame] = useState<FrameConfig>({
    bgColor: "#F5F5F5",
    borderColor: "#F5F5F5",
  });

  const [totalLabel, setTotalLabel] = useState<FontConfig>({
    color: "#1B1B1B",
    size: 14,
    weight: "700",
  });

  const [totalPrice, setTotalPrice] = useState<FontConfig>({
    color: "#008060",
    size: 18,
    weight: "700",
  });

  const [totalComparePrice, setTotalComparePrice] = useState<FontConfig>({
    color: "#e93636",
    size: 14,
    weight: "400",
  });

  const [buttonFont, setButtonFont] = useState<FontConfig>({
    color: "#FFFFFF",
    size: 18,
    weight: "700",
  });

  const [buttonFrame, setButtonFrame] = useState<FrameConfig>({
    bgColor: "#008060",
    borderColor: "#008060",
  });

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

            {/* <TextFieldSelect
              label="Discount value"
              type={discountType.value}
              value={discountVal.toString()}
              options={[
                { label: "Percent", value: "percent" },
                { label: "Fix Amount", value: "fix" },
              ]}
              onChangeType={(v) => discountType.onChange(v as DVT)}
              onChangeValue={(v) => setDiscountVal(Number.parseFloat(v) || 0)}
            /> */}

            <SelectMultipleProducts
              label="Bundle products"
              products={products}
              onChange={(newPs) =>
                setProducts(newPs.map((p) => ({ ...p, requireVol: 1 })))
              }
              showDefault={false}
            >
              <BlockStack gap={"300"} key={"product-list"}>
                {products.map((p, idx) => (
                  <SelectedProduct
                    key={idx}
                    product={p}
                    onRemove={() => {
                      var newProducts = [...products];
                      newProducts.splice(idx, 1);
                      setProducts(newProducts);
                    }}
                    actions={[
                      <Box maxWidth="3rem" key={`child-${idx}`}>
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
                                requireVol: Number.parseInt(v) || 0,
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

        {/* <ColorPickerField
          label="Color"
          hexColor={title.color}
          onChange={(newHex) => setTitle({ ...title, color: newHex })}
        />

        <NumberField
          label="Size"
          autoComplete="off"
          type="number"
          // suffix={"px"}
          max={64}
          min={8}
          num={title.size}
          onChangeNum={(v) => setTitle({ ...title, size: v })}
        />

        <SelectFontWeight
          label="Weight"
          value={title.weight}
          onChange={(v) => setTitle({ ...title, weight: v })}
        /> */}

        <BlockStack gap={"400"}>
          <Text as="h2" variant="headingSm">
            Typography & Colour
          </Text>

          <CardWithHeading title="Title Config">
            <FontTheme {...titleFont} onChange={setTitleFont} />
          </CardWithHeading>

          <CardWithHeading title="Product Name Config">
            <FontTheme {...productName} onChange={setproductName} />
          </CardWithHeading>

          <CardWithHeading title="Product Price Config">
            <FontTheme {...productPrice} onChange={setproductPrice} />
          </CardWithHeading>

          <CardWithHeading title="Product Card Config">
            <FrameTheme {...productFrame} onChange={setproductFrame} />
          </CardWithHeading>

          <CardWithHeading title="Total config">
            <FontTheme {...totalLabel} onChange={setTotalLabel} />
            <FontTheme {...totalPrice} onChange={setTotalPrice} />
            <FontTheme {...totalComparePrice} onChange={setTotalComparePrice} />

            <FrameTheme {...totalFrame} onChange={setTotalFrame} />
          </CardWithHeading>

          <CardWithHeading title="Button Config">
            <ButtonTheme
              font={buttonFont}
              frame={buttonFrame}
              onChangeFont={setButtonFont}
              onChangeFrame={setButtonFrame}
            />
          </CardWithHeading>
        </BlockStack>
      </Grid.Cell>
      {/* 
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
      </Grid.Cell> */}
    </Grid>
  );
}

// const themeConfig: BundleThemeType = {
//   title: useField({
//     color: "#1B1B1B",
//     size: 16,
//     weight: "700",
//   }),
//   productFrame: useField({
//     bgColor: "#F5F5F5",
//     borderColor: "#F5F5F5",
//   }),
//   productName: useField({
//     color: "#1B1B1B",
//     size: 14,
//     weight: "400",
//   }),
//   productPrice: useField({
//     color: "#1B1B1B",
//     size: 16,
//     weight: "700",
//   }),
//   total: {
//     frame: useField({
//       bgColor: "#F5F5F5",
//       borderColor: "#F5F5F5",
//     }),
//     label: useField({
//       color: "#1B1B1B",
//       size: 14,
//       weight: "700",
//     }),
//     price: useField({
//       color: "#008060",
//       size: 18,
//       weight: "700",
//     }),
//     comparePrice: useField({
//       color: "#e93636",
//       size: 14,
//       weight: "400",
//     }),
//   },
//   button: {
//     font: useField({
//       color: "#FFFFFF",
//       size: 18,
//       weight: "700",
//     }),
//     frame: useField({ bgColor: "#008060", borderColor: "#008060" }),
//   },
// };
