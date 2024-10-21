// bold:700, semibol:600 medium:500, regular: normal, light: 300
export type FontWeight = "700" | "600" | "500" | "400" | "300";

export type FontConfig = {
  color: string;
  size: number;
  weight: FontWeight;
};

export type TextConfig = FontConfig & {
  content: string | number;
};

export type FrameConfig = {
  bgColor: string;
  borderColor: string;
};

export type ButtonConfig = {
  frame: FrameConfig;
  font: TextConfig;
};

export interface PriceTotal {
  price: number;
  priceDiscount: number;
}

export type DisplayPositon = "inline" | "popup";

export type DisplayPage = "product";

//  ------------------------------ Bundle ----------------------------------

export interface BundleProductConfig {
  frame: FrameConfig;
  name: FontConfig;
  price: FontConfig;
}

export type BundleContent = {
  // total: string;
  // button: string;
  shortDesc: string;
  showOnPage: boolean;
};

export type BundleSetting = {
  position: DisplayPositon;
  displayPage: DisplayPage;
};

export type BundleSummaryConfig = {
  label: TextConfig;
  frame: FrameConfig;
  price: FontConfig; // Discount price
  comparePrice: FontConfig; // Old price
};

export interface BundleProductThemeConfig {
  frame: FrameConfig;
  name: FontConfig;
  price: FontConfig;
}

export interface BundleThemeConfig {
  container: FrameConfig;
  banner: {
    font: FontConfig;
    bgColor: string;
  };
  title: TextConfig;
  product: BundleProductThemeConfig;
  summary: BundleSummaryConfig;
  button: ButtonConfig;
}

export interface GUIBundle {
  theme?: BundleThemeConfig;
  content?: BundleContent;
  setting?: BundleSetting;
}

//  ------------------------------ Bundle total----------------------------------

export interface BundleTotalTheme {
  title: FontConfig;
  step: {
    size: number;
    highlight: string;
    spent: FontConfig;
    discount: FontConfig;
  };
}

// --------------------------------- Recommendation theme -----------------------------

// Recommended products
export interface GUIRecommended {}

// --------------------------------- Volume theme -----------------------------

export interface GUIVolume {
  id?: string;
  theme?: VolumeTheme;
  content?: VolumeThemeContent;
}

export interface VolumeThemeContent {
  button: string;
}

export type VolumeThemeSetting = {
  position: DisplayPositon;
  displayPage: DisplayPage;
};

// export interface VolumeThemeSetting {
//   button: string;
// }

export interface VolumeTheme {
  title: FontConfig;
  offerTitle: FontConfig;
  discountLabel: FontConfig;
  price: FontConfig;
  comparePrice: FontConfig;
  tagPopular: FontConfig;
  total: FontConfig;
  selected: {
    label: TextConfig;
    frame: FrameConfig;
  };
  unselected: {
    label: FontConfig;
    frame: FrameConfig;
  };
  button: ButtonConfig;
}

export interface GUIVolume {
  theme?: VolumeTheme;
  setting?: VolumeThemeSetting;
  content?: VolumeThemeContent;
}

// --------------------------------- Shipping theme -----------------------------

export interface SDTotalTheme {
  title: FontConfig;
  step: {
    size: number;
    highlight: string;
    spent: FontConfig;
    discount: FontConfig;
  };
}

export interface SDVolumeTheme {
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
  button: ButtonConfig;
}
