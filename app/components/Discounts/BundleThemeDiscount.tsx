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
  ButtonThemeEditor,
  FontTheme,
  FrameTheme,
  RenderBundleButton,
  RenderFrame,
  RenderTextTheme,
} from "./ThemeField";
import { ProductInfo, ProductVariant } from "../Shopify/SelectProduct";
import { DiscountValue } from "~/defs/discount";
import { useEffect, useState } from "react";
import { PlusIcon } from "@shopify/polaris-icons";
import {
  BundleContent,
  BundleProductConfig,
  BundleThemeConfig,
} from "~/defs/theme";
import { initArray } from "~/models/utils";
import { BoxBorderBound, CardCollapse } from "~/components/Common";

export type ProductInfoBundle = ProductInfo & { requireVol: number };

export const defaultBundleTheme: BundleThemeConfig = {
  title: {
    color: "#1B1B1B",
    size: 16,
    weight: "700",
  },
  product: {
    frame: {
      bgColor: "#F5F5F5",
      borderColor: "#F5F5F5",
    },
    name: {
      color: "#1B1B1B",
      size: 14,
      weight: "400",
    },
    price: {
      color: "#1B1B1B",
      size: 16,
      weight: "700",
    },
  },
  total: {
    frame: {
      bgColor: "#F5F5F5",
      borderColor: "#F5F5F5",
    },
    label: {
      color: "#1B1B1B",
      size: 14,
      weight: "700",
    },
    price: {
      color: "#008060",
      size: 18,
      weight: "700",
    },
    comparePrice: {
      color: "#e93636",
      size: 14,
      weight: "400",
    },
  },
  button: {
    font: {
      color: "#FFFFFF",
      size: 18,
      weight: "700",
    },
    frame: { bgColor: "#008060", borderColor: "#008060" },
  },
};

export type BundleThemeProps = BundleThemeConfig & {
  onChangeTheme: (k: string, v: any) => void;
};

export function BundleThemeEditor({
  title,
  product,
  total,
  button,
  onChangeTheme,
}: BundleThemeProps) {
  return (
    <BlockStack gap={"400"}>
      <Text as="h2" variant="headingLg">
        Typography & Colour
      </Text>

      <CardCollapse title="Title Config" collapse={true}>
        <FontTheme
          {...title}
          onChange={(v) => {
            console.log("On change title theme ", title, v);

            onChangeTheme("title", v);
          }}
        />
      </CardCollapse>

      <CardCollapse title="Product Config" collapse>
        <BlockStack gap={"300"}>
          <BoxBorderBound header={"Name"}>
            <FontTheme
              {...product.name}
              onChange={(v) =>
                onChangeTheme("product", {
                  ...product,
                  name: v,
                })
              }
            />
          </BoxBorderBound>
          <BoxBorderBound header={"Price"}>
            <FontTheme
              {...product.price}
              onChange={(v) =>
                onChangeTheme("product", {
                  ...product,
                  price: v,
                })
              }
            />
          </BoxBorderBound>

          <BoxBorderBound header={"Card"}>
            <FrameTheme
              {...product.frame}
              onChange={(v) =>
                onChangeTheme("product", {
                  ...product,
                  frame: v,
                })
              }
            />
          </BoxBorderBound>
        </BlockStack>
      </CardCollapse>

      <CardCollapse title="Total config" collapse>
        <BlockStack gap={"300"}>
          <BoxBorderBound
            header={
              <Text as="h4" variant="headingSm">
                Label
              </Text>
            }
          >
            <Box paddingBlockStart={"200"} paddingBlockEnd={"200"}>
              <FontTheme
                {...total.label}
                onChange={(v) => onChangeTheme("total", { ...total, label: v })}
              />
            </Box>
          </BoxBorderBound>
          <BoxBorderBound>
            <FontTheme
              {...total.price}
              onChange={(v) => onChangeTheme("total", { ...total, price: v })}
            />
          </BoxBorderBound>

          <FontTheme
            {...total.comparePrice}
            onChange={(v) =>
              onChangeTheme("total", { ...total, comparePrice: v })
            }
          />

          <FrameTheme
            {...total.frame}
            onChange={(v) => onChangeTheme("total", { ...total, frame: v })}
          />
        </BlockStack>
      </CardCollapse>

      <CardCollapse title="Button Config" collapse>
        <ButtonThemeEditor
          font={button.font}
          frame={button.frame}
          onChangeFont={(v) => onChangeTheme("button", { ...button, font: v })}
          onChangeFrame={(v) =>
            onChangeTheme("button", { ...button, frame: v })
          }
        />
      </CardCollapse>
    </BlockStack>
  );
}

