import type {
  RunInput,
  FunctionRunResult,
  ProductVariant,
  Target,
  Discount,
} from "../generated/api";
import { DiscountApplicationStrategy } from "../generated/api";

const EMPTY_DISCOUNT: FunctionRunResult = {
  discountApplicationStrategy: DiscountApplicationStrategy.First,
  discounts: [],
};

type VDApplyType = "collection" | "products";

type DVT = "percent" | "fix";

type DiscountValue = {
  value: number;
  type: DVT;
};

type VDStep = {
  require: number;
  value: DiscountValue;
};

type VDConfig = {
  label: string;
  steps: VDStep[];
  applyType: VDApplyType;
  colId: string | undefined;
  collIds: string[] | undefined;
  productIds?: Array<string> | undefined;
};

interface ProductSum {
  id: string;
  total: number;
  inAnyCollection: boolean;
  variants: Array<Target>;
}

export function run(input: RunInput): FunctionRunResult {
  const config: VDConfig = JSON.parse(
    input?.discountNode.metafield?.value ?? "{}",
  );
  // console.log(`Config: `, JSON.stringify(config));

  if (!config.steps || !config.steps.length) {
    return EMPTY_DISCOUNT;
  }

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
    var isPercent = step.value.type === "percent";

    var discount: Discount = {
      targets: pSum.variants.map((v) => ({ ...v })),
      message:
        config.label || `Volume discount ${step.value} ${isPercent ? "%" : ""}`,
      value: isPercent
        ? {
            percentage: {
              value: step.value.value,
            },
          }
        : {
            fixedAmount: {
              amount: step.value.value,
            },
          },
    };
    discounts.push(discount);
  });

  return {
    discountApplicationStrategy: DiscountApplicationStrategy.First,
    discounts: discounts,
  };
}

function findStep(steps: VDStep[], p: ProductSum) {
  for (let i = steps.length - 1; i >= 0; i--) {
    if (p.total >= steps[i].require) {
      return steps[i];
    }
  }
  return null;
}
