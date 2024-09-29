import { DVT } from "~/defs/discount";
import { Box, InlineGrid, TextField } from "@shopify/polaris";
import TextFieldSelect from "~/components/Shopify/TextFieldSelect";
import { DiscountTypeSelect } from "./DiscountCommon";

export type StepData = {
  type: DVT;
  value: number;
  require: number;
  label?: string;
};

interface StepComponentProps extends StepData {
  onChange: (v: StepComponentProps) => void;
}

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
          dv={props.value}
          dvt={props.type}
          onChangeType={(v) => props.onChange({ ...props, type: v })}
          onChangeValue={(v) => props.onChange({ ...props, value: v })}
        />
      </Box>
    </InlineGrid>
  );
}
