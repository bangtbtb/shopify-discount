import {
  BlockStack,
  Text,
  Select,
  SelectOption,
  Box,
  Icon,
  InlineStack,
} from "@shopify/polaris";

import {
  ButtonTheme,
  FontTheme,
  FrameTheme,
  RenderBundleButton,
  RenderFrame,
  RenderTextTheme,
} from "./ThemeField";
import CardWithHeading from "~/components/Common";
import { ProductInfo } from "../Shopify/SelectProduct";
import { DVT } from "~/defs";
import { useEffect, useState } from "react";
import { PlusIcon } from "@shopify/polaris-icons";
import { Field } from "@shopify/react-form";
import { CombinableDiscountTypes } from "@shopify/discount-app-components";
import { FontConfig, FrameConfig } from "~/defs/theme";

export type ProductInfoBundle = ProductInfo & { requireVol: number };

export type BundleThemeType = {
  title: Field<FontConfig>;
  productFrame: Field<FrameConfig>;
  productName: Field<FontConfig>;
  productPrice: Field<FontConfig>;
  total: {
    frame: Field<FrameConfig>;
    label: Field<FontConfig>;
    price: Field<FontConfig>;
    comparePrice: Field<FontConfig>;
  };
  button: {
    frame: Field<FrameConfig>;
    font: Field<FontConfig>;
  };
};

// export const defaultBundleThemeType: BundleThemeType = {
//   title: createFontConfigField({
//     color: "#1B1B1B",
//     size: 16,
//     weight: "700",
//   }),
//   productFrame: createFrameConfigField({
//     bgColor: "#F5F5F5",
//     borderColor: "#F5F5F5",
//   }),
//   productName: createFontConfigField({
//     color: "#1B1B1B",
//     size: 14,
//     weight: "400",
//   }),
//   productPrice: createFontConfigField({
//     color: "#1B1B1B",
//     size: 16,
//     weight: "700",
//   }),
//   total: {
//     frame: createFrameConfigField({
//       bgColor: "#F5F5F5",
//       borderColor: "#F5F5F5",
//     }),
//     label: createFontConfigField({
//       color: "#1B1B1B",
//       size: 14,
//       weight: "700",
//     }),
//     price: createFontConfigField({
//       color: "#008060",
//       size: 18,
//       weight: "700",
//     }),
//     comparePrice: createFontConfigField({
//       color: "#e93636",
//       size: 14,
//       weight: "400",
//     }),
//   },
//   button: createButtonConfigField(
//     {
//       color: "#FFFFFF",
//       size: 18,
//       weight: "700",
//     },
//     { bgColor: "#008060", borderColor: "#008060" },
//   ),
// };

export function BundleTheme({
  title,
  productName,
  productPrice,
  productFrame,
  total,
  button,
}: BundleThemeType) {
  return (
    <BlockStack gap={"400"}>
      <Text as="h2" variant="headingSm">
        Typography & Colour
      </Text>

      <CardWithHeading title="Title Config">
        <FontTheme {...title.value} onChange={title.onChange} />
      </CardWithHeading>

      <CardWithHeading title="Product Name Config">
        <FontTheme {...productName.value} onChange={productName.onChange} />
      </CardWithHeading>

      <CardWithHeading title="Product Price Config">
        <FontTheme {...productPrice.value} onChange={productPrice.onChange} />
      </CardWithHeading>

      <CardWithHeading title="Product Card Config">
        <FrameTheme {...productFrame.value} onChange={productFrame.onChange} />
      </CardWithHeading>

      <CardWithHeading title="Total config">
        <FontTheme {...total.label.value} onChange={total.label.onChange} />
        <FontTheme {...total.price.value} onChange={total.price.onChange} />
        <FontTheme
          {...total.comparePrice.value}
          onChange={total.comparePrice.onChange}
        />

        <FrameTheme {...total.frame.value} onChange={total.frame.onChange} />
      </CardWithHeading>

      {/* <CardWithHeading title="Button Config">
        <ButtonTheme font={buttonfont} frame={button.frame}  onChangeFont={}/>
      </CardWithHeading> */}
    </BlockStack>
  );
}

export type BundleContentField = {
  title: Field<string>;
  startDate: Field<Date>;
  endDate: Field<Date | null>;
  combines: Field<CombinableDiscountTypes>;
  buttonContent: Field<string>;
  footerText: Field<string>;
};

type BundleThemePreviewProps = {
  theme: BundleThemeType;
  content: BundleContentField;
  products?: ProductInfo[];
  discountType: DVT;
  discountValue: number;
};

