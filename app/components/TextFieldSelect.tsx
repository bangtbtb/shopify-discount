import {
  InlineGrid,
  Select,
  SelectGroup,
  SelectOption,
  TextField,
} from "@shopify/polaris";

export type TextFieldSelectProps = {
  label: string;
  value: string;
  type: string;
  options: (SelectOption | SelectGroup)[];
  onChangeValue: (v: string) => void;
  onChangeType: (v: string) => void;
};

export default function TextFieldSelect(props: TextFieldSelectProps) {
  return (
    <TextField
      label={props.label}
      autoComplete="off"
      value={props.value}
      onChange={props.onChangeValue}
      placeholder="Discount value"
      connectedRight={
        <Select
          label=""
          value={props.type}
          options={props.options}
          onChange={props.onChangeType}
        />
      }
    />
  );
}
