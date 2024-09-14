import { Discount } from "@prisma/client";
import { SerializeFrom } from "@remix-run/node";
import { IndexTable, Text } from "@shopify/polaris";

type DiscountTableProps = {
  discounts: SerializeFrom<Discount>[];
  onClick: (discount: SerializeFrom<Discount>) => void;
};

export function DiscountTable({ discounts, onClick }: DiscountTableProps) {
  return (
    <IndexTable
      itemCount={discounts.length}
      selectable={false}
      headings={[{ title: "Title" }, { title: "Status" }, { title: "Type" }]}
      emptyState={<Text as="p">Empty discount</Text>}
    >
      {discounts.map((d, idx) => (
        <IndexTable.Row
          id={d.id}
          key={d.id}
          position={idx}
          onClick={() => onClick(d)}
        >
          <IndexTable.Cell>{d.title}</IndexTable.Cell>
          <IndexTable.Cell>{d.type}</IndexTable.Cell>
          <IndexTable.Cell>{d.status}</IndexTable.Cell>
        </IndexTable.Row>
      ))}
    </IndexTable>
  );
}
