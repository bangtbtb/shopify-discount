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
import { SDApplyType } from "~/defs";
import { StepComponent, StepData } from "./ConfigStep";
import { ProductInfo, SelectMultipleProducts } from "./SelectProduct";
import { CollectionInfo, SelectCollections } from "./SelectCollection";
import { Removeable } from "./Removeable";

type SDConfigCardProps = {
  sdType: Field<SDApplyType>;
  steps: Field<Array<StepData>>;
  products: Field<Array<ProductInfo>>;
  colls: Field<Array<CollectionInfo>>;
};

export function SDConfigCard({
  sdType,
  steps,
  products,
  colls,
}: SDConfigCardProps) {
  const onAddStep = () => {
    var newArr = [...steps.value];

    newArr.push({
      require: "0",
      type: "percent",
      value: "",
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
        <InlineGrid columns={sdType.value === "total" ? 2 : 1}>
          {sdType.value === "total" && (
            <Box>
              <Button onClick={onAddStep}>Add step</Button>
            </Box>
          )}

          <Select
            label=""
            helpText=""
            options={[
              { label: "Volume", value: "volume" },
              { label: "Total order", value: "total" },
            ]}
            value={sdType.value}
            onChange={(v) => sdType.onChange(v as SDApplyType)}
          />
        </InlineGrid>
      </InlineStack>

      <Box minHeight="32px"></Box>

      <InlineStack>
        {sdType.value === "total" ? (
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
        ) : (
          <InlineGrid>
            <SelectMultipleProducts
              label="Select target product"
              products={products.value}
              onChange={products.onChange}
            />
            <SelectCollections
              label="Select target collection"
              colls={colls.value}
              onChange={colls.onChange}
            />

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
        )}
      </InlineStack>
    </Card>
  );
}
