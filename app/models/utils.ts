(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

// export type JSONSpecialFields = {
//   [key: string]: boolean;
// };

// const bigIntFiels: JSONSpecialFields = {
//   price: true,
//   total_tax: true,
//   total_price: true,
// };

export function getShopName(shop?: string) {
  if (shop) {
    var idx = shop.indexOf(".");
    return shop.slice(0, idx);
  }
  return "";
}

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

export function randomNumber(digit: number = 3) {
  return Math.floor(Math.random() * Math.pow(10, digit));
}
