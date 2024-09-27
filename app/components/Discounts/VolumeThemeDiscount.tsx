import { Field, useField } from "@shopify/react-form";

import { ProductInfo, ProductVariant } from "../Shopify/SelectProduct";
import {
  BlockStack,
  Box,
  InlineGrid,
  Select,
  SelectOption,
  Text,
} from "@shopify/polaris";
import { useEffect, useState } from "react";
import { VDApplyType } from "~/defs";
import {
  CombinableDiscountTypes,
  DateTime,
} from "@shopify/discount-app-components";
import { StepData } from "./ConfigStep";
import { CollectionInfo } from "../Shopify/SelectCollection";
import { DiscountAutomaticApp } from "~/types/admin.types";
import { SerializeFrom } from "@remix-run/node";
import { VDConfigExt } from "~/models/vd_model";
import { initArray } from "~/models/utils";
import {
  ButtonConfig,
  FontConfig,
  FrameConfig,
  PriceTotal,
  VolumeDiscountTheme,
} from "~/defs/theme";
import { CardCollapse, Midline } from "~/components/Common";
import {
  ButtonThemeEditor,
  FontTheme,
  FrameTheme,
  RenderBundleButton,
  RenderFrame,
  RenderTextTheme,
} from "./ThemeField";

export type VolumeDiscountContentField = {
  title: Field<string>;
  startDate: Field<DateTime>;
  endDate: Field<DateTime | null>;
  combines: Field<CombinableDiscountTypes>;
  applyType: Field<VDApplyType>;
  steps: Field<Array<StepData>>;
  products: Field<ProductInfo[]>;
  colls: Field<Array<CollectionInfo>>;
};

export type VolumeDiscountThemeField = {
  title: Field<FontConfig>;
  offerTitle: Field<FontConfig>;
  discountLabel: Field<FontConfig>;
  price: Field<FontConfig>;
  comparePrice: Field<FontConfig>;
  tagMostPopular: Field<FontConfig>;
  total: Field<FontConfig>;
  selected: Field<FrameConfig>;
  button: Field<ButtonConfig>;
  unselectedBar: Field<string>;
  unselectedBg: Field<string>;
};

export function createVolumeDiscountContent(
  discount?: SerializeFrom<DiscountAutomaticApp>,
  config?: SerializeFrom<VDConfigExt>,
): VolumeDiscountContentField {
  var now = new Date();

  var data = discount
    ? {
        title: useField(discount.title),
        startDate: useField(discount.startsAt || now.toString()),
        endDate: useField(discount.endsAt),
        combines: useField<CombinableDiscountTypes>({
          ...discount.combinesWith,
        }),
        applyType: useField<VDApplyType>(config?.applyType ?? "products"),
        steps: useField<Array<StepData>>(
          config?.steps
            ? config?.steps.map((v) => ({
                require: v.require,
                type: v.value.type,
                value: v.value.value,
              }))
            : [
                { type: "percent", value: 5, require: 2 },
                { type: "percent", value: 10, require: 3 },
                { type: "percent", value: 20, require: 4 },
              ],
        ),
        products: useField(config?.products ?? []),
        colls: useField(config?.colls ?? []),
      }
    : {
        title: useField("Volume Discount "),
        startDate: useField<Date>(new Date()),
        endDate: useField(null),
        combines: useField<CombinableDiscountTypes>({
          orderDiscounts: false,
          productDiscounts: false,
          shippingDiscounts: true,
        }),
        applyType: useField<VDApplyType>("products"),
        steps: useField<Array<StepData>>([
          { type: "percent", value: 5, require: 2 },
          { type: "percent", value: 10, require: 3 },
          { type: "percent", value: 20, require: 4 },
        ]),
        products: useField([]),
        colls: useField([]),
      };
  return data;
}

