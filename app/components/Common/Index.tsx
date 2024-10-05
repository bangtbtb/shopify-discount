import CSS from "csstype";
import {
  Box,
  Button,
  Card,
  CardProps,
  Collapsible,
  InlineGrid,
  InlineStack,
  Text,
} from "@shopify/polaris";
import { XIcon } from "@shopify/polaris-icons";
import { ReactNode, useEffect, useState } from "react";
import { BsChevronDown, BsChevronUp } from "react-icons/bs";
import { randomDigit } from "~/models/utils";
import { DiscountValue } from "~/defs/discount";

type ColumnRevertProp = {
  children?: React.ReactElement;
};

export function ColumnRevert(props: ColumnRevertProp) {
  return <div className="flex_column_reverse">{props.children}</div>;
}

type BoxBorderBoundProps = {
  headerAlign?: CSS.Property.TextAlign;
  header?: string | React.ReactElement;
  children?: React.ReactElement;
  borderWidth?: CSS.Property.BorderWidth;
  borderColor?: CSS.Property.BorderColor;
};

export function BoxBorderBound(props: BoxBorderBoundProps) {
  return (
    <fieldset
      style={{
        borderRadius: "8px",
        display: "block",
        width: "100%",
        borderWidth: props.borderWidth || "1px",
        borderColor: props.borderColor,
      }}
    >
      <legend
        style={{
          textAlign: props.headerAlign,
        }}
      >
        {props.header}
      </legend>
      {props.children}
    </fieldset>
  );
}

type CardCollapseProps = CardProps & {
  title?: string | React.ReactNode;
  collapse?: boolean;
  initCollapse?: boolean;
  actions?: React.ReactNode;
};

export function CardCollapse(props: CardCollapseProps) {
  const { title, actions, ...rest } = props;
  const [openContent, setOpenContent] = useState(
    props.initCollapse == undefined ? true : props.initCollapse,
  );
  const isTitleString = typeof title === "string";

  const [collapseId, setCollapseId] = useState("");
  useEffect(() => {
    if (!collapseId) {
      setCollapseId(randomDigit(8).toString());
    }
  });

  return (
    <Card {...rest}>
      <InlineStack gap={"300"} align="space-between">
        {/* Heading */}
        {isTitleString && (
          <Text as="h3" variant="headingMd">
            {title}
          </Text>
        )}

        {!isTitleString && title}
        <InlineStack gap={"100"}>
          {actions}
          {props.collapse &&
            (openContent ? (
              <BsChevronUp size={20} onClick={() => setOpenContent(false)} />
            ) : (
              <BsChevronDown size={20} onClick={() => setOpenContent(true)} />
            ))}
        </InlineStack>
      </InlineStack>
      <Collapsible id={collapseId} open={openContent}>
        <Box minHeight="1rem" />
        {props.children}
      </Collapsible>
    </Card>
  );
}

interface RemoveableProps {
  index: number;
  children: any;
  onRemove: (index: number) => void;
}

export function Removeable({ index, children, onRemove }: RemoveableProps) {
  return (
    <InlineStack align="space-between" gap={"200"}>
      {children}
      <InlineGrid alignItems="center">
        <Button
          key={`btn-rm-${index}`}
          onClick={() => onRemove(index)}
          icon={XIcon}
        ></Button>
      </InlineGrid>
    </InlineStack>
  );
}

type MidlineProps = React.CSSProperties & {
  content?: string | React.ReactElement;
};

export function Midline(props: MidlineProps) {
  const { content, ...rest } = props;

  return (
    <div className="vd_title">
      <h3 style={rest}>{content}</h3>
    </div>
  );
}

// export function BlockIcon(params:type) {

// }

type ActionListProps = {
  children?: React.ReactElement[];
};

export function IconActionList(props: ActionListProps) {
  return (
    <InlineStack gap={"200"} aria-colcount={props.children?.length}>
      {props.children}
    </InlineStack>
  );
}
