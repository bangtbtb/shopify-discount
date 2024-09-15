import { useEffect, useState } from "react";
import { SeriesDP } from "~/defs/gui";
import {
  BarChart,
  clearLineChartOption,
  LineChart,
} from "~/components/Common/Chart";
import { InlineGrid, Text } from "@shopify/polaris";

type ViewCounterChartProps = {
  title?: string;
  data: SeriesDP[];
};

const ViewCounterChart = ({ title, data }: ViewCounterChartProps) => {
  const [labels, setLabels] = useState(data.map((v) => v.date));
  const [dArr, setDArr] = useState(data.map((v) => v.data));

  useEffect(() => {
    setLabels(data.map((v) => v.date));
    setDArr(data.map((v) => v.data));
  }, [data]);

  return (
    <InlineGrid>
      <Text as="legend">{title}</Text>
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

export default ViewCounterChart;
