import { BlockStack, InlineGrid, Text, TextField } from "@shopify/polaris";
import { BundleTotalTheme } from "~/defs/theme";
import { BoxBorderBound, CardCollapse } from "../Common";
import { FontTheme, RenderTextTheme } from "./ThemeField";
import { ColorPickerField } from "../Common/ColorPickerField";
import { StepCounter } from "../Common/StepProgress";
import { StepData } from "./ConfigStep";
import { useState } from "react";

export const defaultTotalOrderTheme: BundleTotalTheme = {
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

type BundleTotalThemeEditorProps = BundleTotalTheme & {
  onChangeTheme: (k: string, v: any) => void;
};

export function BundleTotalThemeEditor({
  title,
  step,
  onChangeTheme,
}: BundleTotalThemeEditorProps) {
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

type BundleTotalThemePreviewProps = {
  theme: BundleTotalTheme;
  steps: StepData[];
};

export function BundleTotalThemePreview({
  theme,
  steps,
}: BundleTotalThemePreviewProps) {
  const [selectectd, setSelected] = useState(0);

  return (
    <div>
      <BoxBorderBound
        header={
          <RenderTextTheme as="h3" {...theme.title}>
            "Spent more, discount more"
          </RenderTextTheme>
        }
        headerAlign="center"
        borderWidth={"1px"}
      >
        <StepCounter
          direction="row"
          active={1}
          highlightColor={theme.step.highlight}
          size={72}
          selected={selectectd}
          onSelect={setSelected}
        >
          {steps.map((s, idx) => (
            <div key={idx}>
              <RenderTextTheme as="p" {...theme.step.spent}>
                {s.require}
              </RenderTextTheme>

              <RenderTextTheme as="p" {...theme.step.discount}>
                {s.value} {s.type === "percent" ? "%" : ""}
              </RenderTextTheme>
            </div>
          ))}
        </StepCounter>
      </BoxBorderBound>
    </div>
  );
}
