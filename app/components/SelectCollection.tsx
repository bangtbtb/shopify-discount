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

export interface CollectionInfo {
  id: string;
  title: string;
  image: string;
  imageAlt: string;
}

export interface SelectCollectionProp {
  label: string;
  value: CollectionInfo | null;
  onChange: (val: CollectionInfo) => void;
}

export function SelectCollection({
  label,
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

  return (
    <BlockStack>
      <InlineGrid columns={["twoThirds", "oneThird"]}>
        <TextField
          label={label}
          value=""
          autoComplete=""
          onChange={() => {}}
          onFocus={onSelectCollection}
          placeholder="Select target collection"
          prefix={<Icon source={SearchIcon} />}
          connectedRight={
            <Button variant="primary" onClick={onSelectCollection}>
              Search
            </Button>
          }
        />
      </InlineGrid>
      {value?.id && (
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
      )}
    </BlockStack>
  );
}

export interface SelectCollectionsProp {
  // selectVariant?: boolean;
  label: string;
  colls: Array<CollectionInfo>;
  onChange: (val: CollectionInfo[]) => void;
}

export function SelectCollections({
  // selectVariant,
  label,
  colls,
  onChange,
}: SelectCollectionsProp) {
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

    onChange(pforms);
  };

  const onRemove = (index: number) => {
    console.log("Remove index: ", index);

    var newProducts = [...colls];
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
            placeholder="Select collections"
            prefix={<Icon source={SearchIcon} />}
            connectedRight={
              <Button variant="primary" onClick={selectProducts}>
                Search
              </Button>
            }
          />
        </InlineGrid>
      </BlockStack>

      {/* Selected collections */}
      <InlineGrid>
        {colls?.map((pInfo, index) => (
          <Removeable key={index} index={index} onRemove={onRemove}>
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
