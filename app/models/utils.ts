import { ADT } from "@prisma/client";
import { format } from "date-fns";

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

const onlyNumber = new RegExp(`^\\d+$`);

export const hourDuration = 1000 * 60 * 60;
export const dayDuration = 24 * hourDuration;

export const defaultPageSize = 20;

export type DateGroup = "day" | "week" | "month" | "annual";

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

export function randomDigit(digit: number = 6) {
  return Math.floor(Math.random() * Math.pow(10, digit));
}

export function randomIndex(max: number, min: number = 0) {
  return Math.floor(Math.random() * (max - min) + min);
}

export function randomBool() {
  return Math.floor(Math.random() * 10) % 2 == 0;
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

export function convertDate(date: Date, interval: DateGroup) {
  switch (interval) {
    case "annual":
      return format(date, "yyyy");
    case "month":
      return format(date, "yyyy-MM");
    case "week":
    case "day":
      return format(date, "yyyy-MM-dd");
  }
  return format(date, "yyyy-MM-dd");
}
