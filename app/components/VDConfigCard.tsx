import {
  BlockStack,
  Box,
  Card,
  InlineGrid,
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
  SelectMultipleProductProp,
  SelectMultipleProducts,
} from "./SelectProduct";

interface VBConfigCardProps {
  label?: string;
  minQuantity: Field<string>;
  maxQuantity: Field<string>;
  percent: Field<string>;
  applyType: Field<"collection" | "all">;
  collection: Field<CollectionInfo>;
  // products: SelectMultipleProductProp;
}

export default function VDConfigCard({
  label,
  minQuantity,
  maxQuantity,
  percent,
  applyType,
  collection,
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

        <InlineGrid columns={["oneThird", "oneThird", "oneThird"]}>
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
        </InlineGrid>

        <TextField
          label="Discount percentage"
          autoComplete="on"
          type="number"
          {...percent}
          suffix="%"
        />

        <Select
          label="Apply for"
          value={applyType.value}
          options={[
            { label: "All", value: "all" },
            // { label: "Products", value: "products" },
            { label: "Collections", value: "collection" },
          ]}
        />
        {applyType.value === "all" ? (
          <></>
        ) : (
          <SelectCollection {...collection} />
        )}
      </BlockStack>
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
