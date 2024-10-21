import {
  ButtonConfig,
  FontConfig,
  FontWeight,
  FrameConfig,
  TextConfig,
} from "~/defs/theme";
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
import { ProductVariant } from "../Shopify/SelectProduct";
import { BoxBorderBound } from "../Common";

type FontThemeProps = FontConfig & {
  header?: string | React.ReactElement;
  onChange: (newConfig: FontConfig) => void;
};

// ---------------------------- Theme Editor ----------------------------

export function FontTheme({
  header,
  size,
  color,
  weight,
  onChange,
}: FontThemeProps) {
  return (
    <BoxBorderBound header={header}>
      <InlineStack aria-colcount={3} gap={"100"} align="space-between">
        <Box width="150px">
          <ColorPickerField
            label="Color"
            hexColor={color}
            onChange={(newHex) => onChange({ size, color: newHex, weight })}
          />
        </Box>

        <Box maxWidth="75px">
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

        <Box minWidth="80px">
          <SelectFontWeight
            label="Weight"
            value={weight}
            onChange={(v) => onChange({ size, color, weight: v })}
          />
        </Box>
      </InlineStack>
    </BoxBorderBound>
  );
}

type TextConfigEditor = TextConfig & {
  header?: string | React.ReactElement;
  contentHelp?: string;
  onChange: (newConfig: TextConfig) => void;
};

export function TextConfigEditor({
  header,
  content,
  contentHelp,
  size,
  color,
  weight,
  onChange,
}: TextConfigEditor) {
  return (
    <BoxBorderBound header={header}>
      <InlineGrid gap={"600"} columns={2}>
        <TextField
          label="Text"
          autoComplete="off"
          value={content?.toString()}
          helpText={contentHelp}
          onChange={(v) => onChange({ content: v, size, color, weight })}
        />

        <TextField
          label="Size (px)"
          autoComplete="off"
          type="number"
          max={99}
          min={0}
          value={size.toString()}
          onChange={(v) => {
            console.log("Before Change size: ", { size, color, weight });
            onChange({
              content,
              size: Number.parseInt(v) || 0,
              color,
              weight,
            });
          }}
        />

        <ColorPickerField
          label="Color"
          hexColor={color}
          onChange={(newHex) =>
            onChange({ content, size, color: newHex, weight })
          }
        />

        <Box minWidth="80px">
          <SelectFontWeight
            label="Weight"
            value={weight}
            onChange={(v) => onChange({ content, size, color, weight: v })}
          />
        </Box>
      </InlineGrid>
    </BoxBorderBound>
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

type ButtonThemeProps = ButtonConfig & {
  onChangeFont: (newFont: FontConfig) => void;
  onChangeFrame: (newConfig: FrameConfig) => void;
};

export function ButtonThemeEditor(props: ButtonThemeProps) {
  return (
    <BlockStack gap={"400"}>
      <TextConfigEditor {...props.font} onChange={props.onChangeFont} />
      <FrameTheme {...props.frame} onChange={props.onChangeFrame} />
    </BlockStack>
  );
}

type SelectFontWeightProps = {
  label?: string;
  value: FontWeight;
  onChange: (v: FontWeight) => void;
};

export function SelectFontWeight({
  label,
  value,
  onChange,
}: SelectFontWeightProps) {
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

export type FlexDirection = "row" | "column";

type SelectDirectionProps = {
  label?: string;
  value: FlexDirection;
  onChange: (v: FlexDirection) => void;
};

export function SelectFlexDirection({
  label,
  value,
  onChange,
}: SelectDirectionProps) {
  return (
    <Select
      label={label}
      value={value}
      options={[
        { label: "Row", value: "row" },
        { label: "Column", value: "column" },
      ]}
      onChange={(v) => onChange(v as FlexDirection)}
    />
  );
}

// ------------------------- Preview -------------------------

type RenderTextTheme = TextConfig & {
  as: "span" | "p" | "h3";
  align?: CSS.Property.TextAlign;
  className?: string;
  // Property.TextAlign;
  style?: React.CSSProperties;
  // children: string | number | any;
};

export function RenderTextTheme({
  as,
  className,
  color,
  size,
  weight,
  align,
  style,
  content,
  // children,
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
    id?: string;
    className?: string;
    children?: React.ReactNode;
    onClick?: React.MouseEventHandler<HTMLDivElement>;
  };

export function RenderFrame({
  id,
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
      itemID={id}
      className={`frame ${className || ""}`}
      style={{ ...style, ...rest }}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

type RenderBundleButtonProps = {
  font: TextConfig;
  frame: FrameConfig;
};

export function RenderBundleButton({ font, frame }: RenderBundleButtonProps) {
  const { bgColor, borderColor } = frame;
  const { content, size, color, weight } = font;

  return (
    <button
      className="btn_add_cart"
      style={{
        color: color,
        fontSize: size + "px",
        fontWeight: weight,
        backgroundColor: bgColor,
        borderColor: borderColor,
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
    <div className="select_ctn">
      <select
        className="select variant"
        value={value.id}
        onChange={(ev: React.ChangeEvent<HTMLSelectElement>) => {
          var target = options.find((v) => v.id === ev.currentTarget.value);
          if (target) {
            onChange(target);
          }
        }}
      >
        {options.map((v, idx) => (
          <option key={idx} value={v.id} data-price={v.price || ""}>
            {v.title}
          </option>
        ))}
      </select>
    </div>
  );
}
