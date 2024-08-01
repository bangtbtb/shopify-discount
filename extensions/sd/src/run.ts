import { DiscountApplicationStrategy } from "@shopify/discount-app-components";
import type {
  RunInput,
  FunctionRunResult,
  Target,
  CollectionMembership,
  ProductVariant,
  Merchandise,
} from "../generated/api";

const EMPTY_DISCOUNT: FunctionRunResult = {
  discounts: [],
};

// Shipping discount type
type SDApplyType = "total" | "volume";

type DVT = "percent" | "fix";

type DiscountValue = {
  value: number;
  type: DVT;
};

type SDStep = {
  require: number;
  value: DiscountValue;
};

interface ProductSum {
  id: string;
  total: number;
  collections: Array<CollectionMembership>;
  variants: Array<Merchandise>;
}

type SDConfig = {
  label: string;
  type: SDApplyType;
  local: string[] | undefined;
  steps: SDStep[];
  productIds: string[] | undefined;
  collIds: string[] | undefined;
};

export function run(input: RunInput): FunctionRunResult {
  const config: SDConfig = JSON.parse(
    input?.discountNode?.metafield?.value ?? "{}",
  );

  if (config.local) {
    var idx = config.local.indexOf(input.localization.country.isoCode);
    if (idx < 0) {
      return EMPTY_DISCOUNT;
    }
  }

  if (config.type === "total") {
    return onTotal(input, config);
  }

  if (config.type === "volume") {
    return onVolume(input, config);
  }
  return EMPTY_DISCOUNT;
}

function onTotal(input: RunInput, config: SDConfig): FunctionRunResult {
  var total = 0;
  input.cart.lines.forEach((line) => {
    total += line.cost.amountPerQuantity.amount * line.quantity;
  });

  for (let i = config.steps.length - 1; i >= 0; i--) {
    const s = config.steps[i];

    if (total > s.require) {
      var targets: Target[] = input.cart.deliveryGroups.map((v) => ({
        deliveryGroup: {
          id: v.id,
        },
      }));

      return {
        discounts: [
          {
            targets: targets,
            message: config.label || "dfd",
            value:
              s.value.type === "percent"
                ? {
                    percentage: {
                      value: s.value.value,
                    },
                  }
                : {
                    fixedAmount: {
                      amount: s.value.value,
                    },
                  },
          },
        ],
      };
    }
  }
  return EMPTY_DISCOUNT;
}

function onVolume(input: RunInput, config: SDConfig): FunctionRunResult {
  var pSum = countProduct(input);
  var arr = [...pSum.values()];
  arr = arr
    .filter((v) => {
      if (config.productIds && config.productIds.includes(v.id)) {
        return true;
      }

      if (config.collIds && config.collIds.includes(v.id)) {
        return true;
      }
      return false;
    })
    .sort((a, b) => b.total - a.total);

  for (var idx = 0; idx < arr.length; idx++) {
    const pMax = arr[idx];
    var step = config.steps.reduce<SDStep | null>(
      (prev, current, currentIdx) => {
        if (pMax.total > current.require) {
          idx = currentIdx;
          return current;
        }
        return prev;
      },
      null,
    );

    if (step) {
      return {
        discounts: [
          {
            targets: input.cart.deliveryGroups.map((v) => ({
              deliveryGroup: { id: v.id },
            })),
            message: config.label || "Shipping discount",
            value:
              step.value.type === "percent"
                ? { percentage: { value: step.value.value } }
                : { fixedAmount: { amount: step.value.value } },
          },
        ],
      };
    }
  }

  return EMPTY_DISCOUNT;
}

function countProduct(input: RunInput) {
  // Count product
  var pCounter = new Map<string, ProductSum>();
  input.cart.lines.forEach((line) => {
    var variant = line.merchandise as ProductVariant;
    var sum = pCounter.get(variant.product.id);
    if (!sum) {
      sum = {
        id: variant.product.id,
        total: 0,
        collections: variant.product.inCollections,
        variants: new Array<ProductVariant>(),
      };
      pCounter.set(variant.product.id, sum);
    }

    sum.total += line.quantity;
    sum.variants.push(variant);
  });
  return pCounter;
}
