// bold:700, semibol:600 medium:500, regular: normal, light: 300
export type FontWeight = "700" | "600" | "500" | "400" | "300";

export type FontConfig = {
  size: number;
  color: string;
  weight: FontWeight;
};

export type FrameConfig = {
  bgColor: string;
  borderColor: string;
};

export type ButtonConfig = {
  frame: FontConfig;
  font: FrameConfig;
};

export type GUIBundleTotalConfig = {
  frame: FrameConfig;
  label: FontConfig;
  price: FontConfig;
  comparePrice: FontConfig;
};

export interface BundleThemeConfig {
  title: FontConfig;
  productFrame: FrameConfig;
  productName: FontConfig;
  productPrice: FontConfig;
  total: GUIBundleTotalConfig;
  button: ButtonConfig;
}

export type GUIProductConfig = FrameConfig & {
  name: FontConfig;
  price: FontConfig;
};
