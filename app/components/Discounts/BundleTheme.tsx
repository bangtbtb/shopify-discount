import {
  BlockStack,
  Text,
  SelectOption,
  Box,
  InlineStack,
} from "@shopify/polaris";

import {
  ButtonThemeEditor,
  FontTheme,
  FrameTheme,
  RenderBundleButton,
  RenderFrame,
  RenderTextTheme,
  SelectVariant,
  TextConfigEditor,
} from "./ThemeField";
import { ProductInfo, ProductVariant } from "../Shopify/SelectProduct";
import { DiscountValue } from "~/defs/discount";
import { useEffect, useState } from "react";
import {
  BundleContent,
  BundleProductConfig,
  BundleThemeConfig,
} from "~/defs/theme";
import { initArray } from "~/models/utils";
import { CardCollapse } from "~/components/Common";
import { CountdownTimer } from "../Common/CountDown";
import { ClientOnly } from "remix-utils/client-only";
import { ColorPickerField } from "../Common/ColorPickerField";

export type ProductInfoBundle = ProductInfo & { requireVol: number };

export const defaultBundleTheme: BundleThemeConfig = {
  container: {
    bgColor: "#ffffff",
    borderColor: "#ffffff",
  },
  banner: {
    font: {
      color: "#ffffff",
      weight: "600",
      size: 12,
    },
    bgColor: "#ff0000",
  },
  title: {
    color: "#1B1B1B",
    size: 16,
    weight: "600",
    content: "Bundle Offer",
  },
  product: {
    frame: {
      bgColor: "#F5F5F5",
      borderColor: "#F5F5F5",
    },
    name: {
      color: "#1B1B1B",
      size: 14,
      weight: "600",
    },
    price: {
      color: "#1B1B1B",
      size: 18,
      weight: "600",
    },
  },
  summary: {
    frame: {
      bgColor: "#F5F5F5",
      borderColor: "#F5F5F5",
    },
    label: {
      color: "#1B1B1B",
      size: 14,
      weight: "700",
      content: "Total",
    },
    price: {
      color: "#008060",
      size: 20,
      weight: "700",
    },
    comparePrice: {
      color: "#616161",
      size: 13,
      weight: "400",
    },
  },
  button: {
    font: {
      color: "#FFFFFF",
      size: 18,
      weight: "700",
      content: "Add To Cart",
    },
    frame: { bgColor: "#008060", borderColor: "#008060" },
  },
};

export type BundleThemeProps = BundleThemeConfig & {
  onChangeTheme: (k: string, v: any) => void;
};