export const defaultVolumeDiscountTheme: VolumeDiscountTheme = {
  title: {
    color: "#4289FF",
    size: 21,
    weight: "700",
  },
  offerTitle: {
    color: "#000000",
    size: 14,
    weight: "500",
  },
  discountLabel: {
    color: "#ffffff",
    size: 15,
    weight: "500",
  },
  price: {
    color: "#000000",
    size: 14,
    weight: "600",
  },
  comparePrice: {
    color: "#9d9d9d",
    size: 11,
    weight: "500",
  },
  tagPopular: {
    color: "#4289FF",
    size: 14,
    weight: "600",
  },
  total: {
    color: "#1B1B1B",
    size: 14,
    weight: "500",
  },
  selected: {
    label: {
      color: "#ffffff",
      size: 12,
      weight: "500",
    },
    frame: {
      bgColor: "#4289ff",
      borderColor: "#4289ff",
    },
  },
  unselected: {
    label: {
      color: "#ffffff",
      size: 15,
      weight: "500",
    },
    frame: {
      borderColor: "#4289ff",
      bgColor: "#4289ff",
    },
  },
  button: {
    font: {
      color: "#ffffff",
      size: 18,
      weight: "700",
    },
    frame: { bgColor: "#4289ff", borderColor: "#008060" },
  },
};

type VolumeDiscountThemeEditorProps = VolumeDiscountTheme & {
  onChangeTheme: (k: string, v: any) => void;
};

