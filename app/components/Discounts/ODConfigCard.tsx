import {
  Box,
  Button,
  Card,
  InlineGrid,
  InlineStack,
  Layout,
  Select,
  Text,
  TextField,
} from "@shopify/polaris";
import { Field } from "@shopify/react-form";
import { ODApplyType } from "~/defs/discount";
import { ProductInfo, SelectMultipleProducts } from "../Shopify/SelectProduct";
import { StepComponent, StepData } from "./ConfigStep";
import { Removeable } from "~/components/Common";

type ODConfigCardProps = {
  odType: Field<ODApplyType>;
  steps: Field<Array<StepData>>;
  products: Field<Array<ProductInfo>>;
};

export default function ODConfigCard({
  odType,
  steps,
  products,
}: ODConfigCardProps) {
  const onAddStep = () => {
    var newArr = [...steps.value];

    newArr.push({
      require: 0,
      type: "percent",
      value: 1,
    });

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
        <Text as="h3" fontWeight="bold">
          Target config
        </Text>
        <InlineGrid columns={odType.value === "total" ? 2 : 1}>
          {odType.value === "total" && (
            <Box>
              <Button onClick={onAddStep}>Add step</Button>
            </Box>
          )}

          <Select
            label=""
            helpText=""
            options={[
              { label: "Order Contain", value: "contain" },
              { label: "Total Order", value: "total" },
            ]}
            value={odType.value}
            onChange={(v) => odType.onChange(v as ODApplyType)}
          />
        </InlineGrid>
      </InlineStack>

      <Box minHeight="32px"></Box>

      <InlineStack>
        {odType.value === "bundle" ? (
          <SelectMultipleProducts
            label="Select target product"
            products={products.value}
            onChange={products.onChange}
          />
        ) : (
          <Layout.Section>
            <InlineGrid columns={["oneHalf", "twoThirds"]}>
              <Text as="p">Require total </Text>
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
        )}
      </InlineStack>
    </Card>
  );
}
