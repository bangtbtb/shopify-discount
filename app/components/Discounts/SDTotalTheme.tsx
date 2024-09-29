import { BlockStack, InlineGrid, Text, TextField } from "@shopify/polaris";
import { SDTotalTheme } from "~/defs/theme";
import { BoxBorderBound, CardCollapse } from "../Common";
import { FontTheme } from "./ThemeField";
import { ColorPickerField } from "../Common/ColorPickerField";

export const defaultSDTotalTheme: SDTotalTheme = {
  title: {
    color: "#1B1B1B",
    size: 16,
    weight: "700",
  },
  step: {
    size: 64,
    highlight: "#4289ff",
    spent: {
      color: "#FFFFFF",
      size: 16,
      weight: "700",
    },
    discount: {
      color: "#FFFFFF",
      size: 14,
      weight: "700",
    },
  },
};

type SDTotalThemePreviewProps = {};

type SDTotalThemeEditorProps = SDTotalTheme & {
  onChangeTheme: (k: string, v: any) => void;
};

export function SDTotalThemeEditor({
  title,
  step,
  onChangeTheme,
}: SDTotalThemeEditorProps) {
  return (
    <BlockStack gap={"400"}>
      <Text as="h2" variant="headingLg">
        Typography & Colour
      </Text>

      <CardCollapse title="Title Config" collapse={true}>
        <FontTheme
          {...title}
          onChange={(v) => {
            console.log("On change title theme ", title, v);

            onChangeTheme("title", v);
          }}
        />
      </CardCollapse>

      <CardCollapse title="Step Config" collapse={true}>
        <BlockStack gap={"200"}>
          <InlineGrid columns={2} gap={"200"}>
            <TextField
              autoComplete="false"
              label="Step size"
              value={step.size.toString()}
              onChange={(v) =>
                onChangeTheme("step", {
                  ...step,
                  size: Number.parseInt(v || "0"),
                })
              }
            />

            <ColorPickerField
              label="Highlight Color"
              hexColor={step.highlight}
              onChange={(v) => onChangeTheme("title", v)}
            />
          </InlineGrid>

          <BoxBorderBound header={"Spent config"}>
            <FontTheme
              {...step.spent}
              onChange={(v) => onChangeTheme("step", { ...step, spent: v })}
            />
          </BoxBorderBound>

          <BoxBorderBound header={"Discount config"}>
            <FontTheme
              {...step.discount}
              onChange={(v) => onChangeTheme("step", { ...step, discount: v })}
            />
          </BoxBorderBound>
        </BlockStack>
      </CardCollapse>
    </BlockStack>
  );
}

export function SDTotalThemePreview({}: SDTotalThemePreviewProps) {
  return (
    <div className="flex_row" style={{ padding: "0.75rem", gap: "1rem" }}></div>
  );
}
