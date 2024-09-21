import { Discount } from "@prisma/client";
import {
  ActiveDatesCard,
  CombinableDiscountTypes,
  CombinationCard,
  DateTime,
  DiscountClass,
} from "@shopify/discount-app-components";
import { BlockStack, Card, TextField } from "@shopify/polaris";
import { Field, useField } from "@shopify/react-form";
import { DiscountProvider } from "../providers/DiscountProvider";

type DiscountCommonEditorProps = {
  title: Field<string>;
  startDate: Field<DateTime>;
  endDate: Field<DateTime | null>;
  combines: Field<CombinableDiscountTypes>;
  discountClass: DiscountClass;
};

export function DiscountCommonEditor({
  startDate,
  endDate,
  combines,
  discountClass,
}: DiscountCommonEditorProps) {
  return (
    <BlockStack gap={"300"}>
      <DiscountProvider>
        <ActiveDatesCard
          startDate={startDate}
          endDate={endDate}
          timezoneAbbreviation="EST"
        />

        <CombinationCard
          combinableDiscountTypes={combines}
          discountClass={discountClass}
          discountDescriptor="Discount"
        />
      </DiscountProvider>
    </BlockStack>
  );
}
