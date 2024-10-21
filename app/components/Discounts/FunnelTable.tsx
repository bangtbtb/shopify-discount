import { Discount } from "@prisma/client";
import { SerializeFrom } from "@remix-run/node";
import { useNavigate } from "@remix-run/react";
import { DateTime, DiscountStatus } from "@shopify/discount-app-components";
import {
  Badge,
  Box,
  Button,
  InlineGrid,
  InlineStack,
  Text,
  Tooltip,
} from "@shopify/polaris";
import { DeleteIcon, DuplicateIcon, EditIcon } from "@shopify/polaris-icons";
import { Progress, Tone } from "@shopify/polaris/build/ts/src/components/Badge";
import { useEffect, useState } from "react";
import { CustomTable, TCell, TRow } from "../Common/CustomTable";
import { OverlayImage } from "../Common/OverlayImage";
import { ProductInfo } from "../Shopify/SelectProduct";
import { bridgeLoadProduct } from "../Shopify/shopify_func";
import { Modal, TitleBar } from "@shopify/app-bridge-react";

type FunnelDataTableProps = {
  discounts: SerializeFrom<Discount>[];
  onEdit?: (index: number) => void;
  onDupplicate?: (index: number) => void;
  onDelete?: (index: number) => void;
};

export function FunnelCustomTable({
  discounts,
  onEdit,
  onDupplicate,
  onDelete,
}: FunnelDataTableProps) {
  const [waitDel, setWaitDel] = useState(-1);
  const handleDelete = (index: number) => {
    setWaitDel(index);
    console.log("Show confirm del");
  };

  const handleConfirmDel = () => {
    console.log("Handle confirm del");

    if (waitDel >= 0 && onDelete) {
      onDelete(waitDel);
      setWaitDel(-1);
    }
  };

  return (
    <>
      <CustomTable
        headings={["Name", "Products", "Status", "SaleValue", "Actions"]}
        withs={[undefined, undefined, "120px", "120px", "110px"]}
      >
        {discounts.map((d, idx) => (
          <DiscountRow
            key={d.id}
            index={idx}
            total={"100$"}
            discount={d}
            onEdit={onEdit}
            onDupplicate={onDupplicate}
            onDelete={handleDelete}
          />
        ))}
      </CustomTable>

      <Modal
        id="del_funnel_confirm"
        open={waitDel >= 0}
        onHide={() => setWaitDel(-1)}
        variant="small"
      >
        {/* <Text as="p">hello</Text> */}
        <TitleBar
          title={`Are you sure you want to delete funnel  ${discounts[waitDel]?.title || ""}?`}
        ></TitleBar>
        <Box padding={"100"}>
          <InlineStack align="end">
            <Button variant="tertiary" onClick={() => setWaitDel(-1)}>
              Cancel
            </Button>

            <Button
              variant="primary"
              tone="critical"
              icon={DeleteIcon}
              onClick={handleConfirmDel}
            >
              Delete
            </Button>
          </InlineStack>
        </Box>
      </Modal>
    </>
  );
}

type DiscountRowProps = {
  index: number;
  total: number | string;
  discount: SerializeFrom<Discount>;
  onEdit?: (index: number) => void;
  onDupplicate?: (index: number) => void;
  onDelete?: (index: number) => void;
};

function DiscountRow({
  index,
  discount,
  total,
  onEdit,
  onDupplicate,
  onDelete,
}: DiscountRowProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<ProductInfo[]>([]);

  useEffect(() => {
    if (discount.productIds?.length && !products.length && !isLoading) {
      setIsLoading(true);
      console.log("Start load product 1: ", discount);

      bridgeLoadProduct(discount.productIds)
        .then((v) => {
          setProducts(v);
          setIsLoading(false);
        })
        .catch((err) => {
          console.log("Load product from order error: ", err);
          setIsLoading(false);
        });
    }
  }, [discount.productIds]);

  return (
    <TRow>
      <TCell>{discount.title}</TCell>
      <TCell>
        <OverlayImage srcs={products} size={30} />
      </TCell>
      <TCell>
        <DiscountStatusComponent
          status={DiscountStatus.Active}
          endDate={discount.startAt}
        />
      </TCell>
      <TCell>{total}</TCell>
      <TCell>
        <InlineStack gap={"200"} aria-colcount={3} align="start">
          <Tooltip content="Edit">
            <EditIcon
              width={24}
              height={24}
              onClick={() => onEdit && onEdit(index)}
            />
          </Tooltip>
          <DuplicateIcon
            width={24}
            height={24}
            onClick={() => onDupplicate && onDupplicate(index)}
          />
          <DeleteIcon
            width={24}
            height={24}
            onClick={() => onDelete && onDelete(index)}
          />
        </InlineStack>
      </TCell>
    </TRow>
  );
}

type DiscountStatusComponentProps = {
  status: DiscountStatus;
  endDate: DateTime;
};

function DiscountStatusComponent({ status }: DiscountStatusComponentProps) {
  const [progress, setProgress] = useState<Progress>(
    status === DiscountStatus.Active ? "complete" : "incomplete",
  );
  const [tone, setTone] = useState<Tone>(
    status === DiscountStatus.Active ? "success" : "attention",
  );

  useEffect(() => {
    setProgress(status === DiscountStatus.Active ? "complete" : "incomplete");
    setTone(status === DiscountStatus.Active ? "success" : "attention");
  }, [status]);

  return (
    <Badge size="medium" progress={progress} tone={tone}>
      {status}
    </Badge>
  );
}
