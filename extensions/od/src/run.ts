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

type Configuration = {
  minQuantity: number;
  maxQuantity: number;
  percent: number;
};

interface ProductSum {
  id: string;
  total: number;
  variants: Array<ProductVariantTarget>;
}

export function run(input: RunInput): FunctionRunResult {
  const config: Configuration = JSON.parse(
    input?.discountNode?.metafield?.value ?? "{}",
  );

  console.log("Config: ", JSON.stringify(config));
  if (!config.percent) {
    console.log("Invalid config: ", input?.discountNode?.metafield?.value);
    return EMPTY_DISCOUNT;
  }
  // console.log("ConfigValue: ", input?.discountNode?.metafield?.value);

  // Count product
  var pCounter = new Map<string, ProductSum>();
  input.cart.lines.forEach((line) => {
    var p = line.merchandise as ProductVariant;

    var sum = pCounter.get(p.product.id);
    if (!sum) {
      sum = {
        id: p.product.id,
        total: 0,
        variants: new Array<ProductVariantTarget>(),
      };
      pCounter.set(p.product.id, sum);
    }

    sum.total += line.quantity;
    sum.variants.push({
      id: p.id,
      quantity: line.quantity,
    });

    // let total = (pCounter.get(p.id) ?? 0) + line.quantity;
    // pCounter.set(p.id, total > config.maxQuantity ? config.maxQuantity : total);
  });

  var discounts: Array<Discount> = [];
  pCounter.forEach((ps) => {
    if (ps.total < config.minQuantity) {
      return;
    }
    var max = ps.total < config.maxQuantity ? ps.total : config.maxQuantity;
    var percent = max * config.percent;
    var discount: Discount = {
      targets: ps.variants.map((v) => ({ productVariant: v })),
      message: `Off ${percent}%`,
      value: {
        percentage: {
          value: max * config.percent,
        },
      },
    };

    discounts.push(discount);
  });
  console.log("Discount: ", JSON.stringify(discounts));

  return {
    discountApplicationStrategy: DiscountApplicationStrategy.Maximum,
    discounts: discounts,
  };
}
