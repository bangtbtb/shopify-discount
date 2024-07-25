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

export interface CollectionInfo {
  id: string;
  title: string;
  image: string;
  imageAlt: string;
}

export interface SelectCollectionProp {
  disableSelect?: boolean;
  value: CollectionInfo | null;
  onChange: (val: CollectionInfo) => void;
}

export function SelectCollection({
  disableSelect,
  value,
  onChange,
}: SelectCollectionProp) {
  const onSelectCollection = async () => {
    const sels = await window.shopify.resourcePicker({
      type: "collection",
      action: "select",
      multiple: false,
    });

    if (sels?.length) {
      onChange({
        id: sels[0].id,
        title: sels[0].title,
        image: sels[0].image?.originalSrc ?? "",
        imageAlt: sels[0].image?.altText ?? "",
      });
    }
  };

  if (!value?.id && !disableSelect) {
    return <Button onClick={onSelectCollection}>Select Collection</Button>;
  }

  return (
    <InlineStack blockAlign="center" gap="500">
      <Thumbnail
        source={value?.image || ImageIcon}
        alt={value?.imageAlt ?? ""}
      />
      <InlineGrid alignItems="start">
        <Text as="span" variant="headingMd" fontWeight="semibold">
          {value?.title}
        </Text>
      </InlineGrid>
    </InlineStack>
  );
}

export interface SelectMultipleProductProp {
  // selectVariant?: boolean;
  label: string;
  colls: Array<CollectionInfo>;
  onChange: (val: CollectionInfo[]) => void;
}

export function SelectMultipleProducts({
  // selectVariant,
  label,
  colls,
  onChange,
}: SelectMultipleProductProp) {
  const selectProducts = async () => {
    const selecteds = await window.shopify.resourcePicker({
      type: "collection",
      action: "select",
      multiple: true,
    });
    if (!selecteds) {
      return;
    }

    var pforms: Array<CollectionInfo> =
      selecteds?.map((v) => ({
        id: v.id,
        title: v.title,
        image: v.image?.originalSrc ?? "",
        imageAlt: v.image?.altText ?? "",
      })) ?? [];

    // products.value.push(p);
    console.log("Add product: ", pforms);
    onChange(pforms);
  };

  const onRemoveProduct = (index: number) => {
    console.log("Remove index: ", index);

    var newProducts = [...colls];
    newProducts.splice(index, 1);
    onChange(newProducts);
  };

  return (
    <InlineGrid>
      {/* Controller */}
      <InlineStack>
        <Button onClick={selectProducts}>{"Browse"}</Button>
      </InlineStack>

      {/* Products */}
      <InlineGrid>
        {/* Products {products.length} */}
        {colls?.map((pInfo, index) => (
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
