import { useState } from "react";
import { OrdersReport } from "~/defs/gui";
import {
  BarChart,
  clearBarOption,
  clearLineChartOption,
  LineChart,
} from "~/components/Common/Chart";
import { InlineGrid, Select, Text } from "@shopify/polaris";
import { ChartType } from "chart.js";

export type OrderReportParsed = ReturnType<typeof parseOrderReports>;

export function parseOrderReports(reports: OrdersReport[]) {
  var labels: string[] = [];

  var appliedCount: number[] = [];
  var appliedValue: number[] = [];

  var unappliedCount: number[] = [];
  var unappliedValue: number[] = [];

  var idx = 0;
  var done = false;
  console.log("Report length: ", reports.length);

  while (!done) {
    var label = reports[idx].date;
    var app = 0;
    var appVal = 0;

    var unapp = 0;
    var unappVal = 0;

    for (let i = idx; i < reports.length; i++) {
      const elm = reports[i];
      if (elm.date != label) {
        idx = i;
        break;
      }
      if (elm.wasApplied) {
        app += Number(elm.orderCount);
        appVal += Number(elm.subTotalPrice);
      } else {
        unapp += Number(elm.orderCount);
        unappVal += Number(elm.subTotalPrice);
      }
      if (i === reports.length - 1) {
        done = true;
      }
    }

    labels.push(label);
    appliedCount.push(app);
    appliedValue.push(appVal);
    unappliedCount.push(unapp);
    unappliedValue.push(unappVal);
  }

  return { labels, appliedCount, appliedValue, unappliedCount, unappliedValue };
}

type OrderAppliedChartProps = {
  title?: string;
  labels: string[];
  appliedValue: number[];
  unappliedValue: number[];
};

export const OrderAppliedCounterChart = ({
  title,
  labels,
  appliedValue,
  unappliedValue,
}: OrderAppliedChartProps) => {
  return (
    <InlineGrid>
      <Text as="legend">{title}</Text>
      <BarChart
        // id="hello-chart"
        data={{
          labels: labels,
          datasets: [
            {
              label: "Order applied",
              data: appliedValue,
              // borderColor: "rgb(255, 99, 10)",
              // backgroundColor: "rgb(255, 99, 10)",
              stack: "combine",
              type: "bar",
            },
            {
              label: "Order unapplied",
              data: unappliedValue,
              // borderColor: "rgb(155, 99, 132)",
              // backgroundColor: "rgba(10, 250, 132, 0.5)",
              stack: "combine",
            },
          ],
        }}
        options={{
          responsive: true,
          plugins: {
            title: {
              display: false,
              text: title,
            },
            legend: {
              display: false,
            },
          },
          scales: {
            x: {
              display: false,
              title: {
                display: true,
              },
            },
            y: {
              display: false,
              title: {
                display: true,
                text: "Value",
              },
            },
          },
        }}
      />
    </InlineGrid>
  );
};

type OrderAppliedValueChartProps = {
  title: string;
  labels: string[];
  appliedValue: number[];
  unappliedValue: number[];
};

export const OrderAppliedValueChart = ({
  title,
  labels,
  appliedValue,
  unappliedValue,
}: OrderAppliedValueChartProps) => {
  const [chartType, setChartType] = useState<ChartType>("line");

  return (
    <>
      <InlineGrid columns={2}>
        <Text as="legend">{title}</Text>
        <Select
          label=""
          value={chartType}
          options={[
            {
              label: "Line",
              value: "line",
            },
            {
              label: "StackBar",
              value: "bar",
            },
          ]}
          onChange={(v) => setChartType(v as ChartType)}
        />
      </InlineGrid>
      {chartType === "bar" && (
        <BarChart
          // id="hello-chart"
          data={{
            labels: labels,
            datasets: [
              {
                label: "Order applied",
                data: appliedValue,
                stack: "combine",
                type: "bar",

                // borderColor: "rgb(255, 99, 10)",
                // backgroundColor: "rgb(255, 99, 10)",
              },
              {
                label: "Order unapplied",
                data: unappliedValue,
                stack: "combine",
                // borderColor: "rgb(155, 99, 132)",
                // backgroundColor: "rgba(10, 250, 132, 0.5)",
              },
            ],
          }}
          options={clearBarOption}
        />
      )}

      {chartType === "line" && (
        <LineChart
          // id="hello-chart"
          data={{
            labels: labels,
            datasets: [
              {
                label: "Order applied",
                data: appliedValue,
                // borderColor: "rgb(255, 99, 10)",
                // backgroundColor: "rgb(255, 99, 10)",
                stack: "combine",
              },
              {
                label: "Order unapplied",
                data: unappliedValue,
                // borderColor: "rgb(155, 99, 132)",
                // backgroundColor: "rgba(10, 250, 132, 0.5)",
                stack: "combine",
              },
            ],
          }}
          options={clearLineChartOption}
        />
      )}
    </>
  );
};
