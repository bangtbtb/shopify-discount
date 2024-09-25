import { Discount } from "@prisma/client";
import { SerializeFrom } from "@remix-run/node";
import { useNavigate } from "@remix-run/react";
import { Card, EmptyState, IndexTable } from "@shopify/polaris";
import { useEffect, useState } from "react";

type DiscountTableProps = {
  discounts: SerializeFrom<Discount>[];
  onClick: (discount: SerializeFrom<Discount>) => void;
};

export function DiscountTable({ discounts, onClick }: DiscountTableProps) {
  const nav = useNavigate();
  const [loadSuccess, setLoadSuccess] = useState(false);
  useEffect(() => {
    !loadSuccess && setLoadSuccess(true);
  }, [loadSuccess]);

  if (!loadSuccess) {
    return null;
  }

  return (
    <Card>
      <IndexTable
        itemCount={discounts.length}
        selectable={false}
        headings={[{ title: "Title" }, { title: "Status" }, { title: "Type" }]}
        emptyState={
          <EmptyState
            heading="No discount found. Please create it"
            action={{
              content: "Create new",
              onAction: () => {
                nav("/app/dcs/create_select");
              },
            }}
            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
          >
            {/* <p>Track and receive your incoming inventory from suppliers.</p> */}
          </EmptyState>
        }
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
    </Card>
  );
}
