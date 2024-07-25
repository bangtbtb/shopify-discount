import {
  BlockStack,
  Box,
  Card,
  Grid,
  InlineGrid,
  InlineStack,
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

interface VBConfigCardProps {
  label?: string;
  minQuantity: Field<string>;
  maxQuantity: Field<string>;
  percent: Field<string>;
  applyType: Field<VDApplyType>;
  collection: Field<CollectionInfo | null>;
  products: Field<Array<ProductInfo>>;
}

export default function VDConfigCard({
  label,
  minQuantity,
  maxQuantity,
  percent,
  applyType,
  collection,
  products,
}: VBConfigCardProps) {
  const [delta, setDelta] = useState<Array<string>>([]);

  useEffect(() => {
    var min = parseInt(minQuantity.value);
    var max = parseInt(maxQuantity.value);
    var percentVal = parseFloat(percent.value);

    if (!percentVal) {
      return;
    }

    var newDelta = [];
    if (min) {
      newDelta.push(`Buy ${min} products, sell off ${percentVal}%`);
    }
    if (max) {
      newDelta.push(
        `Buy ${max} products, sell off ${percentVal * (max - min + 1)}%`,
      );
    }
    setDelta(newDelta);
  }, [minQuantity.value, maxQuantity.value]);

  return (
    <Card>
      <BlockStack gap={"300"}>
        <Text variant="headingMd" as="h2">
          {label ?? "Discount config"}
        </Text>

        <InlineGrid columns={2}></InlineGrid>

        <InlineStack aria-rowcount={3} align="space-between">
          <TextField
            label={"Minimum quantity"}
            autoComplete="on"
            type="number"
            {...minQuantity}
          />
          <Box minWidth="16px" />

          <TextField
            label="Max quantity"
            autoComplete="on"
            type="number"
            {...maxQuantity}
          />
          <TextField
            label="Discount percentage"
            autoComplete="on"
            type="number"
            {...percent}
            suffix="%"
          />
        </InlineStack>

        <InlineStack aria-rowcount={2}>
          <Select
            label="Apply for"
            value={applyType.value}
            options={[
              // { label: "All", value: "all" },
              { label: "Products", value: "products" },
              { label: "Collections", value: "collection" },
            ]}
            onChange={(v) => applyType.onChange(v as VDApplyType)}
          />

          {applyType.value === "products" ? (
            <SelectMultipleProducts
              products={products.value}
              onChange={products.onChange}
            />
          ) : (
            <SelectCollection {...collection} />
          )}
        </InlineStack>
      </BlockStack>
      <Box minHeight="24" />

      <BlockStack>
        <Text as="h4">Example</Text>
        {delta.map((v, idx) => (
          <Text as="p" key={idx}>
            {v}
          </Text>
        ))}
      </BlockStack>
    </Card>
  );
}
