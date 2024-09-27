import { ProductInfo, SelectMultipleProducts } from "../Shopify/SelectProduct";
import {
  BlockStack,
  Box,
  InlineGrid,
  InlineStack,
  Tabs,
  TextField,
} from "@shopify/polaris";
import { useCallback, useState } from "react";
import { DVT } from "~/defs";
import {
  defaultVolumeDiscountTheme,
  VolumeDiscountPreview,
  VolumeDiscountThemeEditor,
} from "./VolumeThemeDiscount";
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
import { DiscountAutomaticApp } from "~/types/admin.types";
import { Field, useField } from "@shopify/react-form";
import { CardCollapse } from "~/components/Common/index";
import { TabProps } from "@shopify/polaris/build/ts/src/components/Tabs";
import { BsTrash } from "react-icons/bs";

type VolumeDiscountComponentProps = {
  discount?: SerializeFrom<DiscountAutomaticApp>;
  rawConfig?: string;
  onSubmit?: () => void;
};

export function VolumeDiscountComponent(props: VolumeDiscountComponentProps) {
  const title = useField<string>("Volume Discount Offer");
  const buttonContent = useField<string>("Add To Cart");
  // const totalContent = useField<string>("Total");
  const startDate = useField<DateTime>(new Date().toString());
  const endDate = useField<DateTime | null>(null);
  const combines = useField<CombinableDiscountTypes>({
    orderDiscounts: false,
    productDiscounts: false,
    shippingDiscounts: true,
  });

  const products = useField<ProductInfo[]>([]);
  const steps = useField<Array<StepData>>([
    { label: "OFF 10%", type: "percent", value: 10, require: 2 },
    { label: "OFF 15%", type: "percent", value: 15, require: 3 },
    { label: "OFF 20%", type: "percent", value: 20, require: 4 },
  ]);

  const [theme, setTheme] = useState(defaultVolumeDiscountTheme);
  const onChangeTheme = (k: string, v: any) => {
    setTheme({
      ...theme,
      [k]: v,
    });
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
    >
      <VolumeDiscountSetting
        title={title}
        button={buttonContent}
        products={products}
        steps={steps}
      />

      <VolumeStepConfigCard title="Quantity breaks" steps={steps} />

      <DiscountCommonEditor
        combines={combines}
        startDate={startDate}
        endDate={endDate}
      />

      <VolumeDiscountThemeEditor onChangeTheme={onChangeTheme} {...theme} />
      <Box minHeight="2rem" />
    </DiscountEditorPreviewLayout>
  );
}

type VolumeDiscountSettingProps = {
  title: Field<string>;
  button: Field<string>;
  products: Field<ProductInfo[]>;
  steps: Field<StepData[]>;
};

function VolumeDiscountSetting({
  title,
  button,
  products,
}: VolumeDiscountSettingProps) {
  return (
    <CardCollapse title="Volume information" collapse>
      <BlockStack gap={"400"}>
        <TextField label="Title" autoComplete="off" {...title} />

        <SelectMultipleProducts
          label="Target products"
          products={products.value}
          onChange={products.onChange}
          showDefault={true}
        />

        <InlineGrid columns={2} gap={"200"}>
          <TextField label="Button Text" autoComplete="off" {...button} />
        </InlineGrid>
      </BlockStack>
    </CardCollapse>
  );
}

type VDStepConfigComponentProps = {
  title?: string;
  steps: Field<Array<StepData>>;
};

function VolumeStepConfigCard({ title, steps }: VDStepConfigComponentProps) {
  const [tabSelected, setTabSelected] = useState(0);
  const [offerTabs, setOfferTabs] = useState<TabProps[]>(
    steps.value.map((v, idx) => ({
      id: `offer_${idx}`,
      content: `Offer ${idx}`,
    })),
  );

  const onAddStep = () => {
    var newArr = [...steps.value];
    if (steps.value.length) {
      const latest = steps.value[steps.value.length - 1];
      newArr.push({
        require: latest.require + 1,
        type: latest.type,
        value: latest.type == "percent" ? latest.value + 5 : latest.value,
        label: "Offer " + newArr.length + 1,
      });
    } else {
      newArr.push({
        require: 1,
        type: "percent",
        value: 5,
        label: "Offer " + newArr.length + 1,
      });
    }
    var newOfferTab = newArr.map((v, idx) => ({
      id: `offer_${idx}`,
      content: `Offer ${idx}`,
    }));

    steps.onChange(newArr);
    setOfferTabs(newOfferTab);
  };

  const onRemove = (idx: number) => {
    var newArr = [...steps.value];
    newArr.splice(idx, 1);

    steps.onChange(newArr);
  };

  const onStepChange = (newStep: StepData, idx: number) => {
    var newArr = [...steps.value];
    newArr[idx] = newStep;
    steps.onChange(newArr);
  };

  const handleTabChange = useCallback(
    (selectedTabIndex: number) => setTabSelected(selectedTabIndex),
    [],
  );

  return (
    <CardCollapse title={title ?? ""} collapse>
      <Tabs
        fitted
        tabs={offerTabs}
        selected={tabSelected}
        onSelect={handleTabChange}
        canCreateNewView
        onCreateNewView={async () => {
          onAddStep();
          return true;
        }}
      >
        <VDStep
          {...steps.value[tabSelected]}
          onChange={(v) => onStepChange(v, tabSelected)}
        />
      </Tabs>

      <Box minHeight="1.5rem"></Box>

      <InlineStack align="end">
        <BsTrash size={20} onClick={() => onRemove(tabSelected)}></BsTrash>
      </InlineStack>
    </CardCollapse>
  );
}

export type StepData = {
  type: DVT;
  value: number;
  require: number;
  label?: string;
};

interface VDStepProps extends StepData {
  onChange: (v: StepData) => void;
}

function VDStep(props: VDStepProps) {
  return (
    <BlockStack gap={"200"}>
      <InlineGrid columns={2} gap={"200"}>
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
          dv={props.value}
          dvt={props.type}
          onChangeType={(v) => props.onChange({ ...props, type: v })}
          onChangeValue={(v) => props.onChange({ ...props, value: v })}
        />
      </InlineGrid>

      <InlineStack aria-colcount={2}>
        <TextField
          label={"Offer label"}
          autoComplete="off"
          value={props.label ?? ""}
          onChange={(v) => props.onChange({ ...props, label: v })}
        />
      </InlineStack>
    </BlockStack>
  );
}
