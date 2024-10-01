import { SerializeFrom } from "@remix-run/node";
import {
  DiscountCommonEditor,
  DiscountEditorPreviewLayout,
} from "./DiscountCommon";
import { DiscountAutomaticAppInput } from "~/types/admin.types";
import { ODConfigExt } from "~/models/od_models";
import { Button } from "@shopify/polaris";
import {
  AttachedProductThemeEditor,
  AttachedProductThemePreview,
  defaultAttacedBundleTheme,
} from "./AttachedProductTheme";
import { useField } from "@shopify/react-form";
import {
  CombinableDiscountTypes,
  DateTime,
} from "@shopify/discount-app-components";
import { checkFormArray, checkFormNumber, checkFormString } from "../Common";
import { DiscountValue, ODConfig } from "~/defs/discount";
import { ProductInfo } from "../Shopify/SelectProduct";
import { useState } from "react";

type AttachedProductDetailProps = {
  isCreate?: boolean;
  disableSetting?: boolean;
  discount?: SerializeFrom<DiscountAutomaticAppInput>;
  config?: SerializeFrom<ODConfigExt>;
  onSubmit?: (
    discount: DiscountAutomaticAppInput,
    config: any,
    theme: string,
    themeContent: string,
  ) => void;

  // errors?: BundleComponentErrors;
};

export function AttachedProductDetail({
  isCreate,
  disableSetting,
  discount,
  config,
  onSubmit,
}: AttachedProductDetailProps) {
  const title = useField<string>(discount?.title || "Bund product offer");
  const startDate = useField<DateTime>(
    discount?.startsAt || new Date().toString(),
  );
  const endDate = useField<DateTime | null>(discount?.endsAt || null);
  const combines = useField<CombinableDiscountTypes>({
    orderDiscounts: discount?.combinesWith?.orderDiscounts || false,
    productDiscounts: discount?.combinesWith?.productDiscounts || false,
    shippingDiscounts: discount?.combinesWith?.shippingDiscounts || true,
  });

  const products = useField<ProductInfo[]>(config?.products || []);
  const dVal = useField<DiscountValue>({
    type: "percent",
    value: 10,
  }); // Discount value

  const [theme, setTheme] = useState(defaultAttacedBundleTheme);
  const onChangeTheme = (k: string, v: any) => {
    setTheme({
      ...theme,
      [k]: v,
    });
  };

  const onClickPrimary = () => {
    var discount: DiscountAutomaticAppInput = {
      title: title.value,
      combinesWith: combines.value,
      startsAt: startDate.value,
      endsAt: endDate.value,
    };

    if (!checkFormString("Title is required", discount.title)) {
      return;
    }

    var formConfig: ODConfig = {
      label: "",
      applyType: "bundle",
      // bundle: {
      //   productIds: products.value.map((v) => v.id),
      //   value: {
      //     type: dVal.value.type,
      //     value: dVal.value.value,
      //   },
      //   numRequires: products.value.map((v) => v.requireVol),
      //   allOrder: false,
      // },
    };

    if (dVal.value.type === "fix") {
      if (!checkFormNumber("Discount value is required", dVal.value.value)) {
        return;
      }
    } else {
      if (
        !checkFormNumber(
          "Discount value should be is range [1-100]",
          dVal.value.value,
          1,
          100,
        )
      ) {
        return;
      }
    }

    if (
      !checkFormArray(
        "Please select product list",
        formConfig.bundle?.productIds,
      )
    ) {
      console.log("Check product failed");
      return;
    }

    var themeConfig = JSON.stringify(theme);
    // var themeContent: BundleContent = {
    //   button: buttonContent.value,
    //   total: totalContent.value,
    // };

    // if (!checkFormString("Button Text is required", themeContent.button)) {
    //   return;
    // }

    // if (!checkFormString("Total text is required", themeContent.total)) {
    //   return;
    // }

    console.log("Check pass all");

    // if (onSubmit) {
    //   onSubmit(discount, formConfig, themeConfig, JSON.stringify(themeContent));
    // }
  };

  return (
    <DiscountEditorPreviewLayout
      preview={
        <AttachedProductThemePreview
        // titleContent={title.value}
        // content={{
        //   button: buttonContent.value,
        //   total: totalContent.value,
        // }}
        // discount={dVal.value}
        // theme={theme}
        // products={products.value}
        />
      }
      actions={[
        <Button key={"btn-cancel"} onClick={() => {}}>
          Cancel
        </Button>,
        <Button key={"btn-primary"} variant="primary" onClick={onClickPrimary}>
          {isCreate ? "Create" : "Update"}
        </Button>,
      ]}
    >
      {/* {!disableSetting && (
        <BundleSettingCard
          title={title}
          buttonContent={buttonContent}
          totalContent={totalContent}
          discount={dVal}
          products={products}
        />
      )} */}

      {!disableSetting && (
        <DiscountCommonEditor
          combines={combines}
          startDate={startDate}
          endDate={endDate}
          disableShipping
        />
      )}

      <AttachedProductThemeEditor
      //  onChangeTheme={onChangeTheme} {...theme}
      />
    </DiscountEditorPreviewLayout>
  );
}
