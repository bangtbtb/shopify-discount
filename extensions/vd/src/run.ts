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

export type PDApplyType = "collection" | "products"; // | "attach";
// export type VDApplyType = "volume" | "attached"; // | "attach";

export type AttachedProduct = {
  product: string;
  value: DiscountValue;
};

export type AttachedConfig = {
  productTarget: string;
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
  steps: RewardStep[];
  collIds?: string[];
  productIds?: string[];
  // volume?: VolumeConfig;
  // attached?: AttachedConfig;
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
  // console.log(`Config: `, JSON.stringify(config));

  if (!config.steps || !config.steps.length) {
    return EMPTY_DISCOUNT;
  }

  // if (config.applyType === "bundle_attach") {
  //   return config.attach
  //     ? onAttachedBundle(input, config.label, config.attach)
  //     : EMPTY_DISCOUNT;
  // }

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
  // console.log("Product summary: ", JSON.stringify(pCounter));

  // Calculate discount
  var discounts: Array<Discount> = [];
  pCounter.forEach((pSum) => {
    if (config.applyType === "collection") {
      if (!pSum.inAnyCollection) {
        return;
      }
      console.log("Accepted product by collection: ", pSum.id);
    }

    if (config.applyType === "products") {
      if ((config.productIds?.indexOf(pSum.id) ?? -1) < 0) {
        return;
      }
      console.log("Accepted product by id: ", pSum.id);
    }

    var step = findStep(config.steps, pSum);
    if (!step) {
      return;
    }

    var discount: Discount = {
      targets: pSum.variants.map((v) => ({ ...v })),
      message: config.label || `VOLUME_DISCOUNT`,
      value: calcValue(step.value),
    };
    discounts.push(discount);
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

// function onAttachedBundle(
//   input: RunInput,
//   label: string,
//   config: ODAttachedBundle,
// ): FunctionRunResult {
//   if (label) {
//     return {
//       discountApplicationStrategy: DiscountApplicationStrategy.First,
//       discounts: [
//         {
//           targets: [],
//           value: calcValue({ type: "fix", value: 1 }),
//         },
//       ],
//     };
//   }
//   return EMPTY_DISCOUNT;
// }

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
