import {
  type RunInput,
  type FunctionRunResult,
  type ProductVariant,
  type Discount,
  type Target,
  type ProductVariantTarget,
  DiscountApplicationStrategy,
} from "../generated/api";

const EMPTY_DISCOUNT: FunctionRunResult = {
  discountApplicationStrategy: DiscountApplicationStrategy.First,
  discounts: [],
};

type DVT = "percent" | "fix";

type ODApplyType = "total" | "contain";

type DiscountValue = {
  value: number;
  type: DVT;
};

type ODTotalStep = {
  total: number; // Condition
  value: DiscountValue; // Reward
};

type ODTotalConfig = {
  steps: ODTotalStep[];
};

type ODContainConfig = {
  value: DiscountValue;
  productIds: string[];
};

type ODConfig = {
  label: string;
  applyType: ODApplyType;
  total?: ODTotalConfig | undefined;
  contain?: ODContainConfig | undefined;
};

interface ProductSum {
  id: string;
  total: number;
  mark: boolean;
  variants: Array<ProductVariantTarget>;
}

export function run(input: RunInput): FunctionRunResult {
  const config: ODConfig = JSON.parse(
    input?.discountNode?.metafield?.value ?? "{}",
  );
  // console.log("Config: ", JSON.stringify(config));

  if (config.applyType === "contain") {
    return onContain(input, config);
  }

  if (config.applyType === "total") {
    return onTotal(input, config);
  }
  console.log(`[OD] Apply type [${config.applyType}] is not support `);

  return EMPTY_DISCOUNT;
}

function onTotal(input: RunInput, config: ODConfig): FunctionRunResult {
  if (!config.total) {
    return EMPTY_DISCOUNT;
  }

  var total = 0;
  input.cart.lines.forEach((line) => {
    total += line.cost.amountPerQuantity.amount * line.quantity;
  });

  for (let i = config.total.steps.length - 1; i >= 0; i--) {
    const s = config.total.steps[i];
    if (total > s.total) {
      return {
        discountApplicationStrategy: DiscountApplicationStrategy.First,
        discounts: [
          {
            targets: [
              {
                orderSubtotal: {
                  excludedVariantIds: [],
                },
              },
            ],
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

function onContain(input: RunInput, config: ODConfig): FunctionRunResult {
  var existed = new Map<string, number>();
  if (!config.contain) {
    return EMPTY_DISCOUNT;
  }

  config.contain.productIds.forEach((v) => {
    existed.set(v, 0);
  });

  // Count product
  var pCounter = new Map<string, ProductSum>();
  input.cart.lines.forEach((line) => {
    var p = line.merchandise as ProductVariant;
    var num = existed.get(p.id);

    var sum = pCounter.get(p.product.id);
    if (!sum) {
      sum = {
        id: p.product.id,
        total: 0,
        mark: num !== undefined,
        variants: new Array<ProductVariantTarget>(),
      };
      pCounter.set(p.product.id, sum);
    }

    sum.total += line.quantity;
    sum.variants.push({
      id: p.id,
      quantity: line.quantity,
    });

    if (num !== undefined) {
      existed.set(p.id, num + line.quantity);
    }
  });

  var success = true;
  var targets: Target[] = [];
  existed.forEach((v, k) => {
    var ps = pCounter.get(k);
    if (v > 0 && ps) {
      ps.variants.forEach((variants) => {
        targets.push({
          productVariant: {
            id: variants.id,
            quantity: variants.quantity,
          },
        });
      });
    } else {
      success = false;
    }
  });

  if (!success) {
    return EMPTY_DISCOUNT;
  }

  return {
    discountApplicationStrategy: DiscountApplicationStrategy.First,
    discounts: [
      {
        targets: targets,
        value: {
          percentage: {
            value: 1,
          },
        },
        message: "",
      },
    ],
  };
}
