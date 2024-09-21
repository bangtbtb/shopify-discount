import { Field, useField } from "@shopify/react-form";
import {
  createFontConfigField,
  createFrameConfigField,
  FontConfigField,
  FrameConfigField,
} from "~/components/Discounts/ThemeField";
import {
  ProductInfo,
  SelectedProduct,
  SelectMultipleProducts,
} from "../Shopify/SelectProduct";
import { BlockStack, Box, Card, Grid, TextField } from "@shopify/polaris";
import TextFieldSelect from "~/components/Shopify/TextFieldSelect";
import { useRef, useState } from "react";
import { DVT, VDApplyType } from "~/defs";
import {
  CombinableDiscountTypes,
  DateTime,
} from "@shopify/discount-app-components";
import { StepData } from "./ConfigStep";
import { CollectionInfo } from "../Shopify/SelectCollection";
import { DiscountAutomaticApp } from "~/types/admin.types";
import { SerializeFrom } from "@remix-run/node";
import { VDConfigExt } from "~/models/vd_model";
import { randomIndex } from "~/models/utils";

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

export type VolumeDiscountTheme = {
  title: FontConfigField;
  offerTitle: FontConfigField;
  discountLabel: FontConfigField;
  price: FontConfigField;
  comparePrice: FontConfigField;
  tagMostPopular: FontConfigField;
  total: FontConfigField;
  selected: FrameConfigField;
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
                require: v.require.toString(),
                type: v.value.type,
                value: v.value.value.toString(),
              }))
            : [
                { type: "percent", value: "5", require: "2" },
                { type: "percent", value: "10", require: "3" },
                { type: "percent", value: "20", require: "4" },
              ],
        ),
        products: useField(config?.products ?? []),
        colls: useField(config?.colls ?? []),
      }
    : {
        title: useField("Volume discount "),
        startDate: useField<Date>(new Date()),
        endDate: useField(null),
        combines: useField<CombinableDiscountTypes>({
          orderDiscounts: false,
          productDiscounts: false,
          shippingDiscounts: true,
        }),
        applyType: useField<VDApplyType>("products"),
        steps: useField<Array<StepData>>([
          { type: "percent", value: "5", require: "2" },
          { type: "percent", value: "10", require: "3" },
          { type: "percent", value: "20", require: "4" },
        ]),
        products: useField([]),
        colls: useField([]),
      };
  return data;
}

export function createVolumeDiscountTheme(): VolumeDiscountTheme {
  return {
    title: createFontConfigField({
      color: "#4289FF",
      size: 21,
      weight: "700",
    }),
    offerTitle: createFontConfigField({
      color: "#000000",
      size: 14,
      weight: "500",
    }),
    discountLabel: createFontConfigField({
      color: "#ffffff",
      size: 15,
      weight: "500",
    }),
    price: createFontConfigField({
      color: "#000000",
      size: 14,
      weight: "600",
    }),
    comparePrice: createFontConfigField({
      color: "#9d9d9d",
      size: 11,
      weight: "500",
    }),
    tagMostPopular: createFontConfigField({
      color: "#4289FF",
      size: 14,
      weight: "600",
    }),
    total: createFontConfigField({
      color: "#1B1B1B",
      size: 14,
      weight: "500",
    }),
    selected: createFrameConfigField({
      bgColor: "#F9FAFF",
      borderColor: "#4289FF",
    }),
    unselectedBar: useField("#ffffff"),
    unselectedBg: useField("#4289ff"),
  };
}

type VolumeDiscountPreviewProps = {};

export function VolumeDiscountPreview(props: VolumeDiscountPreviewProps) {
  return <div></div>;
}
