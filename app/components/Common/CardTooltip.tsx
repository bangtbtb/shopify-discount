import { Card, CardProps, Tooltip, TooltipProps } from "@shopify/polaris";
import type {
  BreakpointsAlias,
  ColorBackgroundAlias,
  SpaceScale,
} from "@shopify/polaris-tokens";

type CardTooltipProps = TooltipProps & CardProps & {};

export default function CardTooltip(props: CardTooltipProps) {
  const { children, background, padding, roundedAbove, ...rest } = props;
  return (
    <Tooltip {...rest}>
      <Card {...{ background, padding, roundedAbove }}>{props.children}</Card>
    </Tooltip>
  );
}
