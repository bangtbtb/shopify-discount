import { platform } from "os";
import type {
  RunInput,
  FunctionRunResult,
  ProductVariant,
  Target,
  Discount,
  Value,
} from "../generated/api";
import { DiscountApplicationStrategy } from "../generated/api";

const EMPTY_DISCOUNT: FunctionRunResult = {
  discountApplicationStrategy: DiscountApplicationStrategy.First,
  discounts: [],
};

type DVT = "percent" | "fix";

type DiscountValue = {
  value: number;
  type: DVT;
};

type RewardStep = {
  require: number; // Condition
  value: DiscountValue; // Reward
};

export type PDApplyType = "volume" | "attached"; // | "attach";

export type AttachedProduct = {
  product: string;
  maxProduct: number;
  value: DiscountValue;
};

export type AttachedConfig = {
  productRequire: string;
  attachedProduct: AttachedProduct[];
};

export type VolumeConfig = {
  steps: RewardStep[];
  collIds?: string[];
  productIds?: string[];
};

export type PDConfig = {
  label: string;
  applyType: PDApplyType;
  volume?: VolumeConfig;
  attached?: AttachedConfig;
};

interface ProductSum {
  id: string;
  total: number;
  inAnyCollection: boolean;
  variants: Array<Target>;
}

export function run(input: RunInput): FunctionRunResult {
  const config: PDConfig = JSON.parse(
    input?.discountNode.metafield?.value ?? "{}",
  );
  var frs: FunctionRunResult = EMPTY_DISCOUNT;

  if (config.applyType === "volume") {
    frs = config.volume
      ? onVolume(input, config.label || `VOLUME_DISCOUNT`, config.volume)
      : EMPTY_DISCOUNT;
  } else if (config.applyType === "attached") {
    frs = config.attached
      ? onAttachedProduct(
          input,
          config.label || `VOLUME_DISCOUNT`,
          config.attached,
        )
      : EMPTY_DISCOUNT;
  }

  // console.log(`Label ${config.label} result:  `, frs);
  return frs;
}

function onVolume(input: RunInput, label: string, config: VolumeConfig) {
  if (!config.steps || !config.steps.length) {
    return EMPTY_DISCOUNT;
  }

  // Count product
  var pCounter = countProduct(input);

  // Calculate discount
  var discounts: Array<Discount> = [];
  pCounter.forEach((pSum) => {
    if (config.collIds?.length) {
      if (!pSum.inAnyCollection) {
        return;
      }
      // console.log("Accepted product by collection: ", pSum.id);
    }

    if (config.productIds?.length) {
      if ((config.productIds?.indexOf(pSum.id) ?? -1) < 0) {
        return;
      }
      // console.log("Accepted product by id: ", pSum.id);
    }

    var step = findStep(config.steps, pSum);
    if (!step) {
      return;
    }

    discounts.push({
      targets: pSum.variants,
      message: label || `VOLUME_DISCOUNT`,
      value: calcValue(step.value),
    } as Discount);
  });

  return {
    discountApplicationStrategy: DiscountApplicationStrategy.First,
    discounts: discounts,
  };
}

function onAttachedProduct(
  input: RunInput,
  label: string,
  config: AttachedConfig,
): FunctionRunResult {
  // Count product
  var pCounter = countProduct(input);

  var targetProduct = pCounter.get(config.productRequire);
  if (!targetProduct) {
    return EMPTY_DISCOUNT;
  }

  var discounts: Discount[] = [];
  config.attachedProduct.forEach((attached) => {
    var p = pCounter.get(attached.product);
    if (p) {
      discounts.push({
        message: label,
        targets:
          p.total < attached.maxProduct
            ? p.variants
            : calcAttachedTarget(p.variants, attached.maxProduct),
        value: calcValue(attached.value),
      });
    }
  });

  return {
    discountApplicationStrategy: DiscountApplicationStrategy.First,
    discounts: discounts,
  };
}

function findStep(steps: RewardStep[], p: ProductSum) {
  for (let i = steps.length - 1; i >= 0; i--) {
    if (p.total >= steps[i].require) {
      return steps[i];
    }
  }
  return null;
}

function calcAttachedTarget(variants: Target[], max: number) {
  var rsVariants: Target[] = [];
  var count = 0;
  for (let idx = 0; idx < variants.length; idx++) {
    const cartLine = variants[idx].cartLine;
    if (cartLine) {
      if (count + (cartLine.quantity || 0) < max) {
        rsVariants.push({ cartLine: cartLine });
        count += cartLine.quantity || 0;
      } else {
        rsVariants.push({
          cartLine: {
            id: cartLine.id,
            quantity: max - count,
          },
        });
        return rsVariants;
      }
    }
  }
  return rsVariants;
}

function countProduct(input: RunInput) {
  // Count product
  var pCounter = new Map<string, ProductSum>();
  input.cart.lines.forEach((line) => {
    var p = line.merchandise as ProductVariant;
    var sum = pCounter.get(p.product.id);
    if (!sum) {
      sum = {
        id: p.product.id,
        total: 0,
        inAnyCollection: p.product.inAnyCollection,
        variants: new Array<Target>(),
      };
      pCounter.set(p.product.id, sum);
    }

    sum.total += line.quantity;
    sum.variants.push({
      cartLine: {
        id: line.id,
        quantity: line.quantity,
      },
    });
  });
  return pCounter;
}

function calcValue(dt: DiscountValue): Value {
  return dt.type === "percent"
    ? {
        percentage: {
          value: dt.value,
        },
      }
    : {
        fixedAmount: {
          amount: dt.value,
        },
      };
}
