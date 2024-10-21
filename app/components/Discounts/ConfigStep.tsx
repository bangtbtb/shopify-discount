import { RewardStep } from "~/defs/discount";
import { Box, InlineGrid, TextField } from "@shopify/polaris";
import { DiscountTypeSelect } from "./DiscountCommon";

type StepComponentProps = RewardStep & {
  onChange: (v: RewardStep) => void;
};

export function StepComponent(props: StepComponentProps) {
  return (
    <InlineGrid columns={3} gap={"200"}>
      <Box width="3rem">
        <TextField
          // label="Require volume"
          label=""
          // type="number"
          autoComplete="off"
          value={props.require.toString()}
          onChange={(v) =>
            props.onChange({ ...props, require: Number.parseInt(v) ?? 0 })
          }
          placeholder="Require"
        />
      </Box>

      <Box width="6rem">
        <DiscountTypeSelect
          // label="Discount value"
          dv={props.discount.value}
          dvt={props.discount.type}
          onChangeType={(v) =>
            props.onChange({
              ...props,
              discount: { ...props.discount, type: v },
            })
          }
          onChangeValue={(v) =>
            props.onChange({
              ...props,
              discount: { ...props.discount, value: v },
            })
          }
        />
      </Box>
    </InlineGrid>
  );
}
