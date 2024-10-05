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
import { BsTrash } from "react-icons/bs";

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
    // console.log("Open resource picker");

    const selecteds = await shopify.resourcePicker({
      type: "product",
      action: "select",
      multiple: true,
      selectionIds: ids,
      filter: {
        variants: false,
      },
      // selectionIds: products,
      query: ``,
    });
    if (!selecteds) {
      return;
    }
    console.log("Products Selected: ", selecteds);

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
          {products?.map((pInfo, index) => (
            <SelectedProduct
              key={index}
              product={pInfo}
              onRemove={() => onRemoveProduct(index)}
            />
          ))}
        </BlockStack>
      )}
      {children}
    </InlineGrid>
  );
}
type SelectedProductProps = {
  product: ProductInfo;
  actions?: React.ReactElement[];
  onRemove?: () => void;
};

export function SelectedProduct({
  product,
  actions,
  onRemove,
}: SelectedProductProps) {
  return (
    <div className="flex_row card_grey" style={{ flexWrap: "nowrap" }}>
      <div style={{ minWidth: "92px", height: "71px" }}>
        <img className="fit_img" src={product.image} alt="" />
      </div>

      <div className="remain flex_column" style={{ wordWrap: "break-word" }}>
        <Text as="p" variant="headingSm" breakWord={true}>
          {product.title}
        </Text>

        <div
          className="flex_row_center"
          style={{
            padding: "0 0.5rem",
          }}
        >
          {actions}

          {onRemove && (
            <BsTrash
              color="red"
              size={20}
              onClick={() => {
                if (!!onRemove) {
                  onRemove();
                }
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
