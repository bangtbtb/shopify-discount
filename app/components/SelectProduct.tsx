import {
  Box,
  Button,
  Icon,
  InlineGrid,
  InlineStack,
  Text,
  Thumbnail,
} from "@shopify/polaris";
import { Field, useField, useForm } from "@shopify/react-form";

import { ImageIcon, XIcon, PlusIcon } from "@shopify/polaris-icons";

// export interface SelectProductInfo {
//   productId?: string;
//   image?: string;
//   imageAlt?: string;
// }

export interface SelectProductProp {
  disableSelect?: boolean;
  productId: Field<string>;
  productTitle: Field<string>;
  image: Field<string>;
  imageAlt: Field<string>;
}

export function SelectProduct({
  disableSelect,
  productId,
  productTitle,
  image,
  imageAlt,
}: SelectProductProp) {
  const onSelectProduct = async () => {
    const products = await window.shopify.resourcePicker({
      type: "product",
      action: "select",
      multiple: false,
    });
    if (products?.length) {
      productId.onChange(products[0].id);
      productTitle.onChange(products[0].title);
      image.onChange(products[0].images[0]?.originalSrc);
      imageAlt.onChange(products[0].images[0]?.altText ?? "");
    }
  };

  if (!productId.value && !disableSelect) {
    return <Button onClick={onSelectProduct}>Select Product</Button>;
  }

  return (
    <InlineStack blockAlign="center" gap="500">
      <Thumbnail source={image.value || ImageIcon} alt={imageAlt.value} />
      <InlineGrid alignItems="start">
        <Text as="span" variant="headingMd" fontWeight="semibold">
          {productTitle.value}
        </Text>
      </InlineGrid>
    </InlineStack>
  );
}

export interface ProductInfo {
  disableSelect?: boolean;
  productId: string;
  productTitle: string;
  image: string;
  imageAlt: string;
}

export interface SelectMultipleProductProp {
  // selectVariant?: boolean;
  products: Array<ProductInfo>;
  onChange: (val: ProductInfo[]) => void;
}

export function SelectMultipleProducts({
  // selectVariant,
  products,
  onChange,
}: SelectMultipleProductProp) {
  const selectProducts = async () => {
    const selecteds = await window.shopify.resourcePicker({
      type: "product",
      action: "select",
      multiple: true,
      // selectionIds: [{id: ""}],
      // selectionIds: products,
    });
    if (!selecteds) {
      return;
    }

    var pforms: Array<ProductInfo> =
      selecteds?.map((v) => ({
        productId: v.id,
        productTitle: v.title,
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
      <InlineStack>
        <Button onClick={selectProducts}>Select Multiple Product</Button>
      </InlineStack>

      {/* Products */}
      <InlineGrid>
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
                  {pInfo.productTitle}
                </Text>
              </InlineGrid>
            </InlineStack>
          </Removeable>
        ))}
      </InlineGrid>
    </InlineGrid>
  );
}

interface RemoveableProps {
  index: number;
  children: any;
  onRemove: (index: number) => void;
}

export function Removeable({ index, children, onRemove }: RemoveableProps) {
  return (
    <InlineStack align="space-between">
      <Box key={`content-${index}`}>{children}</Box>
      <InlineGrid alignItems="center">
        <Button
          key={`btn-rm-${index}`}
          tone="critical"
          onClick={() => onRemove(index)}
          icon={XIcon}
        ></Button>
      </InlineGrid>
    </InlineStack>
  );
}
