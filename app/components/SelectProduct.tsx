import {
  BlockStack,
  Box,
  Button,
  Icon,
  InlineGrid,
  InlineStack,
  Text,
  TextField,
  Thumbnail,
} from "@shopify/polaris";
import { Field, useField, useForm } from "@shopify/react-form";

import { ImageIcon, SearchIcon } from "@shopify/polaris-icons";
import { Removeable } from "./Removeable";

// export interface SelectProductInfo {
//   productId?: string;
//   image?: string;
//   imageAlt?: string;
// }

export interface ProductInfo {
  id: string;
  title: string;
  image: string;
  imageAlt: string;
}

export interface SelectProductProp {
  disableSelect?: boolean;
  product: ProductInfo;
  onChange: (v: ProductInfo) => void;
}

export function SelectProduct({
  disableSelect,
  product,
  onChange,
}: SelectProductProp) {
  const onSelectProduct = async () => {
    const products = await window.shopify.resourcePicker({
      type: "product",
      action: "select",
      multiple: false,
    });
    if (products?.length) {
      onChange({
        id: products[0].id,
        title: products[0].title,
        image: products[0].images[0]?.originalSrc,
        imageAlt: products[0].images[0]?.altText ?? "",
      });
    }
  };

  if (!product.id && !disableSelect) {
    return <Button onClick={onSelectProduct}>Select Product</Button>;
  }

  return (
    <InlineStack blockAlign="center" gap="500">
      <Thumbnail source={product.image || ImageIcon} alt={product.image} />
      <InlineGrid alignItems="start">
        <Text as="span" variant="headingMd" fontWeight="semibold">
          {product.title}
        </Text>
      </InlineGrid>
    </InlineStack>
  );
}

export interface SelectMultipleProductProp {
  // selectVariant?: boolean;
  label?: string;
  products: Array<ProductInfo>;
  onChange: (val: ProductInfo[]) => void;
}

export function SelectMultipleProducts({
  // selectVariant,
  label,
  products,
  onChange,
}: SelectMultipleProductProp) {
  const selectProducts = async () => {
    var ids = products.map((v) => ({
      id: v.id,
    }));

    const selecteds = await window.shopify.resourcePicker({
      type: "product",
      action: "select",
      multiple: true,
      selectionIds: ids,
      filter: {
        variants: false,
      },
      // selectionIds: products,
    });
    if (!selecteds) {
      return;
    }

    var pforms: Array<ProductInfo> =
      selecteds?.map((v) => ({
        id: v.id,
        title: v.title,
        image: v.images[0]?.originalSrc,
        imageAlt: v.images[0]?.altText ?? "",
      })) ?? [];

    // products.value.push(p);
    console.log("Add product: ", pforms);
    onChange(pforms);
  };

  const onRemoveProduct = (index: number) => {
    console.log("Remove index: ", index);

    var newProducts = [...products];
    newProducts.splice(index, 1);
    onChange(newProducts);
  };

  return (
    <InlineGrid>
      {/* Controller */}
      <BlockStack>
        <InlineGrid columns={["twoThirds", "oneThird"]}>
          <TextField
            label={label}
            value=""
            autoComplete=""
            onChange={() => {}}
            onFocus={selectProducts}
            placeholder="Select product"
            prefix={<Icon source={SearchIcon} />}
            connectedRight={
              <Button variant="primary" onClick={selectProducts}>
                Search
              </Button>
            }
          />
        </InlineGrid>
      </BlockStack>

      {/* Products */}
      <BlockStack>
        {/* Products {products.length} */}
        {products?.map((pInfo, index) => (
          <Removeable key={index} index={index} onRemove={onRemoveProduct}>
            <InlineStack key={index} blockAlign="center" gap="500">
              <Thumbnail
                source={pInfo.image || ImageIcon}
                alt={pInfo.imageAlt}
              />
              <Box minWidth="4px" />

              <InlineGrid alignItems="start" gap={"1200"}>
                <Text as="span" variant="headingMd" fontWeight="semibold">
                  {pInfo.title}
                </Text>
              </InlineGrid>
            </InlineStack>
          </Removeable>
        ))}
      </BlockStack>
    </InlineGrid>
  );
}
