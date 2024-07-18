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

type Configuration = {
  minQuantity: number;
  maxQuantity: number;
  percent: number;
  applyType: "all" | "collection";
  colId: string;
};

interface ProductSum {
  id: string;
  total: number;
  collections: Array<CollectionMembership>;
  variants: Array<Target>;
}

export function run(input: RunInput): FunctionRunResult {
  const config: Configuration = JSON.parse(
    input?.discountNode.metafield?.value ?? "{}",
  );

  // console.log("Input data: ", JSON.stringify(input));
  // console.log(`ConfigValue: `, input?.discountNode.metafield?.value);
  console.log(`Config: `, JSON.stringify(config));

  if (!config.minQuantity || !config.percent) {
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
    if (ps.total < config.minQuantity) {
      return;
    }

    if (config.applyType === "collection") {
      var idx = ps.collections.findIndex((v) => v.collectionId == config.colId);
      if (idx >= 0) {
        return;
      }
    }

    var max = ps.total < config.maxQuantity ? ps.total : config.maxQuantity;
    var percent = max * config.percent;
    var discount: Discount = {
      targets: ps.variants.map((v) => ({ ...v })),
      message: `Off ${percent}%`,
      value: {
        percentage: {
          value: max * config.percent,
        },
      },
    };
    discounts.push(discount);
  });

  return {
    discountApplicationStrategy: DiscountApplicationStrategy.All,
    discounts: discounts,
  };
}

// export function run(input: RunInput): FunctionRunResult {
//   const config: Configuration = JSON.parse(
//     input?.discountNode.metafield?.value ?? "{}",
//   );

//   // console.log("Input data: ", JSON.stringify(input));
//   console.log(`Config: `, JSON.stringify(config));

//   if (!config.minQuantity || !config.percent) {
//     return EMPTY_DISCOUNT;
//   }

//   var products = new Map<string, number>();
//   input.cart.lines.forEach((line) => {
//     var p = line.merchandise as ProductVariant;
//     let total = (products.get(p.id) ?? 0) + line.quantity;
//     products.set(p.id, total > config.maxQuantity ? config.maxQuantity : total);
//   });

//   const targets = input.cart.lines
//     .filter((line) => {
//       var p = line.merchandise as ProductVariant;
//       return (products.get(p.id) ?? 0) > config.minQuantity;
//     })
//     .map((line) => {
//       var p = line.merchandise as ProductVariant;
//       return {
//         cartLine: {
//           id: line.id,
//         },
//       };
//     });
//   if (!targets.length) {
//     return EMPTY_DISCOUNT;
//   }

//   return {
//     discountApplicationStrategy: DiscountApplicationStrategy.All,
//     discounts: [
//       {
//         targets,
//         value: {
//           // percentage: {
//           //   value: config.stepValue.toString(),
//           // },
//           fixedAmount: {
//             amount: "100",
//             appliesToEachItem: false,
//           },
//         },
//       },
//     ],
//   };
// }
