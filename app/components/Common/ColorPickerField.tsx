import {
  BlockStack,
  ColorPicker,
  hexToRgb,
  HSBAColor,
  TextField,
  rgbToHsb,
  Box,
  hsbToHex,
  hsbToRgb,
  Text,
  Modal,
  InlineStack,
  Button,
} from "@shopify/polaris";
import { XSmallIcon } from "@shopify/polaris-icons";
import { Field } from "@shopify/react-form";

import { useEffect, useRef, useState } from "react";

type ColorPickerExtendProps = {
  hex: string;
  color: HSBAColor;
  allowAlpha?: boolean;

  onChangeColor: (newColor: HSBAColor, hex: string) => void;
};

export function ColorPickerExtend({
  hex,
  color,
  allowAlpha,
  onChangeColor,
}: ColorPickerExtendProps) {
  const onChangeHex = (hexInput: string) => {
    // var newRGB = hexToRgb(hexInput);
    // var newColor = rgbToHsb(newRGB);
    // onChangeColor(hexInput, { ...newColor, alpha: 1 });
  };

  const onNewColor = (newColor: HSBAColor) => {
    var newHex = hsba2Hex(newColor);
    // console.log("On change color: ", newColor, newHex);
    onChangeColor(newColor, newHex);
  };

  //   const onChange
  return (
    <BlockStack gap={"100"}>
      <ColorPicker
        color={color}
        allowAlpha={allowAlpha}
        onChange={onNewColor}
      />
      <TextField
        label=""
        autoComplete="off"
        value={hex}
        size="slim"
        prefix={
          <Text as="p" variant="bodyMd">
            Hex
          </Text>
        }
        onChange={onChangeHex}
      />
    </BlockStack>
  );
}

export type ColorPickerFieldProps = {
  label: string;
  hexColor: string;
  onChange: (newHex: string) => void;
};

export function ColorPickerField(props: ColorPickerFieldProps) {
  const refBox = useRef<HTMLElement>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [color, setColor] = useState<HSBAColor>(hex2HSBA(props.hexColor));

  const handleClickOutside = (ev: MouseEvent) => {
    if (refBox.current) {
      const eleBounds = refBox.current.getBoundingClientRect();
      let ret = ev.clientX >= eleBounds.left && ev.clientX <= eleBounds.right;
      if (!ret) {
        setShowEditor(false);
      }
    }
  };

  useEffect(() => {
    if (showEditor) {
      document.addEventListener("mouseup", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mouseup", handleClickOutside);
    };
  }, [showEditor]);

  return (
    <Box ref={refBox}>
      <Box paddingBlockEnd={"100"}>
        <TextField
          label={props.label}
          autoComplete="off"
          value={props.hexColor}
          onFocus={() => {
            setShowEditor(!showEditor);
          }}
          suffix={
            <div
              className="suffix-color"
              style={{ backgroundColor: props.hexColor }}
              onClick={() => !showEditor && setShowEditor(true)}
            />
          }
        />
      </Box>

      {/* <Modal
        open={showEditor}
        title="Select color"
        onClose={() => setShowEditor(false)}
      >
        <ColorPickerExtend
          allowAlpha
          hex={props.hexColor.value}
          color={color}
          onChangeColor={(newColor, newHex) => {
            setColor(newColor);
            props.hexColor.onChange(newHex);
          }}
        />
      </Modal> */}

      {showEditor && (
        <div
          style={{
            display: showEditor ? "block" : "none",
            marginTop: "0.5rem",
          }}
        >
          <ColorPickerExtend
            allowAlpha
            hex={props.hexColor}
            color={color}
            onChangeColor={(newColor, newHex) => {
              setColor(newColor);
              props.onChange(newHex);
            }}
          />
        </div>
      )}
    </Box>
  );
}

export function hex2HSBA(hex: string): HSBAColor {
  let init = hex[0] === "#" ? 1 : 0;
  const red = parseInt(hex.slice(init, init + 2), 16);
  const green = parseInt(hex.slice(init + 2, init + 4), 16);
  const blue = parseInt(hex.slice(init + 4, init + 6), 16);
  const alpha = parseInt(hex.slice(init + 6, init + 8), 16);

  return { ...rgbToHsb({ red, green, blue }), alpha: alpha ? alpha / 256 : 1 };
}

export function hsba2Hex(color: HSBAColor): string {
  var hex = hsbToHex(color);
  if (color.alpha !== 1) {
    hex += Math.floor(color.alpha * 256).toString(16);
  }
  return hex;
}
