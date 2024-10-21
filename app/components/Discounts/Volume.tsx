import { ProductInfo, SelectMultipleProducts } from "../Shopify/SelectProduct";
import {
  BlockStack,
  Box,
  Button,
  InlineGrid,
  InlineStack,
  Tabs,
  Text,
  TextField,
} from "@shopify/polaris";
import { useCallback, useState } from "react";
import { DiscountValue, DVT, PDConfig, RewardStep } from "~/defs/discount";
import {
  defaultVolumeTheme,
  VolumeDiscountPreview,
  VolumeThemeEditor,
} from "./VolumeTheme";
import {
  DiscountCommonEditor,
  DiscountEditorPreviewLayout,
  DiscountTypeSelect,
} from "./DiscountCommon";
import { SerializeFrom } from "@remix-run/node";
import {
  CombinableDiscountTypes,
  DateTime,
} from "@shopify/discount-app-components";
import {
  DiscountAutomaticAppInput,
  DiscountCombinesWith,
} from "~/types/admin.types";
import { Field, useField } from "@shopify/react-form";
import { CardCollapse } from "~/components/Common/index";
import { BsPlus, BsTrash } from "react-icons/bs";
import { EasyTab } from "../Common/Tab";
import { Discount } from "@prisma/client";
import { GUIVolume, VolumeThemeContent } from "~/defs/theme";
import { CollectionInfo, SelectCollections } from "../Shopify/SelectCollection";
import { checkFormString } from "../Common/FormChecker";

type VolumeDiscountComponentProps = {
  isCreate?: boolean;
  disableSetting?: boolean;
  discount?: SerializeFrom<Discount> | null;
  config?: SerializeFrom<PDConfig> | null;
  combinesWith?: DiscountCombinesWith | null;
  gui?: GUIVolume;
  onSubmit?: (
    discount: DiscountAutomaticAppInput,
    config: any,
    theme: string,
    themeContent: string,
  ) => void;
};

export function VolumeDiscountDetail({
  isCreate,
  disableSetting,
  discount,
  combinesWith,
  gui,
  config,
  onSubmit,
}: VolumeDiscountComponentProps) {
  const title = useField<string>(discount?.title || "Volume Discount Offer");
  const buttonContent = useField<string>(gui?.content?.button || "Add To Cart");
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

  const products = useField<ProductInfo[]>([]);
  const colls = useField<CollectionInfo[]>([]);

  const steps = useField<RewardStep[]>(
    config?.volume?.steps || [
      {
        label: "OFF 10%",
        discount: { type: "percent", value: 10 },
        require: 2,
      },
      {
        label: "OFF 15%",
        discount: { type: "percent", value: 15 },
        require: 3,
      },
      {
        label: "OFF 20%",
        discount: { type: "percent", value: 20 },
        require: 4,
      },
    ],
  );

  const [theme, setTheme] = useState(gui?.theme || defaultVolumeTheme);
  const onChangeTheme = (k: string, v: any) => {
    setTheme({
      ...theme,
      [k]: v,
    });
  };

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

    var formConfig: PDConfig = {
      label: "",
      applyType: "volume",
      volume: {
        productIds: products.value.map((v) => v.id),
        collIds: colls.value.map((v) => v.id),
        steps: steps.value,
      },
    };

    // if (dVal.value.type === "fix") {
    //   if (!checkFormNumber("Discount value is required", dVal.value.value)) {
    //     return;
    //   }
    // } else {
    //   if (
    //     !checkFormNumber(
    //       "Discount value should be is range [1-100]",
    //       dVal.value.value,
    //       1,
    //       100,
    //     )
    //   ) {
    //     return;
    //   }
    // }

    // if (
    //   !checkFormArray(
    //     "Please select product list",
    //     formConfig.bundle?.productIds,
    //   )
    // ) {
    //   console.log("Check product failed");
    //   return;
    // }

    var themeConfig = JSON.stringify(theme);
    var themeContent: VolumeThemeContent = {
      button: buttonContent.value,
    };

    if (!checkFormString("Button Text is required", themeContent.button)) {
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
        <VolumeDiscountPreview
          titleContent={title.value}
          buttonContent={buttonContent.value}
          popularIndex={0}
          products={products.value}
          steps={steps.value}
          theme={theme}
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
      <VolumeDiscountSetting
        title={title}
        button={buttonContent}
        products={products}
        colls={colls}
        steps={steps}
      />

      <VolumeStepConfigCard title="Quantity breaks" steps={steps} />

      <DiscountCommonEditor
        combines={combines}
        startDate={startDate}
        endDate={endDate}
      />

      <VolumeThemeEditor onChangeTheme={onChangeTheme} {...theme} />
    </DiscountEditorPreviewLayout>
  );
}

type VolumeDiscountSettingProps = {
  title: Field<string>;
  button: Field<string>;
  products: Field<ProductInfo[]>;
  colls: Field<CollectionInfo[]>;
  steps: Field<RewardStep[]>;
};

