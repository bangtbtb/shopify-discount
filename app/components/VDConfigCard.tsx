import {
  BlockStack,
  Box,
  Button,
  Card,
  Grid,
  InlineGrid,
  InlineStack,
  Layout,
  Select,
  Text,
  TextField,
} from "@shopify/polaris";
import { useField, Field } from "@shopify/react-form";
import { useEffect, useState } from "react";
import {
  CollectionInfo,
  SelectCollection,
  SelectCollectionProp,
} from "./SelectCollection";
import {
  ProductInfo,
  SelectMultipleProductProp,
  SelectMultipleProducts,
} from "./SelectProduct";
import { VDApplyType } from "~/defs";
import { StepComponent, StepData } from "./ConfigStep";
import { Removeable } from "./Removeable";

interface VBConfigCardProps {
  applyType: Field<VDApplyType>;
  collection: Field<CollectionInfo | null>;
  products: Field<Array<ProductInfo>>;
}

export default function VDConfigCard({
  applyType,
  collection,
  products,
}: VBConfigCardProps) {
  return (
    <Card>
      <Text as="h3" fontWeight="bold">
        Discount target
      </Text>

      <Layout.Section>
        <InlineStack aria-rowcount={2}>
          <Select
            label="Apply for"
            value={applyType.value}
            options={[
              { label: "Products", value: "products" },
              { label: "Collections", value: "collection" },
            ]}
            onChange={(v) => applyType.onChange(v as VDApplyType)}
          />
          <Box minWidth="16px" />

          {applyType.value === "products" ? (
            <SelectMultipleProducts
              label="Select target"
              products={products.value}
              onChange={products.onChange}
            />
          ) : (
            <SelectCollection label="Select target" {...collection} />
          )}
        </InlineStack>
      </Layout.Section>
    </Card>
  );
}

type VDStepConfigComponentProps = {
  steps: Field<Array<StepData>>;
};

export function VDStepConfigComponent({ steps }: VDStepConfigComponentProps) {
  const onAddStep = () => {
    var newArr = [...steps.value];
    if (steps.value.length) {
      const latest = steps.value[steps.value.length - 1];
      newArr.push({
        require: (Number.parseInt(latest.require) + 1).toString(),
        type: latest.type,
        value:
          latest.type == "percent"
            ? (Number.parseFloat(latest.value) + 5).toString()
            : latest.value,
      });
    } else {
      newArr.push({
        require: "1",
        type: "percent",
        value: "5",
      });
    }

    steps.onChange(newArr);
  };

  const onRemove = (idx: number) => {
    var newArr = [...steps.value];
    newArr.splice(idx, 1);

    steps.onChange(newArr);
  };

  return (
    <Card>
      <InlineStack align="space-between">
        <Text as={"h3"} fontWeight="bold">
          Discount volume condition
        </Text>
        <Button onClick={onAddStep}>Add step</Button>
      </InlineStack>
      <Box minHeight="16px"></Box>
      <Layout.Section>
        <InlineGrid columns={["oneHalf", "twoThirds"]}>
          <Text as="p">Require volume </Text>
          <Text as="p">Discount value</Text>
        </InlineGrid>
        <InlineGrid>
          {steps &&
            steps.value.map((v, idx) => (
              <Box key={idx} padding={"100"}>
                <Removeable index={idx} onRemove={onRemove}>
                  <StepComponent
                    key={idx}
                    require={v.require}
                    type={v.type}
                    value={v.value}
                    onChange={(v) => {
                      var newArr = [...steps.value];
                      newArr[idx] = v;
                      steps.onChange(newArr);
                    }}
                  />
                </Removeable>
              </Box>
            ))}
        </InlineGrid>
      </Layout.Section>
    </Card>
  );
}