export function BundleThemeEditor({
  title,
  banner,
  container,
  product,
  summary,
  button,
  onChangeTheme,
}: BundleThemeProps) {
  return (
    <BlockStack gap={"400"}>
      <Text as="h2" variant="headingLg">
        Typography & Colour
      </Text>

      <CardCollapse title="Container Config" collapse={true}>
        <FrameTheme
          {...container}
          onChange={(v) => onChangeTheme("container", v)}
        />
      </CardCollapse>

      <CardCollapse title="Banner Config" collapse={true}>
        <FontTheme
          {...banner.font}
          onChange={(v) => {
            onChangeTheme("banner", { ...banner, font: v });
          }}
        />
        <Box minHeight="1rem"></Box>

        <ColorPickerField
          label="Background color"
          hexColor={banner.bgColor}
          onChange={(v) => onChangeTheme("banner", { ...banner, bgColor: v })}
        />
      </CardCollapse>
      <CardCollapse title="Title Config" collapse={true}>
        <TextConfigEditor
          contentHelp="This title is for use on the website only."
          {...title}
          onChange={(v) => {
            onChangeTheme("title", v);
          }}
        />
      </CardCollapse>

      <CardCollapse title="Product Config" collapse>
        <BlockStack gap={"300"}>
          <FontTheme
            header={"Name"}
            {...product.name}
            onChange={(v) =>
              onChangeTheme("product", {
                ...product,
                name: v,
              })
            }
          />

          <FontTheme
            header={"Price"}
            {...product.price}
            onChange={(v) =>
              onChangeTheme("product", {
                ...product,
                price: v,
              })
            }
          />

          <FrameTheme
            {...product.frame}
            onChange={(v) =>
              onChangeTheme("product", {
                ...product,
                frame: v,
              })
            }
          />
        </BlockStack>
      </CardCollapse>

      <CardCollapse title="Summary Config" collapse>
        <BlockStack gap={"400"}>
          <Box paddingBlockStart={"200"} paddingBlockEnd={"200"}>
            <FontTheme
              header={"Label"}
              {...summary.label}
              onChange={(v) => onChangeTheme("total", { ...summary, label: v })}
            />
          </Box>

          <FontTheme
            header={"Discount Price"}
            {...summary.price}
            onChange={(v) => onChangeTheme("total", { ...summary, price: v })}
          />

          <FontTheme
            header={"Compare Price"}
            {...summary.comparePrice}
            onChange={(v) =>
              onChangeTheme("total", { ...summary, comparePrice: v })
            }
          />

          <FrameTheme
            {...summary.frame}
            onChange={(v) => onChangeTheme("total", { ...summary, frame: v })}
          />
        </BlockStack>
      </CardCollapse>

      <CardCollapse title="Button Config" collapse>
        <ButtonThemeEditor
          {...button}
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
  endAt?: string | number | null;
};

export function BundleThemePreview({
  theme,
  content,
  products,
  discount,
  endAt,
}: BundleThemePreviewProps) {
  const { title, product, summary, button } = theme;

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
      className="flex_column prv_ctn"
      style={{
        backgroundColor: theme.container.bgColor,
        borderColor: theme.container.borderColor,
      }}
    >
      {/* Header */}
      <div className="flex_row space nowrap bundle_header">
        {/* Title */}
        <RenderTextTheme
          as="h3"
          align="left"
          style={{ flexGrow: 2 }}
          // children={titleContent}
          // className="remain"
          {...title}
        />

        {/* Discount banner */}
        <div
          className="diagonal"
          style={{ backgroundColor: theme.banner.bgColor }}
        >
          <RenderTextTheme
            as="span"
            {...theme.banner.font}
            content={`${discount.value}${discount.type === "percent" ? "%" : "$"} OFF`}
          />
        </div>
      </div>

      {endAt && (
        <ClientOnly fallback={null}>
          {() => (
            <div className="flex_row" style={{ alignItems: "center" }}>
              <span
                style={{
                  width: "fit-content",
                  fontSize: "18px",
                  fontWeight: 600,
                }}
              >
                Expires in
              </span>

              <CountdownTimer
                // style={{ flexGrow: 1 }}
                initTime={endAt}
              />
            </div>
          )}
        </ClientOnly>
      )}

      {/* Products */}
      {products?.length ? (
        products.map((pinfo, idx) => (
          <BundleProductPreview
            key={pinfo.id}
            price={prices[idx]}
            priceDiscount={discountPrices[idx]}
            product={pinfo}
            productTheme={product}
            onChangePricing={(newPrice) => onPriceChange(newPrice, idx)}
          />
        ))
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
      <RenderFrame {...summary.frame}>
        <div className="flex_row space" style={{ margin: "1rem" }}>
          <RenderTextTheme as="p" {...summary.label} />

          <div className="flex_row" style={{ textAlign: "right" }}>
            <RenderTextTheme
              as="span"
              className="old_price"
              content={totalValue}
              {...summary.comparePrice}
            />

            <RenderTextTheme
              as="span"
              content={discountTotalValue}
              {...summary.price}
            />
          </div>
        </div>
      </RenderFrame>

      {/* Add to cart button */}
      <RenderBundleButton font={button.font} frame={button.frame} />
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
    <RenderFrame id={product.id} className="product" {...productTheme.frame}>
      <div defaultValue={product.id} className="flex_row nowrap product_bundle">
        {/* Image */}
        <div className="img_ctn">
          <img className="fit_img" src={product.image} alt={product.imageAlt} />
        </div>

        <div className="flex_column remain">
          {/* Title */}
          <RenderTextTheme
            as="p"
            content={product.title}
            style={{ margin: "0" }}
            {...productTheme.name}
          />

          <div
            className="flex_row wrap"
            style={{
              justifyContent: "start",
              alignItems: "flex-end",
            }}
          >
            <RenderTextTheme
              as="p"
              content={priceDiscount}
              {...productTheme.price}
            />

            {product.requireVol > 1 && (
              <span className="product_volume">{`x ${product.requireVol}`}</span>
            )}
          </div>

          <div className="flex_row" style={{ justifyContent: "start" }}>
            {product.variants.length > 1 &&
              variants.map((vari, idx) => (
                <SelectVariant
                  key={idx}
                  value={vari}
                  options={product.variants}
                  onChange={(newVar) => {
                    var newVars = [...variants];
                    newVars[idx] = newVar;
                    setVariants(newVars);
                    var sumPrice = newVars.reduce(
                      (prev, current) =>
                        prev + (Number.parseFloat(current.price ?? "0") || 0),
                      0,
                    );
                    console.log("Sumary: ", sumPrice);
                    onChangePricing(sumPrice);
                  }}
                />
              ))}
          </div>
        </div>
      </div>
    </RenderFrame>
  );
}
