import type {
  RunInput,
  FunctionRunResult,
  Target,
  CollectionMembership,
  ProductVariant,
  Merchandise,
  Value,
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

type RewardStep = {
  require: number; // Condition
  value: DiscountValue; // Reward
};

interface ProductSum {
  id: string;
  total: number;
  inAnyCollection: boolean;
  collections: Array<CollectionMembership>;
  variants: Array<Merchandise>;
}

export type SDConfig = {
  label: string;
  applyType: SDApplyType;
  local?: string[] | undefined;
  steps: RewardStep[] | undefined;
  collIds: string[] | undefined;
  productIds: string[] | undefined;
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

  if (config.applyType === "total") {
    return onTotal(input, config);
  }

  if (config.applyType === "volume") {
    return onVolume(input, config);
  }
  console.log(`Apply type [${config.applyType}] is not support `);

  return EMPTY_DISCOUNT;
}

function onTotal(input: RunInput, config: SDConfig): FunctionRunResult {
  var total = 0;
  input.cart.lines.forEach((line) => {
    total += line.cost.amountPerQuantity.amount * line.quantity;
  });

  if (!config.steps) {
    return EMPTY_DISCOUNT;
  }

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
            message: config.label || "SHIPPING_DISCOUNT",
            value: calcValue(s.value),
          },
        ],
      };
    }
  }
  return EMPTY_DISCOUNT;
}

function onVolume(input: RunInput, config: SDConfig): FunctionRunResult {
  console.log(
    "Calculate shipping discount volume: ",
    config.collIds,
    config.productIds,
  );
  if (!config.steps) {
    console.log("Step is empty");
    return EMPTY_DISCOUNT;
  }

  var pSum = countProduct(input);
  var arr = [...pSum.values()];
  arr = arr
    .filter((v) => {
      if (v.inAnyCollection) {
        return true;
      }
      if (config.productIds && config.productIds.includes(v.id)) {
        return true;
      }
      return false;
    })
    .sort((a, b) => b.total - a.total);

  console.log("Product sorted: ", JSON.stringify(arr));

  for (var idx = 0; idx < arr.length; idx++) {
    const pMax = arr[idx];

    var step = config.steps.reduce<RewardStep | null>(
      (prev, current, currentIdx) => {
        if (pMax.total >= current.require) {
          idx = currentIdx;
          return current;
        }
        return prev;
      },
      null,
    );
    console.log("Step found: ", step);

    if (step) {
      return {
        discounts: [
          {
            targets: input.cart.deliveryGroups.map((v) => ({
              deliveryGroup: { id: v.id },
            })),
            message: config.label || "SHIPPING_DISCOUNT",
            value: calcValue(step.value),
          },
        ],
      };
    }
  }
  console.log("Cant find any product matched");
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
        inAnyCollection: variant.product.inAnyCollection,
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
