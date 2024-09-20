import {
  BlockStack,
  Text,
  Grid,
  Select,
  SelectOption,
  Box,
  Icon,
  InlineGrid,
  InlineStack,
} from "@shopify/polaris";

import {
  ButtonConfigTheme,
  createButtonConfigField,
  createFontConfigField,
  createFrameConfigField,
  FontConfigField,
  FontTheme,
  FrameConfigField,
  FrameConfigTheme,
  GUIBundleTotalConfigField,
  GUIButtonConfigField,
  RenderBundleButton,
  RenderFrame,
  RenderTextTheme,
} from "./ThemeField";
import CardWithHeading from "~/components/Common/CardWithHeading";
import { ProductInfo } from "../Shopify/SelectProduct";
import { DVT } from "~/defs";
import { useEffect, useState } from "react";
import { PlusIcon } from "@shopify/polaris-icons";
import { Field } from "@shopify/react-form";
import { CardOverflow } from "../Common/CardOverflow";

type BundleThemeType = {
  title: FontConfigField;
  productFrame: FrameConfigField;
  productName: FontConfigField;
  productPrice: FontConfigField;
  total: GUIBundleTotalConfigField;
  button: GUIButtonConfigField;
};

export function createBundleThemeType(): BundleThemeType {
  return {
    title: createFontConfigField({
      color: "#1B1B1B",
      size: 16,
      weight: "bold",
    }),
    productFrame: createFrameConfigField({
      bgColor: "#F5F5F5",
      borderColor: "#F5F5F5",
    }),
    productName: createFontConfigField({
      color: "#1B1B1B",
      size: 14,
      weight: "regular",
    }),
    productPrice: createFontConfigField({
      color: "#1B1B1B",
      size: 16,
      weight: "bold",
    }),
    total: {
      frame: createFrameConfigField({
        bgColor: "#F5F5F5",
        borderColor: "#F5F5F5",
      }),
      label: createFontConfigField({
        color: "#1B1B1B",
        size: 14,
        weight: "bold",
      }),
      price: createFontConfigField({
        color: "#008060",
        size: 18,
        weight: "bold",
      }),
      comparePrice: createFontConfigField({
        color: "#e93636",
        size: 14,
        weight: "regular",
      }),
    },
    button: createButtonConfigField(
      {
        color: "#FFFFFF",
        size: 18,
        weight: "bold",
      },
      { bgColor: "#008060", borderColor: "#008060" },
    ),
  };
}

export function BundleTheme({
  title,
  productName,
  productPrice,
  productFrame,
  button,
}: BundleThemeType) {
  return (
    <BlockStack gap={"400"}>
      <Text as="h2" variant="headingSm">
        Typography & Colour
      </Text>

      <CardOverflow>
        <FontTheme {...title} />
      </CardOverflow>

      <CardWithHeading title="Title Config">
        <FontTheme {...title} />
      </CardWithHeading>

      <CardWithHeading title="Product Name Config">
        <FontTheme {...productName} />
      </CardWithHeading>

      <CardWithHeading title="Product Price Config">
        <FontTheme {...productPrice} />
      </CardWithHeading>

      <CardWithHeading title="Product Card Config">
        <FrameConfigTheme {...productFrame} />
      </CardWithHeading>

      <CardWithHeading title="Total config">
        <FontTheme {...productPrice} />
        <FontTheme {...productPrice} />
        <FrameConfigTheme {...productFrame} />
      </CardWithHeading>

      <CardWithHeading title="Button Config">
        <ButtonConfigTheme {...button} />
      </CardWithHeading>
    </BlockStack>
  );
}

export type BundleContentField = {
  title: Field<string>;
  buttonContent: Field<string>;
  footerText: Field<string>;
};

export function BundleThemeContent(props: BundleContentField) {
  return <BlockStack></BlockStack>;
}

type BundleThemePreviewProps = {
  theme: BundleThemeType;
  content: BundleContentField;
  products?: ProductInfo[];
  discountType: DVT;
  discountValue: number;
};

type PriceWithDiscount = {
  price: number;
  priceDiscount: number;
};

type BundlePriceDiscount = {
  total: number;
  totalDiscount: number;
  prices: PriceWithDiscount[];
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
        {...title}
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
              {...{ productFrame, productName, productPrice }}
              onChangePricing={(newPrice) => onPriceChange(newPrice, idx)}
            />
          ) : (
            <div key={idx}>
              <BundleProductPreview
                price={prices[idx]}
                priceDiscount={discountPrices[idx]}
                volume={0}
                product={pinfo}
                {...{ productFrame, productName, productPrice }}
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
      <RenderFrame {...total.frame}>
        <div className="flex_row" style={{ margin: "1rem" }}>
          <div>
            <RenderTextTheme
              as="p"
              content={content.footerText.value}
              {...total.label}
            />
          </div>

          <div className="flex_row" style={{ textAlign: "right" }}>
            <span className="old">{totalValue}</span>
            <RenderTextTheme
              as="span"
              content={discountTotalValue}
              {...total.price}
            />
          </div>
        </div>
      </RenderFrame>

      {/* Add to cart button */}
      <RenderBundleButton content={content.buttonContent.value} {...button} />
    </div>
  );
}

type BundleProductPreviewProps = {
  volume: number;
  price: number;
  priceDiscount: number;
  product: ProductInfo;
  productFrame: FrameConfigField;
  productName: FontConfigField;
  productPrice: FontConfigField;
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