function VolumeDiscountSetting({
  title,
  button,
  products,
  colls,
}: VolumeDiscountSettingProps) {
  const [useProducts, setUseProducts] = useState(colls.value.length == 0);
  return (
    <CardCollapse title="Volume information" collapse>
      <BlockStack gap={"400"}>
        <TextField label="Title" autoComplete="off" {...title} />

        {useProducts ? (
          <SelectMultipleProducts
            label="Target products"
            products={products.value}
            onChange={products.onChange}
            showDefault={true}
          />
        ) : (
          <SelectCollections
            label="Target products"
            colls={colls.value}
            onChange={colls.onChange}
          />
        )}

        <InlineGrid columns={2} gap={"200"}>
          <TextField label="Button Text" autoComplete="off" {...button} />
        </InlineGrid>
      </BlockStack>
    </CardCollapse>
  );
}

type VDStepConfigComponentProps = {
  title?: string;
  steps: Field<Array<RewardStep>>;
};

function VolumeStepConfigCard({ title, steps }: VDStepConfigComponentProps) {
  const [tabSelected, setTabSelected] = useState(0);

  const [offerTabs, setOfferTabs] = useState<string[]>(
    steps.value.map((v, idx) => `Offer ${idx}`),
  );

  const onAddStep = () => {
    if (steps.value.length >= 5) {
      shopify.toast.show("You should create 5 offer is max", {
        duration: 5000,
        isError: true,
      });
      return;
    }

    var newArr = [...steps.value];
    if (steps.value.length) {
      const latest = steps.value[steps.value.length - 1];
      newArr.push({
        label: `Offer ${newArr.length + 1}`,
        require: latest.require + 1,
        discount: {
          type: latest.discount.type,
          value:
            latest.discount.type == "percent"
              ? latest.discount.value + 5
              : latest.discount.value,
        },
      });
    } else {
      newArr.push({
        require: 1,
        discount: {
          type: "percent",
          value: 5,
        },
        label: `Offer ${newArr.length + 1}`,
      });
    }
    var newOfferTab = newArr.map((v, idx) => `Offer ${idx}`);

    steps.onChange(newArr);
    setOfferTabs(newOfferTab);
  };

  const onRemove = (idx: number) => {
    if (steps.value.length == 2) {
      shopify.toast.show("You should create 5 offer is min", {
        duration: 5000,
        isError: true,
      });
      return;
    }

    var newArr = [...steps.value];
    newArr.splice(idx, 1);

    var newOfferTab = newArr.map((v, idx) => `Offer ${idx}`);

    steps.onChange(newArr);
    if (tabSelected) {
      setTabSelected(tabSelected - 1);
    }
    setOfferTabs(newOfferTab);
  };

  const onStepChange = (newStep: RewardStep, idx: number) => {
    var newArr = [...steps.value];
    newArr[idx] = newStep;
    steps.onChange(newArr);
  };

  const handleTabChange = useCallback(
    (selectedTabIndex: number) => setTabSelected(selectedTabIndex),
    [],
  );

  return (
    <CardCollapse
      collapse
      title={
        <BlockStack>
          <Text as="h3" variant="headingMd">
            Card
          </Text>
        </BlockStack>
      }
      actions={[
        //
        <BsPlus
          key={`action-1`}
          size={20}
          onClick={onAddStep}
          aria-label="Add offer"
        />,
      ]}
    >
      <EasyTab
        id="offer-volume"
        active={tabSelected}
        onActive={setTabSelected}
        tabs={offerTabs}
      >
        <VDStep
          {...steps.value[tabSelected]}
          onChange={(v) => onStepChange(v, tabSelected)}
        />
      </EasyTab>

      <InlineStack align="end">
        <BsTrash size={20} onClick={() => onRemove(tabSelected)}></BsTrash>
      </InlineStack>
    </CardCollapse>
  );
}

type VDStepProps = RewardStep & {
  onChange: (v: RewardStep) => void;
};

function VDStep(props: VDStepProps) {
  return (
    <BlockStack gap={"200"}>
      <InlineGrid columns={1} gap={"200"}>
        <TextField
          label={"Offer label"}
          autoComplete="off"
          value={props.label ?? ""}
          onChange={(v) => props.onChange({ ...props, label: v })}
        />
        <TextField
          label="Quantity"
          // type="number"
          autoComplete="off"
          value={props.require.toString()}
          onChange={(v) =>
            props.onChange({ ...props, require: Number.parseInt(v) || 0 })
          }
          placeholder="Require"
        />

        <DiscountTypeSelect
          label="Discount value"
          dv={props.discount.value}
          dvt={props.discount.type}
          onChangeType={(v) =>
            props.onChange({
              ...props,
              discount: { ...props.discount, type: v },
            })
          }
          onChangeValue={(v) =>
            props.onChange({
              ...props,
              discount: { ...props.discount, value: v },
            })
          }
        />
      </InlineGrid>
    </BlockStack>
  );
}
