(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

export const hourDuration = 1000 * 60 * 60;
export const dayDuration = 24 * hourDuration;

const onlyNumber = new RegExp(`^\\d+$`);

export function JSONParse(
  text: string,
  reviver?: (this: any, key: string, value: any) => any,
) {
  return JSON.parse(text, (k, v) => {
    if (typeof v === "string") {
      if (onlyNumber.test(v)) {
        try {
          var v2 = BigInt(v);
          return reviver ? reviver(k, v2) : v2;
        } catch (error) {
          return v;
        }
      }
    }

    return reviver ? reviver(k, v) : v;
  });
}

export function getGraphqlProductId(id: string | number) {
  return "gid://shopify/Product/" + id;
}

export function randomDigit(digit: number = 6) {
  return Math.floor(Math.random() * Math.pow(10, digit));
}

export function randomIndex(max: number, min: number = 0) {
  return Math.floor(Math.random() * (max - min) + min);
}

type InitArrayFunc<T> = (index: number) => T;

export function initArray<T>(length: number, v: T | InitArrayFunc<T>) {
  if (length <= 0) {
    return [];
  }

  var arr = new Array<T>(length);
  for (let idx = 0; idx < arr.length; idx++) {
    arr[idx] = v instanceof Function ? v(idx) : v;
  }
  return arr;
}

export function getShopName(name: string) {
  let idx = name.indexOf(".");
  return idx > 0 ? name.slice(0, idx) : name;
}

// export function getProductId(id: string | number) {
//   return "gid://shopify/Product/" + id;
// }
