import { describe, it, expect } from 'vitest';
import { run } from './index';
import { FunctionResult, DiscountApplicationStrategy } from '../generated/api';

describe('order discounts function', () => {
  it('returns no discounts without configuration', () => {
    const result = run({
      discountNode: {
        metafield: null
      }
    });
    const expected: FunctionResult = {
      discounts: [],
      discountApplicationStrategy: DiscountApplicationStrategy.First,
    };

    expect(result).toEqual(expected);
  });
});