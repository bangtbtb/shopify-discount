import {
  Box,
  Button,
  Card,
  InlineGrid,
  InlineStack,
  Layout,
  Select,
  Text,
} from "@shopify/polaris";
import { Field } from "@shopify/react-form";
import { CollectionInfo, SelectCollections } from "../Shopify/SelectCollection";
import { ProductInfo, SelectMultipleProducts } from "../Shopify/SelectProduct";
import { PDApplyType } from "~/defs/discount";
import { StepComponent, StepData } from "./ConfigStep";
import { CardCollapse } from "~/components/Common";
import { useState } from "react";

interface VBConfigCardProps {
  colls: Field<Array<CollectionInfo>>;
  products: Field<Array<ProductInfo>>;
}

export function PDConfigCard({ colls, products }: VBConfigCardProps) {
  const [useProduct, setUseProduct] = useState(products.value.length == 0);
  return (
    <Card>
      <Text as="h3" fontWeight="bold">
        Discount target
      </Text>

      <Layout.Section>
        <InlineStack aria-rowcount={2}>
          <Select
            label="Apply for"
            value={useProduct ? "p" : "c"}
            options={[
              { label: "Products", value: "p" },
              { label: "Collections", value: "c" },
            ]}
            onChange={(v) => {
              if (v === "products") {
                colls.onChange([]);
                setUseProduct(true);
              } else {
                products.onChange([]);
                setUseProduct(false);
              }
            }}
          />
          <Box minWidth="16px" />

          {useProduct ? (
            <SelectMultipleProducts
              label="Select target"
              products={products.value}
              onChange={products.onChange}
            />
          ) : (
            <SelectCollections
              label="Select collection target"
              colls={colls.value}
              onChange={colls.onChange}
            />
          )}
        </InlineStack>
      </Layout.Section>
    </Card>
  );
}

type PDStepConfigComponentProps = {
  title?: string;
  steps: Field<Array<StepData>>;
};

export function PDStepConfigComponent({
  title,
  steps,
}: PDStepConfigComponentProps) {
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

    steps.onChange(newArr);
  };

  const onRemove = (idx: number) => {
    var newArr = [...steps.value];
    newArr.splice(idx, 1);

    steps.onChange(newArr);
  };

  return (
    <CardCollapse title={title ?? ""}>
      <InlineStack align="space-between">
        <Box></Box>
        <Button onClick={onAddStep}>Add step</Button>
      </InlineStack>

      <Box minHeight="0.5rem"></Box>
      <InlineGrid columns={["oneHalf", "twoThirds"]}>
        <Text as="p">Require volume </Text>
        <Text as="p">Discount value</Text>
      </InlineGrid>

      <InlineGrid>
        {steps &&
          steps.value.map((v, idx) => (
            <Box key={idx}>
              {/* <Removeable index={idx} onRemove={onRemove}>
       
              </Removeable> */}

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
            </Box>
          ))}
      </InlineGrid>
    </CardCollapse>
  );
}
