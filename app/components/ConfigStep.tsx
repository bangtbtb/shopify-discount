import { InlineGrid, TextField } from "@shopify/polaris";
import { DVT } from "~/defs";
import TextFieldSelect from "./TextFieldSelect";

export type StepData = {
  type: DVT;
  value: string;
  require: string;
};

interface StepComponentProps extends StepData {
  onChange: (v: StepComponentProps) => void;
}

export function StepComponent(props: StepComponentProps) {
  return (
    <InlineGrid columns={["oneHalf", "twoThirds"]}>
      <TextField
        // label="Require volume"
        label=""
        autoComplete="off"
        value={props.require}
        onChange={(v) => props.onChange({ ...props, require: v })}
        type="number"
        placeholder="Require"
      />

      <TextFieldSelect
        label=""
        type={props.type}
        value={props.value}
        options={[
          { label: "Percent", value: "percent" },
          { label: "Fix Amount", value: "fix" },
        ]}
        onChangeType={(v) => props.onChange({ ...props, type: v as DVT })}
        onChangeValue={(v) => props.onChange({ ...props, value: v })}
      />
    </InlineGrid>
  );
}