export function VolumeDiscountThemeEditor({
  title,
  offerTitle,
  price,
  comparePrice,
  tagPopular,
  total,
  selected,
  button,
  unselected,
  onChangeTheme,
}: VolumeDiscountThemeEditorProps) {
  return (
    <BlockStack gap={"400"}>
      <Text as="h2" variant="headingLg">
        Typography & Colour
      </Text>

      <CardCollapse title="Title" collapse={true}>
        <FontTheme {...title} onChange={(v) => onChangeTheme("title", v)} />
      </CardCollapse>

      <CardCollapse title="Offer title" collapse={true}>
        <FontTheme
          {...offerTitle}
          onChange={(v) => onChangeTheme("offerTitle", v)}
        />
      </CardCollapse>

      <CardCollapse title="Price" collapse={true}>
        <FontTheme {...price} onChange={(v) => onChangeTheme("price", v)} />
      </CardCollapse>

      <CardCollapse title="Compare Price" collapse={true}>
        <FontTheme
          {...comparePrice}
          onChange={(v) => onChangeTheme("comparePrice", v)}
        />
      </CardCollapse>

      <CardCollapse title="Tag(Most Popular)" collapse={true}>
        <FontTheme
          {...tagPopular}
          onChange={(v) => onChangeTheme("tagPopular", v)}
        />
      </CardCollapse>

      <CardCollapse title="Total" collapse>
        <FontTheme {...total} onChange={(v) => onChangeTheme("total", v)} />
      </CardCollapse>

      <CardCollapse title="Label Selected Offer" collapse>
        <FontTheme
          {...selected.label}
          onChange={(v) => onChangeTheme("selected", { ...selected, label: v })}
        />
        <FrameTheme
          {...selected.frame}
          onChange={(v) => onChangeTheme("selected", { ...selected, frame: v })}
        />
      </CardCollapse>

      <CardCollapse title="Unselected label offer" collapse>
        <FontTheme
          {...unselected.label}
          onChange={(v) =>
            onChangeTheme("unselected", { ...unselected, label: v })
          }
        />
        <FrameTheme
          {...unselected.frame}
          onChange={(v) =>
            onChangeTheme("unselected", { ...unselected, frame: v })
          }
        />
      </CardCollapse>

      <CardCollapse title="Button" collapse>
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

type VolumeDiscountPreviewProps = {
  popularIndex: number;
  products: ProductInfo[];
  steps: StepData[];
  theme: VolumeDiscountTheme;
  titleContent: string;
  buttonContent: string;
};

export function VolumeDiscountPreview({
  steps,
  products,
  theme,
  popularIndex,
  titleContent,
  buttonContent,
}: VolumeDiscountPreviewProps) {
  const [activedIdx, setActivedIdx] = useState(0);
  const { title } = theme;

  return (
    <div
      className="flex_column"
      style={{
        // gap: "12px",
        padding: "20px",
        borderRadius: "0.5rem",
        backgroundColor: "#fff",
      }}
    >
      <Midline
        color={theme.title.color}
        fontSize={theme.title.size}
        fontWeight={theme.title.weight}
        content={titleContent}
      />

      {/* Volume break (Step) */}
      {products.length ? (
        steps.map((s, idx) => (
          <VolumeBreakOffer
            active={activedIdx == idx}
            key={idx}
            popular={popularIndex === idx}
            step={s}
            theme={theme}
            product={products[0] || null}
            onSelect={() => {
              console.log("Select: ", idx);
              setActivedIdx(idx);
            }}
          />
        ))
      ) : (
        <Box padding={"2000"}>
          <InlineGrid>
            <Text as="p" variant="headingMd">
              Select product to see preview
            </Text>
          </InlineGrid>
        </Box>
      )}

      {/* Total */}
      {/* <RenderFrame {...theme.total}>
        <div className="flex_row" style={{ alignContent: "space-between" }}>
          <RenderTextTheme as="p" {...theme.total} content={totalContent} />
          <div>
            <span className="old_price"> {total.price}</span>
            <RenderTextTheme
              as="p"
              {...theme.total}
              content={total.priceDiscount}
            />
          </div>
        </div>
      </RenderFrame> */}

      {/* Add to cart button */}
      <RenderBundleButton
        content={buttonContent}
        font={theme.button.font}
        frame={theme.button.frame}
      />
    </div>
  );
}

type VolumeBreakOfferProps = {
  active: boolean;
  popular: boolean;
  step: StepData;
  theme: VolumeDiscountTheme;
  product?: ProductInfo;
  onSelect?: () => void;
};

function VolumeBreakOffer({
  active,
  popular,
  step,
  theme,
  product,
  onSelect,
}: VolumeBreakOfferProps) {
  const { selected, unselected } = theme;

  const [variants, setVariants] = useState<Partial<ProductVariant>[]>(
    product ? initArray(step.require, product.variants[0]) : [],
  );

  const [variantOptions, setVariantOptions] = useState<SelectOption[]>(
    product?.variants.map((v) => ({
      label: v.title || "",
      value: v.id ?? "",
    })) ?? [],
  );

  const [totalPrice, setTotalPrice] = useState(
    variants.reduce(
      (prev, v) => prev + (v && v?.price ? Number.parseFloat(v.price) : 0),
      0,
    ),
  );

  const [totalDiscount, setTotalDiscount] = useState(
    step.type === "fix"
      ? totalPrice - step.value
      : totalPrice - (totalPrice * step.value) / 100.0,
  );

  useEffect(() => {
    var newVariants = product
      ? initArray(step.require, product.variants[0])
      : [];
    var newTotal = newVariants.reduce(
      (prev, v) => prev + (v && v?.price ? Number.parseFloat(v.price) : 0),
      0,
    );

    var newDiscount =
      step.type === "fix"
        ? newTotal - step.value
        : newTotal - (newTotal * step.value) / 100.0;

    setVariantOptions(
      product?.variants.map((v) => ({
        label: v.title || "",
        value: v.id ?? "",
      })) ?? [],
    );

    setVariants(newVariants);
    setTotalPrice(newTotal);
    setTotalDiscount(newDiscount);
  }, [product, step, active]);

  const onChangeVariant = (variantId: string, index: number) => {
    var target = product?.variants.find((v) => v.id === variantId);

    if (target) {
      var newVariants = [...variants];
      newVariants[index] = target;

      var newTotal = newVariants.reduce(
        (prev, v) => prev + (v && v?.price ? Number.parseFloat(v.price) : 0),
        0,
      );
      // console.log("New variants: ", newVars);
      var sumPrice = newVariants.reduce(
        (prev, current) =>
          prev + (Number.parseFloat(current.price ?? "0") || 0),
        0,
      );

      var newDiscount =
        step.type === "fix"
          ? newTotal - step.value
          : newTotal - (newTotal * step.value) / 100.0;

      setVariants(newVariants);
      setTotalPrice(sumPrice);
      setTotalDiscount(newDiscount);
    }
  };

  return (
    <div className="flex_row vd_ctn" onClick={onSelect}>
      {/* Label */}
      <RenderFrame
        className={active ? "vd_label_ctn active" : "vd_label_ctn"}
        {...(active ? theme.selected.frame : theme.unselected.frame)}
      >
        <RenderTextTheme
          as="p"
          content={step.label ?? ""}
          {...(active ? theme.selected.label : theme.unselected.label)}
        />
      </RenderFrame>

      {/* Bar */}
      <div
        className="remain flex_row"
        style={{
          backgroundColor: "#f4fbf9",
          flexWrap: "nowrap",
          border: `1px solid ${active ? selected.frame.borderColor : "#f4fbf9"}`,
          borderRadius: "6px",
        }}
      >
        <RenderFrame
          className=""
          // bgColor={active ? selected.frame.bgColor : unselected.frame.bgColor}
          bgColor="#f4fbf9"
          borderColor={
            active ? selected.frame.borderColor : unselected.frame.borderColor
          }
          padding="0.25rem 0.5rem"
          width={"100%"}
          borderWidth={"1px"}
          {...(!active
            ? {
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
              }
            : {})}
        >
          <div
            className="flex_row"
            style={{
              justifyContent: "start",
            }}
          >
            <p
              style={{
                fontSize: theme.price.size + "px",
                color: theme.price.color,
                fontWeight: theme.price.weight,
              }}
            >
              {totalDiscount}{" "}
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: "400",
                }}
              >{`/ ${step.require} pieces`}</span>
            </p>

            <div style={{ display: active ? "block" : "none" }}>
              <RenderFrame {...unselected.frame} padding={"0.1rem 0.25rem"}>
                <RenderTextTheme
                  as="p"
                  content={`${step.value} ${step.type == "fix" ? "" : "%"}`}
                  style={{
                    flexBasis: "fit-content",
                  }}
                  {...theme.unselected.label}
                />
              </RenderFrame>
            </div>

            {popular && (
              <div
                className="remain"
                style={{
                  opacity: "0.6",
                  textAlign: "right",
                }}
              >
                <RenderTextTheme
                  as="p"
                  content={"Most popular"}
                  {...theme.tagPopular}
                />
              </div>
            )}
          </div>
          <RenderTextTheme
            as="p"
            className="old_price"
            content={`${totalPrice}`}
            {...theme.comparePrice}
          />

          <div style={{ display: "block", maxWidth: "100%" }}>
            <div
              className="flex_row"
              style={{ gap: "0.1rem", justifyContent: "start" }}
            >
              {active &&
                (product?.variants.length ?? 0) > 1 &&
                variants.map((vari, idx) => (
                  <Select
                    key={idx}
                    label=""
                    value={vari.id}
                    options={variantOptions}
                    onChange={(variantId) => onChangeVariant(variantId, idx)}
                  />
                ))}
            </div>
          </div>
        </RenderFrame>
      </div>
    </div>
  );
}

function calcDiscount(priceStr?: string, curStep?: StepData): PriceTotal {
  if (!curStep) {
    return { price: 0, priceDiscount: 0 };
  }

  var price = curStep.require * (Number.parseFloat(priceStr || "0") || 0);
  return {
    price,
    priceDiscount:
      curStep.type === "fix"
        ? price - curStep.value
        : price - (price * curStep.value) / 100,
  };
}
