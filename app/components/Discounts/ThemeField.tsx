import { FontConfig, FontWeight, FrameConfig } from "~/defs/theme";
import { ColorPickerField } from "../Common/ColorPickerField";
import {
  InlineStack,
  Select,
  TextField,
  Box,
  BlockStack,
  InlineGrid,
  SelectOption,
} from "@shopify/polaris";
import { useEffect, useState } from "react";
import CSS from "csstype";
import { ProductVariant } from "../Shopify/SelectProduct";
import { Product } from "~/types/admin.types";

type FontThemeProps = FontConfig & {
  onChange: (newConfig: FontConfig) => void;
};

// ---------------------------- Theme Editor ----------------------------

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
        <TextField
          label="Size (px)"
          autoComplete="off"
          type="number"
          max={99}
          min={0}
          value={size.toString()}
          onChange={(v) => {
            console.log("Before Change size: ", { size, color, weight });
            onChange({ size: Number.parseInt(v) || 0, color, weight });
          }}
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

export function ButtonThemeEditor(props: ButtonThemeProps) {
  return (
    <BlockStack>
      <FontTheme {...props.font} onChange={props.onChangeFont} />
      <FrameTheme {...props.frame} onChange={props.onChangeFrame} />
    </BlockStack>
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

// ------------------------- Preview -------------------------

type RenderTextTheme = FontConfig & {
  as: "span" | "p" | "h3";
  content: string | number;
  align?: CSS.Property.TextAlign;
  className?: string;
  // Property.TextAlign;
  style?: React.CSSProperties;
};

export function RenderTextTheme({
  as,
  className,
  color,
  content,
  size,
  weight,
  align,
  style,
}: RenderTextTheme) {
  const [stateStyle, setStateStyle] = useState<React.CSSProperties>({
    fontSize: size + "px",
    color: color,
    fontWeight: weight,
    textAlign: align,
    ...style,
  });

  useEffect(() => {
    setStateStyle({
      fontSize: `${size}px`,
      color: color,
      fontWeight: weight,
      textAlign: align,
      ...style,
    });
  }, [size, color, weight]);

  if (as === "h3") {
    return (
      <h3 className={className} style={stateStyle}>
        {content}
      </h3>
    );
  }
  return as == "p" ? (
    <p className={className} style={stateStyle}>
      {content}
    </p>
  ) : (
    <span className={className} style={stateStyle}>
      {content}
    </span>
  );
}

type RenderFrameProps = Partial<FrameConfig> &
  React.CSSProperties & {
    className?: string;
    children?: React.ReactNode;
    onClick?: React.MouseEventHandler<HTMLDivElement>;
  };

export function RenderFrame({
  className,
  bgColor,
  borderColor,
  children,
  onClick,

  ...rest
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
    <div
      className={`frame ${className || ""}`}
      style={{ ...style, ...rest }}
      onClick={onClick}
    >
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

// https://www.w3schools.com/howto/tryit.asp?filename=tryhow_custom_select
export type SelectVariantProps = {
  value: Partial<ProductVariant>;
  options: Partial<ProductVariant>[];
  onChange: (variant: Partial<ProductVariant>) => void;
};

export function SelectVariant({
  value,
  options,
  onChange,
}: SelectVariantProps) {
  return (
    <div className="custom-select">
      <select
        value={value.id}
        onChange={(ev: React.ChangeEvent<HTMLSelectElement>) => {
          var target = options.find((v) => v.id === ev.currentTarget.value);
          if (target) {
            onChange(target);
          }
        }}
      >
        {options.map((v, idx) => (
          <option key={idx} value={v.id}>
            {v.title}
          </option>
        ))}
      </select>
    </div>
  );
}
