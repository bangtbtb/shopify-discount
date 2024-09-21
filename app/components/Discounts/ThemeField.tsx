import { useField, Field } from "@shopify/react-form";
import { FontConfig, FontWeight, FrameConfig } from "~/defs/theme";
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
import { NumberField } from "../Shopify/NumberField";

// export type FontConfigField = {
//   size: Field<string>;
//   color: Field<string>;
//   weight: Field<FontWeight>;
// };

// export type FrameConfigField = {
//   bgColor: Field<string>;
//   borderColor: Field<string>;
// };

// export type GUIButtonConfigField = {
//   frame: FrameConfigField;
//   fontConfig: FontConfigField;
// };

// export type GUIBundleTotalConfigField = {
//   frame: FrameConfigField;
//   label: FontConfigField;
//   price: FontConfigField;
//   comparePrice: FontConfigField;
// };

// export function createFontConfigField(dFont: FontConfig): FontConfigField {
//   return {
//     size: useField<string>(dFont.size.toString()),
//     color: useField<string>(dFont.color),
//     weight: useField<FontWeight>(dFont.weight),
//   };
// }

// export function createFrameConfigField(dFrame: FrameConfig): FrameConfigField {
//   return {
//     bgColor: useField<string>(dFrame.bgColor),
//     borderColor: useField<string>(dFrame.borderColor),
//   };
// }

// export function createButtonConfigField(
//   dFont: FontConfig,
//   dFrame: FrameConfig,
// ): GUIButtonConfigField {
//   return {
//     fontConfig: createFontConfigField(dFont),
//     frame: createFrameConfigField(dFrame),
//   };
// }

// export function createBundleFootTot(params: type) {}

type FontThemeProps = FontConfig & {
  onChange: (newConfig: FontConfig) => void;
};

export function FontTheme({ size, color, weight, onChange }: FontThemeProps) {
  return (
    <InlineStack aria-colcount={3} gap={"100"} align="space-between">
      <Box width="160px">
        <ColorPickerField
          label="Color"
          hexColor={color}
          onChange={(newHex) => onChange({ size, color: newHex, weight })}
        />
      </Box>
      <Box maxWidth="70px">
        <NumberField
          label="Size"
          autoComplete="off"
          type="number"
          // suffix={"px"}
          max={64}
          min={8}
          num={size}
          onChangeNum={(v) => onChange({ size: v, color, weight })}
        />
      </Box>

      <Box minWidth="70px">
        <SelectFontWeight
          label="Weight"
          value={weight}
          onChange={(v) => onChange({ size, color, weight: v })}
        />
      </Box>
    </InlineStack>
  );
}

type FrameThemeProps = FrameConfig & {
  onChange: (newConfig: FrameConfig) => void;
};

export function FrameTheme({
  bgColor,
  borderColor,
  onChange,
}: FrameThemeProps) {
  return (
    <InlineGrid columns={2} gap={"200"}>
      <ColorPickerField
        label="Background color"
        hexColor={bgColor}
        onChange={(v) => onChange({ bgColor: v, borderColor })}
      />
      <ColorPickerField
        label="Border color"
        hexColor={borderColor}
        onChange={(v) => onChange({ bgColor, borderColor: v })}
      />
    </InlineGrid>
  );
}

type ButtonThemeProps = {
  font: FontConfig;
  frame: FrameConfig;
  onChangeFont: (newFont: FontConfig) => void;
  onChangeFrame: (newConfig: FrameConfig) => void;
};

export function ButtonTheme(props: ButtonThemeProps) {
  return (
    <BlockStack>
      <FontTheme {...props.font} onChange={props.onChangeFont} />
      <FrameTheme {...props.frame} onChange={props.onChangeFrame} />
    </BlockStack>
  );
}

// ------------------------- Preview -------------------------

type RenderTextTheme = FontConfig & {
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
    fontSize: size + "px",
    color: color,
    fontWeight: weight,
    textAlign: align,
  });

  useEffect(() => {
    setStyle({
      fontSize: `${size}px`,
      color: color,
      fontWeight: weight,
      textAlign: align,
    });
  }, [size, color, weight]);

  if (as === "h3") {
    return <h3 style={style}>{content}</h3>;
  }
  return as == "p" ? (
    <p style={style}>{content}</p>
  ) : (
    <span style={style}>{content}</span>
  );
}

type RenderFrameProps = FrameConfig & {
  children?: React.ReactElement;
};

export function RenderFrame({
  bgColor,
  borderColor,
  children,
}: RenderFrameProps) {
  const [style, setStyle] = useState<React.CSSProperties>({
    backgroundColor: bgColor,
    borderColor: borderColor,
  });

  useEffect(() => {
    setStyle({
      backgroundColor: bgColor,
      borderColor: borderColor,
    });
  }, [bgColor, borderColor]);

  return (
    <div className="frame" style={style}>
      {children}
    </div>
  );
}

type RenderBundleButtonProps = {
  font: FontConfig;
  frame: FrameConfig;
  content: string;
};

export function RenderBundleButton({
  font,
  frame,
  content,
}: RenderBundleButtonProps) {
  const { bgColor, borderColor } = frame;
  const { size, color, weight } = font;

  return (
    <button
      style={{
        display: "block",
        backgroundColor: bgColor,
        borderColor: borderColor,
        borderWidth: "1px",
        borderRadius: "4px",
        fontSize: size + "px",
        color: color,
        fontWeight: weight,
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
    />
  );
}
