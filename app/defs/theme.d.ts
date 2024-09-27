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
  frame: FrameConfig;
  font: FontConfig;
};

export type GUIBundleTotalConfig = {
  frame: FrameConfig;
  label: FontConfig;
  price: FontConfig;
  comparePrice: FontConfig;
};

export interface BundleProductConfig {
  frame: FrameConfig;
  name: FontConfig;
  price: FontConfig;
}

export interface BundleThemeConfig {
  title: FontConfig;
  product: {
    frame: FrameConfig;
    name: FontConfig;
    price: FontConfig;
  };
  total: GUIBundleTotalConfig;
  button: ButtonConfig;
}

export interface BundleTotalTheme {
  title: FontConfig;
}

export interface PriceTotal {
  price: number;
  priceDiscount: number;
}

export interface VolumeDiscountTheme {
  title: FontConfig;
  offerTitle: FontConfig;
  discountLabel: FontConfig;
  price: FontConfig;
  comparePrice: FontConfig;
  tagPopular: FontConfig;
  total: FontConfig;
  selected: {
    label: FontConfig;
    frame: FrameConfig;
  };
  unselected: {
    label: FontConfig;
    frame: FrameConfig;
  };
  // unselectedBar: string;
  // unselectedBg: string;
  button: ButtonConfig;
}