export function BundleThemePreview({
  theme,
  content,
  products,
  discountType,
  discountValue,
}: BundleThemePreviewProps) {
  const { title, productFrame, productName, productPrice, total, button } =
    theme;

  const [prices, setPrices] = useState<number[]>(
    products?.map((p) => Number.parseFloat(p.variants[0].price ?? "0")) ?? [],
  );

  const [discountPrices, setDiscountPrices] = useState<number[]>(
    prices.map((v) => {
      if (discountType === "fix") {
        return v - discountValue;
      }

      if (discountType === "percent") {
        return v - (v / 100.0) * discountValue;
      }
      return v;
    }),
  );

  const [totalValue, setTotalValue] = useState(
    prices.reduce((prev, current) => current + prev, 0),
  );

  const [discountTotalValue, setDiscountTotalValue] = useState(
    discountPrices.reduce((prev, current) => prev + current, 0),
  );

  useEffect(() => {
    console.log("Discount value: ", discountValue);

    let newPrices =
      products?.map((p) => Number.parseFloat(p.variants[0].price ?? "0")) ?? [];
    let newDiscountPrices = newPrices.map((v) => {
      if (discountType === "fix") {
        return v - discountValue;
      }
      if (discountType === "percent") {
        return v - (v / 100.0) * discountValue;
      }
      return v;
    });

    console.log("newPrices: ", newPrices);
    console.log("newPricesDiscount: ", newDiscountPrices);
    console.log(
      "total: ",
      newPrices.reduce((prev, current) => prev + current, 0),
    );
    console.log(
      "totalDiscount: ",
      newDiscountPrices.reduce((prev, current) => prev + current, 0),
    );

    setPrices(newPrices);
    setDiscountPrices(newDiscountPrices);
    setTotalValue(newPrices.reduce((prev, current) => prev + current, 0));
    setDiscountTotalValue(
      newDiscountPrices.reduce((prev, current) => prev + current, 0),
    );
  }, [products, discountType, discountValue]);

  const onPriceChange = (newPrice: number, idx: number) => {
    var newPrices = [...prices];
    newPrices[idx] = newPrice;

    var newTotal = newPrices.reduce((prev, current) => prev + current);
    console.log("New price change: ", newPrice, idx);
    console.log("New prices: ", newPrices, newTotal);

    setPrices(newPrices);
    setTotalValue(newTotal);
  };

  return (
    <div
      className="flex_column"
      style={{
        gap: "12px",
        padding: "20px",
        borderRadius: "0.5rem",
        backgroundColor: "#fff",
      }}
    >
      {/* Header */}
      <RenderTextTheme
        as="h3"
        align="center"
        content={content.title.value}
        {...title.value}
      />

      {/* Products */}

      {products?.length ? (
        products.map((pinfo, idx) =>
          idx === products.length - 1 ? (
            <BundleProductPreview
              key={idx}
              price={prices[idx]}
              priceDiscount={discountPrices[idx]}
              volume={0}
              product={pinfo}
              productFrame={productFrame.value}
              productName={productName.value}
              productPrice={productPrice.value}
              onChangePricing={(newPrice) => onPriceChange(newPrice, idx)}
            />
          ) : (
            <div key={idx}>
              <BundleProductPreview
                price={prices[idx]}
                priceDiscount={discountPrices[idx]}
                volume={0}
                product={pinfo}
                productFrame={productFrame.value}
                productName={productName.value}
                productPrice={productPrice.value}
                onChangePricing={(newPrice) => onPriceChange(newPrice, idx)}
              />
              <Icon source={PlusIcon} />
            </div>
          ),
        )
      ) : (
        <Box>
          <Box minHeight="80px"></Box>
          <InlineStack align="center">
            <Text as="p" variant="headingSm">
              Select product to see preview
            </Text>
            <Box minHeight="80px"></Box>
          </InlineStack>
        </Box>
      )}

      {/* Total */}
      <RenderFrame {...total.frame.value}>
        <div className="flex_row" style={{ margin: "1rem" }}>
          <div>
            <RenderTextTheme
              as="p"
              content={content.footerText.value}
              {...total.label.value}
            />
          </div>

          <div className="flex_row" style={{ textAlign: "right" }}>
            <span className="old">{totalValue}</span>
            <RenderTextTheme
              as="span"
              content={discountTotalValue}
              {...total.price.value}
            />
          </div>
        </div>
      </RenderFrame>

      {/* Add to cart button */}
      <RenderBundleButton
        content={content.buttonContent.value}
        font={button.font.value}
        frame={button.frame.value}
      />
    </div>
  );
}

type BundleProductPreviewProps = {
  volume: number;
  price: number;
  priceDiscount: number;
  product: ProductInfo;
  productFrame: FrameConfig;
  productName: FontConfig;
  productPrice: FontConfig;
  onChangePricing: (pricing: number) => void;
};

export function BundleProductPreview({
  volume,
  price,
  priceDiscount,
  product,
  productFrame,
  productName,
  productPrice,
  onChangePricing,
}: BundleProductPreviewProps) {
  const [variant, setVariant] = useState(product.variants[0]);
  const [variantOptions] = useState<SelectOption[]>(
    product.variants.map((v) => ({
      label: v.title || "",
      value: v.id ?? "",
    })),
  );

  return (
    <RenderFrame {...productFrame}>
      <div className="flex_row" style={{ padding: "0.75rem", gap: "1rem" }}>
        {/* Image */}
        <div style={{ minWidth: "92px", height: "71px" }}>
          <img className="fit_img" src={product.image} alt="" />
        </div>

        <div
          className="flex_column remain"
          style={{ justifyContent: "space-between" }}
        >
          {/* Title */}
          <RenderTextTheme as="p" content={product.title} {...productName} />

          <div className="flex_row" style={{ justifyContent: "start" }}>
            <span className="product_title">{`x ${volume}`}</span>

            {product.variants.length > 1 && (
              <Select
                label=""
                value={variant.title}
                options={variantOptions}
                onChange={(variantId) => {
                  var target = product.variants.find((v) => v.id === variantId);
                  if (target) {
                    setVariant(target);
                    onChangePricing(Number.parseInt(target.price ?? "") || 0);
                  }
                }}
              />
            )}
          </div>
        </div>

        {/* Price */}
        <div
          className="flex_column"
          style={{ width: "fit-content", height: "71px", textAlign: "right" }}
        >
          <RenderTextTheme as="p" content={priceDiscount} {...productPrice} />
          <span className="old">{price}</span>
        </div>
      </div>
    </RenderFrame>
  );
}
