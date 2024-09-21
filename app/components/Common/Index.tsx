import CSS from "csstype";
import {
  Box,
  Button,
  Card,
  CardProps,
  InlineGrid,
  InlineStack,
  Text,
} from "@shopify/polaris";
import { XIcon } from "@shopify/polaris-icons";

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
};

export function BoxBorderBound(props: BoxBorderBoundProps) {
  return (
    <fieldset style={{ borderRadius: "8px", display: "inline-block" }}>
      <legend
        style={{
          textAlign: props.headerAlign,
        }}
      >
        {/* <span style="font-size: 2rem"> Span text </span> */}
        {props.header}
      </legend>
      {props.children}
    </fieldset>
  );
}

type CardWithHeadingProps = CardProps & {
  title: string;
};

export default function CardWithHeading(props: CardWithHeadingProps) {
  const { title, ...rest } = props;
  return (
    <Card {...rest}>
      <Text as="h3" variant="headingMd">
        {title}
      </Text>
      <Box width="1rem" />
      {props.children}
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
      <h3 style={rest}>content</h3>
    </div>
  );
}
