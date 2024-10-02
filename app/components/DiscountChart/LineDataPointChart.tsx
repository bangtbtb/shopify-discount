import { useEffect, useState } from "react";
import { SeriesDP } from "~/defs/gui";
import {
  BarChart,
  clearLineChartOption,
  LineChart,
} from "~/components/Common/Chart";
import { InlineGrid, Text } from "@shopify/polaris";
import { ChartOptions } from "chart.js";

type LineDataPointChartProps = {
  title?: string;
  data: SeriesDP[];
  options?: ChartOptions<"line">;
};

const LineDataPointChart = ({ title, data }: LineDataPointChartProps) => {
  const [labels, setLabels] = useState(data.map((v) => v.date));
  const [dArr, setDArr] = useState(data.map((v) => v.data));

  useEffect(() => {
    setLabels(data.map((v) => v.date));
    setDArr(data.map((v) => v.data));
  }, [data]);

  return (
    <InlineGrid>
      <Text as="p" variant="bodyMd">
        {title}
      </Text>

      <LineChart
        data={{
          labels: labels,
          datasets: [
            {
              // label: "Discount view",
              data: dArr,
              borderColor: "rgba(10, 250, 132)",
              // backgroundColor: "rgba(10, 250, 132)",
              showLine: true,
              pointStyle: "rectRounded",
            },
          ],
        }}
        options={clearLineChartOption}
      />
    </InlineGrid>
  );
};

export default LineDataPointChart;
