import {
  type RunInput,
  type FunctionRunResult,
  type ProductVariant,
  type Target,
  type ProductVariantTarget,
  DiscountApplicationStrategy,
  Value,
} from "../generated/api";

const EMPTY_DISCOUNT: FunctionRunResult = {
  discountApplicationStrategy: DiscountApplicationStrategy.First,
  discounts: [],
};

type DVT = "percent" | "fix";

type ODApplyType = "total" | "bundle" | "bundle_attach";

type DiscountValue = {
  value: number;
  type: DVT;
};

type RewardStep = {
  require: number; // Condition
  value: DiscountValue; // Reward
};

type ODTotalConfig = {
  steps: RewardStep[];
};

type ODBundleConfig = {
  value: DiscountValue;
  allOrder?: boolean;
  productIds: string[];
  numRequires: number[];
};

type ODConfig = {
  label: string;
  applyType: ODApplyType;
  total?: ODTotalConfig;
  bundle?: ODBundleConfig;
  // bxgy?: ODBXGY;
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

  if (config.applyType === "total") {
    return config.total
      ? onTotal(input, config.label, config.total)
      : EMPTY_DISCOUNT;
  }

  if (config.applyType === "bundle") {
    return onBundle(input, config);
  }

  console.log(`[OD] Apply type [${config.applyType}] is not support `);

  return EMPTY_DISCOUNT;
}

function onTotal(
  input: RunInput,
  label: string,
  configTotal: ODTotalConfig,
): FunctionRunResult {
  var total = 0;
  input.cart.lines.forEach((line) => {
    total += line.cost.amountPerQuantity.amount * line.quantity;
  });

  for (let i = configTotal.steps.length - 1; i >= 0; i--) {
    const s = configTotal.steps[i];
    if (total > s.require) {
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
            message: label || "BUNDLE_DISCOUNT",
            value: calcValue(s.value),
          },
        ],
      };
    }
  }
  return EMPTY_DISCOUNT;
}

function onBundle(input: RunInput, config: ODConfig): FunctionRunResult {
  var existed = new Map<string, number>();
  if (!config.bundle) {
    return EMPTY_DISCOUNT;
  }

  config.bundle.productIds.forEach((v) => {
    existed.set(v, 0);
  });

  // Count product
  var pCounter = new Map<string, ProductSum>();
  input.cart.lines.forEach((line) => {
    const pVar = line.merchandise as ProductVariant;
    var num = existed.get(pVar.id) || 0;

    var sum = pCounter.get(pVar.product.id);
    if (!sum) {
      sum = {
        id: pVar.product.id,
        total: 0,
        mark: num !== undefined,
        variants: new Array<ProductVariantTarget>(),
      };
      pCounter.set(pVar.product.id, sum);
    }

    sum.total += line.quantity;
    sum.variants.push({
      id: pVar.id,
      quantity: line.quantity,
    });

    if (existed.has(pVar.product.id)) {
      existed.set(pVar.product.id, num + line.quantity);
    }
  });

  var success = true;
  var targets: Target[] = [];

  existed.forEach((v, k) => {
    var pSum = pCounter.get(k);
    if (v > 0 && pSum) {
      pSum.variants.forEach((variants) => {
        targets.push({
          productVariant: {
            id: variants.id,
            quantity: variants.quantity,
          },
        });
      });
    } else {
      console.log(
        `Product ${k} is not existed. Count:${v} Sum:${JSON.stringify(pSum)} `,
      );

      success = false;
    }
  });

  if (!success) {
    console.log("Not success ");
    return EMPTY_DISCOUNT;
  }

  if (config.bundle.allOrder) {
    targets = input.cart.lines.map((line) => ({
      productVariant: {
        id: (line.merchandise as ProductVariant).id,
        quantity: line.quantity,
      },
    }));
  }

  return {
    discountApplicationStrategy: DiscountApplicationStrategy.First,
    discounts: [
      {
        targets: targets,
        message: config.label,
        value: calcValue(config.bundle.value),
      },
    ],
  };
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
