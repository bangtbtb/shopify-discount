import { Box, Card, CardProps, Text } from "@shopify/polaris";

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
      <Box width="12px" />
      {props.children}
    </Card>
  );
}
