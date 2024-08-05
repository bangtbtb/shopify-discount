import type {
  RunInput,
  FunctionRunResult,
  ProductVariant,
  Target,
  Discount,
  CollectionMembership,
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
  productIds?: Array<string> | undefined;
};

interface ProductSum {
  id: string;
  total: number;
  collections: Array<CollectionMembership>;
  variants: Array<Target>;
}

export function run(input: RunInput): FunctionRunResult {
  const config: VDConfig = JSON.parse(
    input?.discountNode.metafield?.value ?? "{}",
  );
  console.log(`Config: `, JSON.stringify(config));

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
        collections: p.product.inCollections,
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

  // Calculate discount
  var discounts: Array<Discount> = [];
  pCounter.forEach((ps) => {
    if (config.applyType === "collection") {
      var idx = ps.collections.findIndex((v) => v.collectionId == config.colId);
      if (idx >= 0) {
        return;
      }
    } else if (config.applyType == "products") {
      if ((config.productIds?.indexOf(ps.id) ?? -1) < 0) {
        return;
      }
    }

    var step = findStep(config.steps, ps);
    if (!step) {
      return;
    }
    var isPercent = step.value.type === "percent";
    var label = config.label || `Off ${step.value} ${isPercent ? "%" : ""}`;

    var discount: Discount = {
      targets: ps.variants.map((v) => ({ ...v })),
      message: label,
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
    if (p.total > steps[i].require) {
      return steps[i];
    }
  }
  return null;
}
