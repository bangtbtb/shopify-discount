import {
  Box,
  BlockStack,
  TextField,
  Tooltip,
  InlineGrid,
  Button,
  InlineStack,
  Text,
  ButtonGroup,
} from "@shopify/polaris";
import { DiscountValue, DStatus, ODConfig } from "~/defs/discount";
import {
  DiscountAutomaticAppInput,
  DiscountCombinesWith,
} from "~/types/admin.types";
import {
  BundleThemeEditor,
  BundleThemePreview,
  defaultBundleTheme,
  ProductInfoBundle,
} from "./BundleTheme";
import { useCallback, useEffect, useState } from "react";
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
import { CardCollapse, Heading2 } from "../Common";
import { Discount } from "@prisma/client";
import { bridgeLoadProduct } from "../Shopify/shopify_func";

// export type BundleComponentErrors = {};

type BundleDetailProps = {
  isCreate?: boolean;
  disableSetting?: boolean;
  discount?: SerializeFrom<Discount> | null;
  config?: SerializeFrom<ODConfig> | null;
  combinesWith?: DiscountCombinesWith | null;
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
  combinesWith,
  gui,
  config,
  onSubmit,
}: BundleDetailProps) {
  const title = useField<string>(discount?.title || "Bundle product offer");

  const status = useField<DStatus>("active");
  const startDate = useField<DateTime>(
    discount?.startAt || new Date().toString(),
  );
  const endDate = useField<DateTime | null>(discount?.endAt || null);
  const combines = useField<CombinableDiscountTypes>(
    combinesWith || {
      orderDiscounts: false,
      productDiscounts: false,
      shippingDiscounts: true,
    },
  );

  const products = useField<ProductInfoBundle[]>([]);
  const dVal = useField<DiscountValue>(
    config?.bundle?.value || {
      type: "percent",
      value: 10,
    },
  ); // Discount value

  // const buttonContent = useField<string>(gui?.content?.button || "Add To Cart");
  // const totalContent = useField<string>(gui?.content?.total || "Total");
  const showOnPage = useField<boolean>(gui?.content?.showOnPage || true);

  const [theme, setTheme] = useState(gui?.theme || defaultBundleTheme);
  const onChangeTheme = (k: string, v: any) => {
    setTheme({
      ...theme,
      [k]: v,
    });
  };

  useEffect(() => {
    console.log("Load bundle config: ", config);
    // if (config?.bundle?.productIds && config?.bundle?.numRequires) {
    if (
      discount?.productIds &&
      config?.bundle?.productIds &&
      config?.bundle?.numRequires
    ) {
      const ids = config?.bundle?.productIds;
      const requireVols = config?.bundle?.numRequires;

      bridgeLoadProduct(discount?.productIds).then((pInfos) => {
        let mRequires: { [key: string]: number } = {};
        ids.forEach((p, idx) => {
          mRequires[p] = requireVols[idx] || 0;
        });

        let bundles = pInfos.map(
          (p) =>
            ({
              ...p,
              requireVol: mRequires[p.id] || 1,
            }) as ProductInfoBundle,
        );

        products.onChange(bundles);
      });
    }
  }, []);

  const onClickPrimary = () => {
    var discount: DiscountAutomaticAppInput = {
      title: title.value,
      combinesWith: {
        orderDiscounts: false,
        productDiscounts: false,
        shippingDiscounts: true,
      },
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
    if (
      !checkFormString(
        "Button Text is required",
        theme.button.font.content.toString(),
      )
    ) {
      return;
    }

    if (
      !checkFormString(
        "Summary text is required",
        theme.summary.label.content?.toString(),
      )
    ) {
      return;
    }

    var themeContent: BundleContent = {
      shortDesc: "",
      showOnPage: showOnPage.value,
    };

    console.log("Check pass all");
    if (onSubmit) {
      onSubmit(discount, formConfig, themeConfig, JSON.stringify(themeContent));
    }
  };

  return (
    <DiscountEditorPreviewLayout
      preview={
        <BundleThemePreview
          content={{
            shortDesc: "",
            showOnPage: showOnPage.value,
          }}
          discount={dVal.value}
          theme={theme}
          products={products.value}
          endAt={endDate.value}
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

      {/* <Heading2 title="GUI Content">
        <BundleThemeContentSetting
          buttonContent={buttonContent}
          totalContent={totalContent}
          showOnPage={showOnPage}
        />
      </Heading2> */}

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
        <TextField
          label="Title"
          autoComplete="off"
          helpText="This title is only used on the admin page."
          {...title}
        />
        {/* <InlineStack gap={"200"}>

          <SelectDiscountStatus
            label="Status"
            value={status.value}
            onChange={status.onChange}
          />
        </InlineStack> */}

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

  showOnPage: Field<boolean>;
};

function BundleThemeContentSetting({
  buttonContent,
  totalContent,
  showOnPage,
}: BundleThemeContentSettingProps) {
  return (
    <CardCollapse title="Widget config" collapse>
      <BlockStack gap={"400"}>
        <InlineGrid columns={2} gap={"200"}>
          <TextField
            label="Button Text"
            autoComplete="off"
            {...buttonContent}
          />
          <TextField label="Total text" autoComplete="off" {...totalContent} />
        </InlineGrid>

        <InlineGrid gap={"200"}>
          <Text as="h4" variant="bodyMd">
            Select Display Position
          </Text>

          <Tooltip
            content="Select the position where your bundle offer will be shown to
            customers. You can choose between displaying it directly on a page
            or as a pop-up."
          >
            <PositionSelector
              showOnPage={showOnPage.value}
              onChange={showOnPage.onChange}
            />
          </Tooltip>
          {/* <Text as="p" variant="bodySm">
            Select the position where your bundle offer will be shown to
            customers. You can choose between displaying it directly on a page
            or as a pop-up.
          </Text> */}
        </InlineGrid>
      </BlockStack>
    </CardCollapse>
  );
}

type PositionSelectorProps = {
  showOnPage: boolean;
  onChange: (v: boolean) => void;
};

function PositionSelector(props: PositionSelectorProps) {
  const handleShowOnPage = useCallback(() => {
    if (props.showOnPage) return;
    props.onChange(true);
  }, [props.showOnPage]);

  const handlePopup = useCallback(() => {
    if (!props.showOnPage) return;
    props.onChange(false);
  }, [props.showOnPage]);

  return (
    <ButtonGroup variant="segmented">
      <Button pressed={props.showOnPage} onClick={handleShowOnPage}>
        Show on page
      </Button>

      <Button pressed={!props.showOnPage} onClick={handlePopup}>
        Pop-up
      </Button>
    </ButtonGroup>
  );
}
