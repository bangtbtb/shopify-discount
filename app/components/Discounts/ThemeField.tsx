import { useField, Field } from "@shopify/react-form";
import { FontConfig, FontWeight, FrameConfig } from "~/defs/discount";
import { ColorPickerField } from "../Common/ColorPickerField";
import {
  InlineStack,
  Select,
  TextField,
  Box,
  BlockStack,
  InlineGrid,
} from "@shopify/polaris";
import { useEffect, useState } from "react";
import CSS from "csstype";

export type FontConfigField = {
  size: Field<string>;
  color: Field<string>;
  weight: Field<FontWeight>;
};

export type FrameConfigField = {
  bgColor: Field<string>;
  borderColor: Field<string>;
};

export type GUIButtonConfigField = {
  frame: FrameConfigField;
  fontConfig: FontConfigField;
};

export type GUIBundleTotalConfigField = {
  frame: FrameConfigField;
  label: FontConfigField;
  price: FontConfigField;
  comparePrice: FontConfigField;
};

export function createFontConfigField(dFont: FontConfig): FontConfigField {
  return {
    size: useField<string>(dFont.size.toString()),
    color: useField<string>(dFont.color),
    weight: useField<FontWeight>(dFont.weight),
  };
}

export function createFrameConfigField(dFrame: FrameConfig): FrameConfigField {
  return {
    bgColor: useField<string>(dFrame.bgColor),
    borderColor: useField<string>(dFrame.borderColor),
  };
}

export function createButtonConfigField(
  dFont: FontConfig,
  dFrame: FrameConfig,
): GUIButtonConfigField {
  return {
    fontConfig: createFontConfigField(dFont),
    frame: createFrameConfigField(dFrame),
  };
}

// export function createBundleFootTot(params: type) {}

type FontThemeProps = {
  size: Field<string>;
  color: Field<string>;
  weight: Field<FontWeight>;
};

export function FontTheme({ size, color, weight }: FontThemeProps) {
  return (
    <InlineStack aria-colcount={3} gap={"100"} align="space-between">
      <Box width="160px">
        <ColorPickerField label="Color" hexColor={color} />
      </Box>
      <Box maxWidth="70px">
        <TextField
          label="Size"
          autoComplete="off"
          type="number"
          // suffix={"px"}
          max={64}
          min={8}
          {...size}
        />
      </Box>

      <Box minWidth="70px">
        <SelectFontWeight label="Weight" {...weight} />
      </Box>
    </InlineStack>
  );
}

type FrameConfigThemeProps = {
  bgColor: Field<string>;
  borderColor: Field<string>;
};

export function FrameConfigTheme({
  bgColor,
  borderColor,
}: FrameConfigThemeProps) {
  return (
    <InlineGrid columns={2} gap={"200"}>
      <ColorPickerField label="Background color" hexColor={bgColor} />
      <ColorPickerField label="Border color" hexColor={borderColor} />
    </InlineGrid>
  );
}

export function ButtonConfigTheme(props: GUIButtonConfigField) {
  return (
    <BlockStack>
      <FontTheme {...props.fontConfig} />
      <FrameConfigTheme {...props.frame} />
    </BlockStack>
  );
}

// ------------------------- Preview -------------------------

type RenderTextTheme = FontThemeProps & {
  as: "span" | "p" | "h3";
  content: string | number;
  align?: CSS.Property.TextAlign;
  // Property.TextAlign;
};

export function RenderTextTheme({
  as,
  color,
  content,
  size,
  weight,
  align,
}: RenderTextTheme) {
  const [style, setStyle] = useState<React.CSSProperties>({
    fontSize: size.value + "px",
    color: color.value,
    fontWeight: weight.value,
    textAlign: align,
  });

  useEffect(() => {
    setStyle({
      fontSize: size.value + "px",
      color: color.value,
      fontWeight: weight.value,
    });
  }, [size.value, color.value, weight.value]);

  if (as === "h3") {
    return <h3 style={style}>{content}</h3>;
  }
  return as == "p" ? (
    <p style={style}>{content}</p>
  ) : (
    <span style={style}>{content}</span>
  );
}

type RenderFrameProps = FrameConfigThemeProps & {
  children?: React.ReactElement;
};

export function RenderFrame({
  bgColor,
  borderColor,
  children,
}: RenderFrameProps) {
  const [style, setStyle] = useState<React.CSSProperties>({
    backgroundColor: bgColor.value,
    borderColor: borderColor.value,
  });

  useEffect(() => {
    setStyle({
      backgroundColor: bgColor.value,
      borderColor: borderColor.value,
    });
  }, [bgColor.value, borderColor.value]);

  return (
    <div className="frame" style={style}>
      {children}
    </div>
  );
}

type RenderBundleButtonProps = GUIButtonConfigField & {
  content: string;
};

export function RenderBundleButton({
  frame,
  fontConfig,
  content,
}: RenderBundleButtonProps) {
  const { bgColor, borderColor } = frame;
  const { size, color, weight } = fontConfig;

  return (
    <button
      style={{
        display: "block",
        backgroundColor: bgColor.value,
        borderColor: borderColor.value,
        borderWidth: "1px",
        borderRadius: "4px",
        fontSize: size.value + "px",
        color: color.value,
        fontWeight: weight.value,
        textAlign: "center",
        padding: "10px 0",
      }}
    >
      {content}
    </button>
  );
}

type SelectFontWeight = {
  label?: string;
  value: FontWeight;
  onChange: (v: FontWeight) => void;
};

export function SelectFontWeight({ label, value, onChange }: SelectFontWeight) {
  return (
    <Select
      label={label}
      value={value}
      options={[
        { label: "Light", value: "300" },
        { label: "Normal", value: "400" },
        { label: "Medium", value: "500" },
        { label: "SemiBold", value: "600" },
        { label: "Bold", value: "700" },
      ]}
      onChange={(v) => onChange(v as FontWeight)}
    ></Select>
  );
}