type BundleThemePreviewProps = {
  theme: BundleThemeConfig;
  content: BundleContent;
  products?: ProductInfoBundle[];
  discount: DiscountValue;
};

export function BundleThemePreview({
  theme,
  content,
  products,
  discount,
}: BundleThemePreviewProps) {
  const { title, product, total, button } = theme;

  const [prices, setPrices] = useState<number[]>(
    products?.map(
      (p) => Number.parseFloat(p.variants[0].price ?? "0") * p.requireVol,
    ) ?? [],
  );

  const [discountPrices, setDiscountPrices] = useState<number[]>(
    prices.map((v) => {
      if (discount.type === "fix") {
        return v - discount.value;
      }

      if (discount.type === "percent") {
        return v - (v / 100.0) * discount.value;
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
    let newPrices =
      products?.map(
        (p) => Number.parseFloat(p.variants[0].price ?? "0") * p.requireVol,
      ) ?? [];
    let newDiscountPrices = newPrices.map((v) => {
      if (discount.type === "fix") {
        return v - discount.value;
      }
      if (discount.type === "percent") {
        return v - (v / 100.0) * discount.value;
      }
      return v;
    });

    setPrices(newPrices);
    setDiscountPrices(newDiscountPrices);
    setTotalValue(newPrices.reduce((prev, current) => prev + current, 0));
    setDiscountTotalValue(
      newDiscountPrices.reduce((prev, current) => prev + current, 0),
    );
  }, [products, discount.type, discount.value]);

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
        children={content.title}
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
              product={pinfo}
              productTheme={product}
              onChangePricing={(newPrice) => onPriceChange(newPrice, idx)}
            />
          ) : (
            <div key={idx}>
              <BundleProductPreview
                price={prices[idx]}
                priceDiscount={discountPrices[idx]}
                product={pinfo}
                productTheme={product}
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
            <RenderTextTheme as="p" children={content.total} {...total.label} />
          </div>

          <div className="flex_row" style={{ textAlign: "right" }}>
            <span className="old_price">{totalValue}</span>
            <RenderTextTheme
              as="span"
              children={discountTotalValue}
              {...total.price}
            />
          </div>
        </div>
      </RenderFrame>

      {/* Add to cart button */}
      <RenderBundleButton
        content={content.button}
        font={button.font}
        frame={button.frame}
      />
    </div>
  );
}

type BundleProductPreviewProps = {
  price: number;
  priceDiscount: number;
  product: ProductInfoBundle;
  productTheme: BundleProductConfig;
  onChangePricing: (pricing: number) => void;
};

export function BundleProductPreview({
  priceDiscount,
  price,
  product,
  productTheme,
  onChangePricing,
}: BundleProductPreviewProps) {
  const [variants, setVariants] = useState<Array<Partial<ProductVariant>>>(
    initArray(product.requireVol, product.variants[0]),
  );

  const [variantOptions, setVariantOptions] = useState<SelectOption[]>(
    product.variants.map((v) => ({
      label: v.title || "",
      value: v.id ?? "",
    })),
  );

  useEffect(() => {
    setVariants(initArray(product.requireVol, product.variants[0]));
  }, [product.requireVol]);

  useEffect(() => {
    setVariantOptions(
      product.variants.map((v) => ({
        label: v.title || "",
        value: v.id ?? "",
      })),
    );
  }, [product]);

  return (
    <RenderFrame {...productTheme.frame}>
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
          <RenderTextTheme
            as="p"
            children={product.title}
            {...productTheme.name}
          />

          <div
            className="flex_row"
            style={{ justifyContent: "start", flexWrap: "wrap" }}
          >
            <span className="product_title">{`x ${product.requireVol}`}</span>

            {product.variants.length > 1 &&
              variants.map((vari, idx) => (
                <Select
                  key={idx}
                  label=""
                  value={vari.id}
                  options={variantOptions}
                  onChange={(variantId) => {
                    var target = product.variants.find(
                      (v) => v.id === variantId,
                    );

                    if (target) {
                      var newVars = [...variants];
                      newVars[idx] = target;
                      setVariants(newVars);
                      // console.log("New variants: ", newVars);
                      var sumPrice = newVars.reduce(
                        (prev, current) =>
                          prev + (Number.parseFloat(current.price ?? "0") || 0),
                        0,
                      );
                      console.log("SUmary: ", sumPrice);
                      onChangePricing(sumPrice);
                    }
                  }}
                />
              ))}
          </div>
        </div>

        {/* Price */}
        <div
          className="flex_column"
          style={{ width: "fit-content", height: "71px", textAlign: "right" }}
        >
          <RenderTextTheme
            as="p"
            children={priceDiscount}
            {...productTheme.price}
          />
          <span className="old_price">{price}</span>
        </div>
      </div>
    </RenderFrame>
  );
}
