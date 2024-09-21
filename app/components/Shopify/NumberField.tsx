import { TextField, TextFieldProps } from "@shopify/polaris";
import { useState, useCallback } from "react";

type NumberField = Omit<TextFieldProps, "value" & "onChange"> & {
  num: number;
  onChangeNum: (v: number) => void;
};

export function NumberField(props: NumberField) {
  const { num, onChange, ...rest } = props;
  const [value, setValue] = useState(props.num.toString() || "0");

  const handleChange = useCallback((newValue: string) => {
    var nVal = Number.parseFloat(newValue) || 0;
    setValue(newValue), props.onChangeNum(nVal);
  }, []);

  return (
    <TextField type="number" {...rest} value={value} onChange={handleChange} />
  );
}
