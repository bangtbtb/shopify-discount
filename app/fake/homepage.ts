import { SeriesDP } from "~/defs/gui";

function randomNumber(digit: number = 3) {
  return Math.floor(Math.random() * Math.pow(10, digit));
}

type OrderData = {
  applieds: SeriesDP[];
  unapplied: SeriesDP[];
};

const fakeDate = [
  "2019-01-10",
  "2020-01-10",
  "2019-01-11",
  "2019-01-12",
  "2019-01-13",
  "2019-01-14",
  "2019-01-15",
  "2019-01-16",
  "2019-02-10",
  "2019-03-10",
  "2019-04-10",
  "2019-04-11",
  "2019-04-12",
  "2019-04-13",
  "2020-04-10",
  "2020-04-10",
  "2021-05-11",
  "2021-05-12",
  "2021-05-13",
  "2021-05-14",
  "2021-05-15",
  "2021-05-16",
  "2021-05-17",
  "2021-05-18",
];

export function getFakeView(): SeriesDP[] {
  return fakeDate.map((v) => ({
    date: v,
    data: randomNumber(5),
  }));
}

export function getFakeOrderOverview(): OrderData {
  var data: OrderData = {
    applieds: fakeDate.map((v) => ({
      date: v,
      data: randomNumber(3),
    })),
    unapplied: fakeDate.map((v) => ({
      date: v,
      data: randomNumber(3),
    })),
  };

  data.applieds.pop();
  data.unapplied.pop();
  data.unapplied.pop();

  return data;
}

export function getFakeOrderValue() {
  return fakeDate.map((v) => ({
    date: v,
    data: randomNumber(3),
  }));
}
