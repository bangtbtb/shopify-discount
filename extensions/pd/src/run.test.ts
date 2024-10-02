import { describe, it, expect } from "vitest";
import { PDConfig, run } from "./run";
import {
  FunctionResult,
  DiscountApplicationStrategy,
  Product,
  CartLine,
  Target,
} from "../generated/api";

function genVariant(pid: string, vid: number, anyCol?: boolean) {
  return {
    id: `${pid}_v${vid}`,
    product: {
      id: pid,
      inAnyCollection: !!anyCol,
    },
  };
}

function genTargetCartLine(line: string, quantity: number): Target {
  return {
    cartLine: {
      id: line,
      quantity: quantity,
    },
  };
}

describe("Volume_Product", () => {
  const label = "TEST_VOLUME_001";

  it("returns no discounts without configuration", () => {
    const result = run({
      discountNode: {
        metafield: {
          value: JSON.stringify({
            applyType: "volume",
            label: label,
            volume: {
              steps: [
                {
                  require: 2,
                  value: { type: "percent", value: 5 },
                },

                {
                  require: 3,
                  value: { type: "percent", value: 15 },
                },
              ],
              productIds: ["p1"],
            },
          } as PDConfig),
        },
      },
      cart: {
        lines: [
          {
            id: "line_1",
            quantity: 2,
            merchandise: genVariant("p1", 1),
          },
          {
            id: "line_2",
            quantity: 3,
            merchandise: genVariant("p1", 3),
          },
          {
            id: "line_3",
            quantity: 3,
            merchandise: genVariant("p2", 1),
          },
        ],
      },
    });

    const expected: FunctionResult = {
      discountApplicationStrategy: DiscountApplicationStrategy.First,
      discounts: [
        {
          targets: [
            genTargetCartLine("line_1", 2),
            genTargetCartLine("line_2", 3),
          ],
          message: label,
          value: { percentage: { value: 15 } },
        },
      ],
    };

    expect(result).toEqual(expected);
  });
});

describe("Volume_Collection", () => {
  const label = "TEST_VOLUME_COL_001";
  it("returns no discounts without configuration", () => {
    const result = run({
      discountNode: {
        metafield: {
          value: JSON.stringify({
            applyType: "volume",
            label: label,
            volume: {
              steps: [
                {
                  require: 2,
                  value: { type: "percent", value: 5 },
                },

                {
                  require: 3,
                  value: { type: "percent", value: 15 },
                },
              ],
              //   productIds: ["p1"],
              collIds: ["col_1"],
            },
          } as PDConfig),
        },
      },
      cart: {
        lines: [
          {
            id: "line_1",
            quantity: 2,
            merchandise: genVariant("p1", 1, true),
          },
          {
            id: "line_2",
            quantity: 3,
            merchandise: genVariant("p1", 3, true),
          },
          {
            id: "line_3",
            quantity: 3,
            merchandise: genVariant("p2", 1),
          },
        ],
      },
    });

    const expected: FunctionResult = {
      discountApplicationStrategy: DiscountApplicationStrategy.First,
      discounts: [
        {
          targets: [
            genTargetCartLine("line_1", 2),
            genTargetCartLine("line_2", 3),
          ],
          message: label,
          value: { percentage: { value: 15 } },
        },
      ],
    };

    expect(result).toEqual(expected);
  });
});

describe("Attached", async () => {
  const label = "TEST_ATTACHED_001";
  it("returns no discounts without configuration", () => {
    const result = run({
      discountNode: {
        metafield: {
          value: JSON.stringify({
            applyType: "attached",
            label: label,
            attached: {
              productRequire: "p1",
              attachedProduct: [
                {
                  maxProduct: 2,
                  product: "p2",
                  value: { type: "fix", value: 10 },
                },
                {
                  maxProduct: 4,
                  product: "p3",
                  value: { type: "fix", value: 20 },
                },
                {
                  maxProduct: 4,
                  product: "p4",
                  value: { type: "fix", value: 30 },
                },
              ],
            },
          } as PDConfig),
        },
      },
      cart: {
        lines: [
          {
            id: "line_1",
            quantity: 2,
            merchandise: genVariant("p1", 1),
          },
          {
            id: "line_2",
            quantity: 3,
            merchandise: genVariant("p2", 3),
          },
          {
            id: "line_3",
            quantity: 3,
            merchandise: genVariant("p3", 3),
          },
        ],
      },
    });

    // result.discounts.map((v) => console.log("Discount ", v, v.targets[0]));

    const expected: FunctionResult = {
      discountApplicationStrategy: DiscountApplicationStrategy.First,
      discounts: [
        {
          targets: [genTargetCartLine("line_2", 2)],
          message: label,
          value: { fixedAmount: { amount: 10 } },
        },
        {
          targets: [genTargetCartLine("line_3", 3)],
          message: label,
          value: { fixedAmount: { amount: 20 } },
        },
      ],
    };

    expect(result).toEqual(expected);
  });
});
