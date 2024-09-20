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

import { ImageIcon, SearchIcon } from "@shopify/polaris-icons";
import { Removeable } from "~/components/Common/Removeable";

type Money = string;

interface Image {
  id: string;
  altText?: string;
  originalSrc: string;
}

enum WeightUnit {
  Kilograms = "KILOGRAMS",
  Grams = "GRAMS",
  Pounds = "POUNDS",
  Ounces = "OUNCES",
}

export interface ProductVariant {
  id: string;
  availableForSale: boolean;
  barcode?: string | null;
  compareAtPrice?: Money | null;
  createdAt: string;
  displayName: string;
  image?: Image | null;
  inventoryItem: {
    id: string;
  };
  inventoryQuantity?: number | null;
  position: number;
  price: Money;
  requiresShipping: boolean;
  selectedOptions: {
    value?: string | null;
  }[];
  sku?: string | null;
  taxable: boolean;
  title: string;
  weight?: number | null;
  weightUnit: WeightUnit;
  updatedAt: string;
}

export interface ProductInfo {
  id: string;
  title: string;
  image: string;
  imageAlt: string;
  variants: Partial<ProductVariant>[];
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
        variants:
          products[0].variants?.map((variant) => ({
            ...variant,
          })) ?? [],
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
  showDefault?: boolean;
  children?: React.ReactElement;
  onChange: (val: ProductInfo[]) => void;
}

export function SelectMultipleProducts({
  // selectVariant,
  label,
  products,
  showDefault,
  children,
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
    // console.log("Products Selected: ", selecteds);

    var pforms: Array<ProductInfo> =
      selecteds?.map((product) => ({
        id: product.id,
        title: product.title,
        image: product.images[0]?.originalSrc,
        imageAlt: product.images[0]?.altText ?? "",
        variants:
          product.variants?.map((variant) => ({
            ...variant,
          })) ?? [],
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
      <TextField
        label={label}
        value=""
        autoComplete=""
        onChange={() => {}}
        onFocus={selectProducts}
        placeholder="Select product"
        prefix={<Icon source={SearchIcon} />}
        connectedRight={
          <Button variant="primary" onClick={selectProducts} icon={SearchIcon}>
            Search
          </Button>
        }
      />

      <Box minHeight="12px"></Box>

      {/* Products */}
      {showDefault && (
        <BlockStack gap={"200"}>
          {/* Products {products.length} */}
          {products?.map((pInfo, index) => (
            <Removeable key={index} index={index} onRemove={onRemoveProduct}>
              <InlineStack key={index} blockAlign="center" gap="200">
                <Thumbnail
                  source={pInfo.image || ImageIcon}
                  alt={pInfo.imageAlt}
                  transparent
                />
                {/* <Box width="89" minHeight="71">
          <img
            className="fit_img"
            src={pInfo.image}
            alt={pInfo.imageAlt}
          />
        </Box> */}
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
      )}
      {children}
    </InlineGrid>
  );
}
