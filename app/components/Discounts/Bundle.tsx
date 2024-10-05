import {
  Box,
  BlockStack,
  TextField,
  Tooltip,
  InlineGrid,
  Button,
  InlineStack,
} from "@shopify/polaris";
import { DiscountValue, DStatus, ODConfig } from "~/defs/discount";
import { DiscountAutomaticAppInput } from "~/types/admin.types";
import {
  BundleThemeEditor,
  BundleThemePreview,
  defaultBundleTheme,
  ProductInfoBundle,
} from "./BundleTheme";
import { useState } from "react";
import {
  SelectedProduct,
  SelectMultipleProducts,
} from "../Shopify/SelectProduct";
import {
  DiscountCommonEditor,
  DiscountEditorPreviewLayout,
  DiscountTypeSelect,
  SelectDiscountStatus,
} from "./DiscountCommon";
import {
  CombinableDiscountTypes,
  DateTime,
} from "@shopify/discount-app-components";
import { Field, useField } from "@shopify/react-form";
import {
  checkFormArray,
  checkFormNumber,
  checkFormString,
} from "~/components/Common/FormChecker";
import { SerializeFrom } from "@remix-run/node";
import { BundleContent, GUIBundle } from "~/defs/theme";
import { ODConfigExt } from "~/models/od_models";
import { CardCollapse } from "../Common";

// export type BundleComponentErrors = {};

type BundleDetailProps = {
  isCreate?: boolean;
  disableSetting?: boolean;
  discount?: SerializeFrom<DiscountAutomaticAppInput> | null;
  config?: SerializeFrom<ODConfigExt>;
  gui?: GUIBundle;
  onSubmit?: (
    discount: DiscountAutomaticAppInput,
    config: any,
    theme: string,
    themeContent: string,
  ) => void;

  // errors?: BundleComponentErrors;
};

export function BundleDetail({
  isCreate,
  disableSetting,
  discount,
  gui,
  config,
  onSubmit,
}: BundleDetailProps) {
  const title = useField<string>(discount?.title || "Bund product offer");
  const status = useField<DStatus>("active");
  const buttonContent = useField<string>(gui?.content?.button || "Add To Cart");
  const totalContent = useField<string>(gui?.content?.total || "Total");
  const startDate = useField<DateTime>(
    discount?.startsAt || new Date().toString(),
  );
  const endDate = useField<DateTime | null>(discount?.endsAt || null);
  const combines = useField<CombinableDiscountTypes>({
    orderDiscounts: discount?.combinesWith?.orderDiscounts || false,
    productDiscounts: discount?.combinesWith?.productDiscounts || false,
    shippingDiscounts: discount?.combinesWith?.shippingDiscounts || true,
  });

  const products = useField<ProductInfoBundle[]>(config?.products || []);
  const dVal = useField<DiscountValue>({
    type: "percent",
    value: 10,
  }); // Discount value

  const [theme, setTheme] = useState(gui?.theme || defaultBundleTheme);
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
      bundle: {
        productIds: products.value.map((v) => v.id),
        value: {
          type: dVal.value.type,
          value: dVal.value.value,
        },
        numRequires: products.value.map((v) => v.requireVol),
        allOrder: false,
      },
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
    var themeContent: BundleContent = {
      button: buttonContent.value,
      total: totalContent.value,
      shortDesc: "",
    };

    if (!checkFormString("Button Text is required", themeContent.button)) {
      return;
    }

    if (!checkFormString("Total text is required", themeContent.total)) {
      return;
    }

    console.log("Check pass all");
    if (onSubmit) {
      onSubmit(discount, formConfig, themeConfig, JSON.stringify(themeContent));
    }
  };

  return (
    <DiscountEditorPreviewLayout
      preview={
        <BundleThemePreview
          titleContent={title.value}
          content={{
            button: buttonContent.value,
            total: totalContent.value,
            shortDesc: "",
          }}
          discount={dVal.value}
          theme={theme}
          products={products.value}
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
      {!disableSetting && (
        <BundleSettingCard
          title={title}
          status={status}
          discount={dVal}
          products={products}
        />
      )}

      <BundleThemeContentSetting
        buttonContent={buttonContent}
        totalContent={totalContent}
      />

      {!disableSetting && (
        <DiscountCommonEditor
          combines={combines}
          startDate={startDate}
          endDate={endDate}
          disableShipping
        />
      )}

      <BundleThemeEditor onChangeTheme={onChangeTheme} {...theme} />
    </DiscountEditorPreviewLayout>
  );
}

type BundleSettingCardProps = {
  title: Field<string>;
  status: Field<DStatus>;
  discount: Field<DiscountValue>;
  products: Field<ProductInfoBundle[]>;
};

function BundleSettingCard({
  title,
  status,
  discount,
  products,
}: BundleSettingCardProps) {
  return (
    <CardCollapse title="Bundle information" collapse>
      <BlockStack gap={"400"}>
        <InlineStack gap={"200"}>
          <TextField label="Title" autoComplete="off" {...title} />
          <SelectDiscountStatus
            label="Status"
            value={status.value}
            onChange={status.onChange}
          />
        </InlineStack>

        <DiscountTypeSelect
          label="Discount value"
          dv={discount.value.value}
          dvt={discount.value.type}
          onChangeType={(v) =>
            discount.onChange({ ...discount.value, type: v })
          }
          onChangeValue={(v) =>
            discount.onChange({ ...discount.value, value: v })
          }
        />

        <SelectMultipleProducts
          label="Select products you want to sell together"
          products={products.value}
          onChange={(newPs) =>
            products.onChange(newPs.map((p) => ({ ...p, requireVol: 1 })))
          }
          showDefault={false}
        >
          <BlockStack gap={"300"} key={"product-list"}>
            {products.value.map((p, idx) => (
              <SelectedProduct
                key={idx}
                product={p}
                onRemove={() => {
                  var newProducts = [...products.value];
                  newProducts.splice(idx, 1);
                  products.onChange(newProducts);
                }}
                actions={[
                  <Box maxWidth="3rem" key={`child-${idx}`}>
                    <Tooltip content="Require volume">
                      <TextField
                        label=""
                        autoComplete="off"
                        size="slim"
                        // type="number"
                        max={10}
                        min={0}
                        value={p.requireVol.toString()}
                        onChange={(v) => {
                          var newP = {
                            ...p,
                            requireVol: Number.parseInt(v) || 0,
                          };
                          var newProducts = [...products.value];
                          newProducts[idx] = newP;
                          products.onChange(newProducts);
                        }}
                      />
                    </Tooltip>
                  </Box>,
                ]}
              />
            ))}
          </BlockStack>
        </SelectMultipleProducts>
      </BlockStack>
    </CardCollapse>
  );
}

type BundleThemeContentSettingProps = {
  buttonContent: Field<string>;
  totalContent: Field<string>;
};

function BundleThemeContentSetting({
  buttonContent,
  totalContent,
}: BundleThemeContentSettingProps) {
  return (
    <CardCollapse title="Widget content" collapse>
      <BlockStack gap={"400"}>
        <InlineGrid columns={2} gap={"200"}>
          <TextField
            label="Button Text"
            autoComplete="off"
            {...buttonContent}
          />
          <TextField label="Total text" autoComplete="off" {...totalContent} />
        </InlineGrid>
      </BlockStack>
    </CardCollapse>
  );
}
