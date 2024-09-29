import db from "../db.server";

export async function dbGetCurrency(base: string, target: string) {
  var rs = await db.currencyRate.findFirst({
    where: {
      OR: [
        {
          id: `${base}_${target}`,
        },
        {
          id: `${target}_${base}`,
        },
      ],
    },
  });
  if (rs && rs.base != base) {
    rs = {
      id: `${base}_${target}`,
      base: base,
      target: target,
      rate: 1.0 / rs.rate,
      updatedAt: rs.updatedAt,
    };
  }

  return rs;
}

export async function dbUpsertCurrency(
  base: string,
  target: string,
  rate: number,
) {
  return db.currencyRate.upsert({
    create: {
      id: `${base}_${target}`,
      base: base,
      target: target,
      rate: rate,
      updatedAt: new Date(),
    },
    update: {
      rate: rate,
      updatedAt: new Date(),
    },
    where: {
      id: `${base}_${target}`,
    },
  });
}

export async function dbCurrencyConvert(
  base: string,
  target: string,
  amount: number,
) {
  var rate = await dbGetCurrency(base, target);
  if (rate) {
    return amount * rate.rate;
  }
  return -1;
}
